import { NextRequest, NextResponse } from 'next/server'

interface ScoreRequest {
  subtrait: 'Organization' | 'Perfectionism' | 'Prudence' | 'Diligence'
  userResponse: string
  context: string
  turn: number
}

interface ScoreResponse {
  score: number
  rationale: string
}

const SUBTRAIT_DEFINITIONS = {
  Organization: "The Organization scale assesses a tendency to seek order, particularly in one's physical surroundings. Low scorers tend to be sloppy and haphazard, whereas high scorers keep things tidy and prefer a structured approach to tasks.",
  
  Perfectionism: "The Perfectionism scale assesses a tendency to be thorough and concerned with details. Low scorers tolerate some errors in their work and tend to neglect details, whereas high scorers check carefully for mistakes and potential improvements.",
  
  Prudence: "The Prudence scale assesses a tendency to deliberate carefully and to inhibit impulses. Low scorers act on impulse and tend not to consider consequences, whereas high scorers consider their options carefully and tend to be cautious and self-controlled.",
  
  Diligence: "The Diligence scale assesses a tendency to work hard. Low scorers have little self-discipline and are not strongly motivated to achieve, whereas high scorers have a strong 'work ethic' and are willing to exert themselves."
}

const NORMATIVE_DATA = {
  Organization: { mean: 5.0, sd: 2.0 },
  Perfectionism: { mean: 5.0, sd: 2.0 },
  Prudence: { mean: 5.0, sd: 2.0 },
  Diligence: { mean: 5.0, sd: 2.0 }
}

const CONTEXT_DESCRIPTIONS = {
  2: "User is responding to a viral remix situation where their track has gained unexpected attention and recognition.",
  3: "User is deciding how to respond to a record label (APEX Records) offering to sign their remix but requiring permission from the original artist within 24 hours.",
  4: "User is crafting their final response/strategy after learning more about the situation and considering their next steps."
}

