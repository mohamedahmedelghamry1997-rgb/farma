
"use client"

import { useState, useMemo } from 'react'
import { useAppStore, Booking, Chalet, UserProfile, UserRole } from '@/lib/store'
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
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2,
  MapPin,
  Phone,
  Eye,
  LogOut as LogOutIcon,
  Briefcase,
  ClipboardCheck,
  Wallet,
  Receipt,
  Search,
  Activity,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Star,
  ChevronLeft,
  Calendar as CalendarIcon,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import Image from 'next/image'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  
  // Local States
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [viewingDetailsChalet, setViewingDetailsChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [viewingHistoryChalet, setViewingHistoryChalet] = useState<Chalet | null>(null)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null)
  const [opReportBooking, setOpReportBooking] = useState<Booking | null>(null)
  const [conditionText, setConditionText] = useState('')
  const [depositText, setDepositText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Filtered Lists
  const filteredChalets = useMemo(() => {
    let list = store.chalets
    if (store.role === 'client' || !store.role) list = list.filter(c => c.status === 'active')
    if (searchQuery) {
      list = list.filter(c => c.name.includes(searchQuery) || c.location.includes(searchQuery))
    }
    return list
  }, [store.role, store.chalets, searchQuery])

  const filteredBookings = useMemo(() => {
    let list = store.bookings
    if (store.role === 'supervisor') {
      const assignedIds = store.currentUser?.assignedChaletIds || []
      list = list.filter(b => assignedIds.includes(b.chaletId) && (b.status === 'confirmed' || b.status === 'admin_approved'))
    }
    if (searchQuery) {
      list = list.filter(b => b.clientName.includes(searchQuery) || b.phoneNumber.includes(searchQuery))
    }
    return list
  }, [store.role, store.bookings, store.currentUser, searchQuery])

  const stats = useMemo(() => {
    const confirmed = store.bookings.filter(b => b.status === 'confirmed')
    const totalRevenue = confirmed.reduce((acc, b) => acc + (b.totalAmount || 0), 0)
    const pendingFinance = store.bookings.filter(b => b.paymentStatus === 'pending').length
    const activeGuests = store.bookings.filter(b => b.opStatus === 'checked_in').length
    return { totalRevenue, pendingFinance, activeGuests }
  }, [store.bookings])

  if (!store.isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-black text-primary text-xs">PHARMA</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-right" dir="rtl">
      
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 py-4 border-b border-slate-100 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
               <Home className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">فارما بيتش</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Luxury Management System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {store.role && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-none py-1.5 px-4 rounded-full font-black text-xs hidden md:flex">
                {store.role === 'admin' ? 'مدير النظام' : store.role === 'broker' ? 'وسيط إداري' : store.role === 'supervisor' ? 'مشرف ميداني' : 'زائر'}
              </Badge>
            )}
            {store.role && store.role !== 'client' && (
              <Button variant="ghost" size="sm" onClick={() => { store.setRole(null); localStorage.removeItem('pb_role'); }} className="text-red-600 font-bold gap-2 hover:bg-red-50">
                <LogOutIcon className="h-4 w-4" /> خروج
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20">
        
        {/* LANDING PAGE / CLIENT VIEW */}
        {(!store.role || store.role === 'client') && (
          <div className="space-y-0 animate-slide-up">
            <div className="relative min-h-[75vh] flex items-center justify-center text-slate-900 overflow-hidden bg-white border-b border-slate-100">
               <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] -mr-24 -mt-24"></div>
               <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] -ml-24 -mb-24"></div>
               <div className="container mx-auto px-4 relative z-10 text-center space-y-8 py-20">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-8 py-2.5 rounded-full font-black text-xs md:text-sm mb-4">أرقى وجهات الساحل والسخنة</Badge>
                  <h2 className="text-5xl md:text-8xl font-black leading-tight tracking-tighter text-slate-900">تجربة فندقية <br/><span className="text-primary">لا تُنسى</span></h2>
                  <p className="text-lg md:text-xl font-bold text-slate-500 max-w-2xl mx-auto leading-relaxed">اكتشف مجموعتنا المختارة من الشاليهات الفاخرة المجهزة بأعلى معايير الجودة والرفاهية لضمان عطلة مثالية.</p>
                  <div className="flex flex-wrap justify-center gap-4 pt-6">
                    <Button className="bg-primary hover:bg-primary/90 text-white h-16 px-12 rounded-full text-xl font-black shadow-2xl shadow-primary/30 gap-3" onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}>
                      استعرض الشاليهات <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button variant="outline" className="bg-slate-50 text-slate-900 border-slate-200 h-16 px-12 rounded-full text-xl font-black hover:bg-slate-100" onClick={() => document.getElementById('staff-gate')?.scrollIntoView({ behavior: 'smooth' })}>بوابة الشركاء</Button>
                  </div>
               </div>
            </div>

            <div id="browse" className="container mx-auto px-4 py-24 space-y-16">
               <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                  <div className="text-right space-y-2">
                    <p className="text-primary font-black text-xs uppercase tracking-widest">Our Units</p>
                    <h3 className="text-4xl font-black text-slate-900">وحداتنا الفاخرة</h3>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input 
                        placeholder="ابحث عن اسم الشاليه أو الموقع..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-white rounded-2xl h-14 pr-12 border-slate-200 shadow-sm focus:ring-2 focus:ring-primary/20 text-slate-900 font-bold" 
                      />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredChalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => { setViewingDetailsChalet(chalet); }} />
                  ))}
               </div>
            </div>

            <div id="staff-gate" className="bg-slate-950 py-32 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
               <div className="container mx-auto px-4 text-center space-y-16 relative z-10">
                  <div className="space-y-4">
                    <h4 className="text-4xl font-black">بوابة إدارة العمليات</h4>
                    <p className="text-slate-400 font-bold max-w-xl mx-auto text-lg">هذه المنطقة مخصصة لموظفي وشركاء منتجع فارما بيتش لإدارة الحجوزات والعمليات الميدانية والمالية.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <Card className="bg-white/5 border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all cursor-pointer group" onClick={() => store.setRole('admin')}>
                       <div className="bg-primary/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                       </div>
                       <h5 className="text-2xl font-black mb-2 text-white">مدير النظام</h5>
                       <p className="text-slate-500 text-sm font-bold">التحكم الكامل والمالية</p>
                    </Card>
                    <Card className="bg-white/5 border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all cursor-pointer group" onClick={() => store.setRole('broker')}>
                       <div className="bg-blue-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Briefcase className="h-8 w-8 text-blue-400" />
                       </div>
                       <h5 className="text-2xl font-black mb-2 text-white">وسيط إداري</h5>
                       <p className="text-slate-500 text-sm font-bold">إدارة الحجوزات والوحدات</p>
                    </Card>
                    <Card className="bg-white/5 border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all cursor-pointer group" onClick={() => store.setRole('supervisor')}>
                       <div className="bg-green-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <ClipboardCheck className="h-8 w-8 text-green-400" />
                       </div>
                       <h5 className="text-2xl font-black mb-2 text-white">مشرف ميداني</h5>
                       <p className="text-slate-500 text-sm font-bold">الاستلام والتسليم الفني</p>
                    </Card>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* DASHBOARDS (ADMIN & BROKER) */}
        {(store.role === 'admin' || store.role === 'broker') && (
          <div className="container mx-auto px-4 py-8 space-y-10 animate-slide-up">
            
            {/* STATS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm flex items-center gap-6 group">
                  <div className="bg-primary/10 p-4 rounded-3xl text-primary"><Home className="h-8 w-8" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الوحدات</p>
                    <p className="text-3xl font-black text-slate-900">{store.chalets.length}</p>
                  </div>
               </Card>
               <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm flex items-center gap-6 group">
                  <div className="bg-green-100 p-4 rounded-3xl text-green-600"><Activity className="h-8 w-8" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">نزلاء حالياً</p>
                    <p className="text-3xl font-black text-slate-900">{stats.activeGuests}</p>
                  </div>
               </Card>
               <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm flex items-center gap-6 group">
                  <div className="bg-orange-100 p-4 rounded-3xl text-orange-600"><Wallet className="h-8 w-8" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">بانتظار التحصيل</p>
                    <p className="text-3xl font-black text-slate-900">{stats.pendingFinance}</p>
                  </div>
               </Card>
               <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm flex items-center gap-6 group">
                  <div className="bg-purple-100 p-4 rounded-3xl text-purple-600"><TrendingUp className="h-8 w-8" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">الإيرادات</p>
                    <p className="text-3xl font-black text-slate-900">{stats.totalRevenue.toLocaleString()} <span className="text-xs">ج.م</span></p>
                  </div>
               </Card>
            </div>

            <Tabs dir="rtl" defaultValue="bookings" className="w-full">
              <TabsList className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] shadow-sm h-16 border border-white/50 mb-10 inline-flex w-full md:w-auto">
                <TabsTrigger value="bookings" className="rounded-[1.5rem] px-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm">الحجوزات والمالية</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-[1.5rem] px-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm">إدارة الوحدات</TabsTrigger>
                <TabsTrigger value="users" className="rounded-[1.5rem] px-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-sm">الفريق</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900">سجل العمليات المالية</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full border-slate-200 font-bold px-6 text-slate-700">تحميل تقرير PDF</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {filteredBookings.map(b => (
                    <Card key={b.id} className="p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-none shadow-sm hover:shadow-xl transition-all duration-300">
                      <div className="flex gap-6 items-center flex-1">
                         <div className={`p-5 rounded-[2rem] ${b.paymentStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {b.paymentStatus === 'verified' ? <CheckCircle2 className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                         </div>
                         <div className="text-right space-y-1">
                            <p className="font-black text-xl text-slate-900">{b.clientName}</p>
                            <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-slate-500">
                               <Badge className={b.paymentStatus === 'verified' ? 'bg-green-600' : 'bg-orange-600'}>
                                  {b.paymentStatus === 'verified' ? 'تم تأكيد المبلغ' : 'بانتظار التحقق'}
                               </Badge>
                               <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700">{store.chalets.find(c => c.id === b.chaletId)?.name}</span>
                               <span className="text-slate-600 flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <div className="text-left ml-4 hidden md:block">
                            <p className="text-[10px] font-black text-slate-500 uppercase">المبلغ الإجمالي</p>
                            <p className="text-xl font-black text-primary">{b.totalAmount?.toLocaleString()} ج.م</p>
                         </div>
                         <Button variant="outline" className="rounded-2xl h-14 w-14 p-0 border-slate-100 bg-slate-50 hover:bg-slate-100" title="تفاصيل السجل" onClick={() => setReviewingBooking(b)}>
                            <FileText className="h-6 w-6 text-slate-700" />
                         </Button>
                         
                         {store.role === 'admin' && b.paymentStatus === 'pending' && (
                           <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 px-8 font-black shadow-lg shadow-primary/20" onClick={() => {
                             store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })
                             toast({ title: "تم تأكيد الحوالة بنجاح" })
                           }}>تأكيد استلام المبلغ</Button>
                         )}

                         {store.role === 'broker' && b.status === 'admin_approved' && (
                           <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-14 px-8 font-black gap-2" onClick={() => {
                             store.updateBooking(b.id, { status: 'confirmed' })
                             toast({ title: "تم التأكيد وإرسال للميدان" })
                           }}>تأكيد نهائي</Button>
                         )}
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="chalets" className="space-y-8">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
                   <div>
                    <h3 className="text-2xl font-black text-slate-900">إدارة الأصول العقارية</h3>
                    <p className="text-slate-500 font-bold text-xs mt-1">تعديل وإضافة الوحدات المتاحة في المنظومة</p>
                   </div>
                   <Button className="rounded-2xl gap-3 h-14 px-10 bg-primary text-white font-black shadow-xl shadow-primary/20" onClick={() => setIsAddChaletOpen(true)}>
                     <Plus className="h-6 w-6" /> إضافة وحدة جديدة
                   </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredChalets.map(c => (
                    <Card key={c.id} className="rounded-[3rem] overflow-hidden border-none shadow-sm bg-white group relative hover:shadow-2xl transition-all duration-500">
                       <div className="relative h-60">
                         <Image src={c.image} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                         <div className="absolute bottom-4 right-4 text-white">
                           <h4 className="font-black text-xl">{c.name}</h4>
                           <p className="text-xs font-bold opacity-80 flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>
                         </div>
                         <div className="absolute top-4 left-4">
                           <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-600" onClick={() => store.deleteChalet(c.id)}>
                             <Trash2 className="h-5 w-5" />
                           </Button>
                         </div>
                       </div>
                       <div className="p-6 space-y-4">
                         <Button variant="secondary" className="w-full rounded-2xl h-12 font-black text-xs gap-2 bg-slate-100 text-slate-800 hover:bg-primary hover:text-white transition-colors" onClick={() => setViewingHistoryChalet(c)}>
                           <Clock className="h-4 w-4" /> سجل تشغيل الوحدة (Log)
                         </Button>
                       </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-8">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm">
                   <h3 className="text-2xl font-black text-slate-900">فريق العمل والشركاء</h3>
                   {store.role === 'admin' && (
                    <Button className="rounded-2xl gap-3 h-14 px-10 bg-primary text-white font-black" onClick={() => setIsAddUserOpen(true)}>
                      <Plus className="h-6 w-6" /> إضافة عضو جديد
                    </Button>
                   )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {store.users.map(u => (
                    <Card key={u.id} className="p-8 rounded-[3rem] flex justify-between items-center bg-white border-none shadow-sm group hover:shadow-lg transition-all">
                      <div className="flex items-center gap-6">
                         <div className="bg-slate-100 p-6 rounded-[2.5rem] group-hover:bg-primary/10 transition-colors">
                            <Briefcase className="text-slate-500 h-10 w-10 group-hover:text-primary transition-colors" />
                         </div>
                         <div className="text-right">
                            <p className="font-black text-slate-900 text-2xl">{u.name}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-2 bg-primary/10 inline-block px-4 py-1.5 rounded-full border border-primary/20">
                               {u.role === 'broker' ? 'وسيط إداري (بروكر)' : u.role === 'supervisor' ? 'مشرف ميداني' : 'مدير نظام'}
                            </p>
                         </div>
                      </div>
                      {store.role === 'admin' && !u.isApproved && (
                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 h-12 font-black" onClick={() => store.updateUser(u.id, { isApproved: true })}>تفعيل الحساب</Button>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* SUPERVISOR VIEW */}
        {store.role === 'supervisor' && (
          <div className="container mx-auto px-4 py-8 space-y-10 animate-slide-up">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 text-right flex flex-col md:flex-row justify-between items-center gap-6">
               <div className="space-y-2">
                 <h2 className="text-4xl font-black text-slate-900">مرحباً كابتن {store.currentUser?.name}</h2>
                 <p className="text-slate-500 font-bold text-lg">لديك مهام تسليم وفحص لليوم. يرجى الدقة في تسجيل الحالة.</p>
               </div>
               <div className="bg-green-50 p-8 rounded-[3rem]"><ClipboardCheck className="h-16 w-16 text-green-600" /></div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {filteredBookings.length === 0 ? (
                <Card className="p-32 text-center rounded-[3.5rem] border-dashed border-2 bg-white">
                  <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-slate-500 font-black text-xl">لا توجد مهام ميدانية حالياً</p>
                </Card>
              ) : (
                filteredBookings.map(b => (
                  <Card key={b.id} className="p-10 rounded-[3.5rem] bg-white border-none shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-2 h-full bg-primary opacity-50"></div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                      <div className="text-right space-y-6 flex-1">
                         <div className="flex items-center gap-6">
                           <h3 className="text-3xl font-black text-slate-900">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                           <Badge className={`px-6 py-2 rounded-full font-black text-xs ${b.opStatus === 'waiting' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                             {b.opStatus === 'waiting' ? 'بانتظار وصول العميل' : 'العميل بداخل الوحدة'}
                           </Badge>
                         </div>
                         <div className="bg-slate-50/50 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 border border-slate-100">
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">بيانات العميل</p>
                              <p className="text-2xl font-black text-slate-900">{b.clientName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">التواصل الفوري</p>
                              <p className="text-2xl font-black text-primary flex items-center gap-3 justify-end"><Phone className="h-6 w-6" /> {b.phoneNumber}</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex gap-4 w-full md:w-auto">
                         {b.opStatus === 'waiting' && (
                           <Button className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white rounded-[2.5rem] h-24 px-16 font-black gap-4 shadow-2xl shadow-primary/30 text-xl" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>
                             <CheckCircle2 className="h-8 w-8" /> تسجيل دخول العميل
                           </Button>
                         )}
                         {b.opStatus === 'checked_in' && (
                           <Button className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white rounded-[2.5rem] h-24 px-16 font-black gap-4 shadow-2xl shadow-orange/30 text-xl" onClick={() => setOpReportBooking(b)}>
                             <ClipboardCheck className="h-8 w-8" /> تسجيل خروج وفحص الحالة
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
      </main>

      <RoleSwitcher currentRole={store.role} onRoleChange={store.setRole} />

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-24 mt-20">
         <div className="container mx-auto px-4 text-center space-y-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-1 bg-primary/40 rounded-full"></div>
              <h3 className="text-3xl font-black">فارما بيتش ريزورت</h3>
              <div className="w-12 h-1 bg-primary/40 rounded-full"></div>
            </div>
            <p className="text-slate-400 font-bold max-w-2xl mx-auto leading-loose text-lg">نظام الإدارة المركزي لضمان أقصى درجات الرقابة والجودة في التشغيل الفندقي. نحن نجمع بين الرفاهية للعملاء والدقة المطلقة للإدارة.</p>
            <div className="flex justify-center gap-8 pt-6">
              <div className="text-right">
                <p className="text-primary font-black text-2xl">30+</p>
                <p className="text-slate-500 text-xs font-bold">وحدة فاخرة</p>
              </div>
              <div className="text-right border-x border-white/5 px-8">
                <p className="text-primary font-black text-2xl">100%</p>
                <p className="text-slate-500 text-xs font-bold">رقابة مالية</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-black text-2xl">24/7</p>
                <p className="text-slate-500 text-xs font-bold">دعم ميداني</p>
              </div>
            </div>
         </div>
      </footer>

      {/* MODALS */}
      <ChaletDetailsDialog 
        chalet={viewingDetailsChalet} 
        isOpen={!!viewingDetailsChalet} 
        onClose={() => setViewingDetailsChalet(null)} 
        onBook={() => { 
          setSelectedChalet(viewingDetailsChalet); 
          setViewingDetailsChalet(null); 
          setIsBookingOpen(true); 
        }} 
        existingBookings={store.bookings}
      />
      <BookingDialog chalet={selectedChalet} isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} onConfirm={(data) => { store.addBooking(data); toast({ title: "تم إرسال طلب الحجز للمراجعة" }); }} existingBookings={store.bookings} />
      <AddChaletDialog isOpen={isAddChaletOpen} onClose={() => setIsAddChaletOpen(false)} onAdd={(data) => { store.addChalet(data); toast({ title: "تمت إضافة الوحدة بنجاح" }); }} />
      <AddUserDialog isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} onAdd={(data) => { store.addUser(data); toast({ title: "تمت إضافة الموظف بنجاح" }); }} chalets={store.chalets} />

      {/* FINANCE DETAILS DIALOG */}
      <Dialog open={!!reviewingBooking} onOpenChange={() => setReviewingBooking(null)}>
        <DialogContent className="rounded-[3.5rem] text-right p-0 overflow-hidden border-none max-w-xl">
           <div className="bg-primary p-10 text-white">
              <DialogTitle className="text-3xl font-black text-right">تفاصيل الحجز والمالية</DialogTitle>
              <p className="opacity-80 mt-2 font-bold">مراجعة بيانات التحويل والمبالغ المسجلة</p>
           </div>
           {reviewingBooking && (
             <div className="p-10 space-y-8">
                <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] space-y-4">
                   <div className="flex justify-between items-center border-b border-blue-200 pb-4">
                    <p className="text-[10px] text-blue-700 font-black uppercase tracking-widest">مرجع التحويل (Ref)</p>
                    <Badge className="bg-blue-600 text-white font-black">{reviewingBooking.paymentMethod}</Badge>
                   </div>
                   <p className="text-3xl font-black text-blue-900">{reviewingBooking.paymentReference}</p>
                   <div className="flex justify-between items-center pt-2">
                    <p className="text-lg font-black text-blue-700">إجمالي المبلغ المحصل:</p>
                    <p className="text-2xl font-black text-blue-900">{reviewingBooking.totalAmount?.toLocaleString()} ج.م</p>
                   </div>
                </div>
                {reviewingBooking.conditionReport && (
                  <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 space-y-2">
                     <p className="text-[10px] text-orange-700 font-black uppercase tracking-widest flex items-center gap-2">تقرير فحص المغادرة <Activity className="h-3 w-3" /></p>
                     <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{reviewingBooking.conditionReport}"</p>
                     <p className="text-xs font-black text-orange-900 mt-4 bg-orange-200/50 inline-block px-4 py-1 rounded-full">تأمين مسترد: {reviewingBooking.securityDeposit} ج.م</p>
                  </div>
                )}
             </div>
           )}
           <DialogFooter className="p-10 pt-0 gap-3 flex flex-row-reverse">
              <Button className="flex-1 rounded-2xl h-14 font-black" variant="ghost" onClick={() => setReviewingBooking(null)}>إغلاق النافذة</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OPERATION REPORT DIALOG */}
      <Dialog open={!!opReportBooking} onOpenChange={() => setOpReportBooking(null)}>
        <DialogContent className="rounded-[3.5rem] text-right p-0 overflow-hidden border-none max-w-xl">
          <div className="bg-orange-600 p-10 text-white relative">
            <DialogTitle className="text-3xl font-black text-right relative z-10">فحص الوحدة واستلامها</DialogTitle>
            <DialogDescription className="text-white/90 text-right mt-2 font-bold">يرجى فحص (التكييفات، العفش، النظافة) وتسجيل أي تلفيات لضمان حقوق كافة الأطراف.</DialogDescription>
            <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
              <ClipboardCheck size={120} />
            </div>
          </div>
          <div className="p-10 space-y-8">
             <div className="space-y-3">
                <Label className="font-black text-slate-700 flex justify-end text-sm">ملاحظات الحالة الفنية</Label>
                <Textarea 
                  placeholder="مثال: التكييف يعمل بكفاءة، كسر بسيط في زجاج الطاولة..." 
                  className="rounded-[2rem] min-h-[160px] text-right bg-slate-50 border-slate-200 p-6 text-lg font-bold"
                  value={conditionText}
                  onChange={e => setConditionText(e.target.value)}
                />
             </div>
             <div className="space-y-3">
                <Label className="font-black text-slate-700 flex justify-end text-sm">مبلغ التأمين المسترد للعميل</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  className="rounded-2xl h-16 text-right bg-slate-50 border-slate-200 text-xl font-black px-6"
                  value={depositText}
                  onChange={e => setDepositText(e.target.value)}
                />
             </div>
          </div>
          <DialogFooter className="p-10 pt-0 gap-4 flex flex-row-reverse">
             <Button className="flex-1 rounded-[2rem] h-20 font-black bg-orange-600 text-white text-xl shadow-xl shadow-orange/20" onClick={() => {
               if (!opReportBooking) return
               store.updateBooking(opReportBooking.id, { 
                 opStatus: 'checked_out', 
                 checkOutTime: new Date().toISOString(),
                 conditionReport: conditionText,
                 securityDeposit: depositText
               })
               setOpReportBooking(null); setConditionText(''); setDepositText('');
               toast({ title: "تم تسجيل الخروج وفحص الوحدة" })
             }}>حفظ التقرير والانتهاء</Button>
             <Button variant="ghost" className="h-20 rounded-[2rem] font-bold text-slate-500" onClick={() => setOpReportBooking(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CHALET HISTORY LOG DIALOG */}
      <Dialog open={!!viewingHistoryChalet} onOpenChange={() => setViewingHistoryChalet(null)}>
        <DialogContent className="rounded-[3.5rem] text-right max-w-3xl p-0 overflow-hidden border-none">
          <div className="bg-slate-950 p-10 text-white flex justify-between items-center">
            <div className="text-right">
              <DialogTitle className="text-3xl font-black text-right text-white">سجل التشغيل التاريخي (The Log)</DialogTitle>
              <p className="opacity-70 font-bold mt-2 text-primary">{viewingHistoryChalet?.name} - {viewingHistoryChalet?.location}</p>
            </div>
            <div className="bg-white/10 p-5 rounded-3xl"><Activity className="h-10 w-10 text-primary" /></div>
          </div>
          <div className="p-10 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50">
             {store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).length === 0 ? (
               <div className="text-center py-24 bg-white rounded-[3rem] border-dashed border-2 border-slate-200">
                 <Clock className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-500 font-black text-xl">لا توجد سجلات تشغيل لهذه الوحدة بعد.</p>
               </div>
             ) : (
               store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).map(b => (
                 <div key={b.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-slate-200 group-hover:bg-primary transition-colors"></div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                       <div>
                        <p className="font-black text-slate-900 text-xl">{b.clientName}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{b.phoneNumber}</p>
                       </div>
                       <Badge variant="outline" className="font-black px-4 py-1.5 rounded-full border-slate-200 text-slate-700">{format(new Date(b.startDate), 'dd MMM yyyy')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-6 text-xs font-black text-slate-600">
                       <span className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl"><Wallet className="h-4 w-4 text-primary" /> المحصل: {b.totalAmount?.toLocaleString()} ج.م</span>
                       <span className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl"><Activity className="h-4 w-4 text-orange-600" /> تأمين مسترد: {b.securityDeposit || 0} ج.م</span>
                    </div>
                    {b.conditionReport && (
                      <div className="bg-slate-50 p-4 rounded-2xl border-r-4 border-primary/20">
                        <p className="text-xs font-bold text-slate-500 mb-1">تقرير الحالة عند المغادرة:</p>
                        <p className="text-sm font-bold italic text-slate-700 leading-relaxed">"{b.conditionReport}"</p>
                      </div>
                    )}
                 </div>
               ))
             )}
          </div>
          <DialogFooter className="p-8 bg-white border-t border-slate-100">
             <Button variant="ghost" className="w-full h-14 rounded-2xl font-black text-slate-500 hover:bg-slate-50" onClick={() => setViewingHistoryChalet(null)}>إغلاق السجل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
