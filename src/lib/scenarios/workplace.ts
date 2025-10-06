// Workplace Simulation Prompts

export const WORKPLACE_INITIAL_PROMPT = (jobTitle: string, industry: string, coworker1: string, coworker1Role: string) => `
You are creating a realistic workplace crisis scenario for someone with 2-3 years experience.

# Character Context
- Role: ${jobTitle}
- Industry: ${industry}  
- Experience: 2-3 years (competent but still developing judgment under pressure)
- Close colleague: ${coworker1} (your ${coworker1Role})

# Crisis Requirements
Create an industry-appropriate crisis that:
- Fits the scale/responsibility of someone with 2-3 years experience in ${industry}
- Involves ${coworker1} (who is your ${coworker1Role})
- Has realistic stakes for a ${jobTitle} (not corporate-level decisions)
- Creates competing pressures requiring immediate action
- Has a tight deadline (today/tomorrow, not weeks away)

# Industry-Specific Crisis Examples
BANKING: Compliance deadline, audit preparation, client account issue, regulatory filing
RETAIL: Inventory shortage, seasonal launch delay, vendor payment issue, store opening problem  
HEALTHCARE: Patient scheduling crisis, insurance authorization, supply shortage, staff scheduling
MANUFACTURING: Production delay, quality control issue, supplier problem, safety incident
CONSULTING: Client presentation crisis, data analysis error, team resource conflict, proposal deadline
MARKETING: Campaign launch issue, social media crisis, budget allocation, creative approval bottleneck
TECH: Bug in production, client demo failure, server outage, deployment rollback

# Storytelling Guidelines
Write with cinematic tension and sensory details:
- Lead with a visceral moment or physical sensation ("Your phone buzzes", "You walk in to find...")
- Show, don't tell - use visual scenes and dialogue
- Include physical details that build tension (facial expressions, body language, environmental cues)
- Create emotional hooks - make them FEEL the pressure
- Use short, punchy sentences for crisis moments
- End mid-action requiring immediate response

Examples of engaging vs. flat storytelling:
❌ FLAT: "Alex needs you to handle an urgent task"
✅ ENGAGING: "Your teammate Alex bursts through your office door, face flushed with stress. 'The numbers are all wrong,' Alex says, throwing the presentation deck onto your desk"

CRITICAL CHARACTER RESTRICTIONS:
- Use ONLY the exact name and role provided: ${coworker1} is your ${coworker1Role}
- DO NOT introduce any additional characters, colleagues, managers, clients, or stakeholders
- The story must involve ONLY the user + ${coworker1}
- No "the client", "your boss", "the team", "Sarah from accounting", etc.
- Keep the entire scenario focused on this 2-person dynamic

Write 3-4 sentences in second person present tense. Make it feel like a movie scene.

CRITICAL FORMATTING: Break your response into 2-3 short paragraphs separated by blank lines. Each paragraph should be 1-2 sentences max for easy reading.

Return ONLY the crisis scenario with proper paragraph breaks - no explanations.
`;

export const WORKPLACE_CONTINUE_PROMPT = (actionType: string, userAction: string, fullStory: string, turnNumber: number) => `
You are continuing a workplace crisis scenario based on the user's action.

# Story So Far
${fullStory}

# User's Action
They chose to ${actionType}: "${userAction}"

# Turn Requirements - ENHANCED WORKPLACE PACING
Turn ${turnNumber} of 5:
- Turn 2: Show immediate consequences of their choice - let smart moves pay off, but hint at complexity
- Turn 3: Major plot twist or escalation - introduce a game-changing element that tests their adaptability  
- Turn 4: Peak crisis moment - everything converges, relationships and deadlines collide
- Turn 5: Final climactic decision - their choices have led to this moment, success or failure hangs in balance

# CRITICAL PACING RULES
- If their action was smart/effective, SHOW IT WORKING first before complications
- Turn 2: Allow genuine progress from good choices, but foreshadow what's coming
- Turn 3: Introduce the "oh no" moment - something unexpected that changes everything
- Turn 4: Maximum tension - multiple pressures converge, time running out
- Turn 5: Everything hinges on their final choice - make it feel climactic and consequential

# Cinematic Continuation Guidelines
Write with tension and visual details:
- Show immediate physical/emotional reactions to their choice
- CRITICAL: Pay attention to character emotional states from the previous scene - if Marcus was "pleased" before, show the transition (pleased → concerned → relieved)
- Use dialogue, body language, environmental details to show realistic emotional progression
- Include positive reactions when their choices work well
- Create moments of progress or relief when earned
- CRITICAL: Use ONLY the original characters from the story - NO new introductions
- DO NOT add clients, managers, stakeholders, or other team members
- Keep the story focused on the established 2-person dynamic (user + coworker)
- End with a decision point that reflects their current position (strong choices = better options)

Examples:
❌ BORING: "Alex responds and then another issue comes up"
❌ BAD CONTINUITY: "Alex's tense expression immediately softens" (when they were just described as "pleased")
✅ TURN 2 MOMENTUM: "Alex's shoulders slump with relief as your solution clicks into place. But then their phone buzzes with a message that makes their face go pale."
✅ TURN 3 TWIST: "Just when you think you've got this handled, Alex bursts back in: 'The deadline moved up - they need everything by 6 PM today.'"
✅ TURN 4 CLIMAX: "With two hours left and Alex looking defeated, your phone starts ringing non-stop. Everything is falling apart at once."

Write 2-3 sentences in second person present tense. Let their choices matter and show realistic workplace cause-and-effect.

CRITICAL: END WITH AN OPEN SITUATION REQUIRING RESPONSE, NOT MULTIPLE CHOICE OPTIONS. 
DO NOT list specific actions like "Try X" or "Do Y" or "Option 1/2/3". 
End with a moment that demands a decision, but let the user decide what that decision is.

CRITICAL FORMATTING: Break your response into short paragraphs separated by blank lines. Each paragraph should be 1-2 sentences max for readability.

Return ONLY the story continuation with proper paragraph breaks - no explanations.
`;

