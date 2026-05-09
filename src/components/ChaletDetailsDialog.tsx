
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Calendar } from "@/components/ui/calendar"
import { Chalet, Booking } from "@/lib/store"
import { MapPin, Star, Waves, CheckCircle2, Video, CalendarIcon, Info, ShieldAlert } from "lucide-react"
import { ar } from "date-fns/locale"
import Image from "next/image"
import { startOfDay, isSameDay, isWithinInterval } from "date-fns"

interface ChaletDetailsDialogProps {
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onBook: () => void
  existingBookings: Booking[]
}

export function ChaletDetailsDialog({ chalet, isOpen, onClose, onBook, existingBookings }: ChaletDetailsDialogProps) {
  if (!chalet) return null

  const isDateDisabled = (day: Date) => {
    const today = startOfDay(new Date())
    if (day < today) return true

    return existingBookings.some(b => {
      if (b.chaletId !== chalet.id || b.status === 'cancelled') return false
      const start = startOfDay(new Date(b.startDate))
      const end = startOfDay(new Date(b.endDate))
      return (isSameDay(day, start) || isSameDay(day, end) || isWithinInterval(day, { start, end }))
    })
  }

  const images = chalet.gallery && chalet.gallery.length > 0 ? [chalet.image, ...chalet.gallery] : [chalet.image]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white text-right max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Hidden but required for accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>تفاصيل {chalet.name}</DialogTitle>
        </DialogHeader>

        {/* MEDIA GALLERY */}
        <div className="relative group h-[400px]">
           <Carousel className="w-full h-full">
              <CarouselContent>
                 {images.map((img, idx) => (
                   <CarouselItem key={idx} className="relative h-[400px]">
                      <Image src={img} alt={`${chalet.name}-${idx}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                   </CarouselItem>
                 ))}
              </CarouselContent>
              <div className="absolute bottom-6 right-1/2 translate-x-1/2 flex gap-2">
                 <CarouselPrevious className="static translate-y-0 bg-white/20 border-none text-white hover:bg-white/40" />
                 <CarouselNext className="static translate-y-0 bg-white/20 border-none text-white hover:bg-white/40" />
              </div>
           </Carousel>
           
           <div className="absolute top-8 right-8 flex gap-3">
              <Badge className="bg-primary text-white px-6 py-2 rounded-full border-none shadow-xl font-black">
                {chalet.city}
              </Badge>
              <Badge className="bg-white text-slate-900 px-6 py-2 rounded-full border-none shadow-xl font-black flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 5.0
              </Badge>
           </div>

           <div className="absolute bottom-8 right-8 left-8 text-white text-right">
              <h2 className="text-4xl font-black mb-2">{chalet.name}</h2>
              <p className="flex items-center gap-2 justify-end text-white/80 font-bold"><MapPin className="h-4 w-4 text-primary" /> {chalet.location}</p>
           </div>
        </div>

        <div className="p-10 space-y-12">
           
           {/* DESCRIPTION & PRICING */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-6">
                 <div className="flex items-center gap-3 text-primary justify-end">
                    <h3 className="text-2xl font-black text-slate-900">نظرة عامة</h3>
                    <Info className="h-6 w-6" />
                 </div>
                 <p className="text-lg text-slate-600 font-bold leading-loose">
                   {chalet.description}
                 </p>
                 <div className="flex flex-wrap gap-4 pt-4 justify-end">
                    {['تكييف مركزي', 'شاشة سمارت', 'مطبخ كامل', 'فيو مباشر', 'قريب من البحر'].map(f => (
                       <Badge key={f} variant="outline" className="px-5 py-2 rounded-full border-slate-200 text-slate-600 font-bold flex items-center gap-2 flex-row-reverse">
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> {f}
                       </Badge>
                    ))}
                 </div>
                 
                 <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-center gap-4 flex-row-reverse">
                    <ShieldAlert className="text-orange-600 h-8 w-8" />
                    <div className="text-right">
                       <p className="font-black text-orange-800">سياسة التأمين والرسوم</p>
                       <p className="text-sm text-orange-600 font-bold">يتم دفع مبلغ تأمين مسترد عند الاستلام لضمان سلامة الوحدة.</p>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center gap-6">
                 <div className="space-y-1 text-right">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">أيام الأسبوع</p>
                    <p className="text-3xl font-black text-slate-900">{chalet.normalPrice.toLocaleString()} <span className="text-sm">ج.م</span></p>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-xs font-black text-primary uppercase tracking-widest">نهاية الأسبوع</p>
                    <p className="text-3xl font-black text-primary">{chalet.holidayPrice.toLocaleString()} <span className="text-sm">ج.م</span></p>
                 </div>
                 <Button className="w-full h-16 rounded-2xl bg-slate-950 text-white font-black text-lg hover:bg-primary transition-colors mt-4" onClick={onBook}>
                   احجز الآن
                 </Button>
              </div>
           </div>

           {/* CALENDAR VIEW */}
           <div className="space-y-6">
              <div className="flex items-center gap-3 text-primary justify-end">
                 <h3 className="text-2xl font-black text-slate-900">حالة الإشغال</h3>
                 <CalendarIcon className="h-6 w-6" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-blue-50/50 p-8 rounded-[3rem] border border-blue-100">
                 <div className="flex justify-center bg-white p-4 rounded-[2rem] shadow-sm">
                    <Calendar
                      mode="single"
                      disabled={isDateDisabled}
                      className="rounded-xl w-full flex justify-center"
                      locale={ar}
                      dir="rtl"
                    />
                 </div>
                 <div className="space-y-6 text-right">
                    <div className="space-y-2">
                       <h4 className="font-black text-xl text-slate-900">التقويم المباشر</h4>
                       <p className="text-slate-500 font-bold leading-relaxed">يمكنك مراجعة الأيام المتاحة (باللون الفاتح) والأيام المحجوزة بالفعل (باللون الرمادي) لتخطيط عطلتك.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3 justify-end">
                          <span className="font-bold text-slate-700">متاح للحجز</span>
                          <div className="w-6 h-6 rounded-lg border border-slate-200"></div>
                       </div>
                       <div className="flex items-center gap-3 justify-end">
                          <span className="font-bold text-slate-700">محجوز بالفعل</span>
                          <div className="w-6 h-6 rounded-lg bg-slate-200 opacity-50"></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-10 border-t border-slate-100 flex justify-center">
           <Button variant="ghost" className="rounded-2xl h-14 px-10 font-black text-slate-400 hover:bg-slate-50" onClick={onClose}>إغلاق النافذة</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
