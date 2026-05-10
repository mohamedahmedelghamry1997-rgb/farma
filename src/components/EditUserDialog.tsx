
"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserProfile, UserRole } from "@/lib/store"
import { Settings, Shield, Briefcase, ClipboardCheck, Wallet } from "lucide-react"

interface EditUserDialogProps {
  user: UserProfile | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (userId: string, data: Partial<UserProfile>) => void
}

export function EditUserDialog({ user, isOpen, onClose, onUpdate }: EditUserDialogProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('broker')
  const [commission, setCommission] = useState('200')
  const [status, setStatus] = useState<'active' | 'suspended'>('active')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setRole(user.role || 'broker')
      setCommission(String(user.commissionRate || 200))
      setStatus(user.status || 'active')
    }
  }, [user])

  const handleSave = () => {
    if (!user) return
    onUpdate(user.uid, {
      name,
      role,
      commissionRate: parseFloat(commission),
      status
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right flex items-center justify-end gap-2">
            إعدادات حساب الموظف <Settings className="h-6 w-6 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-right">تعديل الصلاحيات، العمولات، والحالة التشغيلية للموظف.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
           <div className="space-y-2">
              <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">الاسم بالكامل</Label>
              <Input value={name} onChange={e => setName(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50" />
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">الدور</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="rounded-2xl h-12 text-right bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broker">وسيط (Broker)</SelectItem>
                    <SelectItem value="supervisor">مشرف (Supervisor)</SelectItem>
                    <SelectItem value="admin">مدير (Admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">حالة الحساب</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger className="rounded-2xl h-12 text-right bg-slate-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="suspended">معطل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
           </div>

           {role === 'broker' && (
             <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">قيمة العمولة لكل ليلة (ج.م) <Wallet className="h-3 w-3" /></Label>
                <Input type="number" value={commission} onChange={e => setCommission(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 font-black" />
             </div>
           )}

           <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-black text-orange-600 uppercase text-right">تحذير أمني</p>
              <p className="text-xs text-slate-600 text-right mt-1">أي تغيير في الصلاحيات سيؤثر فوراً على واجهة المستخدم الخاصة بالموظف عند تسجيل دخوله القادم.</p>
           </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-3 pb-2">
           <Button className="flex-1 rounded-2xl h-14 font-black bg-primary text-white" onClick={handleSave}>
             حفظ التغييرات
           </Button>
           <Button variant="ghost" className="rounded-2xl h-14 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
