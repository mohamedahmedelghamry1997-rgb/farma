
"use client"

import { useState, useMemo, useEffect } from 'react'
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
  Filter,
  Eye,
  Info,
  LogOut as LogOutIcon,
  LogIn as LogInIcon,
  AlertTriangle,
  FileText,
  Copy,
  CheckCircle,
  TrendingUp,
  Briefcase,
  ClipboardCheck,
  Wallet,
  Receipt,
  ShieldAlert
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  
  // States
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [viewingHistoryChalet, setViewingHistoryChalet] = useState<Chalet | null>(null)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const [opReportBooking, setOpReportBooking] = useState<Booking | null>(null)
  const [conditionText, setConditionText] = useState('')
  const [depositText, setDepositText] = useState('')
  const [refCode, setRefCode] = useState('')

  // Capture Referral from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setRefCode(ref)
  }, [])

  // Filtering Logic
  const filteredChalets = useMemo(() => {
    if (!store.isLoaded) return []
    if (store.role === 'client') return store.chalets.filter(c => c.status === 'active')
    if (store.role === 'admin') return store.chalets
    if (store.role === 'broker') {
      const assignedIds = store.currentUser?.assignedChaletIds || []
      return store.chalets.filter(c => assignedIds.includes(c.id) || c.status === 'pending')
    }
    return store.chalets
  }, [store.isLoaded, store.role, store.chalets, store.currentUser])

  const filteredBookings = useMemo(() => {
    if (!store.isLoaded) return []
    if (store.role === 'admin' || store.role === 'broker') return store.bookings
    if (store.role === 'supervisor') {
      const assignedIds = store.currentUser?.assignedChaletIds || []
      // Supervisor sees confirmed bookings for assigned chalets
      return store.bookings.filter(b => assignedIds.includes(b.chaletId) && b.status === 'confirmed')
    }
    if (store.role === 'client') return store.bookings.filter(b => b.phoneNumber === '0123456789') // Mock client check
    return []
  }, [store.isLoaded, store.role, store.bookings, store.currentUser])

  const handleBookingConfirm = (data: any) => {
    store.addBooking({
      ...data,
      brokerId: store.role === 'broker' ? store.currentUser?.id : (refCode || undefined)
    })
    toast({ title: "تم إرسال طلب الحجز", description: "بانتظار مراجعة الإدارة وتأكيد الدفع." })
  }

  const copyRefLink = () => {
    const link = `${window.location.origin}?ref=${store.currentUser?.id}`
    navigator.clipboard.writeText(link)
    toast({ title: "تم نسخ الرابط", description: "رابط الإحالة الخاص بك جاهز للمشاركة." })
  }

  if (!store.isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse font-bold text-primary text-xl">جاري تحميل نظام فارما بيتش...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      {/* Navbar & Header omitted for brevity as per instructions to be concise but the full page content is provided below */}
      
      {/* Top Bar */}
      <div className="top-bar-gradient text-white py-2 px-4 shadow-md">
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
               <span className="font-medium">العربية</span>
               <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50 py-4 border-b border-slate-100">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#f3e8ff] p-2 rounded-full h-12 w-12 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-2 ring-primary/10">
               <Home className="text-primary h-6 w-6" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-black text-slate-800 leading-none">فارما بيتش</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">نظام الإدارة المتكامل</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-slate-700 font-bold">
            <a href="#" className="hover:text-primary transition-colors">الرئيسية</a>
            <a href="#" className="hover:text-primary transition-colors">عن المنتجع</a>
            {store.role && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none py-1.5 px-4 rounded-full">
                {store.role === 'admin' ? 'مدير النظام' : store.role === 'broker' ? 'وسيط إداري' : store.role === 'supervisor' ? 'مشرف ميداني' : 'زائر'}
              </Badge>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {!store.role ? (
          <div className="container mx-auto px-4 py-20 max-w-lg">
            <Card className="p-10 rounded-[2.5rem] shadow-2xl border-none space-y-8 text-center bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-900">مرحباً بك في نظام الإدارة</h2>
                <p className="text-slate-400 font-medium text-sm">اختر هويتك للدخول إلى لوحة التحكم</p>
              </div>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                <Button onClick={() => store.setRole('client')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all">دخول كعميل</Button>
                <Button onClick={() => store.setRole('broker')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all">دخول كبروكر</Button>
                <Button onClick={() => store.setRole('supervisor')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition-all">دخول كمشرف</Button>
                <Button onClick={() => store.setRole('admin')} size="lg" className="h-16 text-lg rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all">دخول كأدمن</Button>
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
                  {filteredChalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => { setSelectedChalet(chalet); setIsBookingOpen(true); }} />
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- ADMIN & BROKER VIEW ---------------- */}
            {(store.role === 'admin' || store.role === 'broker') && (
              <div className="space-y-8">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><Home className="h-6 w-6" /></div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إجمالي الشاليهات</p>
                        <p className="text-2xl font-black text-slate-800">{store.chalets.length}</p>
                      </div>
                   </Card>
                   <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-2xl text-green-600"><CalendarIcon className="h-6 w-6" /></div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحجوزات المؤكدة</p>
                        <p className="text-2xl font-black text-slate-800">{store.bookings.filter(b => b.status === 'confirmed').length}</p>
                      </div>
                   </Card>
                   <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4">
                      <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Wallet className="h-6 w-6" /></div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">بانتظار تأكيد الدفع</p>
                        <p className="text-2xl font-black text-slate-800">{store.bookings.filter(b => b.paymentStatus === 'pending').length}</p>
                      </div>
                   </Card>
                   <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-2xl text-purple-600"><Briefcase className="h-6 w-6" /></div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">فريق العمل</p>
                        <p className="text-2xl font-black text-slate-800">{store.users.length}</p>
                      </div>
                   </Card>
                </div>

                <div className="bg-gradient-to-r from-primary to-purple-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mt-32 blur-3xl"></div>
                    <div className="text-right relative z-10">
                      <h3 className="text-3xl font-black">أهلاً بك، {store.currentUser?.name}</h3>
                      <p className="opacity-90 font-medium mt-1">لوحة الإدارة المالية والتشغيلية - فارما بيتش</p>
                    </div>
                    {store.role === 'broker' && (
                      <Button onClick={copyRefLink} variant="secondary" className="bg-white text-primary hover:bg-white/90 rounded-2xl h-14 px-8 gap-3 font-black text-base shadow-lg relative z-10">
                        <Copy className="h-5 w-5" /> نسخ رابط الإحالة الخاص بك
                      </Button>
                    )}
                </div>

                <Tabs dir="rtl" defaultValue="bookings" className="w-full">
                  <TabsList className="bg-white p-1 rounded-2xl shadow-sm h-14 border border-slate-100 mb-8 w-full md:w-auto">
                    <TabsTrigger value="bookings" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">طابور المراجعة والمالية</TabsTrigger>
                    <TabsTrigger value="chalets" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">إدارة الشاليهات</TabsTrigger>
                    <TabsTrigger value="users" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">إدارة الموظفين</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bookings" className="space-y-6">
                    {filteredBookings.length === 0 ? (
                      <Card className="py-24 text-center border-dashed rounded-[3rem] bg-white"><p className="text-slate-400 font-bold text-lg">لا توجد سجلات حجوزات حالياً</p></Card>
                    ) : (
                      filteredBookings.map(b => (
                        <Card key={b.id} className="p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-none shadow-sm relative overflow-hidden hover:shadow-md transition-all">
                          {b.status === 'confirmed' && <div className="absolute top-0 right-0 left-0 h-1 bg-green-500"></div>}
                          <div className="flex gap-4 items-center flex-1">
                             <div className="bg-slate-50 p-5 rounded-[2rem]"><Receipt className="text-slate-400 h-8 w-8" /></div>
                             <div className="text-right">
                                <p className="font-black text-xl text-slate-800">{b.clientName}</p>
                                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 mt-2">
                                  <Badge className={b.paymentStatus === 'verified' ? 'bg-green-500' : 'bg-orange-500'}>
                                    {b.paymentStatus === 'verified' ? 'الدفع مأكد' : 'بانتظار تأكيد الأدمن للمال'}
                                  </Badge>
                                  <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full"><Wallet className="h-3 w-3" /> {b.totalAmount} ج.م</span>
                                  <span className="text-primary font-black bg-primary/5 px-3 py-1 rounded-full">{store.chalets.find(c => c.id === b.chaletId)?.name}</span>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <Button variant="outline" className="rounded-2xl h-12 gap-2 border-slate-200 font-bold" onClick={() => setReviewingBooking(b)}>
                                <Eye className="h-5 w-5" /> مراجعة الطلب والدفع
                             </Button>
                             
                             {store.role === 'admin' && b.paymentStatus === 'pending' && (
                               <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-8 font-black shadow-lg shadow-blue-100" onClick={() => {
                                 store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })
                                 toast({ title: "تم تأكيد الدفع", description: "تم اعتماد الحجز مبدئياً، بانتظار التأكيد النهائي للبروكر." })
                               }}>تأكيد استلام المبلغ</Button>
                             )}

                             {(store.role === 'broker' || store.role === 'admin') && b.status === 'admin_approved' && (
                               <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-12 px-8 font-black gap-2 shadow-lg shadow-green-100" onClick={() => {
                                 store.updateBooking(b.id, { status: 'confirmed' })
                                 toast({ title: "تم التأكيد النهائي", description: "الحجز متاح الآن للمشرف الميداني للتسليم." })
                               }}>
                                 <CheckCircle className="h-5 w-5" /> تأكيد وإرسال للمشرف
                               </Button>
                             )}
                          </div>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Other Tabs content omitted for focus on finance but fully provided below */}
                  <TabsContent value="chalets" className="space-y-8">
                    <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
                       <h3 className="text-2xl font-black text-slate-800">قائمة الشاليهات والوحدات</h3>
                       <Button className="rounded-2xl gap-3 h-14 px-8 bg-primary text-white shadow-xl shadow-primary/20 font-black text-lg" onClick={() => setIsAddChaletOpen(true)}>
                         <Plus className="h-6 w-6" /> إضافة شاليه جديد
                       </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {filteredChalets.map(c => (
                        <Card key={c.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-sm bg-white group relative hover:shadow-xl transition-all duration-500">
                           {c.status === 'pending' && <Badge className="absolute top-4 left-4 z-10 bg-orange-500 shadow-lg px-4 py-1.5 rounded-full font-black text-[10px]">بانتظار الاعتماد</Badge>}
                           <div className="relative h-56">
                             <img src={c.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                             {store.role === 'admin' && (
                               <div className="absolute top-4 right-4 flex gap-2">
                                 {c.status === 'pending' && (
                                   <Button size="icon" className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 shadow-lg" onClick={() => store.updateChalet(c.id, { status: 'active' })}><CheckCircle2 className="h-6 w-6" /></Button>
                                 )}
                                 <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full shadow-lg" onClick={() => {
                                   if(confirm('هل أنت متأكد من حذف هذا الشاليه؟')) store.deleteChalet(c.id)
                                 }}><Trash2 className="h-6 w-6" /></Button>
                               </div>
                             )}
                           </div>
                           <div className="p-6 text-right space-y-5">
                             <div>
                               <h4 className="font-black text-slate-800 text-xl">{c.name}</h4>
                               <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {c.location} - {c.city}</p>
                             </div>
                             <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50">
                               <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-400 uppercase">عادي</p>
                                 <p className="font-black text-red-500">{c.normalPrice} <span className="text-[10px]">ج.م</span></p>
                               </div>
                               <div className="text-right border-r border-slate-100 pr-3">
                                 <p className="text-[10px] font-black text-slate-400 uppercase">إجازة</p>
                                 <p className="font-black text-red-600">{c.holidayPrice} <span className="text-[10px]">ج.م</span></p>
                               </div>
                             </div>
                             <Button variant="secondary" className="w-full rounded-2xl h-12 gap-2 font-black text-xs bg-slate-50 hover:bg-primary/5 text-primary border border-primary/10" onClick={() => setViewingHistoryChalet(c)}>عرض سجل الحجوزات</Button>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-8">
                    <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
                       <h3 className="text-2xl font-black text-slate-800">فريق العمل والكوادر</h3>
                       <Button className="rounded-2xl gap-3 h-14 px-8 bg-primary text-white font-black text-lg" onClick={() => setIsAddUserOpen(true)}>
                         <Plus className="h-6 w-6" /> إضافة موظف جديد
                       </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {store.users.map(u => (
                        <Card key={u.id} className="p-6 rounded-[2.5rem] flex justify-between items-center bg-white border-none shadow-sm relative overflow-hidden hover:shadow-md transition-all">
                          {!u.isApproved && <div className="absolute top-0 right-0 left-0 h-1 bg-orange-400"></div>}
                          <div className="flex items-center gap-5">
                             <div className="bg-slate-50 p-5 rounded-[2rem]"><UserPlus className="text-slate-400 h-8 w-8" /></div>
                             <div className="text-right">
                                <p className="font-black text-slate-800 text-xl">{u.name} {!u.isApproved && <span className="text-[11px] text-orange-500 font-black block mt-1">(بانتظار المراجعة والاعتماد)</span>}</p>
                                <p className="text-xs text-primary font-black uppercase tracking-widest mt-1 bg-primary/5 inline-block px-3 py-1 rounded-full">{u.role === 'broker' ? 'وسيط إداري' : u.role === 'supervisor' ? 'مشرف ميداني' : 'مدير نظام'}</p>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                             {store.role === 'admin' && !u.isApproved && (
                               <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 h-10 font-black shadow-lg shadow-green-100" onClick={() => store.updateUser(u.id, { isApproved: true })}>اعتماد الموظف</Button>
                             )}
                             <Badge variant="outline" className="bg-slate-50 border-slate-100 font-black px-4 py-1.5 rounded-full text-slate-500">{(u.assignedChaletIds || []).length} شاليهات مسؤولة</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* ---------------- SUPERVISOR VIEW ---------------- */}
            {store.role === 'supervisor' && (
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 text-right relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16"></div>
                   <h2 className="text-3xl font-black text-slate-900">مرحباً كابتن {store.currentUser?.name}</h2>
                   <p className="text-slate-400 font-bold mt-2 text-lg">لديك حجوزات مؤكدة ومدفوعة بالكامل تتطلب تسليم الوحدة للعملاء.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredBookings.length === 0 ? (
                    <Card className="py-24 text-center border-dashed rounded-[3rem] bg-white"><p className="text-slate-400 font-bold text-lg">لا توجد حجوزات مؤكدة حالياً تتطلب التسليم.</p></Card>
                  ) : (
                    filteredBookings.map(b => (
                      <Card key={b.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm overflow-hidden relative hover:shadow-md transition-all">
                        {b.opStatus === 'checked_in' && <div className="absolute top-0 right-0 left-0 h-1 bg-green-500"></div>}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                          <div className="text-right space-y-3 flex-1">
                             <div className="flex items-center gap-4">
                               <h3 className="text-2xl font-black text-slate-800">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                               <Badge className={`px-4 py-1 rounded-full font-black ${b.opStatus === 'waiting' ? 'bg-blue-100 text-blue-600' : b.opStatus === 'checked_in' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {b.opStatus === 'waiting' ? 'بانتظار التسليم' : b.opStatus === 'checked_in' ? 'مقيد حالياً' : 'تم الخروج'}
                               </Badge>
                             </div>
                             <div className="bg-primary/5 p-4 rounded-2xl space-y-2 border border-primary/10">
                                <p className="text-sm font-bold text-slate-600">بيانات استلام العميل:</p>
                                <p className="text-xl font-black text-slate-900">{b.clientName}</p>
                                <p className="text-lg font-black text-primary flex items-center gap-2"><Phone className="h-5 w-5" /> {b.phoneNumber}</p>
                                <p className="text-xs text-slate-400">تواصل مع العميل لتنسيق موعد الدخول في مارينا 7.</p>
                             </div>
                             <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-slate-400 mt-4">
                               <span className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> الفترة: {format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</span>
                               <span className="bg-slate-100 px-4 py-1 rounded-full">عدد الأفراد: {b.guestCount}</span>
                             </div>
                          </div>
                          
                          <div className="flex gap-4 w-full md:w-auto">
                             {b.opStatus === 'waiting' && (
                               <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] h-16 px-12 font-black gap-3 shadow-xl shadow-blue-200" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>
                                 <LogInIcon className="h-6 w-6" /> تسليم الشاليه (دخول)
                               </Button>
                             )}
                             {b.opStatus === 'checked_in' && (
                               <Button className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white rounded-[2rem] h-16 px-12 font-black gap-3 shadow-xl shadow-orange-200" onClick={() => setOpReportBooking(b)}>
                                 <LogOutIcon className="h-6 w-6" /> استلام الشاليه (خروج)
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

      {/* Booking Details Dialog (Financial & Review) */}
      <Dialog open={!!reviewingBooking} onOpenChange={() => setReviewingBooking(null)}>
        <DialogContent className="rounded-[3rem] border-none text-right max-w-2xl p-0 overflow-hidden shadow-2xl">
          <div className="bg-slate-900 p-8 text-white relative">
            <DialogTitle className="text-2xl font-black text-right mb-2">مراجعة بيانات الدفع والحجز</DialogTitle>
            <DialogDescription className="text-white/60 text-right font-medium">يرجى التأكد من استلام المبلغ على المحفظة قبل الاعتماد.</DialogDescription>
            <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
              <Wallet size={100} />
            </div>
          </div>
          {reviewingBooking && (
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl text-right border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-black uppercase mb-1">العميل</p>
                     <p className="font-black text-slate-800 text-lg">{reviewingBooking.clientName}</p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl text-right border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-black uppercase mb-1">رقم التواصل</p>
                     <p className="font-black text-primary text-lg">{reviewingBooking.phoneNumber}</p>
                  </div>
               </div>

               <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4">
                  <div className="flex justify-between items-center border-b border-blue-200 pb-3">
                     <p className="font-black text-blue-700 flex items-center gap-2"><Receipt className="h-5 w-5" /> تفاصيل التحويل المالي</p>
                     <Badge className={reviewingBooking.paymentStatus === 'verified' ? 'bg-green-600' : 'bg-orange-500'}>
                        {reviewingBooking.paymentStatus === 'verified' ? 'دفع مأكد' : 'بانتظار التأكيد'}
                     </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-2">
                     <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase">المبلغ الإجمالي</p>
                        <p className="text-2xl font-black text-slate-900">{reviewingBooking.totalAmount} ج.م</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase">وسيلة الدفع</p>
                        <p className="text-lg font-bold text-slate-700">{reviewingBooking.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : reviewingBooking.paymentMethod}</p>
                     </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-blue-100">
                     <p className="text-[10px] text-slate-400 font-black mb-1">رقم المرجع / التحويل:</p>
                     <p className="text-xl font-black text-blue-600 tracking-widest">{reviewingBooking.paymentReference}</p>
                  </div>
               </div>

               {reviewingBooking.notes && (
                 <div className="p-5 bg-slate-50 rounded-[2rem] text-right">
                    <p className="text-[10px] text-slate-400 font-black mb-1">ملاحظات العميل</p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{reviewingBooking.notes}</p>
                 </div>
               )}
            </div>
          )}
          <DialogFooter className="p-8 pt-0 gap-4 flex flex-row-reverse">
             {store.role === 'admin' && reviewingBooking?.paymentStatus === 'pending' && (
               <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl h-16 font-black gap-2 shadow-xl shadow-green-100" onClick={() => {
                 store.updateBooking(reviewingBooking.id, { paymentStatus: 'verified', status: 'admin_approved' })
                 setReviewingBooking(null)
                 toast({ title: "تم تأكيد المالية", description: "يمكن للبروكر الآن إجراء التأكيد النهائي لإرسال الحجز للمشرف." })
               }}>
                 <CheckCircle className="h-6 w-6" /> تأكيد استلام المبلغ
               </Button>
             )}
             <Button variant="ghost" className="rounded-2xl h-16 font-bold text-slate-400 px-8" onClick={() => setReviewingBooking(null)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other Helper Dialogs Omitted for Focus but included in store logic */}
      <Dialog open={!!opReportBooking} onOpenChange={() => setOpReportBooking(null)}>
        <DialogContent className="rounded-[3rem] border-none text-right p-0 overflow-hidden shadow-2xl">
          <div className="bg-orange-600 p-8 text-white relative">
            <DialogTitle className="text-2xl font-black text-right mb-2">تقرير الفحص وتسجيل الخروج</DialogTitle>
            <DialogDescription className="text-white/80 text-right">يرجى تقييم حالة الوحدة وتسجيل أي تلفيات أو ملاحظات لضمان حقوق كافة الأطراف.</DialogDescription>
            <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
              <ClipboardCheck size={100} />
            </div>
          </div>
          <div className="p-8 space-y-6">
             <div className="space-y-3">
                <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-sm">الحالة الفنية للوحدة بعد الاستخدام <FileText className="h-4 w-4" /></Label>
                <Textarea 
                  placeholder="مثال: الشاليه بحالة ممتازة، لا توجد تلفيات، العهدة كاملة، التكييف سليم..." 
                  className="rounded-[2rem] min-h-[140px] text-right border-slate-100 bg-slate-50 focus:bg-white focus:border-orange-200 transition-all p-5"
                  value={conditionText}
                  onChange={e => setConditionText(e.target.value)}
                />
             </div>
             <div className="space-y-3">
                <Label className="font-black text-slate-600 flex items-center gap-2 justify-end text-sm">المبلغ المسترد من التأمين <Info className="h-4 w-4" /></Label>
                <div className="relative">
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    className="rounded-2xl h-16 text-right pr-6 bg-slate-50 border-slate-100 focus:bg-white text-xl font-black"
                    value={depositText}
                    onChange={e => setDepositText(e.target.value)}
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">جنيه مصري</div>
                </div>
             </div>
          </div>
          <DialogFooter className="p-8 pt-0 gap-4 flex flex-row-reverse">
             <Button className="flex-1 rounded-2xl h-16 font-black bg-orange-600 text-white shadow-xl shadow-orange-100 text-lg" onClick={() => {
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
               toast({ title: "تم تسجيل الخروج", description: "تم إرسال تقرير الفحص النهائي للإدارة بنجاح." })
             }}>إرسال التقرير النهائي</Button>
             <Button variant="ghost" className="rounded-2xl h-16 font-bold text-slate-400 px-8" onClick={() => setOpReportBooking(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddChaletDialog 
        isOpen={isAddChaletOpen} 
        onClose={() => setIsAddChaletOpen(false)} 
        onAdd={(data) => { store.addChalet(data); setIsAddChaletOpen(false); toast({ title: "تمت إضافة الوحدة" }) }}
      />
      <AddUserDialog 
        isOpen={isAddUserOpen} 
        onClose={() => setIsAddUserOpen(false)} 
        onAdd={(data) => { store.addUser(data); setIsAddUserOpen(false); toast({ title: "تم تسجيل الموظف" }) }}
        chalets={store.chalets}
      />
      <BookingDialog 
        chalet={selectedChalet}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleBookingConfirm}
        existingBookings={store.bookings}
      />
      
      {/* History Dialog */}
      <Dialog open={!!viewingHistoryChalet} onOpenChange={() => setViewingHistoryChalet(null)}>
        <DialogContent className="rounded-[3rem] border-none text-right max-w-3xl p-0 overflow-hidden">
          <div className="bg-slate-100 p-8 border-b border-slate-200">
            <DialogTitle className="text-2xl font-black text-right text-slate-800">سجل عمليات {viewingHistoryChalet?.name}</DialogTitle>
          </div>
          <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
             {store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).length === 0 ? (
               <div className="text-center py-20 bg-slate-50 rounded-[2.5rem]">
                 <p className="text-slate-400 font-bold text-lg">لا يوجد سجل عمليات حالياً.</p>
               </div>
             ) : (
               store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).map(b => (
                 <div key={b.id} className="p-5 bg-white rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="text-right">
                       <p className="font-black text-slate-800 text-lg">{b.clientName}</p>
                       <p className="text-xs text-primary font-black">جوال: {b.phoneNumber}</p>
                    </div>
                    <Badge variant="outline" className={`font-black px-4 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-slate-50'}`}>
                       {b.status === 'confirmed' ? 'مؤكد' : b.status === 'admin_approved' ? 'معتمد' : 'معلق'}
                    </Badge>
                 </div>
               ))
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 mt-20 relative overflow-hidden">
         <div className="container mx-auto px-4 text-center space-y-8 relative z-10">
            <h3 className="text-4xl font-black tracking-tight">منتجع فارما بيتش</h3>
            <p className="text-slate-400 font-medium max-w-xl mx-auto leading-relaxed text-lg">نظام الإدارة الرقمي المتكامل لتقديم أرقى مستويات الخدمة في أفخم المنتجعات الساحلية المصرية.</p>
            <div className="pt-10 border-t border-white/5 max-w-2xl mx-auto">
               <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">© {new Date().getFullYear()} فارما بيتش جروب - كافة الحقوق محفوظة</p>
            </div>
         </div>
      </footer>

      {/* Role Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl px-4 py-3 rounded-full flex items-center gap-3 z-50 shadow-2xl border border-slate-200/50">
         <div className="flex gap-2">
            {(['client', 'broker', 'supervisor', 'admin'] as const).map(r => (
               <Button 
                key={r} 
                onClick={() => store.setRole(r)}
                variant={store.role === r ? 'default' : 'ghost'} 
                className={`rounded-full h-12 px-6 text-xs font-black ${store.role === r ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
               >
                 {r === 'admin' ? 'أدمن' : r === 'broker' ? 'بروكر' : r === 'supervisor' ? 'مشرف' : 'عميل'}
               </Button>
            ))}
         </div>
      </div>
    </div>
  )
}
