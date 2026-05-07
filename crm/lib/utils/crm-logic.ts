/**
 * Calculates a lead's "health score" from 0-100 based on various factors.
 */
export function calculateLeadHealth(lead: any): number {
  let score = 50 // Base score

  // 1. Activity Factor (Recent interaction)
  const lastActivityDate = lead.activities?.[0]?.createdAt || lead.createdAt
  const daysSinceLastActivity = (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceLastActivity <= 2) score += 20
  else if (daysSinceLastActivity <= 7) score += 10
  else score -= 15 // Stale lead penalty

  // 2. Deal Value Factor
  if (lead.estimatedValue > 10000) score += 10
  if (lead.estimatedValue > 50000) score += 15

  // 3. Status Progression
  if (lead.status === 'QUALIFIED') score += 10
  if (lead.status === 'PROPOSAL_SENT') score += 15
  if (lead.status === 'WON') score = 100
  if (lead.status === 'LOST') score = 0

  // 4. Overdue Follow-ups Penalty
  const hasOverdueFollowUp = lead.followUps?.some((f: any) => !f.completed && new Date(f.date) < new Date())
  if (hasOverdueFollowUp) score -= 25

  // Clamp score between 0 and 100
  return Math.min(Math.max(score, 0), 100)
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-blue-600'
  if (score >= 30) return 'text-orange-600'
  return 'text-rose-600'
}
