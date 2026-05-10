
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
import { format, isBefore, startOfDay, isSameDay, isWithinInterval, differenceInDays, addDays, subDays } from "date-fns"
import { ar } from "date-fns/locale"
import { CalendarIcon, Users, Phone, User, MessageSquare, Wallet, CreditCard, AlertTriangle } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useToast } from '@/hooks/use-toast'

interface BookingDialogProps {
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (booking: Omit<Booking, 'id' | 'status' | 'opStatus'>) => void
  existingBookings: Booking[]
  currentUser?: any
}

export function BookingDialog({ chalet, isOpen, onClose, onConfirm, existingBookings, currentUser }: BookingDialogProps) {
  const { toast } = useToast()
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
    return chalet.normalPrice * days
  }

  const checkGapRule = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to || !chalet) return true;

    const startOfNew = startOfDay(range.from);
    const endOfNew = startOfDay(range.to);

    // الحصول على الحجوزات النشطة لهذا الشاليه وترتيبها زمنياً
    const relevantBookings = existingBookings
      .filter(b => b.chaletId === chalet.id && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // البحث عن أقرب حجز يسبق هذا الحجز
    const prevBooking = [...relevantBookings].reverse().find(b => startOfDay(new Date(b.endDate)) < startOfNew);
    
    // البحث عن أقرب حجز يلي هذا الحجز
    const nextBooking = relevantBookings.find(b => startOfDay(new Date(b.startDate)) > endOfNew);

    if (prevBooking) {
      const prevEnd = startOfDay(new Date(prevBooking.endDate));
      const gap = differenceInDays(startOfNew, prevEnd);
      
      if (gap > 1) {
        toast({
          variant: "destructive",
          title: "خطأ في الجدولة (فجوة فارغة)",
          description: `لا يمكن ترك أيام فارغة (${gap - 1} أيام). يجب أن يبدأ الحجز الجديد يوم ${format(addDays(prevEnd, 1), 'dd MMMM', { locale: ar })} ليكون متصلاً بالحجز السابق.`
        });
        return false;
      }
    }

    if (nextBooking) {
      const nextStart = startOfDay(new Date(nextBooking.startDate));
      const gap = differenceInDays(nextStart, endOfNew);
      
      if (gap > 1) {
        toast({
          variant: "destructive",
          title: "خطأ في الجدولة (فجوة فارغة)",
          description: `لا يمكن ترك أيام فارغة (${gap - 1} أيام) قبل الحجز القادم. يجب أن ينتهي الحجز الجديد يوم ${format(subDays(nextStart, 1), 'dd MMMM', { locale: ar })} ليغلق الفجوة.`
        });
        return false;
      }
    }

    return true;
  }

  const handleConfirm = () => {
    if (!chalet || !dateRange?.from || !dateRange?.to || !name || !phone) return
    
    if (!checkGapRule(dateRange)) return;

    const nights = differenceInDays(dateRange.to, dateRange.from) + 1;
    const commissionPerNight = currentUser?.commissionRate || 200;

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
      totalAmount: calculateTotal(),
      brokerId: currentUser?.uid || null,
      brokerName: currentUser?.name || "مباشر",
      brokerCommission: nights * commissionPerNight
    })
    
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
        <DialogHeader className="bg-primary p-8 text-white relative">
          <DialogTitle className="text-2xl font-bold text-right mb-2">طلب حجز واستلام الوحدة</DialogTitle>
          <DialogDescription className="text-white/70 text-right font-medium">
             منتجع فارما بيتش - يرجى الالتزام بالجدولة المتصلة (بدون أي فجوات زمنية)
          </DialogDescription>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <CalendarIcon size={120} />
          </div>
        </DialogHeader>
        
        <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[75vh]">
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
               اختر تواريخ الإقامة <CalendarIcon className="h-3 w-3" />
            </Label>
            <div className="flex justify-center border rounded-3xl p-2 bg-slate-50/50">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                disabled={isDateDisabled}
                className="rounded-xl w-full flex justify-center"
                locale={ar}
                dir="rtl"
              />
            </div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3 flex-row-reverse text-right">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
            <p className="text-xs text-orange-800 font-bold leading-relaxed">
              سياسة الجدولة: يمنع النظام ترك أي أيام فارغة بين الحجوزات. يجب أن تبدأ حجوزاتك من اليوم التالي مباشرة لآخر حجز مسجل لضمان استمرارية الإشغال.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
                  اسم العميل بالكامل <User className="h-3 w-3" />
                </Label>
                <Input placeholder="الاسم الثلاثي..." value={name} onChange={e => setName(e.target.value)} className="rounded-2xl border-slate-100 bg-slate-50 h-12 text-right" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
                  رقم الجوال <Phone className="h-3 w-3" />
                </Label>
                <Input placeholder="01xxxxxxxxx" value={phone} onChange={e => setPhone(e.target.value)} className="rounded-2xl border-slate-100 bg-slate-50 h-12 text-right" />
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-600 font-black flex items-center gap-2"><Wallet className="h-4 w-4" /> بيانات الدفع المالي</span>
                  <span className="text-xl font-black text-slate-800">{calculateTotal()} ج.م</span>
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
