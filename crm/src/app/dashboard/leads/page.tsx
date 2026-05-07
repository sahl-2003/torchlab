'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2,
  Calendar,
  ChevronRight,
  Download,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { format } from 'date-fns'

const statusColors: any = {
  NEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CONTACTED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  QUALIFIED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  PROPOSAL_SENT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  WON: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  LOST: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
}

const priorityColors: any = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-rose-100 text-rose-700",
  URGENT: "bg-red-600 text-white animate-pulse",
}

import { CreateLeadDialog } from '@/components/leads/CreateLeadDialog'
import { EditLeadDialog } from '@/components/leads/EditLeadDialog'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LeadsPage() {
  const router = useRouter()
  // ... existing states ...
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sourceFilter, setSourceFilter] = useState('ALL')
  const [users, setUsers] = useState<any[]>([])
  const [editingLead, setEditingLead] = useState<any>(null)

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(setUsers)
  }, [])

  const fetchLeads = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/leads').catch(() => null)
      if (res && res.ok) {
        const data = await res.json()
        setLeads(data)
      } else {
        const mockLeads = [
          { id: '1', name: 'Sarah Chen', company: 'Nexus Dynamics', email: 'sarah@nexus.com', phone: '+1 555-0123', status: 'QUALIFIED', source: 'LINKEDIN', estimatedValue: 12500, createdAt: new Date().toISOString() },
          { id: '2', name: 'James Wilson', company: 'Global Logistics', email: 'j.wilson@globallog.com', phone: '+1 555-0456', status: 'NEW', source: 'WEBSITE', estimatedValue: 8400, createdAt: new Date().toISOString() },
        ]
        setLeads(mockLeads)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Lead deleted successfully')
      fetchLeads()
    } catch (error) {
      toast.error('Could not delete lead')
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Value']
    const data = leads.map(l => [l.name, l.company, l.email, l.phone, l.status, l.source || 'MANUAL', l.estimatedValue])
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + data.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "leads_export.csv")
    document.body.appendChild(link)
    link.click()
    toast.success("Leads exported successfully")
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Leads</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track your sales pipeline prospects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-slate-200 dark:border-slate-800"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <CreateLeadDialog onLeadCreated={fetchLeads} />
        </div>
      </div>

      <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-50 dark:border-slate-800 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, company, or email..." 
                className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="outline" className="rounded-xl h-11 border-slate-100 dark:border-slate-800">
                    <Filter className="w-4 h-4 mr-2" />
                    {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
                  </Button>
                } />
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('ALL')}>All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('NEW')}>New</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('CONTACTED')}>Contacted</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('QUALIFIED')}>Qualified</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('PROPOSAL_SENT')}>Proposal Sent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('WON')}>Won</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('LOST')}>Lost</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button variant="outline" className="rounded-xl h-11 border-slate-100 dark:border-slate-800">
                    <Filter className="w-4 h-4 mr-2" />
                    {sourceFilter === 'ALL' ? 'All Sources' : sourceFilter}
                  </Button>
                } />
                <DropdownMenuContent align="end" className="rounded-xl w-48">
                  <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSourceFilter('ALL')}>All Sources</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSourceFilter('LINKEDIN')}>LinkedIn</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSourceFilter('WEBSITE')}>Website</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSourceFilter('REFERRAL')}>Referral</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSourceFilter('COLD_OUTREACH')}>Cold Outreach</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSourceFilter('MANUAL')}>Manual Entry</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                  <TableHead className="font-semibold py-4">Lead Name</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Source</TableHead>
                  <TableHead className="font-semibold">Assigned To</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold text-right">Value</TableHead>
                  <TableHead className="font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredLeads.map(lead => (
                  <TableRow key={lead.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-slate-50 dark:border-slate-800 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{lead.name}</span>
                        <span className="text-xs text-slate-400">{lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full px-3 font-medium border-none", statusColors[lead.status])}>
                        {lead.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                     <TableCell>
                       <Badge variant="outline" className="rounded-full px-3 border-none bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                         {(lead.source || 'MANUAL').toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase())}
                       </Badge>
                     </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{lead.salesperson?.name || 'Unassigned'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Building2 className="w-3 h-3" />
                        <span className="text-sm">{lead.company}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 dark:text-white">
                      ${lead.estimatedValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="rounded-xl w-40">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => lead.id && router.push(`/dashboard/leads/${lead.id}`)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingLead(lead)}>
                              <Edit className="w-4 h-4 mr-2" /> Edit Lead
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-600" onClick={() => handleDeleteLead(lead.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredLeads.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No leads found</h3>
              <p className="text-slate-500 max-w-sm mt-2">
                We couldn't find any leads matching your current search or filters.
              </p>
              <Button 
                variant="ghost" 
                className="mt-6 text-blue-600 font-semibold"
                onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {editingLead && (
        <EditLeadDialog
          lead={editingLead}
          onLeadUpdated={() => { fetchLeads(); setEditingLead(null) }}
          externalOpen={true}
          onExternalClose={() => setEditingLead(null)}
        />
      )}
    </motion.div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
