
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chalet, Booking } from "@/lib/store"
import { format, isBefore, startOfDay, isSameDay, isWithinInterval, differenceInDays } from "date-fns"
import { ar } from "date-fns/locale"
import { CalendarIcon, Users, Phone, User, MessageSquare, Wallet, CreditCard } from "lucide-react"
import { DateRange } from "react-day-picker"

interface BookingDialogProps {
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (booking: Omit<Booking, 'id' | 'status' | 'opStatus'>) => void
  existingBookings: Booking[]
}

export function BookingDialog({ chalet, isOpen, onClose, onConfirm, existingBookings }: BookingDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(1)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('vodafone_cash')
  const [paymentRef, setPaymentRef] = useState('')

  const calculateTotal = () => {
    if (!chalet || !dateRange?.from || !dateRange?.to) return 0
    const days = differenceInDays(dateRange.to, dateRange.from) + 1
    // Simple logic: if weekend involved, use holiday price, else normal
    // For MVP, we'll just use normalPrice * days
    return chalet.normalPrice * days
  }

  const handleConfirm = () => {
    if (!chalet || !dateRange?.from || !dateRange?.to || !name || !phone) return
    onConfirm({
      chaletId: chalet.id,
      clientName: name,
      phoneNumber: phone,
      guestCount: guests,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      notes: notes,
      paymentMethod,
      paymentReference: paymentRef,
      totalAmount: calculateTotal()
    })
    // Reset state after confirm
    setDateRange(undefined)
    setName('')
    setPhone('')
    setGuests(1)
    setNotes('')
    setPaymentRef('')
    onClose()
  }

  const isDateDisabled = (day: Date) => {
    const today = startOfDay(new Date())
    if (isBefore(day, today)) return true

    return existingBookings.some(b => {
      if (b.chaletId !== chalet?.id || b.status === 'cancelled') return false
      const start = startOfDay(new Date(b.startDate))
      const end = startOfDay(new Date(b.endDate))
      return (isSameDay(day, start) || isSameDay(day, end) || isWithinInterval(day, { start, end }))
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl text-right">
        <div className="bg-primary p-8 text-white relative">
          <DialogTitle className="text-2xl font-bold text-right mb-2">طلب حجز واستلام الوحدة</DialogTitle>
          <DialogDescription className="text-white/70 text-right font-medium">
             منتجع فارما بيتش - يرجى استكمال بيانات الدفع للتأكيد
          </DialogDescription>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <CalendarIcon size={120} />
          </div>
        </div>
        
        <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[75vh]">
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
               اختر تواريخ الإقامة <CalendarIcon className="h-3 w-3" />
            </Label>
            <div className="flex justify-center border rounded-3xl p-2 bg-slate-50/50">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={isDateDisabled}
                className="rounded-xl w-full flex justify-center"
                locale={ar}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
                  اسم العميل بالكامل <User className="h-3 w-3" />
                </Label>
                <Input 
                  placeholder="الاسم الثلاثي..." 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="rounded-2xl border-slate-100 bg-slate-50 h-12 text-right focus:bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
                  رقم الجوال <Phone className="h-3 w-3" />
                </Label>
                <Input 
                  placeholder="01xxxxxxxxx" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="rounded-2xl border-slate-100 bg-slate-50 h-12 text-right focus:bg-white"
                />
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-600 font-black flex items-center gap-2"><Wallet className="h-4 w-4" /> بيانات الدفع المالي</span>
                  <span className="text-xl font-black text-slate-800">{calculateTotal()} ج.م</span>
               </div>
               
               <div className="space-y-3">
                 <Label className="text-[10px] font-black text-slate-400 uppercase">وسيلة التحويل</Label>
                 <Select onValueChange={setPaymentMethod} defaultValue="vodafone_cash">
                    <SelectTrigger className="rounded-xl bg-white border-blue-100 h-12">
                      <SelectValue placeholder="اختر الوسيلة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vodafone_cash">فودافون كاش (01012345678)</SelectItem>
                      <SelectItem value="instapay">إنستا باي (InstaPay)</SelectItem>
                      <SelectItem value="bank">تحويل بنكي</SelectItem>
                    </SelectContent>
                 </Select>
               </div>

               <div className="space-y-3">
                 <Label className="text-[10px] font-black text-slate-400 uppercase">رقم العملية أو المرجع <CreditCard className="h-3 w-3 inline ml-1" /></Label>
                 <Input 
                  placeholder="ادخل رقم التحويل أو المرجع هنا..." 
                  value={paymentRef} 
                  onChange={e => setPaymentRef(e.target.value)}
                  className="rounded-xl border-blue-100 bg-white h-12 text-right"
                />
               </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
                ملاحظات إضافية <MessageSquare className="h-3 w-3" />
              </Label>
              <Textarea 
                placeholder="أي طلبات خاصة للمشرف..." 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                className="rounded-2xl border-slate-100 bg-slate-50 min-h-[80px] text-right focus:bg-white"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 bg-white gap-3 flex flex-row-reverse">
          <Button 
            onClick={handleConfirm} 
            disabled={!dateRange?.from || !dateRange?.to || !name || !phone || !paymentRef}
            className="rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white flex-1 font-bold text-lg shadow-xl shadow-primary/20"
          >
            تأكيد الطلب وإرسال الدفع
          </Button>
          <Button variant="ghost" onClick={onClose} className="rounded-2xl h-14 font-bold text-slate-400">إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
