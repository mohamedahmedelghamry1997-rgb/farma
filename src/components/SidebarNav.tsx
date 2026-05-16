
"use client"

import { 
  Calendar, Wallet, Settings, ClipboardCheck, Users, 
  Home as HomeIcon, LayoutDashboard, History, Box, Tag, 
  UserPlus, Search, Waves, FileText, ListTodo, UserCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/lib/store'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  role: UserRole | null
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function SidebarNav({ activeTab, onTabChange, role, isOpen, setIsOpen }: SidebarNavProps) {
  if (!role) return null

  const adminItems = [
    { id: 'spreadsheet', label: 'جدول الحجوزات', icon: Calendar },
    { id: 'brokers-management', label: 'تقارير الوسطاء', icon: UserCheck },
    { id: 'chalet-reports', label: 'التقارير المالية التفصيلية', icon: FileText },
    { id: 'bookings', label: 'الإدارة المالية', icon: Wallet },
    { id: 'ops', label: 'العمليات الميدانية', icon: ClipboardCheck },
    { id: 'withdrawals', label: 'طلبات السحب', icon: History },
    { id: 'chalets', label: 'إدارة الشاليهات', icon: Box },
    { id: 'users', label: 'إدارة الفريق', icon: Users },
    { id: 'settings', label: 'إعدادات النظام', icon: Settings },
  ]

  const brokerItems = [
    { id: 'spreadsheet', label: 'جدول الحجوزات', icon: Calendar },
    { id: 'ops', label: 'متابعة التنفيذ', icon: ClipboardCheck },
    { id: 'wallet', label: 'محفظتي المالية', icon: Wallet },
    { id: 'units', label: 'تصفح الشاليهات', icon: Search },
  ]

  const supervisorItems = [
    { id: 'tasks', label: 'المهام الميدانية', icon: ClipboardCheck },
    { id: 'spreadsheet', label: 'جدول الإشغال', icon: Calendar },
  ]

  const clientItems = [
    { id: 'home', label: 'تصفح الشاليهات', icon: Search },
    { id: 'my-bookings', label: 'حجوزاتي الخاصة', icon: ListTodo },
  ]

  const items = role === 'admin' ? adminItems : 
                role === 'broker' ? brokerItems : 
                role === 'supervisor' ? supervisorItems : clientItems

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 border-none rounded-l-[2.5rem] bg-white shadow-2xl">
        <SheetHeader className="p-8 bg-primary text-white rounded-bl-[3rem]">
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <SheetTitle className="text-xl font-black text-white">لوحة التحكم</SheetTitle>
              <p className="text-white/70 text-xs font-bold">نظام فارما بيتش الإداري</p>
            </div>
            <div className="bg-white/20 p-2 rounded-xl">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-140px)] p-6">
          <div className="space-y-2">
            {items.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-end gap-3 h-14 rounded-2xl font-black text-sm transition-all duration-300",
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
                onClick={() => {
                  onTabChange(item.id)
                  setIsOpen(false)
                }}
              >
                {item.label}
                <item.icon className={cn(
                  "h-5 w-5",
                  activeTab === item.id ? "text-primary" : "text-slate-400"
                )} />
              </Button>
            ))}
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-100">
             <div className="bg-slate-50 p-4 rounded-2xl text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">المساعدة والدعم</p>
                <p className="text-xs font-bold text-slate-600">إذا واجهت أي مشكلة تقنية، يرجى التواصل مع الدعم الفني للمنظومة.</p>
             </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
