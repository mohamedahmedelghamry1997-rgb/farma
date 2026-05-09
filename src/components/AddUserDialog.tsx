
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserRole, Chalet } from "@/lib/store"
import { UserPlus, Shield, Briefcase, ClipboardCheck } from "lucide-react"

interface AddUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: any) => void
  chalets: Chalet[]
}

export function AddUserDialog({ isOpen, onClose, onAdd, chalets }: AddUserDialogProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('broker')

  const handleAdd = () => {
    onAdd({
      name,
      role,
      assignedChaletIds: chalets.slice(0, 5).map(c => c.id) // Default assignment for mock
    })
    setName('')
    setRole('broker')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right">إضافة موظف جديد للفريق</DialogTitle>
          <DialogDescription className="text-right">سيتم إنشاء حساب موظف جديد بالصلاحيات المختارة.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
           <div className="space-y-2">
              <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">الاسم الثلاثي للموظف <UserPlus className="h-3.3" /></Label>
              <Input placeholder="مثال: أحمد محمد علي" value={name} onChange={e => setName(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
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

           <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-[10px] font-black text-primary uppercase text-right">ملاحظة إدارية</p>
              <p className="text-xs text-slate-600 text-right mt-1">سيتم تعيين 5 شاليهات عشوائية للموظف بشكل تلقائي في النسخة التجريبية.</p>
           </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-3 pb-2">
           <Button className="flex-1 rounded-2xl h-14 font-black bg-primary text-white" onClick={handleAdd} disabled={!name}>
             إضافة الموظف
           </Button>
           <Button variant="ghost" className="rounded-2xl h-14 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
