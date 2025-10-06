'use server'

import { createClient } from '@/lib/supabase/server'
import { HumanStepData, HumanSessionData } from '@/lib/human-types'

export async function startHumanSession(clientSessionId?: string) {
  try {
    const supabase = await createClient()

    // Get authenticated user (optional)
    const { data: { user } } = await supabase.auth.getUser()

    const sessionData: HumanSessionData = {
      steps: [],
      meta: {
        totalResponseTime: 0,
        averageResponseTime: 0,
        startTime: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          game_id: 'human-test',
          user_id: user?.id ?? null,
          session_id: clientSessionId ?? null,
          data: sessionData,
          result: null,
          steps_total: 15, // Human test has 15 questions
          steps_completed: 0,
          last_active_at: new Date().toISOString(),
          completed: false
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return { error: 'Failed to start session.' }
    }

    console.log('✅ [HUMAN] Session created:', data.id)
    return { success: true, sessionId: data.id }
  } catch (error) {
    console.error('Error starting session:', error)
    return { error: 'Failed to start session.' }
  }
}

// Queue for batching database operations
let batchQueue: Array<{ sessionId: string; stepData: HumanStepData; resolve: (value: any) => void; reject: (error: any) => void }> = []
let batchTimeout: NodeJS.Timeout | null = null

export async function recordHumanStep(
  sessionId: string,
  stepData: HumanStepData
) {
  // Input validation
  if (!sessionId?.trim()) {
    console.error('❌ [HUMAN] Session ID is required')
    return { error: 'Invalid session. Please try again.' }
  }

  if (!stepData || !stepData.userResponse?.trim() || typeof stepData.responseTimeMs !== 'number') {
    console.error('❌ [HUMAN] Complete step data is required')
    return { error: 'Invalid step data. Please try again.' }
  }

  // Validate response time bounds
  if (stepData.responseTimeMs < 100 || stepData.responseTimeMs > 600000) {
    console.warn(`⚠️ [HUMAN] Unusual response time: ${stepData.responseTimeMs}ms`)
  }

  console.log(`📝 [HUMAN] Recording Step ${stepData.stepNumber} (${stepData.questionType}): "${stepData.userResponse.substring(0, 50)}..." [${stepData.responseTimeMs}ms]`)

  return new Promise((resolve, reject) => {
    // Add to batch queue
    batchQueue.push({ sessionId, stepData, resolve, reject })

    // Clear existing timeout
    if (batchTimeout) {
      clearTimeout(batchTimeout)
    }

    // Process batch after delay OR if queue is full
    const shouldProcessImmediately = batchQueue.length >= 3 // Process immediately for every 3 steps
    
    if (shouldProcessImmediately) {
      processBatch()
    } else {
      // Delayed batch processing
      batchTimeout = setTimeout(processBatch, 1000) // 1 second delay
    }
  })
}

async function processBatch() {
  if (batchQueue.length === 0) return

  const currentBatch = [...batchQueue]
  batchQueue = []
  batchTimeout = null

  console.log(`🔄 [HUMAN] Processing batch of ${currentBatch.length} steps`)

  try {
    const supabase = await createClient()
    const groupedBySession = new Map<string, typeof currentBatch>()

    // Group by session ID
    currentBatch.forEach(item => {
      if (!groupedBySession.has(item.sessionId)) {
        groupedBySession.set(item.sessionId, [])
      }
      groupedBySession.get(item.sessionId)!.push(item)
    })

    // Process each session
    const sessionPromises = Array.from(groupedBySession.entries()).map(async ([sessionId, sessionBatch]) => {
      try {
        // Get current session data once
        const { data: sessionData, error: fetchError } = await supabase
          .from('sessions')
          .select('data')
          .eq('id', sessionId)
          .single()

        if (fetchError || !sessionData) {
          throw new Error(`Could not retrieve session ${sessionId}: ${fetchError?.message}`)
        }

        // Add all new steps at once
        const existingSteps = sessionData.data?.steps || []
        const newSteps = sessionBatch.map(item => item.stepData)
        const allSteps = [...existingSteps, ...newSteps]
        
        const totalResponseTime = allSteps.reduce((sum, step) => sum + step.responseTimeMs, 0)
        const averageResponseTime = totalResponseTime / allSteps.length

        const updatedData: HumanSessionData = {
          ...sessionData.data,
          steps: allSteps,
          meta: {
            ...sessionData.data?.meta,
            totalResponseTime,
            averageResponseTime,
            lastUpdated: new Date().toISOString()
          }
        }

        // Single database update per session
        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            data: updatedData,
            steps_completed: allSteps.length,
            last_active_at: new Date().toISOString(),
            abandoned_at_step: null // Clear if they came back
          })
          .eq('id', sessionId)

        if (updateError) {
          throw new Error(`Failed to update session ${sessionId}: ${updateError.message}`)
        }

        // Resolve all promises for this session
        sessionBatch.forEach(item => item.resolve({ success: true }))
        console.log(`✅ [HUMAN] Batch saved ${sessionBatch.length} steps for session ${sessionId}`)

      } catch (error) {
        console.error(`❌ [HUMAN] Batch error for session ${sessionId}:`, error)
        // Reject all promises for this session
        sessionBatch.forEach(item => item.reject({ error: error instanceof Error ? error.message : 'Failed to save step.' }))
      }
    })

    await Promise.all(sessionPromises)
    
  } catch (error) {
    console.error('❌ [HUMAN] Batch processing failed:', error)
    // Reject all remaining promises
    currentBatch.forEach(item => item.reject({ error: 'Batch processing failed.' }))
  }
}

