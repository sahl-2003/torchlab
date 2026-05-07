'use client'

import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'

interface CreateDealDialogProps {
  onDealCreated?: () => void
  trigger?: React.ReactNode
}

export function CreateDealDialog({ onDealCreated, trigger }: CreateDealDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call for deals
    setTimeout(() => {
      toast.success('Deal created successfully')
      setOpen(false)
      setIsLoading(false)
      if (onDealCreated) onDealCreated()
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          (trigger as React.ReactElement) || (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Opportunity</DialogTitle>
          <p className="text-sm text-slate-500">Track a new high-value deal in your sales funnel.</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Input id="title" name="title" placeholder="e.g. Enterprise License" required className="rounded-xl h-11 border-slate-200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client Name</Label>
              <Input id="client" name="client" placeholder="Company Name" required className="rounded-xl h-11 border-slate-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="value">Deal Value ($)</Label>
                <Input id="value" name="value" type="number" placeholder="50000" className="rounded-xl h-11 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close_date">Expected Close</Label>
                <Input id="close_date" name="close_date" type="date" className="rounded-xl h-11 border-slate-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select name="stage" defaultValue="Discovery">
                  <SelectTrigger className="rounded-xl h-11 border-slate-200">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Discovery">Discovery</SelectItem>
                    <SelectItem value="Proposal Sent">Proposal Sent</SelectItem>
                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                    <SelectItem value="Closed Won">Closed Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="probability">Probability (%)</Label>
                <Input id="probability" name="probability" type="number" placeholder="50" className="rounded-xl h-11 border-slate-200" />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-bold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Deal...
                </>
              ) : 'Confirm Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