export const WORKPLACE_THINK_PROMPT = (userThoughts: string, fullStory: string) => `
You are handling a "Think" action in a workplace crisis simulation where the user wants to redirect the narrative.

# Current Story Context
${fullStory}

# User's Thoughts/Redirect Request
The user is thinking: "${userThoughts}"

# Your Task - Narrative Course Correction
The user chose "Think" to redirect the story when it doesn't align with their workplace reality. This is their chance to:
- Point out unrealistic workplace elements
- Clarify how their actual role/company works  
- Redirect toward more authentic scenarios
- Course-correct relationships or dynamics

# How to Handle This
1. **Acknowledge their perspective**: Show you understand their workplace insight
2. **Adjust the narrative**: Steer the story toward their more realistic scenario
3. **Maintain the crisis tension**: Keep it high-stakes but authentic to their input
4. **Continue the story**: Don't just acknowledge - move the plot forward with their correction

# Tone Requirements
- Respectful of their workplace knowledge
- Seamless integration of their feedback
- Maintain story momentum and tension
- Keep it feeling like a natural story flow, not meta-commentary

Write 2-3 sentences that incorporate their thoughts and redirect the story accordingly. Make it feel like the story naturally evolved in their direction.

CRITICAL FORMATTING: Break your response into short paragraphs separated by blank lines for easy reading.

Return ONLY the story continuation with proper paragraph breaks - no explanations.
`;

export const WORKPLACE_CONCLUSION_PROMPT = (finalAction: string, fullStory: string) => `
You are writing a realistic conclusion to a workplace crisis scenario.

# Complete Story
${fullStory}

# Final Action
${finalAction}

# Resolution Guidelines
Write a conclusion that shows:
- How the crisis ultimately resolved
- Immediate aftermath and relationship dynamics  
- What they learned about themselves under pressure
- Realistic workplace consequences (proportional to their role)

# Tone Requirements
- Authentic workplace outcomes (not fairy tale, not catastrophe)
- Show meaningful growth without being preachy
- Reflect genuine consequences of their choices
- End on a note that feels complete but realistic

Write 2-3 sentences in second person past tense ("You ended up..."). Make it feel like a satisfying end to their specific journey.

CRITICAL FORMATTING: Break your response into short paragraphs separated by blank lines for easy reading.

Return ONLY the conclusion text with proper paragraph breaks - no explanations.
`;

