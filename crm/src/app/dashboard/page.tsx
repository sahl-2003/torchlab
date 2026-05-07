'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Clock,
  MoreVertical,
  Briefcase
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'

import { toast } from 'sonner'
import { CreateLeadDialog } from '@/components/leads/CreateLeadDialog'

export default function DashboardPage() {
  const [data, setData] = React.useState<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard')
        return res.json()
      })
      .then(json => {
        if (!json || !json.stats) throw new Error('Invalid dashboard data')
        setData(json)
        setIsLoading(false)
      })
      .catch(err => {
        toast.error("Failed to load dashboard data")
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Initializing dashboard...</div>
  }

  if (!data || !data.stats) {
    return <div className="p-8 text-center text-slate-500">No dashboard data available. Please try refreshing.</div>
  }

  const metrics = data.stats
  const chartData = data.chartData
  const statusData = data.statusBreakdown
  const recentActivities = data.recentActivities
  const health = data.health

  const exportDashboardReport = () => {
    if (!data || !data.chartData) return;
    const headers = ['Month', 'Revenue'];
    const csvData = data.chartData.map((d: any) => [d.name, d.revenue]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + csvData.map((e: any[]) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dashboard_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dashboard report downloaded successfully");
  };

  const stats = [
    { 
      title: 'Total Leads', 
      value: metrics.totalLeads.toString(), 
      change: metrics.leadTrend, 
      trend: 'up', 
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      title: 'Won Value', 
      value: `$${metrics.wonValue.toLocaleString()}`, 
      change: metrics.wonValueTrend, 
      trend: 'up', 
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    { 
      title: 'Total Pipeline', 
      value: `$${metrics.totalPipeline.toLocaleString()}`, 
      change: metrics.pipelineTrend, 
      trend: 'up', 
      icon: Briefcase,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    { 
      title: 'Won Deals', 
      value: metrics.wonDeals.toString(), 
      change: metrics.wonDealsTrend, 
      trend: 'up', 
      icon: Target,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20'
    },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <CreateLeadDialog />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm shadow-slate-200 dark:shadow-none rounded-2xl overflow-hidden active:scale-[0.98] transition-transform cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div className={cn(
                    "flex items-center text-sm font-medium",
                    stat.trend === 'up' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {stat.change}
                    {stat.trend === 'up' ? <ArrowUpRight className="ml-1 w-4 h-4" /> : <ArrowDownRight className="ml-1 w-4 h-4" />}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm shadow-slate-200 dark:shadow-none rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-bold">Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue growth and performance</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl h-9"
              onClick={exportDashboardReport}
            >
              Download Report
            </Button>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Status Breakdown */}
        <Card className="border-none shadow-sm shadow-slate-200 dark:shadow-none rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Lead Status</CardTitle>
            <CardDescription>Distribution of current pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-6">
              {statusData.map((item: any) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}+</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 border-none shadow-sm shadow-slate-200 dark:shadow-none rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Activities</CardTitle>
            <CardDescription>Latest updates from your sales team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={cn(
                    "p-2 rounded-full mt-1",
                    activity.type === 'status' ? "bg-blue-50 text-blue-600" :
                    activity.type === 'note' ? "bg-purple-50 text-purple-600" :
                    "bg-emerald-50 text-emerald-600"
                  )}>
                    {activity.type === 'status' ? <Clock className="w-4 h-4" /> :
                     activity.type === 'note' ? <Briefcase className="w-4 h-4" /> :
                     <Users className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <p className="text-sm text-slate-900 dark:text-white leading-relaxed">
                      <span className="font-bold underline decoration-blue-200 underline-offset-4">{activity.lead}</span>
                      {" "}{activity.action}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-blue-600 hover:text-blue-700 font-semibold rounded-xl h-11">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Lead Health / Pipeline Progress */}
        <Card className="border-none shadow-sm shadow-slate-200 dark:shadow-none rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Pipeline Health</CardTitle>
            <CardDescription>Overall performance score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-100 dark:border-blue-900/30 rounded-3xl">
              <div className="relative">
                 <div className="text-4xl font-black text-blue-600">{health.score}</div>
                 <div className="text-xs font-bold text-center text-blue-400 uppercase tracking-widest mt-1">Score</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Contact Rate</span>
                  <span className="font-bold text-slate-900">{health.contactRate}%</span>
                </div>
                <Progress value={health.contactRate} className="h-1.5 bg-slate-100" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Follow-up Speed</span>
                  <span className="font-bold text-slate-900">{health.followUpSpeed}%</span>
                </div>
                <Progress value={health.followUpSpeed} className="h-1.5 bg-slate-100" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Conversion Quality</span>
                  <span className="font-bold text-slate-900">{health.conversionQuality}%</span>
                </div>
                <Progress value={health.conversionQuality} className="h-1.5 bg-slate-100" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
               <p className="text-xs text-slate-500 leading-relaxed uppercase font-bold tracking-wider mb-2">Smart Insight</p>
               <p className="text-sm text-slate-900 dark:text-slate-300">
                 {health.insight}
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
