'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

const revenueData = [
  { month: 'Jan', current: 4000, target: 4500 },
  { month: 'Feb', current: 3000, target: 4500 },
  { month: 'Mar', current: 5500, target: 5000 },
  { month: 'Apr', current: 4780, target: 5000 },
  { month: 'May', current: 6890, target: 5500 },
  { month: 'Jun', current: 7390, target: 6000 },
  { month: 'Jul', current: 9490, target: 7000 },
]

const leadSourceData = [
  { name: 'LinkedIn', value: 45, color: '#3b82f6' },
  { name: 'Referral', value: 25, color: '#10b981' },
  { name: 'Web Search', value: 20, color: '#f59e0b' },
  { name: 'Cold Call', value: 10, color: '#ef4444' },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Analytics</h1>
        <p className="text-slate-500">Deep dive into your sales performance and pipeline trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg Deal Size', value: '$12,400', change: '+8%', trend: 'up', icon: DollarSign },
          { label: 'Sales Cycle', value: '18 Days', change: '-2 Days', trend: 'up', icon: Clock },
          { label: 'Win Rate', value: '24.5%', change: '+3.2%', trend: 'up', icon: Target },
          { label: 'Active Leads', value: '142', change: '+12', trend: 'up', icon: Users },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-slate-50 rounded-xl">
                   <stat.icon className="w-5 h-5 text-slate-600" />
                 </div>
                 <Badge className={stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}>
                   {stat.change}
                 </Badge>
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden h-[450px]">
           <CardHeader>
              <CardTitle>Revenue Forecast vs Actual</CardTitle>
              <CardDescription>Tracking monthly revenue against quarterly targets</CardDescription>
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

function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}
