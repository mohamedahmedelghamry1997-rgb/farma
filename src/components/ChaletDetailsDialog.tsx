
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Calendar } from "@/components/ui/calendar"
import { Chalet, Booking, UserRole } from "@/lib/store"
import { MapPin, Star, CheckCircle2, CalendarIcon, Info, ShieldAlert, History, User, Video, Play, ImageIcon } from "lucide-react"
import { ar } from "date-fns/locale"
import Image from "next/image"
import { startOfDay, isSameDay, isWithinInterval, format } from "date-fns"
import { useState } from "react"

interface ChaletDetailsDialogProps {
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onBook: () => void
  existingBookings: Booking[]
  userRole?: UserRole | null
}

export function ChaletDetailsDialog({ chalet, isOpen, onClose, onBook, existingBookings, userRole }: ChaletDetailsDialogProps) {
  const [activeMedia, setActiveMedia] = useState<'images' | 'video'>('images')

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

  const chaletHistory = existingBookings.filter(b => b.chaletId === chalet.id)
  const images = chalet.gallery && chalet.gallery.length > 0 ? [chalet.image, ...chalet.gallery] : [chalet.image]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white text-right max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-3xl font-black text-slate-900">{chalet.name}</DialogTitle>
          <DialogDescription className="text-slate-500 font-bold">{chalet.location} | {chalet.city}</DialogDescription>
        </DialogHeader>

        <div className="relative group h-[450px] bg-slate-950">
           {activeMedia === 'images' ? (
             <Carousel className="w-full h-full">
                <CarouselContent>
                   {images.map((img, idx) => (
                     <CarouselItem key={idx} className="relative h-[450px]">
                        <Image src={img} alt={`${chalet.name}-${idx}`} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                     </CarouselItem>
                   ))}
                </CarouselContent>
                <div className="absolute bottom-6 right-1/2 translate-x-1/2 flex gap-2 z-10">
                   <CarouselPrevious className="static translate-y-0 bg-white/20 border-none text-white hover:bg-white/40" />
                   <CarouselNext className="static translate-y-0 bg-white/20 border-none text-white hover:bg-white/40" />
                </div>
             </Carousel>
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-black">
                {chalet.videoUrl?.includes('youtube') ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={chalet.videoUrl.replace('watch?v=', 'embed/')} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls className="w-full h-full object-contain">
                    <source src={chalet.videoUrl} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                )}
             </div>
           )}
           
           <div className="absolute top-8 right-8 flex gap-3 z-10">
              <Badge className="bg-primary text-white px-6 py-2 rounded-full border-none shadow-xl font-black">
                {chalet.city}
              </Badge>
              {chalet.videoUrl && (
                <Button 
                  size="sm" 
                  className={`rounded-full gap-2 font-black ${activeMedia === 'video' ? 'bg-red-600 text-white' : 'bg-white text-slate-900'}`}
                  onClick={() => setActiveMedia(activeMedia === 'images' ? 'video' : 'images')}
                >
                  {activeMedia === 'video' ? 'عرض الصور' : 'مشاهدة الفيديو'}
                  {activeMedia === 'video' ? <ImageIcon className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              )}
           </div>
        </div>

        <div className="p-10 space-y-12">
           
           {(userRole === 'admin' || userRole === 'broker') && (
             <div className="space-y-6">
                <div className="flex items-center gap-3 text-primary justify-end">
                   <h3 className="text-2xl font-black text-slate-900">سجل التشغيل التاريخي</h3>
                   <History className="h-6 w-6" />
                </div>
                <div className="space-y-4">
                   {chaletHistory.length === 0 ? (
                     <p className="text-center py-10 bg-slate-50 rounded-2xl text-slate-400 font-bold">لا توجد سجلات سابقة لهذه الوحدة</p>
                   ) : (
                     chaletHistory.map(h => (
                       <div key={h.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row-reverse justify-between items-center gap-4">
                          <div className="flex items-center gap-4 flex-row-reverse text-right">
                             <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-primary"><User /></div>
                             <div>
                                <p className="font-black text-slate-900">{h.clientName}</p>
                                <p className="text-xs font-bold text-slate-500">{format(new Date(h.startDate), 'yyyy/MM/dd')} - {format(new Date(h.endDate), 'yyyy/MM/dd')}</p>
                             </div>
                          </div>
                          <div className="flex gap-3 items-center">
                             <Badge variant="outline" className="rounded-full px-4">{h.totalAmount} ج.م</Badge>
                             <Badge className={h.status === 'confirmed' ? 'bg-green-100 text-green-700 border-none' : 'bg-orange-100 text-orange-700 border-none'}>
                                {h.status === 'confirmed' ? 'تمت بنجاح' : 'معلق'}
                             </Badge>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-6">
                 <div className="flex items-center gap-3 text-primary justify-end">
                    <h3 className="text-2xl font-black text-slate-900">نظرة عامة</h3>
                    <Info className="h-6 w-6" />
                 </div>
                 <p className="text-lg text-slate-600 font-bold leading-loose text-right">
                   {chalet.description}
                 </p>
                 <div className="flex flex-wrap gap-4 pt-4 justify-end">
                    {['تكييف مركزي', 'شاشة سمارت', 'مطبخ كامل', 'فيو مباشر', 'قريب من البحر'].map(f => (
                       <Badge key={f} variant="outline" className="px-5 py-2 rounded-full border-slate-200 text-slate-600 font-bold flex items-center gap-2 flex-row-reverse">
                          <CheckCircle2 className="h-4 w-4 text-green-500" /> {f}
                       </Badge>
                    ))}
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
                 {(!userRole || userRole === 'client' || userRole === 'broker') && (
                   <Button className="w-full h-16 rounded-2xl bg-slate-950 text-white font-black text-lg hover:bg-primary transition-colors mt-4" onClick={onBook}>
                     احجز الآن
                   </Button>
                 )}
              </div>
           </div>

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
