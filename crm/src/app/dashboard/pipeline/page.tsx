'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  useDroppable,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  MoreVertical, 
  DollarSign,
  Building2,
  Briefcase,
  Target,
  Clock,
  ArrowUpRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { CreateLeadDialog } from '@/components/leads/CreateLeadDialog'
import Link from 'next/link'

const STATUSES = [
  { id: 'NEW', label: 'New', color: 'bg-blue-500', bg: 'bg-blue-50/50' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-purple-500', bg: 'bg-purple-50/50' },
  { id: 'QUALIFIED', label: 'Qualified', color: 'bg-indigo-500', bg: 'bg-indigo-50/50' },
  { id: 'PROPOSAL_SENT', label: 'Proposal', color: 'bg-orange-500', bg: 'bg-orange-50/50' },
  { id: 'WON', label: 'Won', color: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
  { id: 'LOST', label: 'Lost', color: 'bg-rose-500', bg: 'bg-rose-50/50' },
]

export default function PipelinePage() {
  const [leads, setLeads] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [salespersonFilter, setSalespersonFilter] = useState('ALL')
  const [users, setUsers] = useState<any[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchLeads = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      if (Array.isArray(data)) {
        setLeads(data)
      }
    } catch (error) {
      // toast.error('Failed to fetch leads')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    fetch('/api/users').then(res => res.json()).then(setUsers).catch(() => {})
  }, [fetchLeads])

  const findContainer = (id: string) => {
    if (STATUSES.find(s => s.id === id)) return id
    const lead = leads.find(l => l.id === id)
    return lead ? lead.status : null
  }

  const [dragStartStatus, setDragStartStatus] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find(l => l.id === event.active.id)
    if (lead) {
      setDragStartStatus(lead.status)
    }
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    const overId = over?.id

    if (!overId) return

    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(overId as string)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    setLeads((prev) => {
      return prev.map(l => {
        if (l.id === active.id) {
          return { ...l, status: overContainer }
        }
        return l
      })
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const overId = over?.id

    if (!overId) {
      if (dragStartStatus) {
        setLeads(prev => prev.map(l => l.id === active.id ? { ...l, status: dragStartStatus } : l))
      }
      setActiveId(null)
      setDragStartStatus(null)
      return
    }

    const overContainer = findContainer(overId as string)

    if (overContainer && dragStartStatus && dragStartStatus !== overContainer) {
      // The status has changed
      try {
        const res = await fetch(`/api/leads/${active.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: overContainer }),
        })
        if (!res.ok) throw new Error()
        toast.success(`Moved to ${overContainer.replace('_', ' ')}`)
      } catch (error) {
        toast.error('Failed to sync status change')
        setLeads(prev => prev.map(l => l.id === active.id ? { ...l, status: dragStartStatus } : l))
      }
    }

    setActiveId(null)
    setDragStartStatus(null)
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter
    const matchesSalesperson = salespersonFilter === 'ALL' || lead.salespersonId === salespersonFilter
    return matchesSource && matchesPriority && matchesSalesperson
  })

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sales Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400">Streamline your deals with visual stage management.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white shadow-sm font-semibold text-blue-600">
             Value: ${filteredLeads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0).toLocaleString()}
          </Badge>
          <CreateLeadDialog onLeadCreated={fetchLeads} />
        </div>
      </div>

      {/* Pipeline Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit shadow-sm">
        <select 
          value={sourceFilter} 
          onChange={(e) => setSourceFilter(e.target.value)}
          className="h-9 px-3 text-xs font-bold rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="ALL">All Sources</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="WEBSITE">Website</option>
          <option value="REFERRAL">Referral</option>
          <option value="COLD_OUTREACH">Cold Outreach</option>
          <option value="MANUAL">Manual</option>
        </select>

        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 px-3 text-xs font-bold rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="URGENT">Urgent</option>
        </select>

        <select 
          value={salespersonFilter} 
          onChange={(e) => setSalespersonFilter(e.target.value)}
          className="h-9 px-3 text-xs font-bold rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none max-w-[150px]"
        >
          <option value="ALL">All Salespeople</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { setSourceFilter('ALL'); setPriorityFilter('ALL'); setSalespersonFilter('ALL'); }}
          className="h-9 px-3 text-xs font-bold text-slate-400 hover:text-slate-600"
        >
          Reset
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max">
            {STATUSES.map((status) => (
              <PipelineColumn 
                key={status.id} 
                status={status} 
                leads={filteredLeads.filter(l => l.status === status.id)}
                isOver={activeId ? findContainer(activeId) === status.id : false}
              />
            ))}
          </div>

          <DragOverlay>
            {activeLead ? (
              <div className="w-[300px] scale-105 opacity-90 rotate-2">
                <PipelineCard lead={activeLead} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

function PipelineColumn({ status, leads, isOver }: { status: any, leads: any[], isOver?: boolean }) {
  const { setNodeRef } = useDroppable({
    id: status.id,
  })

  return (
    <div 
      ref={setNodeRef}
      className={`
        w-80 flex flex-col ${status.bg} dark:bg-slate-900/30 rounded-3xl p-4 border transition-all duration-200
        ${isOver ? 'border-blue-400 ring-2 ring-blue-100 ring-offset-2 scale-[1.01]' : 'border-slate-100 dark:border-slate-800'}
      `}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${status.color} shadow-sm`} />
          <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">{status.label}</h3>
          <Badge variant="secondary" className="ml-2 rounded-lg bg-white dark:bg-slate-800 border-none shadow-sm text-slate-500 font-bold">
            {leads.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all">
          <Plus className="w-4 h-4 text-slate-400" />
        </Button>
      </div>

      <SortableContext
        id={status.id}
        items={leads.map(l => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 pb-4 min-h-[100px]">
            <AnimatePresence>
              {leads.map((lead) => (
                <SortableLeadCard key={lead.id} lead={lead} />
              ))}
            </AnimatePresence>
            {leads.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-3xl opacity-40">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Empty Stage</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  )
}

function SortableLeadCard({ lead }: { lead: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-0' : 'opacity-100'}
    >
      <PipelineCard lead={lead} />
    </div>
  )
}

function PipelineCard({ lead, isDragging = false }: { lead: any, isDragging?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 
        hover:shadow-md hover:shadow-slate-200 dark:hover:shadow-none transition-all cursor-grab active:cursor-grabbing group
        ${isDragging ? 'ring-2 ring-blue-500 border-transparent shadow-xl' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <Badge className={`
          text-[10px] uppercase tracking-wider font-extrabold rounded-lg px-2 py-0.5 border-none
          ${lead.priority === 'URGENT' ? 'bg-rose-100 text-rose-600' : 
            lead.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' :
            'bg-blue-100 text-blue-600'}
        `}>
          {lead.priority}
        </Badge>
        <Link href={`/dashboard/leads/${lead.id}`}>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
      
      <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">{lead.name}</h4>
      <div className="flex items-center gap-2 text-slate-400 font-medium text-xs mb-5">
        <Building2 className="w-3.5 h-3.5" />
        <span className="truncate">{lead.company}</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-black text-sm">
          <span className="text-slate-400 font-normal">$</span>
          {(lead.estimatedValue || 0).toLocaleString()}
        </div>
        <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
              {lead.salesperson?.name?.slice(0, 1) || 'U'}
            </div>
        </div>
      </div>
    </motion.div>
  )
}
