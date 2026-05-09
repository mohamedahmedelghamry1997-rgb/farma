
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Chalet, Booking, UserRole } from '@/lib/store'
import { Badge } from './ui/badge'
import { User, Phone, Calendar as CalendarIcon, DollarSign, Tag, Briefcase, History, MapPin } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { ar } from 'date-fns/locale'

interface ChaletReportDialogProps {
  chalet: Chalet | null
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
  userRole?: UserRole | null
}

export function ChaletReportDialog({ chalet, booking, isOpen, onClose, userRole }: ChaletReportDialogProps) {
  if (!chalet) return null

  const nights = booking ? differenceInDays(new Date(booking.endDate), new Date(booking.startDate)) + 1 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl text-right bg-white">
        <DialogHeader className="bg-primary p-8 text-white">
          <DialogTitle className="text-3xl font-black text-right flex items-center justify-end gap-3">
            تقرير الوحدة: {chalet.name} <Tag className="h-6 w-6" />
          </DialogTitle>
          <p className="text-primary-foreground/70 font-bold mt-2">كود الوحدة: {chalet.code} | {chalet.location}</p>
        </DialogHeader>

        <div className="p-10 space-y-10">
          {booking ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="العميل" value={booking.clientName} icon={User} color="text-blue-600" subValue={booking.phoneNumber} />
                <InfoCard title="التواريخ" value={`${format(new Date(booking.startDate), 'dd MMM')} - ${format(new Date(booking.endDate), 'dd MMM')}`} icon={CalendarIcon} color="text-orange-600" subValue={`${nights} ليالي`} />
                <InfoCard title="المسوق (البروكر)" value={booking.brokerName || "مباشر"} icon={Briefcase} color="text-purple-600" />
                <InfoCard title="إجمالي الحجز" value={`${booking.totalAmount?.toLocaleString()} ج.م`} icon={DollarSign} color="text-green-600" />
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row-reverse justify-between items-center gap-6">
                <div className="text-right">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">عمولة المسوق</h4>
                  <p className="text-4xl font-black text-primary">{(nights * 200).toLocaleString()} <span className="text-sm">ج.م</span></p>
                  <p className="text-[10px] text-slate-500 mt-1 font-bold">بواقع 200 ج.م لكل ليلة حجز</p>
                </div>
                <div className={`px-6 py-2 rounded-full font-black text-sm ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {booking.status === 'confirmed' ? 'حجز مؤكد' : 'في انتظار التأكيد'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 space-y-6">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <History size={40} />
              </div>
              <p className="text-xl font-black text-slate-400">لا يوجد حجز نشط حالياً لهذا التاريخ</p>
            </div>
          )}

          <div className="pt-6 border-t flex items-center justify-between flex-row-reverse">
             <div className="text-right">
                <p className="text-xs font-black text-slate-400">سعر الليلة الأساسي</p>
                <p className="text-xl font-black text-slate-900">{chalet.normalPrice.toLocaleString()} ج.م</p>
             </div>
             <Badge variant="outline" className="rounded-full px-6 py-2 border-slate-200 text-slate-500 font-bold">
               {chalet.city}
             </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ title, value, icon: Icon, color, subValue }: any) {
  return (
    <div className="p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm flex items-center gap-4 flex-row-reverse text-right">
       <div className={`${color} bg-slate-50 p-4 rounded-2xl`}><Icon className="h-6 w-6" /></div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{title}</p>
          <p className="text-lg font-black text-slate-900 leading-tight">{value}</p>
          {subValue && <p className="text-xs font-bold text-slate-500">{subValue}</p>}
       </div>
    </div>
  )
}
