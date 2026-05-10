
"use client"

import { Home, Calendar, Wallet, Settings, ClipboardCheck, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/lib/store'

interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  role: UserRole | null
}

export function BottomNav({ activeTab, onTabChange, role }: BottomNavProps) {
  if (!role || role === 'client') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-100 flex justify-around items-center h-20 pb-4 px-2 z-[100] md:hidden">
        <NavItem 
          icon={Home} 
          label="الرئيسية" 
          active={activeTab === 'home'} 
          onClick={() => onTabChange('home')} 
        />
        <NavItem 
          icon={Search} 
          label="استكشف" 
          active={activeTab === 'units'} 
          onClick={() => {
            onTabChange('home');
            document.getElementById('units')?.scrollIntoView({ behavior: 'smooth' });
          }} 
        />
      </nav>
    )
  }

  const items = [
    { id: 'spreadsheet', label: 'الجدول', icon: Calendar, roles: ['admin', 'broker', 'supervisor'] },
    { id: 'bookings', label: 'المالية', icon: Wallet, roles: ['admin'] },
    { id: 'tasks', label: 'المهام', icon: ClipboardCheck, roles: ['supervisor'] },
    { id: 'ops', label: 'التنفيذ', icon: ClipboardCheck, roles: ['broker'] },
    { id: 'wallet', label: 'محفظتي', icon: Wallet, roles: ['broker'] },
    { id: 'settings', label: 'الإعدادات', icon: Settings, roles: ['admin'] },
  ].filter(item => item.roles.includes(role))

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center h-20 pb-5 px-4 z-[100] md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {items.map((item) => (
        <NavItem 
          key={item.id}
          icon={item.icon} 
          label={item.label} 
          active={activeTab === item.id} 
          onClick={() => onTabChange(item.id)} 
        />
      ))}
    </nav>
  )
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative",
        active ? "text-primary" : "text-slate-400"
      )}
    >
      <div className={cn(
        "p-2 rounded-2xl transition-all duration-300",
        active ? "bg-primary/10 scale-110" : "bg-transparent"
      )}>
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={cn("text-[10px] font-black tracking-tight", active ? "opacity-100" : "opacity-70")}>{label}</span>
      {active && <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full" />}
    </button>
  )
}
