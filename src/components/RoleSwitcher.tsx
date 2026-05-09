"use client"

import { Button } from "@/components/ui/button"
import { UserRole } from "@/lib/store"
import { Shield, User, Briefcase, ClipboardCheck } from "lucide-react"

interface RoleSwitcherProps {
  currentRole: UserRole | null
  onRoleChange: (role: UserRole) => void
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const roles: { id: UserRole; label: string; icon: any }[] = [
    { id: 'client', label: 'Client', icon: User },
    { id: 'broker', label: 'Broker', icon: Briefcase },
    { id: 'supervisor', label: 'Supervisor', icon: ClipboardCheck },
    { id: 'admin', label: 'Admin', icon: Shield },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-in slide-in-from-bottom-10">
      <span className="text-[10px] font-bold text-primary uppercase mr-2 opacity-50">Role Switcher</span>
      {roles.map((r) => (
        <Button
          key={r.id}
          variant={currentRole === r.id ? "default" : "ghost"}
          size="sm"
          className="rounded-full h-10 w-10 p-0 md:w-auto md:px-4"
          onClick={() => onRoleChange(r.id)}
        >
          <r.icon className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">{r.label}</span>
        </Button>
      ))}
    </div>
  )
}