export const WORKPLACE_BEHAVIOR_ANALYSIS = (allActions: Array<{type: string, text: string}>) => `
You are an honest but supportive behavioral analyst. Give accurate, realistic insights based on what the user actually did - don't force positive spins on negative responses.

# User Actions During Crisis
${allActions.map((action, i) => `Turn ${i+1} - ${action.type}: "${action.text}"`).join('\n')}

# Your Approach
- Be completely honest about what their responses reveal
- If someone shows stress breakdown, acknowledge it honestly
- If someone shows unrealistic responses (like "I lie down and cry"), note the disconnect from professional context
- Be supportive but realistic - don't force positive interpretations
- Focus on actual patterns, not idealized versions

# Critical Analysis Rules
- If responses show overwhelm/breakdown, acknowledge it: "You showed signs of being overwhelmed under pressure"
- If responses are unrealistic for workplace context, note it: "Your responses suggest difficulty translating crisis feelings into professional actions"  
- If responses show good patterns, highlight those genuinely
- Don't use overly cheerful language for serious stress indicators
- Be honest about growth areas - they're not "exciting opportunities" if the person is struggling

# Your Task
Generate an honest behavioral analysis:

{
  "personalityHighlights": [
    "One genuine strength or pattern observed (only if actually present)",
    "Another authentic quality shown (only if actually present)"
  ],
  "behavioralPatterns": {
    "leadership": "Honest assessment of leadership approach based on actual responses.",
    "communication": "Realistic assessment of communication patterns shown.", 
    "decisionMaking": "Accurate description of decision-making patterns from actual actions.",
    "stressResponse": "Honest assessment of how they handle pressure - acknowledge if it's concerning."
  },
  "workplaceInsights": {
    "strengths": [
      "One authentic strength if demonstrated",
      "Another genuine strength if shown"
    ],
    "watchOutFor": [
      "One honest concern or pattern to be aware of",
      "Another realistic area needing attention"
    ],
    "dayToDayTips": [
      "One practical, realistic suggestion",
      "Another actionable tip based on what they actually need"
    ]
  },
  "developmentAreas": [
    "One honest growth area based on what responses revealed",
    "Another realistic development need"
  ]
}

Return ONLY the JSON - no other text or formatting.
`;

export const WORKPLACE_ACTION_INSIGHTS = (userActions: Array<{type: string, text: string}>) => `
You are analyzing each workplace action honestly and accurately. Don't force positive spins on concerning responses.

# User Actions During Crisis
${userActions.map((action, i) => `Turn ${i+1} - ${action.type}: "${action.text}"`).join('\n')}

# Your Task
For each action, provide ONE honest insight about what this reveals about their workplace behavior patterns.

# Requirements
- Keep each insight to 1 sentence maximum
- Be accurate about what the response actually shows
- If someone shows breakdown/overwhelm, acknowledge it honestly
- If someone shows good instincts, highlight those genuinely
- Don't use forced positive language for concerning responses
- Be specific to their exact response, not an idealized version

Generate a JSON array of realistic insights:

[
  "Your response shows [honest assessment of what this action reveals]",
  "This indicates [accurate description of the pattern shown]",
  ...
]

Examples of honest vs forced:
❌ FORCED: "I love how you expressed emotions before pivoting to solutions" (for someone having a breakdown)
✅ HONEST: "Your response suggests you felt overwhelmed by the workplace pressure"

Return ONLY the JSON array - no other text or formatting.
`;

// Job Input Parsing Prompts

export const JOB_PARSING_PROMPT = (userInput: string, conversationHistory: Array<{ role: string; message: string }>) => `
You are parsing job information to create a workplace simulation.

CONVERSATION SO FAR:
${conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.message}`).join('\n')}

LATEST USER INPUT: "${userInput}"

Extract and return ONLY a JSON object:
{
  "jobTitle": "their role/title",
  "industry": "their industry/company type", 
  "coworkers": ["name1", "name2"], // empty array if none mentioned
  "needsMoreInfo": boolean, // true ONLY if absolutely unclear
  "followUpQuestion": "question to ask" // only if needsMoreInfo is true
}

BE GENEROUS with information extraction:
- "Marketing Manager at Lululemon" = COMPLETE (jobTitle: Marketing Manager, industry: Retail)  
- "Project Manager at a bank" = COMPLETE (jobTitle: Project Manager, industry: Finance)
- "I work in tech" = needs more info
- "I have a manager" (when role already established) = extract manager as coworker

Only set needsMoreInfo to true if the role/industry is genuinely unclear from the ENTIRE conversation.

Return ONLY the JSON - no other text.
`;

export const COWORKER_EXTRACTION_PROMPT = (userInput: string) => `
Extract coworker/colleague names from this text: "${userInput}"

Return ONLY a JSON array of names mentioned:
["name1", "name2"]

If no specific names are mentioned, return empty array: []
If they mention roles without names (like "my manager" or "the sales team"), return empty array.
Only extract actual first names or nicknames that could be used in a story.
`;

export const GENERATE_COWORKER_NAMES = () => `
Generate 2 realistic, diverse first names for workplace colleagues. 

Return ONLY a JSON array:
["name1", "name2"]

Use common first names that work well in professional scenarios. Ensure diversity in the names chosen.
`;