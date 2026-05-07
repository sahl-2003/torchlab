'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  PieChart as PieChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    stats: any;
    revenueData: any[];
    leadSourceData: any[];
  } | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(json => {
        setData(json)
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast.error("Failed to load analytics data")
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-96 bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[450px] bg-slate-100 rounded-3xl" />
          <div className="h-[450px] bg-slate-100 rounded-3xl" />
        </div>
      </div>
    )
  }

  const revenueData = data?.revenueData || []
  const leadSourceData = data?.leadSourceData || []
  const stats = data?.stats || {}

  const statItems = [
    { label: 'Avg Deal Size', value: `$${(stats.avgDealSize || 0).toLocaleString()}`, change: stats.avgDealSizeChange, trend: 'up', icon: DollarSign },
    { label: 'Sales Cycle', value: `${stats.salesCycle || 0} Days`, change: stats.salesCycleChange, trend: 'down', icon: Clock },
    { label: 'Win Rate', value: `${stats.winRate || 0}%`, change: stats.winRateChange, trend: 'up', icon: Target },
    { label: 'Active Leads', value: stats.activeLeads?.toString() || '0', change: stats.activeLeadsChange, trend: 'up', icon: Users },
  ]

  const exportAnalyticsReport = () => {
    if (!data || !data.revenueData) return;
    const headers = ['Month', 'Current Revenue', 'Target Revenue'];
    const csvData = data.revenueData.map((d: any) => [d.month, d.current, d.target]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + csvData.map((e: any[]) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Analytics report downloaded successfully");
  };
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Analytics</h1>
        <p className="text-slate-500">Deep dive into your sales performance and pipeline trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                   <stat.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                 </div>
                 <Badge className={stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}>
                   {stat.change}
                 </Badge>
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden h-[450px]">
           <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Revenue Forecast vs Actual</CardTitle>
                <CardDescription>Tracking monthly revenue against quarterly targets</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl h-9"
                onClick={exportAnalyticsReport}
              >
                Download Report
              </Button>
           </CardHeader>
           <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="current" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={3} />
                    <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeDasharray="5 5" />
                 </AreaChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden h-[450px]">
           <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Where your strongest leads come from</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {leadSourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-6">
                 {leadSourceData.map((source) => (
                    <div key={source.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{backgroundColor: source.color}} />
                          <span className="text-sm font-medium text-slate-600">{source.name}</span>
                       </div>
                       <span className="text-sm font-bold">{source.value}%</span>
                    </div>
                 ))}
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
