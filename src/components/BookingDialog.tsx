
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Chalet, Booking, useAppStore } from "@/lib/store"
import { format, isBefore, startOfDay, isSameDay, isWithinInterval, differenceInDays, addDays, subDays } from "date-fns"
import { ar } from "date-fns/locale"
import { 
  Calendar as CalendarIcon, 
  Phone, 
  User, 
  Wallet, 
  CreditCard, 
  Info, 
  PlusCircle, 
  Trash2, 
  Smartphone, 
  Landmark,
  Upload,
  X,
  ImageIcon
} from "lucide-react"
import { DateRange } from "react-day-picker"
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

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
  const [idCardUrls, setIdCardUrls] = useState<string[]>([])
  const [guests, setGuests] = useState(1)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('vodafone_cash')
  const [paymentRef, setPaymentRef] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)
    
    fileArray.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setIdCardUrls(prev => [...prev, base64String])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setIdCardUrls(prev => prev.filter((_, i) => i !== index))
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

    onConfirm({
      chaletId: chalet.id,
      clientName: name,
      phoneNumber: phone,
      clientIdCardUrls: idCardUrls,
      clientIdCardUrl: idCardUrls[0] || '',
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
    setIdCardUrls([])
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
             منتجع فارما بيتش - يرجى إدخال بيانات العميل والبطاقات أولاً
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-6 bg-white overflow-y-auto max-h-[75vh] custom-scrollbar">
          
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
                صور بطاقات العميل (وجه وظهر) <ImageIcon className="h-3 w-3 ml-1" />
              </Label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {idCardUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-100 group">
                    <Image src={url} alt={`بطاقة ${idx + 1}`} fill className="object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors">
                  <Upload size={20} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">رفع صور</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
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
            <Info className="h-5 w-5 text-orange-600 shrink-0" />
            <p className="text-xs text-orange-800 font-bold leading-relaxed">
              سياسة الجدولة: يمنع النظام ترك أي أيام فارغة بين الحجوزات. يجب أن تبدأ حجوزاتك من اليوم التالي مباشرة لآخر حجز مسجل.
            </p>
          </div>

          <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-4">
               <div className="flex justify-between items-center mb-2 flex-row-reverse">
                  <span className="text-blue-600 font-black flex items-center gap-2 flex-row-reverse"><Wallet className="h-4 w-4" /> بيانات الدفع المالي</span>
                  <span className="text-xl font-black text-slate-800">{calculateTotal()} ج.م</span>
               </div>
               
               <div className="bg-white/80 p-4 rounded-2xl border border-blue-100/50 space-y-3 text-right">
                  <p className="text-[10px] font-black text-slate-400 mb-1">يرجى التحويل على أحد الحسابات التالية:</p>
                  {systemSettings?.vodafoneCash && (
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                         <Smartphone className="h-4 w-4 text-red-500" />
                         <span className="text-[10px] font-bold text-slate-500">فودافون كاش:</span>
                      </div>
                      <span className="font-black text-sm text-slate-900 select-all">{systemSettings.vodafoneCash}</span>
                    </div>
                  )}
                  {systemSettings?.instaPay && (
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                         <Landmark className="h-4 w-4 text-purple-600" />
                         <span className="text-[10px] font-bold text-slate-500">انستا باي:</span>
                      </div>
                      <span className="font-black text-sm text-slate-900 select-all">{systemSettings.instaPay}</span>
                    </div>
                  )}
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

        <DialogFooter className="p-8 pt-0 bg-white gap-3 flex flex-row-reverse">
          <Button 
            onClick={handleConfirm} 
            disabled={!dateRange?.from || !dateRange?.to || !name || !phone || !paymentRef || idCardUrls.length === 0}
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
