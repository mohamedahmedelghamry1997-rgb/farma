
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Booking, Chalet } from "@/lib/store"
import { Zap, Droplets, ShieldAlert, ClipboardCheck, Box, CheckCircle2 } from "lucide-react"

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

  if (!booking || !chalet) return null

  const handleAction = () => {
    onConfirm({
      opStatus: 'checked_out',
      checkOutTime: new Date().toISOString(),
      electricityReading: electricity,
      waterReading: water,
      conditionReport: `الحالة: ${condition} | ملاحظات: ${damages}`,
      status: 'confirmed'
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right flex items-center justify-end gap-2">
            إجراءات إخلاء وفحص الوحدة <ShieldAlert className="text-orange-600" />
          </DialogTitle>
          <DialogDescription className="text-right font-bold">
            يرجى تعبئة بيانات الفحص النهائي قبل مغادرة العميل للوحدة: {chalet.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">قراءة عداد الكهرباء <Zap className="h-3.5 text-yellow-500" /></Label>
                <Input type="number" placeholder="0000" value={electricity} onChange={e => setElectricity(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">قراءة عداد المياه <Droplets className="h-3.5 text-blue-500" /></Label>
                <Input type="number" placeholder="0000" value={water} onChange={e => setWater(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="space-y-2">
              <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">حالة الوحدة الفنية</Label>
              <Select onValueChange={setCondition} defaultValue="excellent">
                <SelectTrigger className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">ممتازة (لا توجد ملاحظات)</SelectItem>
                  <SelectItem value="good">جيدة (استهلاك طبيعي)</SelectItem>
                  <SelectItem value="needs_maintenance">تحتاج صيانة بسيطة</SelectItem>
                  <SelectItem value="damaged">يوجد تلفيات (خصم تأمين)</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="space-y-2">
              <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-xs">تفاصيل التلفيات أو المفقودات</Label>
              <Textarea placeholder="اكتب أي ملاحظات ميدانية هنا..." value={damages} onChange={e => setDamages(e.target.value)} className="rounded-2xl min-h-[80px] text-right bg-slate-50 border-slate-100" />
           </div>

           <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-2 flex-row-reverse">
                <Box className="text-primary h-5 w-5" />
                <span className="text-sm font-black text-slate-700">فحص المخزون (فوط، ملايات، صابون)</span>
              </div>
              <Button 
                variant={inventoryChecked ? "default" : "outline"} 
                size="sm" 
                className="rounded-xl font-black"
                onClick={() => setInventoryChecked(!inventoryChecked)}
              >
                {inventoryChecked ? "تم الفحص" : "تأكيد الجرد"}
              </Button>
           </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-3">
           <Button 
             className="flex-1 rounded-2xl h-16 font-black bg-orange-600 text-white text-lg shadow-xl shadow-orange-100" 
             onClick={handleAction} 
             disabled={!inventoryChecked || !electricity || !water}
           >
             إنهاء الحجز وتسجيل الخروج
           </Button>
           <Button variant="ghost" className="rounded-2xl h-16 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