// Force process remaining batch on cleanup
export async function flushBatch() {
  if (batchQueue.length > 0) {
    await processBatch()
  }
}

export async function saveHumanAnalysis(
  sessionId: string,
  analysisResult: unknown
) {
  try {
    const supabase = await createClient()

    console.log('💾 [HUMAN] Saving analysis result...')

    // Get current session to update end time
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      console.error('Error fetching session:', fetchError)
      return { error: 'Could not retrieve session.' }
    }

    // Update data with end time
    const updatedData = {
      ...sessionData.data,
      meta: {
        ...sessionData.data.meta,
        endTime: new Date().toISOString()
      }
    }

    // Save analysis result
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        result: analysisResult,
        data: updatedData,
        completed: true,
        steps_completed: 15, // Human test has 15 questions
        last_active_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error saving analysis:', updateError)
      return { error: 'Failed to save analysis.' }
    }

    console.log('✅ [HUMAN] Analysis saved successfully')
    const result = analysisResult as { metascore: number; humanessLevel: string }
    console.log(`   Metascore: ${result.metascore}/100`)
    console.log(`   Level: ${result.humanessLevel}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error saving analysis:', error)
    return { error: 'Failed to save analysis.' }
  }
}

export async function getPopulationStats(stepNumber: number, questionType: string) {
  try {
    const supabase = await createClient()

    // Query all sessions for this question
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('data')
      .eq('game_id', 'human-test')
      .not('data', 'is', null)

    if (error) {
      console.error('Error fetching population stats:', error)
      return { error: 'Could not retrieve population stats.' }
    }

    // Extract responses for this specific step
    const responses: string[] = []
    const responseTimes: number[] = []

    sessions?.forEach((session) => {
      const step = session.data?.steps?.find(
        (s: HumanStepData) => s.stepNumber === stepNumber
      )
      if (step) {
        responses.push(step.userResponse.toLowerCase().trim())
        responseTimes.push(step.responseTimeMs)
      }
    })

    // Calculate frequency
    const frequencyMap = new Map<string, number>()
    responses.forEach((response) => {
      frequencyMap.set(response, (frequencyMap.get(response) || 0) + 1)
    })

    // Get top 10 most common responses
    const commonResponses = Array.from(frequencyMap.entries())
      .map(([response, frequency]) => ({ response, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    return {
      success: true,
      stats: {
        totalResponses: responses.length,
        commonResponses,
        averageResponseTime
      }
    }
  } catch (error) {
    console.error('Error getting population stats:', error)
    return { error: 'Failed to get population stats.' }
  }
}
