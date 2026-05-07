'use client'

import React, { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { 
  Plus, 
  MoreVertical, 
  GripVertical,
  DollarSign,
  Building2,
  Clock,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

const statuses = [
  { id: 'NEW', label: 'New', color: 'bg-blue-500' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-purple-500' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'bg-indigo-500' },
  { id: 'PROPOSAL_SENT', label: 'Proposal', color: 'bg-orange-500' },
  { id: 'WON', label: 'Won', color: 'bg-emerald-500' },
]

const initialLeads = [
  { id: '1', name: 'Sarah Chen', company: 'Nexus', status: 'QUALIFIED', value: 12500, priority: 'HIGH' },
  { id: '2', name: 'James Wilson', company: 'Global Log', status: 'NEW', value: 8400, priority: 'MEDIUM' },
  { id: '3', name: 'Elena Rodriguez', company: 'CloudScale', status: 'PROPOSAL_SENT', value: 32000, priority: 'URGENT' },
  { id: '4', name: 'Michael Brown', company: 'AeroTech', status: 'WON', value: 15700, priority: 'LOW' },
  { id: '5', name: 'Linda Zhang', company: 'Vista Media', status: 'CONTACTED', value: 5200, priority: 'MEDIUM' },
  { id: '6', name: 'Robert Fox', company: 'SoftServe', status: 'NEW', value: 21000, priority: 'HIGH' },
  { id: '7', name: 'Cody Fisher', company: 'FireBolt', status: 'QUALIFIED', value: 9500, priority: 'MEDIUM' },
]

import { CreateLeadDialog } from '@/components/leads/CreateLeadDialog'

export default function PipelinePage() {
  const [leads, setLeads] = useState(initialLeads)

  const getLeadsByStatus = (status: string) => leads.filter(l => l.status === status)

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400">Drag and drop leads to update their stage in the pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-9 px-4 rounded-xl border-slate-200">
            Total Value: ${leads.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
          </Badge>
          <CreateLeadDialog />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {statuses.map((status) => (
            <div key={status.id} className="w-80 flex flex-col bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                  <h3 className="font-bold text-slate-900 dark:text-white">{status.label}</h3>
                  <Badge variant="secondary" className="ml-2 rounded-lg bg-white dark:bg-slate-800 border-none shadow-sm">
                    {getLeadsByStatus(status.id).length}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Plus className="w-4 h-4 text-slate-400" />
                </Button>
              </div>

              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-4">
                  {getLeadsByStatus(status.id).map((lead) => (
                    <motion.div
                      key={lead.id}
                      layoutId={lead.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer group active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={`
                          text-[10px] uppercase tracking-wider font-bold rounded-md px-1.5 py-0
                          ${lead.priority === 'URGENT' ? 'bg-red-100 text-red-600' : 
                            lead.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'}
                        `}>
                          {lead.priority}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">{lead.name}</h4>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                        <Building2 className="w-3 h-3" />
                        <span>{lead.company}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                          <DollarSign className="w-3 h-3" />
                          {lead.value.toLocaleString()}
                        </div>
                        <div className="flex -space-x-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white dark:border-slate-800" />
                          <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold">
                            +1
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
