
"use client"

import { useState, useMemo } from 'react'
import { useAppStore, Booking, Chalet, User, UserRole } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Info,
  LogOut as LogOutIcon,
  LogIn as LogInIcon,
  AlertTriangle,
  FileText
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
  const [opReportBooking, setOpReportBooking] = useState<Booking | null>(null)
  const [conditionText, setConditionText] = useState('')
  const [depositText, setDepositText] = useState('')

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-pulse font-bold text-primary">جاري تحميل نظام فارما بيتش...</div></div>

  const handleBookingConfirm = (data: any) => {
    store.addBooking({
      ...data,
      brokerId: store.role === 'broker' ? store.currentUser?.id : undefined
    })
    toast({ title: "تم إرسال الطلب بنجاح", description: "سيقوم الإدمن بمراجعة حجزك قريباً." })
  }

  // تصفية البيانات حسب الدور
  const filteredChalets = useMemo(() => {
    if (store.role === 'admin' || store.role === 'client') return store.chalets
    return store.chalets.filter(c => store.currentUser?.assignedChaletIds.includes(c.id))
  }, [store.role, store.currentUser, store.chalets])

  const filteredBookings = useMemo(() => {
    if (store.role === 'admin') return store.bookings
    if (store.role === 'broker') return store.bookings.filter(b => b.brokerId === store.currentUser?.id)
    if (store.role === 'supervisor') return store.bookings.filter(b => b.status === 'confirmed' && store.currentUser?.assignedChaletIds.includes(b.chaletId))
    if (store.role === 'client') return store.bookings.filter(b => b.phoneNumber === '0123456789') // محاكاة لعميل محدد
    return []
  }, [store.role, store.currentUser, store.bookings])

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
            <div className="flex items-center gap-2">
               <span>العربية</span>
               <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#f3e8ff] p-2 rounded-full h-12 w-12 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-2 ring-primary/10">
               <Home className="text-primary h-6 w-6" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-800 leading-none">فارما بيتش</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إدارة الشاليهات الفاخرة</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-slate-700 font-bold">
            <a href="#" className="hover:text-primary transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-primary transition-colors">عن المنتجع</a>
            {store.role && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none py-1 px-4">
                {store.role === 'admin' ? 'مدير النظام' : store.role === 'broker' ? 'وسيط مبيعات' : store.role === 'supervisor' ? 'مشرف ميداني' : 'زائر'}
              </Badge>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {!store.role ? (
          <div className="container mx-auto px-4 py-20 max-w-lg">
            <Card className="p-8 rounded-[2.5rem] shadow-2xl border-none space-y-8 text-center bg-white">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">مرحباً بك في لوحة الإدارة</h2>
                <p className="text-slate-400 font-medium text-sm">اختر هويتك للدخول التجريبي للنظام</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button onClick={() => store.setRole('client')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100">دخول كعميل</Button>
                <Button onClick={() => store.setRole('broker')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100">دخول كبروكر</Button>
                <Button onClick={() => store.setRole('supervisor')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100">دخول كمشرف</Button>
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
                    <Select><SelectTrigger className="bg-white rounded-xl h-12 text-right"><SelectValue placeholder="المدينة" /></SelectTrigger>
                      <SelectContent><SelectItem value="sc">الساحل الشمالي</SelectItem><SelectItem value="sh">العين السخنة</SelectItem></SelectContent>
                    </Select>
                    <Select><SelectTrigger className="bg-white rounded-xl h-12 text-right"><SelectValue placeholder="السعر" /></SelectTrigger>
                      <SelectContent><SelectItem value="low">اقتصادي</SelectItem><SelectItem value="high">فاخر</SelectItem></SelectContent>
                    </Select>
                    <Button className="bg-primary hover:bg-primary/90 h-12 rounded-xl gap-2 font-bold text-white col-span-1 lg:col-span-2">تصفية الشاليهات</Button>
                    <Button variant="ghost" className="h-12 font-bold text-slate-400">إعادة تعيين</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {store.chalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => { setSelectedChalet(chalet); setIsBookingOpen(true); }} />
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- ADMIN & BROKER VIEW ---------------- */}
            {(store.role === 'admin' || store.role === 'broker') && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="text-right">
                      <h2 className="text-3xl font-black text-slate-900">لوحة التحكم الإدارية</h2>
                      <p className="text-slate-400 font-bold">أهلاً بك، {store.currentUser?.name}</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-blue-400">الشاليهات المتاحة</p>
                        <p className="text-2xl font-black text-blue-600">{filteredChalets.length}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-purple-400">الحجوزات النشطة</p>
                        <p className="text-2xl font-black text-purple-600">{filteredBookings.filter(b => b.status === 'confirmed').length}</p>
                      </div>
                   </div>
                </div>

                <Tabs dir="rtl" defaultValue="bookings" className="w-full">
                  <TabsList className="bg-white p-1 rounded-2xl shadow-sm h-14 border border-slate-100 mb-8">
                    <TabsTrigger value="bookings" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">طلبات الحجز</TabsTrigger>
                    <TabsTrigger value="chalets" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">إدارة الشاليهات</TabsTrigger>
                    {store.role === 'admin' && <TabsTrigger value="users" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">الموظفين</TabsTrigger>}
                  </TabsList>

                  <TabsContent value="bookings" className="space-y-6">
                    {filteredBookings.length === 0 ? (
                      <Card className="py-20 text-center border-dashed rounded-[2rem]"><p className="text-slate-400 font-bold">لا توجد سجلات حجوزات حالياً</p></Card>
                    ) : (
                      filteredBookings.map(b => (
                        <Card key={b.id} className="p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-none shadow-sm">
                          <div className="flex gap-4 items-center">
                             <div className="bg-primary/5 p-4 rounded-2xl"><Users className="text-primary h-6 w-6" /></div>
                             <div className="text-right">
                                <p className="font-black text-lg text-slate-800">{b.clientName}</p>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mt-1">
                                  <Badge className={b.status === 'confirmed' ? 'bg-green-500' : b.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'}>
                                    {b.status === 'confirmed' ? 'مؤكد' : b.status === 'pending' ? 'قيد المراجعة' : 'ملغي'}
                                  </Badge>
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMM')}</span>
                                  <span className="text-primary">{store.chalets.find(c => c.id === b.chaletId)?.name}</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button variant="outline" className="rounded-xl h-10 gap-2" onClick={() => setReviewingBooking(b)}>
                                <Eye className="h-4 w-4" /> التفاصيل
                             </Button>
                             {store.role === 'admin' && b.status === 'pending' && (
                               <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-8" onClick={() => store.updateBooking(b.id, { status: 'confirmed' })}>موافقة</Button>
                             )}
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="chalets" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredChalets.map(c => (
                      <Card key={c.id} className="rounded-3xl overflow-hidden border-none shadow-sm bg-white group">
                         <div className="relative h-40">
                           <img src={c.image} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                           {store.role === 'admin' && (
                             <div className="absolute top-2 right-2"><Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-4 w-4" /></Button></div>
                           )}
                         </div>
                         <div className="p-4 text-right space-y-3">
                           <h4 className="font-black text-slate-800 text-sm">{c.name}</h4>
                           <Button variant="secondary" className="w-full rounded-xl h-10 gap-2 font-bold text-xs" onClick={() => setViewingHistoryChalet(c)}>سجل الحجز</Button>
                         </div>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="users" className="space-y-6">
                    {store.users.map(u => (
                      <Card key={u.id} className="p-4 rounded-2xl flex justify-between items-center bg-white border-none shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="bg-slate-100 p-3 rounded-xl"><UserPlus className="text-slate-500 h-5 w-5" /></div>
                           <div className="text-right">
                              <p className="font-bold text-slate-800">{u.name}</p>
                              <p className="text-xs text-slate-400 font-bold uppercase">{u.role === 'broker' ? 'وسيط مبيعات' : 'مشرف ميداني'}</p>
                           </div>
                        </div>
                        <Badge variant="outline">{u.assignedChaletIds.length} شاليهات</Badge>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* ---------------- SUPERVISOR VIEW ---------------- */}
            {store.role === 'supervisor' && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-right">
                   <h2 className="text-3xl font-black text-slate-900">مرحباً كابتن {store.currentUser?.name}</h2>
                   <p className="text-slate-400 font-bold">لديك {filteredBookings.length} حجوزات نشطة تتطلب متابعتك الميدانية.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredBookings.length === 0 ? (
                    <Card className="py-20 text-center border-dashed rounded-[2rem]"><p className="text-slate-400 font-bold">لا توجد حجوزات مؤكدة بانتظار الدخول/الخروج</p></Card>
                  ) : (
                    filteredBookings.map(b => (
                      <Card key={b.id} className="p-6 rounded-3xl bg-white border-none shadow-sm overflow-hidden relative">
                        {b.opStatus === 'checked_in' && <div className="absolute top-0 right-0 left-0 h-1 bg-green-500"></div>}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="text-right space-y-1">
                             <div className="flex items-center gap-2">
                               <h3 className="text-xl font-black text-slate-800">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                               <Badge className={b.opStatus === 'waiting' ? 'bg-blue-100 text-blue-600' : b.opStatus === 'checked_in' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}>
                                 {b.opStatus === 'waiting' ? 'بانتظار الدخول' : b.opStatus === 'checked_in' ? 'مقيد حالياً' : 'تم الخروج'}
                               </Badge>
                             </div>
                             <p className="text-sm font-bold text-slate-500">العميل: {b.clientName} | {b.phoneNumber}</p>
                             <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="h-3 w-3" /> الحجز من {format(new Date(b.startDate), 'dd MMM')} إلى {format(new Date(b.endDate), 'dd MMM')}</p>
                          </div>
                          
                          <div className="flex gap-3">
                             {b.opStatus === 'waiting' && (
                               <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-black gap-2" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>
                                 <LogInIcon className="h-4 w-4" /> تسجيل دخول العميل
                               </Button>
                             )}
                             {b.opStatus === 'checked_in' && (
                               <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 px-8 font-black gap-2" onClick={() => setOpReportBooking(b)}>
                                 <LogOutIcon className="h-4 w-4" /> تسجيل خروج العميل
                               </Button>
                             )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Booking Details Dialog (Review) */}
      <Dialog open={!!reviewingBooking} onOpenChange={() => setReviewingBooking(null)}>
        <DialogContent className="rounded-[2rem] border-none text-right">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-right">تفاصيل الحجز</DialogTitle>
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
                     <p className="text-[10px] text-slate-400 font-bold mb-1">التواريخ</p>
                     <p className="font-bold text-slate-800 text-xs">{format(new Date(reviewingBooking.startDate), 'dd MMM')} - {format(new Date(reviewingBooking.endDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-right">
                     <p className="text-[10px] text-slate-400 font-bold mb-1">الحالة التشغيلية</p>
                     <Badge variant="outline" className="font-bold text-[10px]">
                       {reviewingBooking.opStatus === 'waiting' ? 'بانتظار الوصول' : reviewingBooking.opStatus === 'checked_in' ? 'داخل الشاليه' : 'تم إنهاء الإقامة'}
                     </Badge>
                  </div>
               </div>
               {reviewingBooking.conditionReport && (
                 <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-right">
                    <p className="text-[10px] text-orange-600 font-black mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> تقرير حالة الشاليه (المشرف)</p>
                    <p className="text-sm font-medium text-slate-700">{reviewingBooking.conditionReport}</p>
                    <p className="text-xs font-black text-orange-700 mt-2">التأمين المسترد: {reviewingBooking.securityDeposit} ج.م</p>
                 </div>
               )}
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-right">
                  <p className="text-[10px] text-blue-400 font-bold mb-1">ملاحظات الحجز</p>
                  <p className="text-sm font-medium text-slate-700">{reviewingBooking.notes || "لا توجد ملاحظات إضافية"}</p>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Supervisor Out-Report Dialog */}
      <Dialog open={!!opReportBooking} onOpenChange={() => setOpReportBooking(null)}>
        <DialogContent className="rounded-[2rem] border-none text-right">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-right">تقرير خروج العميل</DialogTitle>
            <DialogDescription className="text-right">يرجى كتابة حالة الشاليه اليدوية لضمان سلامة العهدة.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
             <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end">حالة الشاليه بعد الخروج <FileText className="h-4 w-4" /></Label>
                <Textarea 
                  placeholder="مثال: الشاليه سليم ولا يوجد تلفيات، يحتاج تنظيف عميق فقط..." 
                  className="rounded-2xl min-h-[100px] text-right"
                  value={conditionText}
                  onChange={e => setConditionText(e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end">مبلغ التأمين المسترد <Info className="h-4 w-4" /></Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  className="rounded-2xl h-12 text-right"
                  value={depositText}
                  onChange={e => setDepositText(e.target.value)}
                />
             </div>
          </div>
          <DialogFooter className="flex flex-row-reverse gap-3">
             <Button className="flex-1 rounded-xl h-12 font-black bg-primary text-white" onClick={() => {
               if (!opReportBooking) return
               store.updateBooking(opReportBooking.id, { 
                 opStatus: 'checked_out', 
                 checkOutTime: new Date().toISOString(),
                 conditionReport: conditionText,
                 securityDeposit: depositText
               })
               setOpReportBooking(null)
               setConditionText('')
               setDepositText('')
               toast({ title: "تم تسجيل الخروج بنجاح" })
             }}>إرسال التقرير وإنهاء الإقامة</Button>
          </DialogFooter>
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
      
      <footer className="bg-slate-900 text-white py-12 mt-20">
         <div className="container mx-auto px-4 text-center space-y-4">
            <h3 className="text-2xl font-black">منتجع فارما بيتش</h3>
            <p className="text-slate-500 font-medium">نظام الإدارة الميداني والتقني المتكامل</p>
         </div>
      </footer>
    </div>
  )
}
