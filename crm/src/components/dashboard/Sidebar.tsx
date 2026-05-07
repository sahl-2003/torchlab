'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Leads', href: '/dashboard/leads' },
  { icon: Kanban, label: 'Pipeline', href: '/dashboard/pipeline' },
  { icon: TrendingUp, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Clock, label: 'Follow-ups', href: '/dashboard/follow-ups' },
  { icon: Briefcase, label: 'Deals', href: '/dashboard/deals' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <aside 
      className={cn(
        "sticky top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-40",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl text-slate-900 dark:text-white"
            >
              CRM Plus
            </motion.span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                    : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-slate-900 dark:group-hover:text-white"
                  )} />
                  {!isCollapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-slate-500"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
            render={
              <Link href="/api/auth/logout">
                <LogOut className="w-5 h-5" />
                {!isCollapsed && <span>Sign Out</span>}
              </Link>
            }
            nativeButton={false}
          />
        </div>
      </div>
    </aside>
  )
}
