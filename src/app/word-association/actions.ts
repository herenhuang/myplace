'use server';

import Groq from 'groq-sdk';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

function parseAnalysisJson(text: string): { summary: string; scores: number[] } | null {
	try {
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		const jsonText = jsonMatch ? jsonMatch[0] : text;

		const parsed = JSON.parse(jsonText);

		if (parsed.summary && Array.isArray(parsed.scores) && parsed.scores.length === 5) {
			return parsed;
		}
	} catch (e) {
		console.error('Failed to parse analysis JSON:', e);
	}
	return null;
}

export async function analyze(userResponses: string, clientSessionId?: string) {
	const supabase = await createClient();
	const {
		data: { user }
	} = await supabase.auth.getUser();

	const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

	if (!userResponses) {
		return { error: 'No responses provided.' };
	}

	try {
		const systemPrompt = `You are a personality analysis expert with a background in psychology.
Analyze the following word association results from a user.
Based on their responses (the association they provided for a given stimulus word) and response times, provide a brief personality analysis.
Rank them on the following 5 categories on a scale of 0-10, where 0 is very low and 10 is very high:
1.  Creativity/Abstract Thinking
2.  Optimism/Positivity
3.  Anxiety/Neuroticism
4.  Pragmatism/Concrete Thinking
5.  Emotional Spontaneity

Address the user in the second-person POV "you" in the analysis. Use appropriate bolding and emphasis on important points (at least 2 per analysis). Keep the language simple and straightforward and personal.

Please provide the analysis as a JSON object with two properties:
- "summary": A single paragraph of general analysis (no scores mentioned in the text)
- "scores": An array of exactly 5 numbers (0-10) in the order listed above

Be insightful but also responsible. Do not make medical diagnoses.

Example output format:
{
  "summary": "Based on your responses, you appear to be a highly creative and spontaneous individual with a tendency toward abstract thinking. Your associations suggest an optimistic outlook and emotional openness.",
  "scores": [8, 7, 3, 4, 9]
}
`;

		const chatCompletion = await groq.chat.completions.create({
			messages: [
				{
					role: 'system',
					content: systemPrompt
				},
				{
					role: 'user',
					content: `Here are the user's word association results: ${userResponses}`
				}
			],
			model: 'openai/gpt-oss-20b'
		});

		const analysis = chatCompletion.choices[0]?.message?.content || 'Could not generate analysis.';

		const parsedAnalysis = parseAnalysisJson(analysis);

		if (!parsedAnalysis) {
			return { error: 'Failed to parse analysis from AI response.' };
		}

		try {
			const gameData = JSON.parse(userResponses);

			// Best-effort client IP and User-Agent for additional tracking context
			const hdrs = await headers();
			const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null;
			const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null;
			const userAgent = hdrs.get('user-agent') || null;

			const sessionData = {
				game_id: 'word-association',
				user_id: user?.id ?? null,
				session_id: clientSessionId ?? null,
				data: {
					...gameData,
					meta: { clientIp, userAgent }
				},
				result: parsedAnalysis
			};

			const { error } = await supabase.from('sessions').insert([sessionData]);

			console.log(sessionData);

			if (error) {
				console.error('Error saving game session:', error);
			}
		} catch (e) {
			console.error('Could not save game session', e);
		}

		return { success: true, analysis: parsedAnalysis };
	} catch (error) {
		console.error('Error with Groq API:', error);
		return { error: 'Failed to generate analysis due to a server error.' };
	}
}