function buildPerfectionismPrompt(userResponse: string): string {
  return `You are **Dr. Kibeom Lee**, co-author of the HEXACO-PI-R, with 20+ years of experience in personality assessment. You are scoring responses for the **Perfectionism** facet of Conscientiousness.

---

## **TRAIT DEFINITION**
**Perfectionism**: The tendency to be thorough and concerned with details. Low scorers tolerate some errors in their work and tend to neglect details, whereas high scorers check carefully for mistakes and potential improvements.

**Normative Data**: M = 5.0, SD = 2.0 (College sample)

---

## **SCENARIO CONTEXT**
The user posted a viral remix (2M+ views) using original audio without permission. Their friend just texted: **"Woah, there's so many copyright comments on your remix... are you gonna do anything about it??"**

This scenario directly tests perfectionism because it involves:
- **Recognizing mistakes/oversights** in their work process
- **Attention to detail** regarding legal/technical requirements  
- **Thoroughness** in addressing identified problems
- **Quality control** after the fact

---

## **SCORING RUBRIC & EXAMPLES**

### **SCORE 9 - Exceptional Perfectionism**
**Cognitive Process**: Deep mistake acknowledgment + comprehensive improvement planning + quality control focus
**ONLY LONG responses qualify** (requires demonstrating thorough attention to detail)
**Example**: *"Oh no, I should have been way more careful before posting. I'm going to research the proper licensing process, understand exactly what permissions I need, and figure out the correct way to handle this. I want to make sure I do everything properly and learn from this mistake so it doesn't happen again."*

### **SCORE 8 - High Perfectionism** 
**Cognitive Process**: Clear mistake recognition + detailed improvement commitment + quality-focused action
**ONLY LONG responses qualify** (requires substantial detail orientation)
**Example**: *"Yeah, I messed up not checking this first. I need to look into how to properly clear this, research the copyright requirements, and do it right. I should have been more thorough from the beginning."*

### **SCORE 7 - Above Average**
**Cognitive Process**: Strong improvement focus + some mistake awareness + detail-seeking behavior
**LONG Example**: *"I should probably research the copyright laws around this and see what I need to do. I want to make sure I handle this properly and understand the requirements better."*
**SHORT Example**: *"I should research the copyright laws and handle this properly."*

### **SCORE 6 - Slightly Above Average**
**Cognitive Process**: Shows concern for quality + some detail awareness + moderate thoroughness
**LONG Example**: *"Yeah, that's concerning. I should figure out what to do about this and make sure I'm handling it the right way. I don't want to make things worse by not being careful."*
**SHORT Example**: *"That's concerning. I should figure out how to handle this properly."*

### **SCORE 5 - Average**
**Cognitive Process**: Acknowledges issue + limited quality concern + passive approach to details
**LONG Example**: *"I see them too. I guess we'll see what happens, though I know it's concerning and I should probably do something about it eventually."*
**SHORT Example**: *"I see them too. I guess we'll see what happens."*

### **SCORE 4 - Below Average**
**Cognitive Process**: Minimal quality concern + superficial engagement + limited detail focus
**LONG Example**: *"Yeah, I noticed that too. I'll see what happens. Maybe I should think about it at some point, but I'm not really sure what to do about copyright stuff anyway."*
**SHORT Example**: *"Yeah, I noticed that too. I'll see what happens."*

### **SCORE 3 - Low Perfectionism**
**Cognitive Process**: Deflection + blame-shifting + dismissive of quality standards
**LONG Example**: *"Well, the platform should have warned me about copyright before I posted. Everyone does remixes and they don't usually get in trouble. It's not really my fault that the system doesn't make this stuff clearer. Why should I have to worry about all these legal details?"*
**SHORT Example**: *"The platform should have warned me. It's not really my fault."*

### **SCORE 2 - Very Low**
**Cognitive Process**: Careless dismissal + low quality standards + avoiding thoroughness
**LONG Example**: *"It's probably fine, lots of people do remixes all the time and nothing happens to them. I'll deal with it if it becomes a real problem, but I don't think I need to worry about it too much. These things usually work themselves out."*
**SHORT Example**: *"It's probably fine. I'll deal with it if it becomes a problem."*

### **SCORE 1 - Extremely Low**
**Cognitive Process**: No quality concern + complete disengagement + no attention to detail
**LONG Example**: *"Woah erm... I don't know, whatever I guess. Don't worry about it, it's probably nothing. I mean, lots of people post remixes and stuff, so... yeah, whatever happens happens. I'm not really worried about it..."*
**SHORT Example**: *"Whatever"* or *"Don't worry about it"* or *"Woah erm... I"* (incomplete thought)

---

## **CRITICAL SCORING GUIDELINES**

### **RED FLAGS for Low Scores (1-3)**:
- **Blame/deflection**: Putting responsibility on others/system
- **Incomplete responses**: Trailing off, unfinished thoughts, minimal effort
- **Dismissive attitude**: "It's fine," "Whatever," ignoring the problem
- **No engagement**: Single words, avoiding the question entirely

### **GREEN FLAGS for High Scores (7-9)**:
- **Mistake ownership**: "I should have..." "I messed up..."
- **Process orientation**: Specific steps to research/fix properly
- **Detail awareness**: Understanding the complexity of copyright issues
- **Improvement focus**: Commitment to doing it "right" or "properly"

### **LENGTH vs. QUALITY DISTINCTION**:
- **High Perfectionism (8-9)**: MUST be long because it requires demonstrating comprehensive quality control and detailed improvement planning
- **Low Perfectionism (1-3)**: Can be ANY length - brief dismissal OR long blame-shifting rambling both show lack of perfectionism
- **Medium Perfectionism (4-7)**: Can be short or long, quality of detail orientation matters more than length

### **PERFECTIONISM vs OTHER TRAITS**:
- This is NOT about **speed** (that's Diligence)
- This is NOT about **caution** (that's Prudence) 
- This IS about **thoroughness, attention to detail, and quality control**

---

## **RESPONSE EVALUATION**
**User Response**: ${JSON.stringify(userResponse)}

Based on the perfectionism definition, scenario context, and examples above, assign a score 1-9 considering:
1. Level of thoroughness in addressing the copyright concern
2. Attention to detail/quality control shown
3. Recognition of need for careful checking/improvement
4. Overall engagement with the precision required

**Output ONLY this JSON**:
\`\`\`json
{
  "score": X,
  "rationale": "Specific reasoning based on perfectionism markers shown/absent in response"
}
\`\`\``
}

