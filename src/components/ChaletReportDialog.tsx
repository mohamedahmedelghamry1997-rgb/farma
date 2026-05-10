
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Chalet, Booking, UserRole } from '@/lib/store'
import { Badge } from './ui/badge'
import { User, Phone, Calendar as CalendarIcon, DollarSign, Tag, Briefcase, History, MapPin, Hash, Receipt, Wallet, UserCheck, Clock, ArrowLeftRight } from 'lucide-react'
import { format, differenceInDays, isAfter, startOfDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Button } from './ui/button'

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

  // حساب الموعد القادم المتاح
  const chaletBookings = allBookings
    .filter(b => b.chaletId === chalet.id && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const currentBooking = chaletBookings.find(b => {
    const today = startOfDay(new Date());
    return isAfter(new Date(b.endDate), today) && !isAfter(new Date(b.startDate), today);
  });

  const nextBooking = chaletBookings.find(b => isAfter(new Date(b.startDate), new Date()));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl text-right bg-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="bg-primary p-10 text-white relative">
          <div className="flex flex-col gap-2 z-10 relative">
             <Badge variant="outline" className="w-fit border-white/30 text-white font-black px-4">{chalet.code}</Badge>
             <DialogTitle className="text-4xl font-black text-right flex items-center justify-end gap-3 mt-2">
               {chalet.name} <Tag className="h-8 w-8" />
             </DialogTitle>
             <div className="flex items-center gap-2 justify-end opacity-80 font-bold mt-1">
                <span>{chalet.location}</span>
                <MapPin className="h-4 w-4" />
             </div>
          </div>
          <div className="absolute top-0 left-0 p-10 opacity-10">
             <Hash size={120} />
          </div>
        </DialogHeader>

        <div className="p-10 space-y-12">
          {/* قسم حالة التوافر الفورية */}
          {!booking && (
            <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col items-center text-center gap-4 ${currentBooking ? 'border-orange-100 bg-orange-50' : 'border-green-100 bg-green-50'}`}>
                {currentBooking ? (
                  <>
                    <Clock className="h-12 w-12 text-orange-600 animate-pulse" />
                    <div>
                      <p className="text-2xl font-black text-orange-900">الوحدة محجوزة حالياً</p>
                      <p className="text-orange-700 font-bold mt-1">
                        ستكون متاحة للإيجار بدءاً من: {format(new Date(currentBooking.endDate), 'dd MMMM yyyy', { locale: ar })}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-12 w-12 text-green-600" />
                    <div>
                      <p className="text-2xl font-black text-green-900">الوحدة متاحة الآن</p>
                      <p className="text-green-700 font-bold mt-1">
                        جاهزة لاستقبال الحجوزات الفورية في الشيت.
                      </p>
                    </div>
                  </>
                )}
                {onViewFullHistory && (
                  <Button variant="outline" className="mt-4 rounded-2xl h-12 px-8 font-black border-slate-200 gap-2" onClick={() => onViewFullHistory(chalet)}>
                    عرض سجل التشغيل الكامل <History className="h-4 w-4" />
                  </Button>
                )}
            </div>
          )}

          {booking && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="العميل المستأجر" value={booking.clientName} icon={User} color="text-blue-600" subValue={booking.phoneNumber} />
                <InfoCard title="فترة الإقامة" value={`${format(new Date(booking.startDate), 'dd MMMM yyyy', { locale: ar })}`} icon={CalendarIcon} color="text-orange-600" subValue={`إلى ${format(new Date(booking.endDate), 'dd MMMM yyyy', { locale: ar })} (${nights} ليالي)`} />
                <InfoCard title="المسوق المسؤول" value={booking.brokerName || "حجز مباشر"} icon={Briefcase} color="text-purple-600" subValue={booking.brokerId ? "وسيط معتمد" : "إدارة المنتجع"} />
                <InfoCard title="إجمالي مبلغ الحجز" value={`${booking.totalAmount?.toLocaleString()} ج.م`} icon={Wallet} color="text-green-600" subValue={`سعر الليلة: ${chalet.normalPrice.toLocaleString()} ج.م`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col items-center text-center gap-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">عمولة المسوق الإجمالية</p>
                    <p className="text-4xl font-black text-primary">{commission.toLocaleString()} <span className="text-sm">ج.م</span></p>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] mt-2">{(commission / nights).toFixed(0)} ج.م × {nights} ليالي</Badge>
                 </div>
                 
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center gap-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">مرجع العملية المالية</p>
                    <p className="text-xl font-black text-slate-900">{booking.paymentReference || '---'}</p>
                    <div className="flex gap-2 mt-2">
                       <Badge className={booking.paymentStatus === 'verified' ? 'bg-green-500' : 'bg-orange-500'}>
                          {booking.paymentStatus === 'verified' ? 'دفع مؤكد' : 'انتظار المراجعة'}
                       </Badge>
                    </div>
                 </div>
              </div>

              {onViewFullHistory && (
                <div className="flex justify-center">
                   <Button variant="link" className="text-primary font-black gap-2" onClick={() => onViewFullHistory(chalet)}>
                      شاهد سجل الحجوزات الكامل لهذه الوحدة <ArrowLeftRight className="h-4 w-4" />
                   </Button>
                </div>
              )}
            </div>
          )}

          <div className="pt-10 border-t flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4 flex-row-reverse w-full md:w-auto">
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary shadow-sm"><Receipt /></div>
                <div className="text-right">
                   <p className="text-xs font-black text-slate-400 uppercase">سياسة الإلغاء</p>
                   <p className="font-bold text-slate-700">تخضع لشروط الإدارة اليدوية</p>
                </div>
             </div>
             <div className="flex gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none h-14 px-10 rounded-2xl font-black bg-slate-900 text-white hover:bg-primary transition-colors">طباعة التقرير</button>
                <button className="flex-1 md:flex-none h-14 px-10 rounded-2xl font-black border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-colors" onClick={onClose}>إغلاق</button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ title, value, icon: Icon, color, subValue }: any) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center gap-6 flex-row-reverse text-right group hover:border-primary/20 transition-all">
       <div className={`${color} bg-slate-50 p-5 rounded-[1.5rem] group-hover:bg-white group-hover:shadow-inner transition-all`}><Icon className="h-7 w-7" /></div>
       <div className="flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">{title}</p>
          <p className="text-xl font-black text-slate-900 leading-tight">{value}</p>
          {subValue && <p className="text-xs font-bold text-slate-500 mt-1">{subValue}</p>}
       </div>
    </div>
  )
}
