import { createClient } from './client'
import type { ChatMessage, NegotiationState, AnalysisResult } from '../../app/investor/types'

export interface InvestorSimulationSession {
  id: string
  user_email: string
  session_token: string
  full_transcript: ChatMessage[]
  is_on_cap_table: boolean
  cap_table_amount?: number
  end_result?: string
  final_negotiation_state?: NegotiationState
  play_time_seconds?: number
  negotiation_duration_seconds?: number
  started_at: string
  completed_at?: string
  user_agent?: string
  device_fingerprint?: string
  ip_address?: string
  investor_company?: string
  investor_title?: string
}

// Helper function to check if email is in investor list (from CSV)
export async function isEmailInInvestorList(email: string): Promise<boolean> {
  // This would check against your CSV data or a simple lookup
  // For now, return true - you can implement CSV checking later
  return true
}

// Main simulation session operations
export async function createSimulationSession(data: {
  user_email: string
  session_token: string
  user_agent?: string
  device_fingerprint?: string
  ip_address?: string
  investor_company?: string
  investor_title?: string
}): Promise<InvestorSimulationSession | null> {
  const supabase = createClient()
  
  const { data: session, error } = await supabase
    .from('investor_simulation_sessions')
    .insert({
      ...data,
      full_transcript: []
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating simulation session:', error)
    return null
  }
  
  return session
}

export async function updateSimulationSession(
  sessionId: string, 
  updates: Partial<InvestorSimulationSession>
): Promise<InvestorSimulationSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('investor_simulation_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating simulation session:', error)
    return null
  }
  
  return data
}

export async function getSimulationSession(sessionId: string): Promise<InvestorSimulationSession | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('investor_simulation_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
  
  if (error) {
    console.error('Error fetching simulation session:', error)
    return null
  }
  
  return data
}

// Save full transcript and final results
export async function saveSimulationResults(
  sessionId: string,
  data: {
    full_transcript: ChatMessage[]
    is_on_cap_table: boolean
    cap_table_amount?: number
    end_result: string
    final_negotiation_state?: NegotiationState
    play_time_seconds?: number
    negotiation_duration_seconds?: number
  }
): Promise<InvestorSimulationSession | null> {
  const supabase = createClient()
  
  const { data: session, error } = await supabase
    .from('investor_simulation_sessions')
    .update({
      ...data,
      completed_at: new Date().toISOString()
    })
    .eq('id', sessionId)
    .select()
    .single()
  
  if (error) {
    console.error('Error saving simulation results:', error)
    return null
  }
  
  return session
}

// Get all simulation sessions for analytics
export async function getAllSimulationSessions(): Promise<InvestorSimulationSession[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('investor_simulation_sessions')
    .select('*')
    .order('started_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching simulation sessions:', error)
    return []
  }
  
  return data || []
}

// Get sessions by email
export async function getSimulationSessionsByEmail(email: string): Promise<InvestorSimulationSession[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('investor_simulation_sessions')
    .select('*')
    .eq('user_email', email)
    .order('started_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching simulation sessions by email:', error)
    return []
  }
  
  return data || []
}

// Analytics queries
export async function getCapTableStats(): Promise<{
  total_sessions: number
  on_cap_table: number
  average_amount: number
  total_amount: number
}> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('investor_simulation_sessions')
    .select('is_on_cap_table, cap_table_amount')
    .not('completed_at', 'is', null)
  
  if (error) {
    console.error('Error fetching cap table stats:', error)
    return { total_sessions: 0, on_cap_table: 0, average_amount: 0, total_amount: 0 }
  }
  
  const totalSessions = data.length
  const onCapTable = data.filter(s => s.is_on_cap_table).length
  const amounts = data.filter(s => s.cap_table_amount).map(s => s.cap_table_amount!)
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0)
  const averageAmount = amounts.length > 0 ? totalAmount / amounts.length : 0
  
  return {
    total_sessions: totalSessions,
    on_cap_table: onCapTable,
    average_amount: averageAmount,
    total_amount: totalAmount
  }
}