// Placeholder functions for other traits (to be implemented)
function buildDiligencePrompt(userResponse: string): string {
  return `You are **Dr. Kibeom Lee**, co-author of the HEXACO-PI-R, with 20+ years of experience in personality assessment. You are scoring responses for the **Diligence** facet of Conscientiousness.

---

## **TRAIT DEFINITION**
**Diligence**: The tendency to work hard. Low scorers have little self-discipline and are not strongly motivated to achieve, whereas high scorers have a strong "work ethic" and are willing to exert themselves.

**Normative Data**: M = 5.0, SD = 2.0 (College sample)

---

## **SCENARIO CONTEXT**
The user received an Instagram DM from APEX Records offering to sign their viral remix: **"Hey [userName]! We love your remix, it's 🔥. We want to sign it for an official release... But we need to move fast. The hype window is short. Can you get permission from the original artist by tomorrow? Gonna need a response ASAP."**

This scenario directly tests diligence because it involves:
- **Willingness to put in effort** vs. being overwhelmed by work required
- **Self-motivation to achieve** vs. needing others to push them  
- **Work ethic in time-sensitive situations** vs. giving up when it's hard
- **Taking initiative** vs. waiting for things to happen
- **Persistence despite obstacles** vs. easily discouraged
- **Self-discipline to follow through** vs. procrastination/avoidance

---

## **SCORING RUBRIC & EXAMPLES**

### **SCORE 9 - Exceptional Diligence**
**Cognitive Process**: Immediate action planning + comprehensive work commitment + persistent mindset
**ONLY LONG responses qualify** (requires demonstrating detailed work ethic)
**Example**: *"Absolutely! I'm going to reach out to the artist's team right now and put in serious effort to make this happen by tomorrow. Let me start calling management companies, reaching out to my industry contacts, and researching the best way to get in touch with them directly. I'll work through the night if I need to and try every avenue possible."*

### **SCORE 8 - High Diligence**
**Cognitive Process**: Clear work commitment + detailed action plan + strong motivation
**ONLY LONG responses qualify** (requires substantial effort demonstration)
**Example**: *"Yes! Let me get on this immediately and work through all my contacts. I'll start reaching out to their management, check industry directories, and see if anyone in my network has connections. I'll do whatever it takes to get this done by tomorrow."*

### **SCORE 7 - Above Average**
**Cognitive Process**: Strong work commitment + specific action steps + some urgency
**LONG Example**: *"Absolutely, I'm going to start reaching out to their management right now and see what I can do. Let me check my contacts and start making calls to see if I can track down the right people to talk to."*
**SHORT Example**: *"I'll start reaching out immediately and work through all my contacts."*

### **SCORE 6 - Slightly Above Average**
**Cognitive Process**: Willing to work + some action plan + moderate effort commitment
**LONG Example**: *"Yes, I can definitely try. Let me start researching how to contact them and get on this. I'll see if I can find their management info and reach out today to get the ball rolling."*
**SHORT Example**: *"Yes, let me research how to contact them and get started."*

### **SCORE 5 - Average**
**Cognitive Process**: Some willingness + limited effort commitment + uncertain follow-through
**LONG Example**: *"Yeah, I can try to reach out and see what happens. I'll look into it and see if I can figure out how to get in touch with them, though 24 hours is pretty tight."*
**SHORT Example**: *"I can try to reach out and see what happens."*

### **SCORE 4 - Below Average**
**Cognitive Process**: Minimal work commitment + passive approach + low motivation
**LONG Example**: *"I guess I'll see if I can find their contact info somewhere. Maybe I can look online or something, but I'm not really sure how to go about this kind of thing. It seems pretty complicated."*
**SHORT Example**: *"I guess I'll see if I can find their contact info."*

### **SCORE 3 - Low Diligence**
**Cognitive Process**: Work avoidance + excuse-making + easy discouragement
**LONG Example**: *"24 hours isn't realistic, record labels should know better than to give such short deadlines. This kind of thing usually takes weeks to set up properly. If it's this hard already, maybe it's not meant to be. There's got to be an easier way."*
**SHORT Example**: *"24 hours isn't realistic. This seems too hard."*

### **SCORE 2 - Very Low**
**Cognitive Process**: Clear work avoidance + overwhelming easily + lack of motivation
**LONG Example**: *"That's so much work, I don't know where to start. This seems really complicated and I'm not sure I'm the right person to handle this kind of business stuff. Maybe you guys should just take care of the permission thing since you probably have better connections anyway."*
**SHORT Example**: *"That's so much work. This seems too complicated for me."*

### **SCORE 1 - Extremely Low**
**Cognitive Process**: Complete work refusal + no engagement + minimal acknowledgment
**LONG Example**: *"Woah erm... I don't know about this. That sounds like your job, not mine, you know? I mean, I just make music, I don't really do the business side of things. Can't you guys just handle all the permission stuff? I thought that's what record labels do... I'm not really sure what you want me to do here..."*
**SHORT Example**: *"ok"*, *"sure"*, *"yeah"*, *"Woah erm... I"*, *"That sounds like your job, not mine."*

**CRITICAL**: Any minimal response showing ZERO work commitment gets Score 1. This includes single words like "ok", "sure", "yeah" that acknowledge the request but show no effort, planning, or engagement with the work required.

---

## **CRITICAL SCORING GUIDELINES**

### **RED FLAGS for Low Scores (1-3)**:
- **Complete work avoidance**: Refusing to contribute or engage
- **Incomplete responses**: Trailing off, unfinished thoughts, minimal effort
- **Easy discouragement**: Giving up before trying
- **Making excuses**: Blaming timeline, circumstances, others
- **Overwhelming easily**: "Too much work," "too complicated"

### **GREEN FLAGS for High Scores (7-9)**:
- **Immediate action**: "Right now," "immediately," "let me start"
- **Strong work commitment**: "Whatever it takes," "serious effort"
- **Self-motivation**: Taking initiative without being pushed
- **Persistence mindset**: Willing to overcome obstacles

### **SMART COLLABORATION vs. WORK AVOIDANCE**:
**GOOD (Higher scores)**:
- "Can you help me figure out the best way to approach this?"
- "I'll start reaching out - do you have any contacts that might help?"
- "Let me handle the research part, can you help with the industry connections?"

**BAD (Lower scores)**:
- "You figure it out and let me know"
- "Can't you guys just handle all the permission stuff?"
- "That sounds like your department, not mine"

### **LENGTH vs. QUALITY DISTINCTION**:
- **High Diligence (8-9)**: MUST be long because it requires demonstrating comprehensive work ethic and detailed action plans
- **Low Diligence (1-3)**: Can be ANY length - brief work avoidance OR long excuse-making rambling both show lack of work ethic
- **Medium Diligence (4-7)**: Can be short or long, quality of work commitment matters more than length

### **DILIGENCE vs OTHER TRAITS**:
- This is NOT about **caution/planning** (that's Prudence)
- This is NOT about **attention to detail** (that's Perfectionism)
- This IS about **work ethic, effort, and willingness to exert themselves**

---

## **RESPONSE EVALUATION**
**User Response**: ${JSON.stringify(userResponse)}

Based on the diligence definition, scenario context, and examples above, assign a score 1-9 considering:
1. Willingness to put in effort and work hard
2. Self-motivation and initiative shown
3. Work ethic in time-sensitive situation
4. Overall engagement with the demanding opportunity

**Output ONLY this JSON**:
\`\`\`json
{
  "score": X,
  "rationale": "Specific reasoning based on diligence markers shown/absent in response"
}
\`\`\``
}

