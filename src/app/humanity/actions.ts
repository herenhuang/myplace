'use server'

import { createClient } from '@/lib/supabase/server'
import {
  HumanitySessionData,
  HumanityStepData,
} from '@/lib/humanity-types'

const GAME_ID = 'humanity-simulation'
const TOTAL_STEPS = 16

export async function startHumanitySession(clientSessionId?: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const sessionData: HumanitySessionData = {
      steps: [],
      meta: {
        totalResponseTime: 0,
        averageResponseTime: 0,
        startTime: new Date().toISOString(),
      },
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([
        {
          game_id: GAME_ID,
          user_id: user?.id ?? null,
          session_id: clientSessionId ?? null,
          data: sessionData,
          result: null,
          steps_total: TOTAL_STEPS,
          steps_completed: 0,
          last_active_at: new Date().toISOString(),
          completed: false,
        },
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

let batchQueue: Array<{
  sessionId: string
  stepData: HumanityStepData
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
}> = []

let batchTimeout: NodeJS.Timeout | null = null

export async function recordHumanityStep(
  sessionId: string,
  stepData: HumanityStepData,
) {
  if (!sessionId?.trim()) {
    console.error('[HUMANITY] Missing session ID')
    return { error: 'Invalid session. Please try again.' }
  }

  if (!stepData || typeof stepData.responseTimeMs !== 'number') {
    console.error('[HUMANITY] Invalid step payload')
    return { error: 'Invalid step data. Please try again.' }
  }

  return new Promise((resolve, reject) => {
    batchQueue.push({ sessionId, stepData, resolve, reject })

    if (batchTimeout) {
      clearTimeout(batchTimeout)
    }

    const shouldProcessImmediately = batchQueue.length >= 3

    if (shouldProcessImmediately) {
      processBatch()
    } else {
      batchTimeout = setTimeout(processBatch, 1200)
    }
  })
}

async function processBatch() {
  if (batchQueue.length === 0) return

  const currentBatch = [...batchQueue]
  batchQueue = []
  batchTimeout = null

  try {
    const supabase = await createClient()
    const grouped = new Map<string, typeof currentBatch>()

    currentBatch.forEach((item) => {
      if (!grouped.has(item.sessionId)) grouped.set(item.sessionId, [])
      grouped.get(item.sessionId)!.push(item)
    })

    await Promise.all(
      Array.from(grouped.entries()).map(async ([sessionId, entries]) => {
        try {
          const { data: existing, error } = await supabase
            .from('sessions')
            .select('data')
            .eq('id', sessionId)
            .single()

          if (error || !existing) {
            throw new Error(
              `Unable to fetch session ${sessionId}: ${error?.message}`,
            )
          }

          const sessionData = existing.data as HumanitySessionData
          const steps = sessionData?.steps ?? []
          const mergedSteps = [...steps, ...entries.map((e) => e.stepData)]
          const totalResponseTime = mergedSteps.reduce(
            (sum, step) => sum + step.responseTimeMs,
            0,
          )
          const averageResponseTime =
            mergedSteps.length > 0
              ? Math.round(totalResponseTime / mergedSteps.length)
              : 0

          const updatedData: HumanitySessionData = {
            steps: mergedSteps,
            meta: {
              ...sessionData?.meta,
              totalResponseTime,
              averageResponseTime,
              endTime: mergedSteps.length === TOTAL_STEPS
                ? new Date().toISOString()
                : sessionData?.meta?.endTime,
              startTime:
                sessionData?.meta?.startTime ?? new Date().toISOString(),
            },
          }

          const { error: updateError } = await supabase
            .from('sessions')
            .update({
              data: updatedData,
              steps_completed: mergedSteps.length,
              last_active_at: new Date().toISOString(),
            })
            .eq('id', sessionId)

          if (updateError) {
            throw new Error(
              `Failed saving session ${sessionId}: ${updateError.message}`,
            )
          }

          entries.forEach((entry) => entry.resolve({ success: true }))
        } catch (sessionError) {
          console.error(`[HUMANITY] Failed to persist batch:`, sessionError)
          entries.forEach((entry) =>
            entry.reject({
              error:
                sessionError instanceof Error
                  ? sessionError.message
                  : 'Failed to save step.',
            }),
          )
        }
      }),
    )
  } catch (batchError) {
    console.error('[HUMANITY] Batch processing error:', batchError)
    currentBatch.forEach((entry) =>
      entry.reject({ error: 'Batch processing failed.' }),
    )
  }
}

export async function saveHumanityAnalysis(
  sessionId: string,
  analysisResult: unknown,
) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('sessions')
      .update({
        result: analysisResult,
        completed: true,
        last_active_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      console.error('Failed to store humanity analysis:', error)
      return { error: 'Could not save analysis.' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error saving humanity analysis:', error)
    return { error: 'Could not save analysis.' }
  }
}

