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
          result: null
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

export async function recordHumanStep(
  sessionId: string,
  stepData: HumanStepData
) {
  try {
    const supabase = await createClient()

    // Validate required parameters
    if (!sessionId) {
      console.error('❌ [HUMAN] Session ID is required')
      return { error: 'Invalid session. Please try again.' }
    }

    if (!stepData || !stepData.userResponse) {
      console.error('❌ [HUMAN] Step data is required')
      return { error: 'Invalid step data. Please try again.' }
    }

    console.log(`\n📝 [HUMAN] Recording Step ${stepData.stepNumber}:`)
    console.log(`   Question Type: ${stepData.questionType}`)
    console.log(`   User Response: "${stepData.userResponse}"`)
    console.log(`   Response Time: ${stepData.responseTimeMs}ms`)

    // Get current session
    const { data: sessionData, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (fetchError || !sessionData) {
      console.error('Error fetching session:', fetchError)
      return { error: 'Could not retrieve session.' }
    }

    // Add new step to data
    const updatedSteps = [...(sessionData.data?.steps || []), stepData]
    const totalResponseTime = updatedSteps.reduce((sum, step) => sum + step.responseTimeMs, 0)
    const averageResponseTime = totalResponseTime / updatedSteps.length

    const updatedData: HumanSessionData = {
      ...sessionData.data,
      steps: updatedSteps,
      meta: {
        ...sessionData.data.meta,
        totalResponseTime,
        averageResponseTime
      }
    }

    // Update session
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ data: updatedData })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session:', updateError)
      return { error: 'Failed to save step.' }
    }

    console.log('✅ [HUMAN] Step recorded successfully')
    return { success: true }
  } catch (error) {
    console.error('Error recording step:', error)
    return { error: 'Failed to record step.' }
  }
}

export async function saveHumanAnalysis(
  sessionId: string,
  analysisResult: any
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
        data: updatedData
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error saving analysis:', updateError)
      return { error: 'Failed to save analysis.' }
    }

    console.log('✅ [HUMAN] Analysis saved successfully')
    console.log(`   Metascore: ${analysisResult.metascore}/100`)
    console.log(`   Level: ${analysisResult.humanessLevel}`)
    
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