function buildPrudencePrompt(userResponse: string): string {
  return `You are **Dr. Kibeom Lee**, co-author of the HEXACO-PI-R, with 20+ years of experience in personality assessment. You are scoring responses for the **Prudence** facet of Conscientiousness.

---

## **TRAIT DEFINITION**
**Prudence**: The tendency to deliberate carefully and to inhibit impulses. Low scorers act on impulse and tend not to consider consequences, whereas high scorers consider their options carefully and tend to be cautious and self-controlled.

**Normative Data**: M = 5.0, SD = 2.0 (College sample)

---

## **SCENARIO CONTEXT**
The user received an email from Sarah (artist's manager): **"Hi [userName], We saw your remix and absolutely loved it — the energy, the direction, everything. [ArtistName] would love to re-record it with you properly in-studio and release it together. We'd need about two weeks to pull it off the right way. Let me know if you're interested — we can make something great here."**

This scenario directly tests prudence because it involves:
- **Deliberating carefully** vs. immediate gut reactions
- **Considering consequences** vs. ignoring potential downsides (momentum loss)
- **Asking clarifying questions** vs. jumping to conclusions
- **Measured decision-making** vs. uncontrolled impulses
- **Self-control in responses** vs. emotional reactivity
- **Impulse inhibition** when faced with exciting opportunities

---

## **SCORING RUBRIC & EXAMPLES**

### **SCORE 9 - Exceptional Prudence**
**Cognitive Process**: Deep deliberation + multiple consequence consideration + sophisticated restraint
**ONLY LONG responses qualify** (requires comprehensive deliberation)
**Example**: *"This is an incredible opportunity that I'm really excited about. Before I commit, I need to understand how this affects my current momentum, what the collaboration terms would be, and how we'd handle rights. Can we also discuss contingency plans if the studio timeline changes? I want to make sure we approach this thoughtfully."*

### **SCORE 8 - High Prudence**
**Cognitive Process**: Clear deliberation + key consequence awareness + thoughtful restraint
**ONLY LONG responses qualify** (requires substantial consideration)
**Example**: *"I'm definitely interested! This could be amazing, but I want to make sure I understand what I'm agreeing to. What would the partnership look like, and how do we balance the quality benefits with the momentum timing? I need to think through all the implications."*

### **SCORE 7 - Above Average**
**Cognitive Process**: Some deliberation + aware of major trade-off + measured response
**LONG Example**: *"This sounds like a great opportunity! I'm just thinking about the timing - two weeks means losing some viral momentum. Can you tell me more about how the collaboration would work and what the terms would be?"*
**SHORT Example**: *"I'm interested but need to understand the timing trade-off and collaboration terms first."*

### **SCORE 6 - Slightly Above Average**
**Cognitive Process**: Brief pause + limited consequence awareness + some caution
**LONG Example**: *"Yes, I'm interested! Though I'm wondering - won't two weeks kill my current buzz? But if you think it's worth it, maybe we can figure out how to make it work while minimizing the momentum loss."*
**SHORT Example**: *"Yes, but what about losing momentum in two weeks? Can we discuss that?"*

### **SCORE 5 - Average**
**Cognitive Process**: Recognizes decision importance but limited deliberation
**LONG Example**: *"This sounds like a big opportunity and I appreciate you reaching out. Two weeks is a while but if you think that's what it takes to do it right, I'm willing to consider it seriously."*
**SHORT Example**: *"Sounds like a great opportunity. I'm interested."*

### **SCORE 4 - Below Average**
**Cognitive Process**: Minimal deliberation + mostly impulse-driven
**LONG Example**: *"Yes! This is what I've been hoping for! I love [Artist] and would be thrilled to work together. Two weeks sounds fine - whatever it takes to make great music together!"*
**SHORT Example**: *"Yes! This is exactly what I wanted! Let's do it!"*

### **SCORE 3 - Low Prudence**
**Cognitive Process**: Emotional reaction + little consequence consideration
**LONG Example**: *"OMG yes! This is amazing! I can't believe [Artist] wants to work with me! I've been a huge fan forever and this is like a dream come true! Two weeks is perfect! When do we start? Can I come to the studio tomorrow?"*
**SHORT Example**: *"OMG yes! This is amazing! When do we start?"*

### **SCORE 2 - Very Low**
**Cognitive Process**: Pure impulse + no deliberation + emotional overwhelm
**LONG Example**: *"OMG YES! This is literally my dream come true! I can't believe [Artist] wants to work with me! I've been listening to their music since I was a kid and now they want to collaborate! This is going to be absolutely incredible! I'm so ready for this! Two weeks is perfect because I can quit my job and focus entirely on this! When do we start? Can I come to the studio tomorrow? This is the best day of my life!"*
**SHORT Example**: *"YES! Absolutely! Right now! I'm so ready!"*

### **SCORE 1 - Extremely Low**
**Cognitive Process**: No processing + incomplete impulse control + confused rambling
**LONG Example**: *"Woah erm, OK would love to. Any way you and [Artist] can make this happen sooner than 2 weeks? Just want to make sure we capitalize on our momentum! I mean, I'm super excited but also like, you know, the timing thing is... well, actually, two weeks might be fine? Or maybe sooner? I don't know, what do you think works best? I'm just thinking out loud here but..."*
**SHORT Example**: *"Woah erm... yes!"* or *"Sure whatever works!"*

---

## **CRITICAL SCORING GUIDELINES**

### **RED FLAGS for Low Scores (1-3)**:
- **Pure emotional reaction**: "OMG!", "This is my dream!", excessive excitement without thought
- **No consequence consideration**: Ignoring momentum loss, timing issues entirely
- **Immediate agreement**: "YES!" without any deliberation markers
- **Incomplete responses**: Trailing off, confused rambling, unfinished thoughts
- **Impulsive demands**: Wanting to change terms immediately without consideration

### **GREEN FLAGS for High Scores (7-9)**:
- **Deliberation language**: "I need to think," "Before I commit," "Let me consider"
- **Consequence awareness**: Acknowledging momentum vs. quality trade-offs
- **Question-asking**: Seeking clarification before deciding
- **Controlled enthusiasm**: Excited but measured response
- **Process-oriented**: "How would this work?", "What are the terms?"

### **LENGTH vs. QUALITY DISTINCTION**:
- **High Prudence (8-9)**: MUST be long because it requires demonstrating complex deliberation
- **Low Prudence (1-3)**: Can be ANY length - brief impulses OR long emotional rambling both show lack of prudence
- **Medium Prudence (4-7)**: Can be short or long, quality of deliberation matters more than length

### **PRUDENCE vs OTHER TRAITS**:
- This is NOT about **work ethic** (that's Diligence)
- This is NOT about **attention to detail** (that's Perfectionism)
- This IS about **impulse control, careful deliberation, and considering consequences**

---

## **RESPONSE EVALUATION**
**User Response**: ${JSON.stringify(userResponse)}

Based on the prudence definition, scenario context, and examples above, assign a score 1-9 considering:
1. Level of deliberation vs. impulsive reaction
2. Consideration of consequences (momentum vs. quality trade-off)
3. Self-control in decision-making process
4. Quality of thought organization vs. emotional overwhelm

**Output ONLY this JSON**:
\`\`\`json
{
  "score": X,
  "rationale": "Specific reasoning based on prudence markers shown/absent in response"
}
\`\`\``
}

