
"use client"

import { useState, useMemo } from 'react'
import { useAppStore, Booking, Chalet, User } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { 
  Users, 
  Home, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2,
  ShieldCheck,
  UserPlus,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Phone,
  RotateCcw,
  Filter,
  LogOut,
  Mail,
  Map,
  History,
  Eye,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  
  // States
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [viewingHistoryChalet, setViewingHistoryChalet] = useState<Chalet | null>(null)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-pulse font-bold text-primary">جاري تحميل نظام فارما بيتش...</div></div>

  const handleBookingConfirm = (data: any) => {
    store.addBooking({
      ...data,
      brokerId: store.role === 'broker' ? store.currentUser?.id : undefined
    })
    toast({ title: "تم إرسال الطلب بنجاح", description: "سيقوم الإدمن بمراجعة حجزك قريباً." })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      {/* Top Bar */}
      <div className="top-bar-gradient text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-xs md:text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Twitter className="h-4 w-4 cursor-pointer hover:opacity-80" />
              <Instagram className="h-4 w-4 cursor-pointer hover:opacity-80" />
              <Facebook className="h-4 w-4 cursor-pointer hover:opacity-80" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="font-bold">+20 123 456 789</span>
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
               <span>العربية</span>
               <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <nav className="hidden md:flex items-center gap-8 text-slate-700 font-bold">
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">الرئيسية</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">خدماتنا</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">اتصل بنا</a>
            <a href="#" className="text-primary border-b-2 border-primary pb-1">الشاليهات</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="text-left hidden md:block">
              <h1 className="text-lg font-black text-slate-800 leading-none">فارما بيتش</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pharma Beach Management</p>
            </div>
            <div className="bg-[#f3e8ff] p-2 rounded-full h-12 w-12 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-2 ring-primary/10">
               <Home className="text-primary h-6 w-6" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!store.role ? (
          <div className="container mx-auto px-4 py-20 max-w-lg">
            <Card className="p-8 rounded-[2.5rem] shadow-2xl border-none space-y-8 text-center bg-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">مرحباً بك في لوحة التحكم</h2>
                <p className="text-slate-400 font-medium text-sm">اختر هويتك للدخول للنظام</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button onClick={() => store.setRole('client')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 shadow-none">دخول كعميل</Button>
                <Button onClick={() => store.setRole('broker')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 shadow-none">دخول كبروكر</Button>
                <Button onClick={() => store.setRole('supervisor')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 shadow-none">دخول كمشرف</Button>
                <Button onClick={() => store.setRole('admin')} size="lg" className="h-16 text-lg rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">دخول كأدمن</Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 pb-32">
            
            {/* ---------------- CLIENT VIEW ---------------- */}
            {store.role === 'client' && (
              <div className="space-y-12">
                <div className="filter-container">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    <Select>
                      <SelectTrigger className="bg-white rounded-xl border-none shadow-sm h-12 text-right">
                        <SelectValue placeholder="المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north-coast">الساحل الشمالي</SelectItem>
                        <SelectItem value="sokhna">العين السخنة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="bg-white rounded-xl border-none shadow-sm h-12 text-right">
                        <SelectValue placeholder="النطاق السعري" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">اقتصادي</SelectItem>
                        <SelectItem value="high">فاخر</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-primary hover:bg-primary/90 h-12 rounded-xl gap-2 font-bold text-white col-span-1 lg:col-span-2">
                       <Filter className="h-4 w-4" /> تطبيق الفلتر
                    </Button>
                    <Button variant="ghost" className="h-12 font-bold text-slate-400">
                       <RotateCcw className="h-4 w-4 ml-2" /> استعادة
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {store.chalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => { setSelectedChalet(chalet); setIsBookingOpen(true); }} />
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- ADMIN VIEW ---------------- */}
            {store.role === 'admin' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm gap-6 border border-slate-100">
                   <div className="text-right space-y-1">
                      <h2 className="text-3xl font-black text-slate-900 leading-none">إدارة منتجع فارما بيتش</h2>
                      <p className="text-slate-400 font-bold">مرحباً بك، {store.currentUser?.name}</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-blue-400 uppercase">إجمالي الوحدات</p>
                        <p className="text-2xl font-black text-blue-600">{store.chalets.length}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-purple-400 uppercase">طلبات معلقة</p>
                        <p className="text-2xl font-black text-purple-600">{store.bookings.filter(b => b.status === 'pending').length}</p>
                      </div>
                   </div>
                </div>

                <Tabs dir="rtl" defaultValue="bookings" className="w-full">
                  <TabsList className="bg-white p-1 rounded-2xl shadow-sm h-14 border border-slate-100 mb-8">
                    <TabsTrigger value="bookings" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">طابور المراجعة</TabsTrigger>
                    <TabsTrigger value="chalets" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">إدارة الشاليهات</TabsTrigger>
                    <TabsTrigger value="users" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">الموظفين</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bookings" className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {store.bookings.length === 0 ? (
                        <Card className="py-20 text-center border-dashed rounded-[2rem]">
                           <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
                           <p className="font-bold text-slate-400">لا توجد طلبات جديدة</p>
                        </Card>
                      ) : (
                        store.bookings.map(b => (
                          <Card key={b.id} className="p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-none shadow-sm hover:shadow-md transition-all">
                            <div className="flex gap-4 items-center w-full md:w-auto">
                               <div className="bg-primary/5 p-4 rounded-2xl">
                                 <Users className="text-primary h-6 w-6" />
                               </div>
                               <div className="text-right">
                                  <p className="font-black text-lg text-slate-800">{b.clientName}</p>
                                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
                                    <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMM')}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                               <Button variant="outline" className="rounded-xl h-12 px-6 gap-2" onClick={() => setReviewingBooking(b)}>
                                  <Eye className="h-4 w-4" /> مراجعة التفاصيل
                               </Button>
                               {b.status === 'pending' && (
                                 <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-8 font-black" onClick={() => store.updateBooking(b.id, { status: 'confirmed' })}>
                                   قبول فوري
                                 </Button>
                               )}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="chalets" className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {store.chalets.map(c => (
                        <Card key={c.id} className="rounded-3xl overflow-hidden border-none shadow-sm bg-white group">
                           <div className="relative h-40">
                             <img src={c.image} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                             <div className="absolute top-2 right-2 flex gap-1">
                               <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-4 w-4" /></Button>
                             </div>
                           </div>
                           <div className="p-4 text-right space-y-3">
                             <h4 className="font-black text-slate-800 text-sm">{c.name}</h4>
                             <Button variant="secondary" className="w-full rounded-xl h-10 gap-2 font-bold text-xs" onClick={() => setViewingHistoryChalet(c)}>
                                <History className="h-4 w-4" /> سجل الحجوزات
                             </Button>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-6">
                    {/* إدارة المستخدمين هنا */}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Details Dialog (Review) */}
      <Dialog open={!!reviewingBooking} onOpenChange={() => setReviewingBooking(null)}>
        <DialogContent className="rounded-[2rem] border-none text-right">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-right">مراجعة طلب الحجز</DialogTitle>
            <DialogDescription className="text-right">يرجى مراجعة كافة بيانات العميل قبل الموافقة على الحجز.</DialogDescription>
          </DialogHeader>
          {reviewingBooking && (
            <div className="space-y-6 py-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-right">
                     <p className="text-[10px] text-slate-400 font-bold mb-1">اسم العميل</p>
                     <p className="font-black text-slate-800">{reviewingBooking.clientName}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-right">
                     <p className="text-[10px] text-slate-400 font-bold mb-1">رقم الهاتف</p>
                     <p className="font-black text-slate-800">{reviewingBooking.phoneNumber}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-right">
                     <p className="text-[10px] text-slate-400 font-bold mb-1">تاريخ البداية</p>
                     <p className="font-black text-slate-800">{format(new Date(reviewingBooking.startDate), 'dd MMMM yyyy', { locale: ar })}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-right">
                     <p className="text-[10px] text-slate-400 font-bold mb-1">تاريخ النهاية</p>
                     <p className="font-black text-slate-800">{format(new Date(reviewingBooking.endDate), 'dd MMMM yyyy', { locale: ar })}</p>
                  </div>
               </div>
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-right">
                  <p className="text-[10px] text-blue-400 font-bold mb-1 flex items-center gap-1">ملاحظات العميل <Info className="h-3 w-3" /></p>
                  <p className="text-sm font-medium text-slate-700">{reviewingBooking.notes || "لا توجد ملاحظات"}</p>
               </div>
            </div>
          )}
          <DialogFooter className="flex flex-row-reverse gap-3">
             <Button className="flex-1 rounded-xl h-12 font-black bg-green-600 hover:bg-green-700" onClick={() => { store.updateBooking(reviewingBooking!.id, { status: 'confirmed' }); setReviewingBooking(null); toast({ title: "تم قبول الحجز" }) }}>
               قبول الحجز
             </Button>
             <Button variant="destructive" className="flex-1 rounded-xl h-12 font-black" onClick={() => { store.updateBooking(reviewingBooking!.id, { status: 'cancelled' }); setReviewingBooking(null); toast({ title: "تم رفض الحجز" }) }}>
               رفض الطلب
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chalet History Dialog */}
      <Dialog open={!!viewingHistoryChalet} onOpenChange={() => setViewingHistoryChalet(null)}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none text-right">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-right flex items-center justify-end gap-3">
              سجل حجوزات {viewingHistoryChalet?.name} <History className="h-6 w-6 text-primary" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
             {store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).length === 0 ? (
               <div className="py-10 text-center text-slate-400 font-bold">لا توجد حجوزات سابقة لهذا الشاليه</div>
             ) : (
               store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).map(b => (
                 <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="text-right">
                       <p className="font-black text-slate-800">{b.clientName}</p>
                       <p className="text-xs text-slate-400 font-bold">{format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM yyyy')}</p>
                    </div>
                    <Badge className={b.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'}>
                      {b.status === 'confirmed' ? 'مؤكد' : 'ملغي'}
                    </Badge>
                 </div>
               ))
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 z-50 shadow-2xl border border-primary/20 animate-in slide-in-from-bottom-10">
         <div className="text-[10px] font-black text-primary opacity-50 ml-2 uppercase">تبديل الأدوار</div>
         <div className="flex gap-2">
            {(['client', 'broker', 'supervisor', 'admin'] as const).map(r => (
               <Button 
                key={r} 
                onClick={() => store.setRole(r)}
                variant={store.role === r ? 'default' : 'ghost'} 
                className={`rounded-full h-10 px-5 text-xs font-black transition-all ${store.role === r ? 'bg-primary shadow-lg shadow-primary/20' : 'text-slate-400'}`}
               >
                 {r === 'admin' ? 'أدمن' : r === 'broker' ? 'بروكر' : r === 'supervisor' ? 'مشرف' : 'عميل'}
               </Button>
            ))}
         </div>
      </div>

      <BookingDialog 
        chalet={selectedChalet}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleBookingConfirm}
        existingBookings={store.bookings}
      />
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-20">
         <div className="container mx-auto px-4 text-center space-y-4">
            <h3 className="text-2xl font-black">منتجع فارما بيتش</h3>
            <p className="text-slate-500 font-medium">نظام الإدارة المتكامل للشاليهات الفاخرة</p>
            <div className="flex justify-center gap-6 pt-4">
              <Facebook className="text-slate-600 hover:text-white cursor-pointer" />
              <Instagram className="text-slate-600 hover:text-white cursor-pointer" />
              <Mail className="text-slate-600 hover:text-white cursor-pointer" />
            </div>
         </div>
      </footer>
    </div>
  )
}
