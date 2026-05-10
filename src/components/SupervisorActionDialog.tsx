
"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Booking, Chalet } from "@/lib/store"
import { Zap, Droplets, ShieldAlert, ClipboardCheck, Box, CheckCircle2, Activity, UserCheck, LogOut } from "lucide-react"

interface SupervisorActionDialogProps {
  booking: Booking | null
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (updates: Partial<Booking>) => void
}

export function SupervisorActionDialog({ booking, chalet, isOpen, onClose, onConfirm }: SupervisorActionDialogProps) {
  const [electricity, setElectricity] = useState('')
  const [water, setWater] = useState('')
  const [condition, setCondition] = useState('excellent')
  const [damages, setDamages] = useState('')
  const [inventoryChecked, setInventoryChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset fields when dialog opens
  useEffect(() => {
    if (isOpen) {
      setElectricity(booking?.electricityReading || '')
      setWater(booking?.waterReading || '')
      setCondition('excellent')
      setDamages('')
      setInventoryChecked(false)
    }
  }, [isOpen, booking])

  if (!booking || !chalet) return null

  const isCheckIn = booking.opStatus === 'waiting'

  const handleAction = async () => {
    setIsSubmitting(true)
    try {
      const updates: Partial<Booking> = {
        electricityReading: electricity,
        waterReading: water,
        conditionReport: `الحالة: ${condition} | ملاحظات المشرف: ${damages}`,
      }

      if (isCheckIn) {
        updates.opStatus = 'checked_in'
        updates.checkInTime = new Date().toISOString()
      } else {
        updates.opStatus = 'checked_out'
        updates.checkOutTime = new Date().toISOString()
      }

      await onConfirm(updates)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="bg-slate-50 p-8 border-b">
          <div className="flex items-center justify-center mb-4">
             <div className={`p-4 rounded-3xl ${isCheckIn ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {isCheckIn ? <UserCheck size={40} /> : <LogOut size={40} />}
             </div>
          </div>
          <DialogTitle className="text-2xl font-black text-center">
            {isCheckIn ? 'إجراء استلام العميل للوحدة' : 'إجراء إخلاء العميل للوحدة'}
          </DialogTitle>
          <DialogDescription className="text-center font-bold text-slate-500 mt-2">
            الوحدة: {chalet.name} ({chalet.code})<br/>
            العميل: {booking.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">قراءة عداد الكهرباء <Zap className="h-4 text-yellow-500" /></Label>
                <Input type="number" placeholder="ادخل الرقم..." value={electricity} onChange={e => setElectricity(e.target.value)} className="rounded-2xl h-14 text-right bg-slate-50 border-none shadow-inner" />
              </div>
              <div className="space-y-3">
                <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">قراءة عداد المياه <Droplets className="h-4 text-blue-500" /></Label>
                <Input type="number" placeholder="ادخل الرقم..." value={water} onChange={e => setWater(e.target.value)} className="rounded-2xl h-14 text-right bg-slate-50 border-none shadow-inner" />
              </div>
           </div>

           <div className="space-y-3">
              <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">الحالة الفنية للوحدة</Label>
              <Select onValueChange={setCondition} defaultValue="excellent">
                <SelectTrigger className="rounded-2xl h-14 text-right bg-slate-50 border-none shadow-inner">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">ممتازة (لا ملاحظات)</SelectItem>
                  <SelectItem value="good">جيدة جداً</SelectItem>
                  <SelectItem value="needs_maintenance">تحتاج صيانة بسيطة</SelectItem>
                  <SelectItem value="damaged">يوجد تلفيات (برجاء كتابتها)</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="space-y-3">
              <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">تقرير المعاينة الميداني</Label>
              <Textarea 
                placeholder="اكتب تفاصيل الفحص، أي مفقودات، أو شكاوى العميل..." 
                value={damages} 
                onChange={e => setDamages(e.target.value)} 
                className="rounded-2xl min-h-[120px] text-right bg-slate-50 border-none shadow-inner" 
              />
           </div>

           <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse">
                <Box className="text-primary h-6 w-6" />
                <div>
                   <p className="text-sm font-black text-slate-700">جرد الأثاث والمستلزمات</p>
                   <p className="text-[10px] text-slate-400 font-bold">تأكد من وجود كافة الفوط والملايات والأواني</p>
                </div>
              </div>
              <Button 
                variant={inventoryChecked ? "default" : "outline"} 
                size="sm" 
                className="rounded-2xl font-black h-12 px-6 transition-all"
                onClick={() => setInventoryChecked(!inventoryChecked)}
              >
                {inventoryChecked ? <CheckCircle2 className="h-5 w-5 ml-2" /> : null}
                {inventoryChecked ? "تم الجدولة" : "تأكيد الجرد"}
              </Button>
           </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex flex-row-reverse gap-4">
           <Button 
             className={`flex-1 rounded-[1.5rem] h-16 font-black text-lg shadow-xl ${isCheckIn ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'} text-white transition-all`} 
             onClick={handleAction} 
             disabled={!inventoryChecked || !electricity || !water || isSubmitting}
           >
             {isSubmitting ? <Activity className="animate-spin h-6 w-6" /> : isCheckIn ? "تأكيد الاستلام والتسليم للعميل" : "تأكيد الإخلاء وإغلاق الحجز"}
           </Button>
           <Button variant="ghost" className="rounded-[1.5rem] h-16 px-8 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
