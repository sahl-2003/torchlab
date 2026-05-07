import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch relevant leads (Qualified, Proposal Sent, Won)
    const activeDeals = await prisma.lead.findMany({
      where: {
        status: {
          in: ['QUALIFIED', 'PROPOSAL_SENT', 'WON']
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // 2. Calculate Metrics
    const pipelineValue = activeDeals.reduce((sum: number, lead: any) => sum + (lead.estimatedValue || 0), 0)
    
    // Forecasted = estimatedValue * probability (simplified mapping)
    const probabilityMap: Record<string, number> = {
      'QUALIFIED': 0.3,
      'PROPOSAL_SENT': 0.6,
      'WON': 1.0
    }
    const forecastedRevenue = activeDeals.reduce((sum: number, lead: any) => {
      const prob = probabilityMap[lead.status as string] || 0
      return sum + ((lead.estimatedValue || 0) * prob)
    }, 0)

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const wonThisMonthLeads = activeDeals.filter((l: any) => l.status === 'WON' && l.updatedAt >= firstDayOfMonth)
    const wonThisMonthValue = wonThisMonthLeads.reduce((sum: number, l: any) => sum + (l.estimatedValue || 0), 0)

    return NextResponse.json({
      deals: activeDeals.map((d: any) => ({
        id: d.id,
        title: `${d.name} Opportunity`,
        client: d.company,
        value: d.estimatedValue || 0,
        stage: d.status.replace('_', ' '),
        probability: `${(probabilityMap[d.status as string] || 0) * 100}%`,
        expectedClose: d.nextFollowUp?.toLocaleDateString() || 'TBD'
      })),
      metrics: {
        pipelineValue,
        forecastedRevenue: Math.round(forecastedRevenue),
        wonThisMonthValue,
        wonDealsCount: wonThisMonthLeads.length,
        // Mock trend data for UI consistency
        pipelineTrend: '+12% from last month',
        forecastTrend: 'Based on probability',
        wonTrend: `${wonThisMonthLeads.length} Deals Closed`
      }
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
