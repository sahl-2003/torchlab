'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  BadgeCheck,
  Building2,
  Calendar,
  MoreHorizontal,
  Plus,
  Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

import { useState, useEffect } from 'react'
import { CreateDealDialog } from '@/components/deals/CreateDealDialog'

export default function DealsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/deals')
      .then(res => res.json())
      .then(json => {
        setData(json)
        setIsLoading(false)
      })
      .catch(err => {
        toast.error("Failed to load deals")
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading deals and metrics...</div>
  }

  const deals = data?.deals || []
  const metrics = data?.metrics || {}
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Deals Management</h1>
          <p className="text-slate-500">Track and manage high-value opportunities in your sales funnel.</p>
        </div>
        <CreateDealDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-blue-600 text-white">
           <CardContent className="p-6">
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Pipeline Value</p>
              <h3 className="text-3xl font-black mt-2">${(metrics.pipelineValue || 0).toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm">
                 <ArrowUpRight className="w-4 h-4" />
                 <span>{metrics.pipelineTrend}</span>
              </div>
           </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-slate-900 text-white">
           <CardContent className="p-6">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Forecasted Revenue</p>
              <h3 className="text-3xl font-black mt-2">${(metrics.forecastedRevenue || 0).toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
                 <Briefcase className="w-4 h-4" />
                 <span>{metrics.forecastTrend}</span>
              </div>
           </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-emerald-600 text-white">
           <CardContent className="p-6">
              <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Won This Month</p>
              <h3 className="text-3xl font-black mt-2">${(metrics.wonThisMonthValue || 0).toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-emerald-100 text-sm">
                 <BadgeCheck className="w-4 h-4" />
                 <span>{metrics.wonTrend}</span>
              </div>
           </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <CardHeader>
           <CardTitle>Active Opportunities</CardTitle>
           <CardDescription>A detailed list of all ongoing deals and their current status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
              <TableHeader className="bg-slate-50">
                 <TableRow>
                    <TableHead className="font-bold">Deal Name</TableHead>
                    <TableHead className="font-bold">Client</TableHead>
                    <TableHead className="font-bold">Value</TableHead>
                    <TableHead className="font-bold">Stage</TableHead>
                    <TableHead className="font-bold">Probability</TableHead>
                    <TableHead className="font-bold">Expected Close</TableHead>
                    <TableHead className="font-bold text-right">Action</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {deals.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center py-10 text-slate-400">No active opportunities found.</TableCell>
                   </TableRow>
                 ) : deals.map((deal: any) => (
                    <TableRow key={deal.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-slate-50 dark:border-slate-800">
                       <TableCell className="font-bold py-4 text-slate-900 dark:text-white">{deal.title}</TableCell>
                       <TableCell>
                          <div className="flex items-center gap-2 text-slate-500">
                             <Building2 className="w-4 h-4" />
                             <span>{deal.client}</span>
                          </div>
                       </TableCell>
                       <TableCell className="font-black text-blue-600">${deal.value.toLocaleString()}</TableCell>
                       <TableCell>
                          <Badge variant="secondary" className="rounded-lg border-none bg-blue-50 text-blue-700">
                             {deal.stage}
                          </Badge>
                       </TableCell>
                       <TableCell>
                          <div className="flex items-center gap-2">
                             <div className="flex-1 h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: deal.probability}} />
                             </div>
                             <span className="text-xs font-bold text-slate-500">{deal.probability}</span>
                          </div>
                       </TableCell>
                       <TableCell className="text-slate-500 text-sm">{deal.expectedClose}</TableCell>
                       <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger render={
                              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 h-9 w-9">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            } />
                            <DropdownMenuContent align="end" className="rounded-xl w-40">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Deal Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => toast.success("Opening deal workshop...")}>
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info("Stage updated successfully")}>
                                  Change Stage
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-rose-600" onClick={() => toast.error("Deals cannot be deleted in demo mode")}>
                                Archive Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  )
}
