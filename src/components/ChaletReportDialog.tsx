
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Chalet, Booking, UserRole } from '@/lib/store'
import { Badge } from './ui/badge'
import { User, Phone, Calendar as CalendarIcon, DollarSign, Tag, Briefcase, History, MapPin, Hash, Receipt, Wallet, UserCheck, Clock, ArrowLeftRight, Zap, Droplets, ClipboardCheck, CheckCircle2, ImageIcon } from 'lucide-react'
import { format, differenceInDays, isAfter, startOfDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ChaletReportDialogProps {
  chalet: Chalet | null
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  onViewFullHistory?: (chalet: Chalet) => void
  userRole?: UserRole | null
  allBookings?: Booking[]
}

export function ChaletReportDialog({ chalet, booking, isOpen, onClose, onViewFullHistory, userRole, allBookings = [] }: ChaletReportDialogProps) {
  if (!chalet) return null

  const nights = booking ? differenceInDays(new Date(booking.endDate), new Date(booking.startDate)) + 1 : 0;
  const commission = booking ? (booking.brokerCommission || 0) : (nights * 200);

  const chaletBookings = allBookings
    .filter(b => b.chaletId === chalet.id && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const currentBooking = chaletBookings.find(b => {
    const today = startOfDay(new Date());
    return isAfter(new Date(b.endDate), today) && !isAfter(new Date(b.startDate), today);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl md:rounded-[3rem] border-none shadow-2xl text-right bg-white max-h-[92vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="bg-primary p-6 md:p-10 text-white relative">
          <div className="flex flex-col gap-1 md:gap-2 z-10 relative">
             <Badge variant="outline" className={cn("w-fit border-white/30 text-white font-black px-3", "text-[10px]")}>{chalet.code}</Badge>
             <DialogTitle className="text-2xl md:text-4xl font-black text-right flex items-center justify-end gap-2 mt-1">
               {chalet.name} <Tag className="h-5 w-5 md:h-8 md:w-8" />
             </DialogTitle>
             <div className="flex items-center gap-1 justify-end opacity-80 font-bold text-xs md:text-base mt-0.5">
                <span>{chalet.location}</span>
                <MapPin className="h-3 w-3 md:h-4 md:w-4" />
             </div>
          </div>
          <div className="absolute top-0 left-0 p-6 md:p-10 opacity-10">
             <Hash size={80} className="md:w-32 md:h-32" />
          </div>
        </DialogHeader>

        <div className="p-6 md:p-10 space-y-8 md:space-y-12">
          {!booking && (
            <div className={`p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-3 md:gap-4 ${currentBooking ? 'border-orange-100 bg-orange-50' : 'border-green-100 bg-green-50'}`}>
                {currentBooking ? (
                  <>
                    <Clock className="h-10 w-10 md:h-12 md:w-12 text-orange-600 animate-pulse" />
                    <div>
                      <p className="text-xl md:text-2xl font-black text-orange-900">الوحدة محجوزة حالياً</p>
                      <p className="text-orange-700 font-bold text-xs md:text-base mt-1">
                        ستكون متاحة للإيجار بدءاً من: {format(new Date(currentBooking.endDate), 'dd MMMM yyyy', { locale: ar })}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-10 w-10 md:h-12 md:w-12 text-green-600" />
                    <div>
                      <p className="text-xl md:text-2xl font-black text-green-900">الوحدة متاحة الآن</p>
                      <p className="text-green-700 font-bold text-xs md:text-base mt-1">
                        جاهزة لاستقبال الحجوزات الفورية.
                      </p>
                    </div>
                  </>
                )}
                {onViewFullHistory && (
                  <Button variant="outline" className="mt-2 rounded-xl h-10 md:h-12 px-6 md:px-8 font-black border-slate-200 gap-2 text-xs" onClick={() => onViewFullHistory(chalet)}>
                    سجل التشغيل الكامل <History className="h-4 w-4" />
                  </Button>
                )}
            </div>
          )}

          {booking && (
            <div className="space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <InfoCard title="العميل المستأجر" value={booking.clientName} icon={User} color="text-blue-600" subValue={booking.phoneNumber} />
                <InfoCard title="فترة الإقامة" value={`${format(new Date(booking.startDate), 'dd MMM', { locale: ar })}`} icon={CalendarIcon} color="text-orange-600" subValue={`إلى ${format(new Date(booking.endDate), 'dd MMM', { locale: ar })} (${nights} ليالي)`} />
              </div>

              {booking.clientIdCardUrl && (
                <div className="p-6 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 space-y-4">
                  <div className="flex items-center justify-end gap-2 text-primary">
                    <h4 className="text-lg font-black">بطاقة هوية العميل</h4>
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-white shadow-md">
                    <a href={booking.clientIdCardUrl} target="_blank" rel="noopener noreferrer">
                      <Image 
                        src={booking.clientIdCardUrl} 
                        alt="بطاقة العميل" 
                        fill 
                        className="object-contain hover:scale-105 transition-transform cursor-zoom-in"
                        unoptimized
                      />
                    </a>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-100 space-y-6 md:space-y-8">
                 <div className="flex items-center justify-between flex-row-reverse border-b pb-4">
                    <h4 className="text-lg md:text-2xl font-black flex items-center gap-2 flex-row-reverse"><ClipboardCheck className="text-primary h-5 w-5 md:h-6 md:w-6" /> تقرير الفحص الميداني</h4>
                    <Badge className={cn(booking.opStatus === 'checked_out' ? 'bg-green-500' : booking.opStatus === 'checked_in' ? 'bg-blue-500' : 'bg-orange-500', "text-white border-none px-3 py-1 text-[8px] md:text-xs")}>
                        {booking.opStatus === 'checked_out' ? 'تم الإخلاء' : booking.opStatus === 'checked_in' ? 'بالداخل' : 'انتظار'}
                    </Badge>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border-b-2 md:border-b-4 border-yellow-400 text-center">
                       <Zap className="h-4 w-4 md:h-6 md:w-6 text-yellow-500 mx-auto mb-1 md:mb-2" />
                       <p className="text-[7px] md:text-[10px] font-black text-slate-400">الكهرباء</p>
                       <p className="text-sm md:text-xl font-black">{booking.electricityReading || '---'}</p>
                    </div>
                    <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border-b-2 md:border-b-4 border-blue-400 text-center">
                       <Droplets className="h-4 w-4 md:h-6 md:w-6 text-blue-500 mx-auto mb-1 md:mb-2" />
                       <p className="text-[7px] md:text-[10px] font-black text-slate-400">المياه</p>
                       <p className="text-sm md:text-xl font-black">{booking.waterReading || '---'}</p>
                    </div>
                    <div className="bg-white p-3 md:p-6 rounded-xl md:rounded-2xl shadow-sm border-b-2 md:border-b-4 border-green-400 text-center">
                       <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-green-500 mx-auto mb-1 md:mb-2" />
                       <p className="text-[7px] md:text-[10px] font-black text-slate-400">الجرد</p>
                       <p className="text-[10px] md:text-sm font-black">{booking.opStatus !== 'waiting' ? 'تم' : 'بانتظار'}</p>
                    </div>
                 </div>

                 <div className="p-4 md:p-6 bg-white rounded-xl md:rounded-2xl border border-slate-100 text-right">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase mb-1 md:mb-2">ملاحظات المشرف:</p>
                    <p className="text-xs md:text-slate-700 font-bold leading-relaxed">{booking.conditionReport || 'لا توجد ملاحظات.'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                 <div className="p-4 md:p-8 bg-primary/5 rounded-2xl md:rounded-[2.5rem] border border-primary/10 flex flex-col items-center text-center gap-1 md:gap-2">
                    <p className="text-[8px] md:text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي العمولة</p>
                    <p className="text-2xl md:text-4xl font-black text-primary">{commission.toLocaleString()} <span className="text-xs">ج.م</span></p>
                 </div>
                 <div className="p-4 md:p-8 bg-slate-50 rounded-2xl md:rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center gap-1 md:gap-2">
                    <p className="text-[8px] md:text-xs font-black text-slate-400 uppercase tracking-widest">مرجع العملية</p>
                    <p className="text-sm md:text-xl font-black text-slate-900">{booking.paymentReference || '---'}</p>
                 </div>
              </div>
            </div>
          )}

          <div className="pt-6 md:pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
             <div className="flex items-center gap-3 md:gap-4 flex-row-reverse w-full md:w-auto">
                <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-sm"><Receipt size={20} className="md:w-7 md:h-7" /></div>
                <div className="text-right">
                   <p className="text-[8px] md:text-xs font-black text-slate-400 uppercase">سياسة الإلغاء</p>
                   <p className="text-xs md:text-base font-bold text-slate-700">تخضع لشروط الإدارة</p>
                </div>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-black bg-slate-900 text-white hover:bg-primary transition-colors text-xs md:text-base">طباعة</button>
                <button className="flex-1 md:flex-none h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors text-xs md:text-base" onClick={onClose}>إغلاق</button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ title, value, icon: Icon, color, subValue }: any) {
  return (
    <div className="p-4 md:p-8 bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] shadow-sm flex items-center gap-4 md:gap-6 flex-row-reverse text-right group hover:border-primary/20 transition-all">
       <div className={`${color} bg-slate-50 p-3 md:p-5 rounded-xl md:rounded-[1.5rem] group-hover:bg-white group-hover:shadow-inner transition-all`}><Icon className="h-5 w-5 md:h-7 md:w-7" /></div>
       <div className="flex-1 overflow-hidden">
          <p className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">{title}</p>
          <p className="text-sm md:text-xl font-black text-slate-900 leading-tight truncate">{value}</p>
          {subValue && <p className="text-[9px] md:text-xs font-bold text-slate-500 mt-0.5 truncate">{subValue}</p>}
       </div>
    </div>
  )
}
