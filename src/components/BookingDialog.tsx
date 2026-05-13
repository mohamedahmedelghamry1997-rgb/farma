
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chalet, Booking, useAppStore } from "@/lib/store"
import { format, isBefore, startOfDay, isSameDay, isWithinInterval, differenceInDays, addDays, subDays } from "date-fns"
import { ar } from "date-fns/locale"
import { CalendarIcon, Users, Phone, User, MessageSquare, Wallet, CreditCard, AlertTriangle, ImageIcon, PlusCircle, Trash2, Smartphone, Landmark } from "lucide-react"
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
  const { systemSettings } = useAppStore()
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [idCardUrls, setIdCardUrls] = useState<string[]>([''])
  const [guests, setGuests] = useState(1)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('vodafone_cash')
  const [paymentRef, setPaymentRef] = useState('')

  const handleAddIdUrl = () => {
    setIdCardUrls([...idCardUrls, ''])
  }

  const handleUpdateIdUrl = (index: number, value: string) => {
    const newUrls = [...idCardUrls]
    newUrls[index] = value
    setIdCardUrls(newUrls)
  }

  const handleRemoveIdUrl = (index: number) => {
    if (idCardUrls.length <= 1) return
    setIdCardUrls(idCardUrls.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    if (!chalet || !dateRange?.from || !dateRange?.to) return 0
    const days = differenceInDays(dateRange.to, dateRange.from) + 1
    return chalet.normalPrice * days
  }

  const checkGapRule = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to || !chalet) return true;

    const startOfNew = startOfDay(range.from);
    const endOfNew = startOfDay(range.to);

    const relevantBookings = existingBookings
      .filter(b => b.chaletId === chalet.id && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const prevBooking = [...relevantBookings].reverse().find(b => startOfDay(new Date(b.endDate)) < startOfNew);
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
    
    const commissionPerNight = currentUser?.role === 'admin' ? 0 : (currentUser?.commissionRate || 200);
    const validIdUrls = idCardUrls.filter(u => u.trim() !== '');

    onConfirm({
      chaletId: chalet.id,
      clientName: name,
      phoneNumber: phone,
      clientIdCardUrls: validIdUrls,
      clientIdCardUrl: validIdUrls[0] || '',
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
    setIdCardUrls([''])
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

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 justify-end">
                روابط صور بطاقات العميل <PlusCircle className="h-3 w-3 ml-1" />
              </Label>
              {idCardUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveIdUrl(idx)} className="text-red-500 rounded-xl h-12 w-12 shrink-0 bg-slate-50" disabled={idCardUrls.length <= 1}>
                    <Trash2 size={18} />
                  </Button>
                  <Input 
                    placeholder={`رابط بطاقة ${idx + 1}...`} 
                    value={url} 
                    onChange={e => handleUpdateIdUrl(idx, e.target.value)} 
                    className="rounded-2xl border-slate-100 bg-slate-50 h-12 text-right flex-1" 
                  />
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddIdUrl} className="w-full rounded-xl border-dashed border-2 font-bold gap-2">
                <PlusCircle className="h-4 w-4" /> إضافة رابط بطاقة آخر
              </Button>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
               <div className="flex justify-between items-center mb-2 flex-row-reverse">
                  <span className="text-blue-600 font-black flex items-center gap-2 flex-row-reverse"><Wallet className="h-4 w-4" /> بيانات الدفع المالي</span>
                  <span className="text-xl font-black text-slate-800">{calculateTotal()} ج.م</span>
               </div>
               
               {/* عرض بيانات التحويل من إعدادات النظام */}
               {(systemSettings?.vodafoneCash || systemSettings?.instaPay) && (
                 <div className="bg-white/80 p-4 rounded-2xl border border-blue-100/50 space-y-2 text-right">
                    <p className="text-[10px] font-black text-slate-400 mb-2">يرجى التحويل على أحد الحسابات التالية:</p>
                    {systemSettings?.vodafoneCash && (
                      <div className="flex items-center justify-end gap-2 text-slate-700">
                        <span className="font-black text-sm">{systemSettings.vodafoneCash}</span>
                        <span className="text-[10px] font-bold text-slate-500">فودافون كاش:</span>
                        <Smartphone className="h-3 w-3 text-red-500" />
                      </div>
                    )}
                    {systemSettings?.instaPay && (
                      <div className="flex items-center justify-end gap-2 text-slate-700">
                        <span className="font-black text-sm">{systemSettings.instaPay}</span>
                        <span className="text-[10px] font-bold text-slate-500">انستا باي:</span>
                        <Landmark className="h-3 w-3 text-purple-600" />
                      </div>
                    )}
                 </div>
               )}

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