function buildOrganizationPrompt(userResponse: string): string {
  // Organization is scored from Turn 1 choices, not text responses
  // This function exists for completeness but shouldn't be called
  throw new Error('Organization is scored from Turn 1 choices, not text responses')
}

function buildScoringPrompt(subtrait: keyof typeof SUBTRAIT_DEFINITIONS, userResponse: string, turn: number): string {
  switch (subtrait) {
    case 'Perfectionism':
      return buildPerfectionismPrompt(userResponse)
    case 'Diligence':
      return buildDiligencePrompt(userResponse)
    case 'Prudence':
      return buildPrudencePrompt(userResponse)
    case 'Organization':
      return buildOrganizationPrompt(userResponse)
    default:
      throw new Error(`Unknown subtrait: ${subtrait}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ScoreRequest = await request.json()
    const { subtrait, userResponse, turn } = body

    // Validate input
    if (!subtrait || !userResponse || !turn) {
      return NextResponse.json(
        { error: 'Missing required fields: subtrait, userResponse, turn' },
        { status: 400 }
      )
    }

    if (!SUBTRAIT_DEFINITIONS[subtrait]) {
      return NextResponse.json(
        { error: `Invalid subtrait: ${subtrait}` },
        { status: 400 }
      )
    }

    // Build the scoring prompt
    const prompt = buildScoringPrompt(subtrait, userResponse, turn)

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const content = result.content[0].text
    console.log('Claude response content:', content)

    // Extract JSON from the response - try multiple formats
    let jsonStr = null
    
    // First try to find JSON in code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1]
    } else {
      // Try to find JSON without code blocks
      const jsonObjectMatch = content.match(/\{[\s\S]*\}/)
      if (jsonObjectMatch) {
        jsonStr = jsonObjectMatch[0]
      } else {
        // Fallback - try to extract score and rationale from text
        const scoreMatch = content.match(/score[\":\s]*(\d)/i)
        const rationaleMatch = content.match(/rationale[\":\s]*[\"']([^\"']+)[\"']/i)
        
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1])
          const rationale = rationaleMatch ? rationaleMatch[1] : "Score extracted from response"
          jsonStr = JSON.stringify({ score, rationale })
        } else {
          throw new Error('Could not parse JSON response from Claude')
        }
      }
    }

    const scoreData: ScoreResponse = JSON.parse(jsonStr)

    // Validate score is 1-9
    if (scoreData.score < 1 || scoreData.score > 9 || !Number.isInteger(scoreData.score)) {
      throw new Error(`Invalid score: ${scoreData.score}. Must be integer 1-9.`)
    }

    return NextResponse.json({
      success: true,
      score: scoreData.score,
      rationale: scoreData.rationale,
      subtrait
    })

  } catch (error) {
    console.error('Error in scoreTrait API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to score trait',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}