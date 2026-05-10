
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, Smartphone, Landmark, SendHorizontal } from "lucide-react"

interface WithdrawalDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: any) => void
  availableBalance: number
}

export function WithdrawalDialog({ isOpen, onClose, onConfirm, availableBalance }: WithdrawalDialogProps) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<'vodafone_cash' | 'instapay' | 'bank'>('vodafone_cash')
  const [details, setDetails] = useState('')

  const handleConfirm = () => {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0 || val > availableBalance) return
    onConfirm({
      amount: val,
      method,
      details
    })
    setAmount('')
    setDetails('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right flex items-center justify-end gap-2">طلب سحب أرباح <Wallet className="text-primary" /></DialogTitle>
          <DialogDescription className="text-right">يرجى إدخال المبلغ وتحديد وسيلة التحويل المفضلة.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
           <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
              <p className="text-xs font-black text-slate-400 uppercase mb-1">الرصيد المتاح للسحب</p>
              <p className="text-3xl font-black text-primary">{availableBalance.toLocaleString()} ج.م</p>
           </div>

           <div className="space-y-2">
              <Label className="font-bold text-slate-500 flex justify-end">المبلغ المطلوب سحبه</Label>
              <Input 
                type="number" 
                placeholder="أدخل المبلغ..." 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="h-14 rounded-2xl bg-slate-50 border-none text-right text-lg font-black"
              />
           </div>

           <div className="space-y-2">
              <Label className="font-bold text-slate-500 flex justify-end">وسيلة السحب</Label>
              <Select value={method} onValueChange={(v: any) => setMethod(v)}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                  <SelectItem value="instapay">انستا باي (InstaPay)</SelectItem>
                  <SelectItem value="bank">تحويل بنكي</SelectItem>
                </SelectContent>
              </Select>
           </div>

           <div className="space-y-2">
              <Label className="font-bold text-slate-500 flex justify-end">
                {method === 'vodafone_cash' ? 'رقم الهاتف' : method === 'instapay' ? 'معرف انستا باي' : 'بيانات الحساب'}
              </Label>
              <Input 
                placeholder="أدخل البيانات هنا..." 
                value={details} 
                onChange={e => setDetails(e.target.value)}
                className="h-14 rounded-2xl bg-slate-50 border-none text-right"
              />
           </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-3 pb-2">
           <Button 
            className="flex-1 rounded-2xl h-16 font-black bg-primary text-white text-lg shadow-xl shadow-primary/20" 
            onClick={handleConfirm}
            disabled={!amount || !details || parseFloat(amount) > availableBalance || parseFloat(amount) <= 0}
           >
             إرسال طلب السحب <SendHorizontal className="mr-2 h-5 w-5" />
           </Button>
           <Button variant="ghost" className="rounded-2xl h-16 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
