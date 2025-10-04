'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

interface GameData {
  bubblesPopped: number;
  timeElapsed: number;
  completed: boolean;
  poppingPattern: string;
}

export async function saveAndAnalyze(gameData: GameData, clientSessionId?: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    // Generate AI analysis
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Generate shareable third-person version for the card with dynamic context
    const getShareableContext = () => {
      if (gameData.completed && gameData.timeElapsed < 60) {
        return `SPEED DEMON: Finished all 100 bubbles in under a minute (${formatTime(gameData.timeElapsed)}). Write about their obsessive efficiency, competitive nature, or inability to do anything casually. Compare to other perfectionist behaviors. Make it funny but accurate.`;
      } else if (gameData.completed && gameData.timeElapsed < 180) {
        return `COMPLETIONIST: Methodically finished all 100 bubbles in ${formatTime(gameData.timeElapsed)}. Write about their need for closure, following rules to the letter, or satisfying completion. Are they the type who can't leave tasks unfinished?`;
      } else if (gameData.completed) {
        return `DETERMINED: Spent ${formatTime(gameData.timeElapsed)} popping every single bubble. This took serious commitment. Write about their stubbornness, persistence, or dedication to finishing what they start even when it's pointless.`;
      } else if (gameData.bubblesPopped >= 75) {
        return `PRAGMATIST: Got to ${gameData.bubblesPopped}/100 and called it quits. Write about their practical nature, knowing when "good enough" is actually good enough, or efficiency over completion.`;
      } else if (gameData.bubblesPopped >= 40) {
        return `QUESTIONER: Made it to ${gameData.bubblesPopped} bubbles in ${formatTime(gameData.timeElapsed)} before saying "what's the point?" Write about their tendency to question meaningless tasks, value their time, or rebel against arbitrary goals.`;
      } else if (gameData.bubblesPopped >= 10) {
        return `SAMPLER: Popped ${gameData.bubblesPopped} bubbles and peaced out. Write about their short attention span, need for immediate payoff, or ability to quickly assess if something's worth their time.`;
      } else {
        return `INSTANT QUITTER: Literally ${gameData.bubblesPopped} bubbles and DONE in ${formatTime(gameData.timeElapsed)}. Write about their zero tolerance for bullsh*t, ability to spot pointless tasks instantly, or complete lack of patience for meaningless activities.`;
      }
    };

    const patternContext = gameData.poppingPattern === 'sequential' 
      ? 'They popped bubbles methodically in order - very organized, rule-following behavior.' 
      : gameData.poppingPattern === 'strategic' 
      ? 'They had a clear strategy/pattern - analytical, systematic approach.'
      : 'They popped bubbles randomly all over - chaotic, spontaneous, or impulsive.';

    // Add randomization to prompts to ensure variety
    const toneVariations = [
      'Be witty and sharp.',
      'Be playfully sarcastic.',
      'Be brutally honest but funny.',
      'Be clever and insightful.',
      'Be cheeky and observant.'
    ];
    const randomTone = toneVariations[Math.floor(Math.random() * toneVariations.length)];

    const styleVariations = [
      'Use phrases like "This person...", "They\'re definitely the type who..."',
      'Open with a direct observation. Follow with a comparison to everyday behavior.',
      'Start with the numbers, then zoom out to personality. Make it feel personal.',
      'Begin with a personality trait, then prove it with their behavior.',
      'Use rhetorical questions that reveal character.'
    ];
    const randomStyle = styleVariations[Math.floor(Math.random() * styleVariations.length)];

    const shareablePrompt = `You're a sharp personality analyst. Someone just played a bubble-popping game.

BEHAVIOR: ${getShareableContext()}

PATTERN: ${patternContext}

Write exactly 2 SHORT paragraphs (2-3 sentences each) in THIRD PERSON. Make it SHAREABLE - something they'd screenshot and send to friends.

Paragraph 1: A SPECIFIC, FUNNY observation about what THIS EXACT behavior reveals. Reference the actual numbers (${gameData.bubblesPopped} bubbles, ${formatTime(gameData.timeElapsed)}) naturally. ${randomTone}

Paragraph 2: Connect this to a broader personality trait or life approach. Make it feel true and a bit exposing in a fun way. ${randomStyle}

IMPORTANT: Make each analysis feel completely unique. Don't reuse phrases. Don't follow a template. Be memorable and shareable.`;

    const shareableCompletion = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 512,
      system: shareablePrompt,
      messages: [
        {
          role: 'user',
          content: 'Analyze this gameplay behavior.'
        }
      ]
    });

    const analysis = (shareableCompletion.content[0] as { text: string })?.text || 'Could not generate analysis.';

    // Generate personal second-person version for full assessment
    const getPersonalContext = () => {
      if (gameData.completed && gameData.timeElapsed < 60) {
        return `They SPEEDRAN this - ${formatTime(gameData.timeElapsed)} for 100 bubbles. Call them out on their competitive nature, need to "win" even pointless games, or inability to do anything half-way. Be playfully confrontational.`;
      } else if (gameData.completed && gameData.timeElapsed < 180) {
        return `They finished all 100 methodically in ${formatTime(gameData.timeElapsed)}. Tease them about being a completionist, rule-follower, or someone who can't handle leaving things undone. Be affectionately mocking.`;
      } else if (gameData.completed) {
        return `They spent ${formatTime(gameData.timeElapsed)} on this. That's dedication to something utterly pointless. Call out their stubbornness or commitment issues. Be loving but brutally honest.`;
      } else if (gameData.bubblesPopped >= 75) {
        return `${gameData.bubblesPopped}/100 - so close but said "nah." Recognize their pragmatism and efficiency, but also question if they're okay leaving things 75% done in life.`;
      } else if (gameData.bubblesPopped >= 40) {
        return `${gameData.bubblesPopped} bubbles before bailing. Talk about their BS detector, questioning nature, or how they probably leave projects when they stop making sense.`;
      } else if (gameData.bubblesPopped >= 10) {
        return `${gameData.bubblesPopped} bubbles was their limit. They gave it a shot, got the vibe, and bounced. Discuss their short attention span or ability to quickly cut losses.`;
      } else {
        return `Literally ${gameData.bubblesPopped} bubbles in ${formatTime(gameData.timeElapsed)}. They saw this game and said NOPE. Celebrate their zero-BS tolerance while gently roasting their impatience.`;
      }
    };

    const approachVariations = [
      'Call them out lovingly but directly.',
      'Tease them like a close friend would.',
      'Be the brutally honest best friend.',
      'Channel wise older sibling energy.',
      'Use affectionate roasting style.'
    ];
    const randomApproach = approachVariations[Math.floor(Math.random() * approachVariations.length)];

    const questionVariations = [
      'Ask pointed rhetorical questions that make them think.',
      'Use comparisons to other life situations.',
      'Make predictions about their behavior in other contexts.',
      'Challenge them gently about their patterns.',
      'Reflect their behavior back at them with examples.'
    ];
    const randomQuestion = questionVariations[Math.floor(Math.random() * questionVariations.length)];

    const personalPrompt = `You're their honest friend who just watched them play this bubble game. Be DIRECT and PERSONAL.

WHAT HAPPENED: ${getPersonalContext()}

THEIR STYLE: ${patternContext}

Write 2 paragraphs (3-4 sentences each) in SECOND PERSON ("you") that make them feel SEEN. 

Paragraph 1: Call out EXACTLY what their behavior reveals using the specific numbers (${gameData.bubblesPopped} bubbles, ${formatTime(gameData.timeElapsed)}). ${randomApproach}

Paragraph 2: Connect this to how they probably are in real life. ${randomQuestion} Make them laugh and nod along. Be insightful but playful.

CRITICAL: Every single assessment must feel COMPLETELY DIFFERENT. Use different sentence structures, different angles, different observations. Don't repeat phrases or follow patterns. Make it fresh every time.`;

    const personalCompletion = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 512,
      system: personalPrompt,
      messages: [
        {
          role: 'user',
          content: 'Analyze this gameplay behavior.'
        }
      ]
    });

    const personalAnalysis = (personalCompletion.content[0] as { text: string })?.text || 'Could not generate analysis.';

    // Save to sessions table
    try {
      const hdrs = await headers();
      const ipHeader = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || null;
      const clientIp = ipHeader ? ipHeader.split(',')[0]?.trim() || null : null;
      const userAgent = hdrs.get('user-agent') || null;

      const sessionData = {
        game_id: 'bubble-popper',
        user_id: user?.id ?? null,
        session_id: clientSessionId ?? null,
        data: {
          ...gameData,
          meta: { clientIp, userAgent }
        },
        result: { analysis, personalAnalysis }
      };

      const { error } = await supabase.from('sessions').insert([sessionData]);

      if (error) {
        console.error('Error saving game session:', error);
      }
    } catch (e) {
      console.error('Could not save game session', e);
    }

    return { success: true, analysis, personalAnalysis };
  } catch (error) {
    console.error('Error with Claude API:', error);
    return { error: 'Failed to generate analysis due to a server error.' };
  }
}

export async function getGlobalStats() {
  try {
    const supabase = await createClient();
    
    // Query sessions table for bubble-popper games
    const { data, error } = await supabase
      .from('sessions')
      .select('data')
      .eq('game_id', 'bubble-popper');

    if (error) {
      console.error('Error fetching stats:', error);
      return { 
        totalPlays: 0, 
        averageCompletion: 0, 
        averageTime: 0 
      };
    }

    if (!data || data.length === 0) {
      return { 
        totalPlays: 0, 
        averageCompletion: 0, 
        averageTime: 0 
      };
    }

    // Calculate stats from data
    const totalPlays = data.length;
    const totalBubbles = data.reduce((sum, session) => sum + (session.data?.bubblesPopped || 0), 0);
    const totalTime = data.reduce((sum, session) => sum + (session.data?.timeElapsed || 0), 0);

    return {
      totalPlays,
      averageCompletion: totalPlays > 0 ? totalBubbles / totalPlays : 0,
      averageTime: totalPlays > 0 ? totalTime / totalPlays : 0
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return { 
      totalPlays: 0, 
      averageCompletion: 0, 
      averageTime: 0 
    };
  }
}

