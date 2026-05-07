'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Search,
  Bell,
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

const followUps = [
  { id: '1', title: 'Call Sarah Chen', lead: 'Sarah Chen', company: 'Nexus', date: 'Upcoming: Today, 2:00 PM', type: 'UPCOMING', priority: 'HIGH' },
  { id: '2', title: 'Send proposal to James', lead: 'James Wilson', company: 'Global Log', date: 'Overdue: Yesterday', type: 'OVERDUE', priority: 'URGENT' },
  { id: '3', title: 'Email follow-up: Elena', lead: 'Elena Rodriguez', company: 'CloudScale', date: 'Upcoming: Tomorrow', type: 'UPCOMING', priority: 'MEDIUM' },
]

export default function FollowUpsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Follow-up Reminders</h1>
        <p className="text-slate-500">Never miss a lead with automated task reminders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-12 border border-slate-200/60">
              <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-white">All Tasks</TabsTrigger>
              <TabsTrigger value="overdue" className="rounded-xl px-6 data-[state=active]:bg-white">Overdue</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-xl px-6 data-[state=active]:bg-white">Upcoming</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6 space-y-4">
              {followUps.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-2xl ${task.type === 'OVERDUE' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                          {task.type === 'OVERDUE' ? <AlertCircle className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 dark:text-white">{task.title}</h4>
                            <Badge className={task.priority === 'URGENT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 border-none'}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">{task.lead} • {task.company}</p>
                          <div className="flex items-center gap-2 mt-3 text-xs font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className={task.type === 'OVERDUE' ? 'text-rose-600' : 'text-slate-400'}>{task.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Button variant="ghost" size="icon" className="rounded-full hover:bg-emerald-50 hover:text-emerald-600">
                              <Check className="w-5 h-5" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="rounded-full"
                             render={
                               <Link href="/dashboard/leads/1">
                                 <ExternalLink className="w-4 h-4" />
                               </Link>
                             }
                           />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100">
            <CardHeader>
              <CardTitle className="text-xl">Productivity Stats</CardTitle>
              <CardDescription>How you're doing this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-3xl font-black text-blue-600">92%</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Completion Rate</p>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-500">Tasks Completed</span>
                    </div>
                    <span className="font-bold">24</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-slate-500">Tasks Overdue</span>
                    </div>
                    <span className="font-bold">2</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
