
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserRole, Chalet } from "@/lib/store"
import { UserPlus, Shield, Briefcase, ClipboardCheck, Mail, Phone, Home, Lock } from "lucide-react"

interface AddUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: any) => void
  chalets: Chalet[]
}

export function AddUserDialog({ isOpen, onClose, onAdd, chalets }: AddUserDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('broker')
  const [selectedChaletIds, setSelectedChaletIds] = useState<string[]>([])

  const handleToggleChalet = (id: string) => {
    setSelectedChaletIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleAdd = () => {
    onAdd({
      name,
      email,
      password,
      phone,
      role,
      assignedChaletIds: selectedChaletIds,
      commissionRate: role === 'broker' ? 200 : 0
    })
    // Reset
    setName('')
    setEmail('')
    setPassword('')
    setPhone('')
    setRole('broker')
    setSelectedChaletIds([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right">إضافة موظف جديد للفريق</DialogTitle>
          <DialogDescription className="text-right">سيتم إنشاء حساب موظف جديد بالصلاحيات والوحدات المختارة.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">الاسم الثلاثي للموظف <UserPlus className="h-3.5" /></Label>
                <Input placeholder="مثال: أحمد محمد علي" value={name} onChange={e => setName(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">البريد الإلكتروني <Mail className="h-3.5" /></Label>
                <Input type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">كلمة المرور <Lock className="h-3.5" /></Label>
                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">رقم الهاتف <Phone className="h-3.5" /></Label>
                <Input placeholder="01xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="space-y-2">
              <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">الدور والمسؤولية</Label>
              <Select onValueChange={(v) => setRole(v as UserRole)} defaultValue="broker">
                <SelectTrigger className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broker">وسيط إداري (بروكر)</SelectItem>
                  <SelectItem value="supervisor">مشرف ميداني</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="space-y-3">
              <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">تعيين الوحدات (اختياري) <Home className="h-3.5" /></Label>
              <ScrollArea className="h-[150px] w-full rounded-2xl border border-slate-100 p-4 bg-slate-50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chalets.map(c => (
                      <div key={c.id} className="flex items-center gap-3 flex-row-reverse text-right">
                         <Checkbox 
                            id={`ch-${c.id}`} 
                            checked={selectedChaletIds.includes(c.id)} 
                            onCheckedChange={() => handleToggleChalet(c.id)}
                          />
                         <label htmlFor={`ch-${c.id}`} className="text-xs font-bold text-slate-700 cursor-pointer">{c.name} ({c.code})</label>
                      </div>
                    ))}
                 </div>
              </ScrollArea>
           </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-3 pb-2">
           <Button className="flex-1 rounded-2xl h-14 font-black bg-primary text-white" onClick={handleAdd} disabled={!name || !email || !password}>
             إضافة الموظف للمنظومة
           </Button>
           <Button variant="ghost" className="rounded-2xl h-14 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
