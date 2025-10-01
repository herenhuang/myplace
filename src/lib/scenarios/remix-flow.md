# Remix Simulation Turn Flow

## CORRECT TURN STRUCTURE

**Turn 1: Initial Choice (Organization scoring)**
- User chooses how to handle seeing the text notification
- Organization score based on choice (skim_respond=6, read_immediately=5, etc.)
- If user chooses to respond → goes to Turn 1 Page 3 (FullscreenIMessage)
- Text response at Turn 1 Page 3 does NOT get scored (Organization already scored from choice)

**Turn 2: Friend Text Response (Perfectionism scoring)** 
- User responds to friend's text about copyright concerns
- Uses `handleMessageWithScoring` 
- Perfectionism score based on response quality/detail

**Turn 3: APEX Instagram DM Response (Diligence scoring)**
- User responds to APEX Records Instagram DM about record deal
- Uses `handleMessageWithScoring`
- Diligence score based on response thoroughness

**Turn 4: Email Response (Prudence scoring)**
- User responds to artist manager's email about collaboration
- Uses `handleMessageWithScoring` 
- Prudence score based on response caution/consideration

## SCORING MAPPING
- Turn 1 → Organization (from choice)
- Turn 2 → Perfectionism (from text message)
- Turn 3 → Diligence (from Instagram DM) 
- Turn 4 → Prudence (from email)

## CRITICAL: Do NOT confuse the turn numbers!
- The Instagram DM is Turn 3, not Turn 2
- The friend text response is Turn 2, not Turn 1
- Turn 1 is only the initial choice