'use client'

import React, { useState, useEffect, useCallback, use } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  Calendar,
  MessageSquare,
  History,
  Clock,
  Heart,
  Edit,
  MoreVertical,
  Send,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'


import { toast } from 'sonner'
import { EditLeadDialog } from '@/components/leads/EditLeadDialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

export default function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [lead, setLead] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [noteContent, setNoteContent] = useState('')
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  const unwrappedParams = use(params)
  const leadId = unwrappedParams.id

  const fetchLeadDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/leads/${leadId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setLead(data)
    } catch (error) {
      toast.error('Failed to load lead details')
    } finally {
      setIsLoading(false)
    }
  }, [leadId])

  useEffect(() => {
    fetchLeadDetails()
  }, [fetchLeadDetails])

  const handleAddNote = async () => {
    if (!noteContent.trim()) return
    setIsSubmittingNote(true)
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent }),
      })
      if (!res.ok) throw new Error()
      toast.success('Note added')
      setNoteContent('')
      fetchLeadDetails()
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const formatSafeDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown date'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return format(date, 'MMM dd, yyyy HH:mm')
    } catch (e) {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold">Lead Not Found</h2>
        <Link href="/dashboard/leads">
          <Button variant="outline" className="rounded-xl">Go Back to Leads</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 border border-slate-200 dark:border-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{lead.name}</h1>
          <p className="text-slate-500">{lead.company} • Lead Details</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <EditLeadDialog 
            lead={lead} 
            onLeadUpdated={fetchLeadDetails}
            trigger={
              <Button variant="outline" className="rounded-xl">
                 <Edit className="w-4 h-4 mr-2" />
                 Edit Lead
              </Button>
            } 
          />
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                 Action
              </Button>
            } />
            <DropdownMenuContent align="end" className="rounded-xl w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Communicate</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toast.success("Opening email composer...")}>
                  <Mail className="w-4 h-4 mr-2" /> Send Email
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast.success("Dialing lead...")}>
                  <Phone className="w-4 h-4 mr-2" /> Start Call
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast.info("Activity logged")}>
                Log Interaction
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Score */}
        <div className="space-y-8">
          {/* Health Score Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <p className="text-blue-100/80 text-sm font-medium uppercase tracking-wider">Health Score</p>
                   <h3 className="text-4xl font-bold mt-1">{(lead.healthScore || 50)}%</h3>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                   <Heart className="w-6 h-6 fill-white" />
                </div>
              </div>
              <Progress value={lead.healthScore || 50} className="h-2 bg-white/20" />
              <p className="mt-6 text-sm text-blue-100 leading-relaxed">
                Lead engagement score based on recent interactions.
              </p>
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card className="border-none shadow-sm shadow-slate-200 dark:shadow-none rounded-3xl overflow-hidden">
            <CardHeader>
               <CardTitle className="text-lg font-bold">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email Address</p>
                    <p className="text-sm font-medium">{lead.email}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone Number</p>
                    <p className="text-sm font-medium">{lead.phone}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <Building2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Company</p>
                    <p className="text-sm font-medium">{lead.company}</p>
                  </div>
               </div>
               <div className="pt-4 border-t border-slate-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Status</p>
                      <Badge className="bg-blue-50 text-blue-600 border-none rounded-lg">{lead.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Priority</p>
                      <Badge className="bg-rose-50 text-rose-600 border-none rounded-lg">{lead.priority || 'MEDIUM'}</Badge>
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activities, Notes, and Tasks */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-12 inline-flex border border-slate-200/60">
              <TabsTrigger value="timeline" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                 <History className="w-4 h-4 mr-2" /> Timeline
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                 <MessageSquare className="w-4 h-4 mr-2" /> Notes
              </TabsTrigger>
              <TabsTrigger value="followups" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                 <Clock className="w-4 h-4 mr-2" /> Follow-ups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-0">
               <Card className="border-none shadow-sm shadow-slate-200 dark:shadow-none rounded-3xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl">Activity Timeline</CardTitle>
                    <CardDescription>Visual history of all lead interactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                      {(lead.activities || []).map((activity: any) => (
                        <div key={activity.id} className="relative flex gap-6 pl-2">
                           <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-blue-500 absolute left-[-1px] z-10 shadow-sm" />
                           <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{activity.description}</p>
                              <p className="text-xs text-slate-400 mt-1">{formatSafeDate(activity.createdAt)}</p>
                           </div>
                        </div>
                      ))}
                      {(lead.activities || []).length === 0 && (
                        <p className="text-sm text-slate-400 pl-8">No recent activities recorded.</p>
                      )}
                    </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 space-y-6">
               <div className="relative">
                  <Input 
                    placeholder="Add a private note for this lead..." 
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="h-14 pl-12 pr-12 rounded-2xl bg-white border-slate-200 shadow-sm shadow-slate-100/50 focus-visible:ring-blue-500"
                  />
                  <MessageSquare className="absolute left-4 top-5 h-4 w-4 text-slate-400" />
                  <Button 
                    size="icon" 
                    className="absolute right-2 top-2 h-10 w-10 bg-blue-600 rounded-xl"
                    onClick={handleAddNote}
                    disabled={isSubmittingNote}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
               </div>

               <div className="space-y-4">
                  {(lead.notes || []).map((note: any) => (
                    <Card key={note.id} className="border-none shadow-sm shadow-slate-100 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
                       <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold uppercase border-2 border-white shadow-sm">
                                   {note.createdBy?.name?.slice(0, 2) || 'U'}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-sm font-bold text-slate-900">{note.createdBy?.name || 'Unknown'}</span>
                                   <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{formatSafeDate(note.createdAt)}</span>
                                </div>
                             </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                             "{note.content}"
                          </p>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="followups" className="mt-0">
               <Card className="border-none shadow-sm shadow-slate-200 rounded-3xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Next Follow-ups</CardTitle>
                      <CardDescription>Scheduled tasks and reminders</CardDescription>
                    </div>
                    <Button className="rounded-xl h-9 bg-slate-900">
                       <Plus className="w-4 h-4 mr-2" /> New Task
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Calendar className="w-10 h-10 text-slate-300 mb-4" />
                        <h4 className="font-bold text-slate-900">No follow-ups scheduled</h4>
                        <p className="text-sm text-slate-500 max-w-xs mt-1">Schedule a follow-up to ensure you don't lose track of this lead.</p>
                        <Button 
                          variant="outline" 
                          className="mt-6 rounded-xl"
                          onClick={() => toast.success("Follow-up reminder set for next Tuesday.")}
                        >
                          Set Reminder
                        </Button>
                    </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
