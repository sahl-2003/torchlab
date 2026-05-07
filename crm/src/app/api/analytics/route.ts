import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/auth'

export async function GET() {
  const session = await requireAuth()
  if (!session) return unauthorized()

  try {
    const allLeads = await prisma.lead.findMany()
    const wonLeads = allLeads.filter(l => l.status === 'WON')
    const lostLeads = allLeads.filter(l => l.status === 'LOST')
    const totalLeads = allLeads.length

    // 1. Avg Deal Size (from WON leads)
    const avgDealSize = wonLeads.length > 0 
      ? wonLeads.reduce((sum: number, l: any) => sum + (l.estimatedValue || 0), 0) / wonLeads.length 
      : 0

    // 2. Sales Cycle (Days from created to WON)
    const salesCycle = wonLeads.length > 0
      ? wonLeads.reduce((sum: number, l: any) => {
          const days = Math.ceil((l.updatedAt.getTime() - l.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          return sum + (days || 1) // Min 1 day
        }, 0) / wonLeads.length
      : 0

    // 3. Win Rate
    const winRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0

    // 4. Active Leads (Not WON or LOST)
    const activeLeads = allLeads.filter((l: any) => l.status !== 'WON' && l.status !== 'LOST').length

    // 5. Lead Source Data
    const sourcesMap = allLeads.reduce((acc: Record<string, number>, lead: any) => {
      const src = lead.source || 'MANUAL'
      acc[src] = (acc[src] || 0) + 1
      return acc
    }, {})

    const sourceColors: Record<string, string> = {
      'LINKEDIN': '#3b82f6',
      'WEBSITE': '#10b981',
      'REFERRAL': '#f59e0b',
      'COLD_OUTREACH': '#ef4444',
      'MANUAL': '#94a3b8'
    }

    const leadSourceData = Object.entries(sourcesMap).map(([name, value]) => ({
      name: name.toLowerCase().replace(/^\w/, c => c.toUpperCase()),
      value: Math.round((value / totalLeads) * 100),
      color: sourceColors[name] || '#94a3b8'
    }))

    // 6. Revenue Forecast vs Actual (Last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    interface ChartItem {
      month: string;
      monthIdx: number;
      year: number;
      current: number;
      target: number;
    }
    const last6Months: ChartItem[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6Months.push({
        month: months[d.getMonth()],
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        current: 0, // Actual (WON in that month)
        target: 0   // Forecast (PROPOSAL_SENT in that month or overall)
      })
    }

    allLeads.forEach((lead: any) => {
      const leadDate = lead.updatedAt
      const monthIdx = leadDate.getMonth()
      const year = leadDate.getFullYear()
      
      const chartItem = last6Months.find(m => m.monthIdx === monthIdx && m.year === year)
      if (chartItem) {
        if (lead.status === 'WON') {
          chartItem.current += (lead.estimatedValue || 0)
        }
        if (lead.status === 'PROPOSAL_SENT' || lead.status === 'QUALIFIED') {
          chartItem.target += (lead.estimatedValue || 0)
        }
      }
    })

    return NextResponse.json({
      stats: {
        avgDealSize: Math.round(avgDealSize),
        salesCycle: Math.round(salesCycle),
        winRate: winRate.toFixed(1),
        activeLeads,
        // Mocking changes for UI trend badges
        avgDealSizeChange: '+5.2%',
        salesCycleChange: '-1.5 Days',
        winRateChange: '+2.1%',
        activeLeadsChange: `+${allLeads.filter((l: any) => l.createdAt > new Date(now.getTime() - 7*24*60*60*1000)).length}`
      },
      revenueData: last6Months.map(({ month, current, target }) => ({
        month,
        current,
        target: target || (current * 1.2) // Simple target if none exists
      })),
      leadSourceData: leadSourceData.length > 0 ? leadSourceData : [
        { name: 'Manual', value: 100, color: '#94a3b8' }
      ]
    })
  } catch (error) {
    console.error('Analytics Error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
