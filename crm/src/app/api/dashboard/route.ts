import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allLeads = await prisma.lead.findMany()
    const activities = await prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { lead: { select: { name: true } } }
    })

    const now = new Date()
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // 1. Stats Calculation
    const totalLeads = allLeads.length
    const totalPipeline = allLeads.reduce((sum: number, l: any) => sum + (l.estimatedValue || 0), 0)
    const wonLeads = allLeads.filter((l: any) => l.status === 'WON')
    const wonValue = wonLeads.reduce((sum: number, l: any) => sum + (l.estimatedValue || 0), 0)

    // Trends (Simplified: compared to last month)
    const lastMonthLeads = allLeads.filter((l: any) => l.createdAt < firstDayOfThisMonth && l.createdAt >= firstDayOfLastMonth).length
    const leadTrend = lastMonthLeads > 0 ? ((totalLeads - lastMonthLeads) / lastMonthLeads * 100).toFixed(1) : '+100'

    // 2. Revenue Chart (Bar Chart) - Last 7 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const chartData = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthLabel = months[d.getMonth()]
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0)

      const monthWonValue = allLeads
        .filter((l: any) => l.status === 'WON' && l.updatedAt >= monthStart && l.updatedAt <= monthEnd)
        .reduce((sum: number, l: any) => sum + (l.estimatedValue || 0), 0)
      
      const monthLeadsCount = allLeads.filter((l: any) => l.createdAt >= monthStart && l.createdAt <= monthEnd).length

      chartData.push({
        name: monthLabel,
        revenue: monthWonValue,
        leads: monthLeadsCount
      })
    }

    // 3. Status Distribution (Pie Chart)
    const statusMap = {
      'NEW': '#3b82f6',
      'QUALIFIED': '#8b5cf6',
      'WON': '#10b981',
      'LOST': '#f43f5e',
      'CONTACTED': '#64748b',
      'PROPOSAL_SENT': '#f59e0b'
    }
    const statusBreakdown = Object.entries(statusMap).map(([status, color]) => ({
      name: status.replace('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()),
      value: allLeads.filter((l: any) => l.status === status).length,
      color
    })).filter(s => s.value > 0)

    // 4. Health & Pipeline Stats
    const totalCount = allLeads.length
    const contactedLeads = allLeads.filter((l: any) => l.status !== 'NEW').length
    const contactRate = totalCount > 0 ? Math.round((contactedLeads / totalCount) * 100) : 0
    const conversionQuality = totalCount > 0 ? Math.round((wonLeads.length / totalCount) * 100) : 0
    
    // Performance Score (Weighted average)
    const score = Math.round((contactRate + conversionQuality + 90) / 3) // +90 for follow-up speed mock

    return NextResponse.json({
      stats: {
        totalLeads,
        wonValue,
        totalPipeline,
        wonDeals: wonLeads.length,
        leadTrend: `+${leadTrend}%`,
        wonValueTrend: '+12.5%', 
        pipelineTrend: '+8.2%',  
        wonDealsTrend: '+5.4%'   
      },
      chartData,
      statusBreakdown,
      recentActivities: activities.map((a: any) => ({
        id: a.id,
        type: a.type.toLowerCase().includes('status') ? 'status' : a.type.toLowerCase().includes('note') ? 'note' : 'creation',
        lead: a.lead?.name || 'Lead',
        action: a.description,
        time: a.createdAt.toLocaleDateString() === now.toLocaleDateString() ? 'Today' : a.createdAt.toLocaleDateString()
      })),
      health: {
        score,
        contactRate,
        followUpSpeed: 94,
        conversionQuality,
        insight: conversionQuality < 20 
          ? "Your conversion rate is below average. Try reaching out to 'Contacted' leads."
          : "Your pipeline is healthy! Focus on closing the remaining 'Proposal Sent' deals."
      }
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
