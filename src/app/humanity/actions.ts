'use server'

import { createClient } from '@/lib/supabase/server'
import { HumanityStepData, HumanitySessionData } from '@/lib/humanity-types'

export async function startHumanitySession(clientSessionId?: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user }
    } = await supabase.auth.getUser()

    const sessionData: HumanitySessionData = {
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
          game_id: 'humanity-test',
          user_id: user?.id ?? null,
          session_id: clientSessionId ?? null,
          data: sessionData,
          result: null,
          steps_total: 15,
          steps_completed: 0,
          last_active_at: new Date().toISOString(),
          completed: false
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating humanity session:', error)
      return { error: 'Failed to start session.' }
    }

    console.log('✅ [HUMANITY] Session created:', data.id)
    return { success: true, sessionId: data.id }
  } catch (error) {
    console.error('Error starting humanity session:', error)
    return { error: 'Failed to start session.' }
  }
}

let humanityBatchQueue: Array<{
  sessionId: string
  stepData: HumanityStepData
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []
let humanityBatchTimeout: NodeJS.Timeout | null = null

export async function recordHumanityStep(sessionId: string, stepData: HumanityStepData) {
  if (!sessionId?.trim()) {
    console.error('❌ [HUMANITY] Session ID is required')
    return { error: 'Invalid session. Please try again.' }
  }

  if (!stepData || typeof stepData.responseTimeMs !== 'number') {
    console.error('❌ [HUMANITY] Incomplete step data')
    return { error: 'Invalid step data. Please try again.' }
  }

  console.log(
    `📝 [HUMANITY] Recording Step ${stepData.stepNumber} (${stepData.questionType}) [${stepData.responseTimeMs}ms]`
  )

  return new Promise((resolve, reject) => {
    humanityBatchQueue.push({ sessionId, stepData, resolve, reject })

    if (humanityBatchTimeout) {
      clearTimeout(humanityBatchTimeout)
    }

    const shouldProcessImmediately = humanityBatchQueue.length >= 3
    if (shouldProcessImmediately) {
      processHumanityBatch()
    } else {
      humanityBatchTimeout = setTimeout(processHumanityBatch, 1000)
    }
  })
}

async function processHumanityBatch() {
  if (humanityBatchQueue.length === 0) return

  const currentBatch = [...humanityBatchQueue]
  humanityBatchQueue = []
  humanityBatchTimeout = null

  console.log(`🔄 [HUMANITY] Processing batch of ${currentBatch.length} steps`)

  try {
    const supabase = await createClient()
    const groupedBySession = new Map<
      string,
      Array<{
        sessionId: string
        stepData: HumanityStepData
        resolve: (value: any) => void
        reject: (error: any) => void
      }>
    >()

    currentBatch.forEach(item => {
      if (!groupedBySession.has(item.sessionId)) {
        groupedBySession.set(item.sessionId, [])
      }
      groupedBySession.get(item.sessionId)!.push(item)
    })

    const sessionPromises = Array.from(groupedBySession.entries()).map(async ([sessionId, sessionBatch]) => {
      try {
        const { data: sessionRecord, error: fetchError } = await supabase
          .from('sessions')
          .select('data')
          .eq('id', sessionId)
          .single()

        if (fetchError || !sessionRecord) {
          throw new Error(`Could not retrieve session ${sessionId}: ${fetchError?.message}`)
        }

        const existingSteps: HumanityStepData[] = sessionRecord.data?.steps || []
        const newSteps = sessionBatch.map(item => item.stepData)
        const allSteps = [...existingSteps, ...newSteps]

        const totalResponseTime = allSteps.reduce((sum, step) => sum + step.responseTimeMs, 0)
        const averageResponseTime = allSteps.length > 0 ? totalResponseTime / allSteps.length : 0

        const updatedData: HumanitySessionData = {
          steps: allSteps,
          meta: {
            ...sessionRecord.data?.meta,
            totalResponseTime,
            averageResponseTime,
            startTime: sessionRecord.data?.meta?.startTime || new Date().toISOString(),
            endTime: allSteps.length >= 15 ? new Date().toISOString() : undefined
          }
        }

        const { error: updateError } = await supabase
          .from('sessions')
          .update({
            data: updatedData,
            steps_completed: allSteps.length,
            last_active_at: new Date().toISOString(),
            abandoned_at_step: null
          })
          .eq('id', sessionId)

        if (updateError) {
          throw new Error(`Failed to update session ${sessionId}: ${updateError.message}`)
        }

        sessionBatch.forEach(item => item.resolve({ success: true }))
        console.log(`✅ [HUMANITY] Saved ${sessionBatch.length} steps for session ${sessionId}`)
      } catch (error) {
        console.error(`❌ [HUMANITY] Batch error for session ${sessionId}:`, error)
        sessionBatch.forEach(item =>
          item.reject({ error: error instanceof Error ? error.message : 'Failed to save step.' })
        )
      }
    })

    await Promise.all(sessionPromises)
  } catch (error) {
    console.error('❌ [HUMANITY] Batch processing failed:', error)
    currentBatch.forEach(item => item.reject({ error: 'Batch processing failed.' }))
  }
}

export async function flushHumanityBatch() {
  if (humanityBatchQueue.length > 0) {
    await processHumanityBatch()
  }
}

export async function saveHumanityAnalysis(sessionId: string, analysisResult: unknown) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('sessions')
      .update({
        result: analysisResult,
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (error) {
      throw error
    }

    console.log(`✅ [HUMANITY] Analysis saved for session ${sessionId}`)
    return { success: true }
  } catch (error) {
    console.error('Error saving humanity analysis:', error)
    return { error: 'Failed to save analysis.' }
  }
}

