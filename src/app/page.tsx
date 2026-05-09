
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
  LayoutDashboard
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  
  // Local States
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
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
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse font-black text-primary text-2xl">جاري تحميل نظام فارما بيتش...</div>
      </div>
    )
  }

  const Header = () => (
    <header className="bg-white shadow-sm sticky top-0 z-50 py-4 border-b border-slate-100">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full h-12 w-12 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-2 ring-primary/10">
             <Home className="text-primary h-6 w-6" />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-slate-800 leading-none">فارما بيتش</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">إدارة فندقية احترافية</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-slate-700 font-bold">
          <a href="#" onClick={() => store.setRole(null)} className="hover:text-primary transition-colors">الرئيسية</a>
          {store.role && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none py-1.5 px-4 rounded-full">
              {store.role === 'admin' ? 'مدير النظام' : store.role === 'broker' ? 'وسيط إداري' : store.role === 'supervisor' ? 'مشرف ميداني' : 'زائر'}
            </Badge>
          )}
          {store.role && store.role !== 'client' && (
            <Button variant="ghost" size="sm" onClick={() => { store.setRole(null); localStorage.removeItem('pb_role'); }} className="text-red-500 font-bold gap-2">
              <LogOutIcon className="h-4 w-4" /> خروج
            </Button>
          )}
        </nav>
      </div>
    </header>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      <Header />

      <main className="flex-1">
        {/* ---------------- LANDING PAGE (CLIENT VIEW) ---------------- */}
        {(!store.role || store.role === 'client') && (
          <div className="space-y-0">
            <div className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
               <img src="https://picsum.photos/seed/beachhero/1920/1080" className="absolute inset-0 w-full h-full object-cover brightness-50" />
               <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
                  <h2 className="text-5xl md:text-7xl font-black leading-tight">عالم من الرفاهية <br/> في قلب الطبيعة</h2>
                  <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl mx-auto">احجز شاليهك الآن في أرقى قرى الساحل الشمالي والعين السخنة بتشطيبات فندقية عالمية.</p>
                  <Button className="bg-primary hover:bg-primary/90 text-white h-16 px-12 rounded-full text-xl font-black shadow-2xl shadow-primary/40 gap-3">
                    ابدأ رحلتك الآن <ArrowRight className="h-6 w-6 rotate-180" />
                  </Button>
               </div>
            </div>

            <div className="container mx-auto px-4 py-20 space-y-12">
               <div className="text-center space-y-4">
                  <h3 className="text-4xl font-black text-slate-900">وحداتنا الفاخرة</h3>
                  <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
               </div>

               <div className="filter-container">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input 
                        placeholder="ابحث عن شاليه..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-white rounded-xl h-12 pr-10 border-none shadow-sm" 
                      />
                    </div>
                    <Select><SelectTrigger className="bg-white rounded-xl h-12 text-right"><SelectValue placeholder="المدينة" /></SelectTrigger>
                      <SelectContent><SelectItem value="sc">الساحل الشمالي</SelectItem><SelectItem value="sh">العين السخنة</SelectItem></SelectContent>
                    </Select>
                    <Button className="bg-primary hover:bg-primary/90 h-12 rounded-xl gap-2 font-bold text-white col-span-1 lg:col-span-1">بحث</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredChalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => { setSelectedChalet(chalet); setIsBookingOpen(true); }} />
                  ))}
                </div>
            </div>

            <div id="staff-login" className="bg-slate-900 py-24 text-white">
               <div className="container mx-auto px-4 text-center space-y-12">
                  <h4 className="text-3xl font-black">بوابة الإدارة والميدان</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all cursor-pointer group" onClick={() => store.setRole('admin')}>
                       <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110" />
                       <h5 className="text-xl font-black mb-2 text-white">مدير النظام</h5>
                    </Card>
                    <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all cursor-pointer group" onClick={() => store.setRole('broker')}>
                       <Briefcase className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110" />
                       <h5 className="text-xl font-black mb-2 text-white">وسيط إداري</h5>
                    </Card>
                    <Card className="bg-white/5 border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all cursor-pointer group" onClick={() => store.setRole('supervisor')}>
                       <ClipboardCheck className="h-12 w-12 text-green-400 mx-auto mb-4 group-hover:scale-110" />
                       <h5 className="text-xl font-black mb-2 text-white">مشرف ميداني</h5>
                    </Card>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* ---------------- ADMIN & BROKER DASHBOARDS ---------------- */}
        {(store.role === 'admin' || store.role === 'broker') && (
          <div className="container mx-auto px-4 py-8 space-y-8 animate-slide-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
               <div>
                 <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                   <LayoutDashboard className="text-primary h-8 w-8" /> لوحة التحكم المركزية
                 </h2>
                 <p className="text-slate-400 font-bold mt-1">مرحباً بك في نظام إدارة فارما بيتش المتكامل</p>
               </div>
               <div className="flex gap-2">
                 <Badge variant="outline" className="px-4 py-2 rounded-full border-slate-100 font-black">
                   تاريخ اليوم: {format(new Date(), 'dd MMMM yyyy')}
                 </Badge>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4 group hover:bg-primary transition-colors cursor-default">
                  <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 group-hover:bg-white/20 group-hover:text-white"><Home className="h-6 w-6" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/60">الوحدات</p>
                    <p className="text-2xl font-black text-slate-800 group-hover:text-white">{store.chalets.length}</p>
                  </div>
               </Card>
               <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4 group hover:bg-green-600 transition-colors cursor-default">
                  <div className="bg-green-100 p-3 rounded-2xl text-green-600 group-hover:bg-white/20 group-hover:text-white"><Activity className="h-6 w-6" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/60">نشط ميدانياً</p>
                    <p className="text-2xl font-black text-slate-800 group-hover:text-white">{stats.activeGuests}</p>
                  </div>
               </Card>
               <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4 group hover:bg-orange-600 transition-colors cursor-default">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 group-hover:bg-white/20 group-hover:text-white"><Wallet className="h-6 w-6" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/60">تحصيلات معلقة</p>
                    <p className="text-2xl font-black text-slate-800 group-hover:text-white">{stats.pendingFinance}</p>
                  </div>
               </Card>
               <Card className="p-6 rounded-[2rem] bg-white border-none shadow-sm flex items-center gap-4 group hover:bg-purple-600 transition-colors cursor-default">
                  <div className="bg-purple-100 p-3 rounded-2xl text-purple-600 group-hover:bg-white/20 group-hover:text-white"><TrendingUp className="h-6 w-6" /></div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/60">الإيرادات</p>
                    <p className="text-2xl font-black text-slate-800 group-hover:text-white">{stats.totalRevenue.toLocaleString()} ج.م</p>
                  </div>
               </Card>
            </div>

            <Tabs dir="rtl" defaultValue="bookings" className="w-full">
              <TabsList className="bg-white p-1 rounded-2xl shadow-sm h-14 border border-slate-100 mb-8 w-full md:w-auto">
                <TabsTrigger value="bookings" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">الحجوزات والمالية</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">الوحدات</TabsTrigger>
                <TabsTrigger value="users" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">الفريق</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {filteredBookings.length === 0 ? (
                    <Card className="py-24 text-center border-dashed rounded-[3rem] bg-white">
                      <Clock className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold text-lg">لا توجد سجلات حالياً</p>
                    </Card>
                  ) : (
                    filteredBookings.map(b => (
                      <Card key={b.id} className="p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 bg-white border-none shadow-sm hover:shadow-md transition-all">
                        <div className="flex gap-4 items-center flex-1">
                           <div className="bg-slate-50 p-5 rounded-[2rem]"><Receipt className="text-slate-400 h-8 w-8" /></div>
                           <div className="text-right">
                              <p className="font-black text-xl text-slate-800">{b.clientName}</p>
                              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 mt-2">
                                <Badge className={b.paymentStatus === 'verified' ? 'bg-green-500' : 'bg-orange-500'}>
                                  {b.paymentStatus === 'verified' ? 'مؤكد مالياً' : 'بانتظار التحصيل'}
                                </Badge>
                                <span className="bg-slate-100 px-3 py-1 rounded-full">{store.chalets.find(c => c.id === b.chaletId)?.name}</span>
                                <span className="text-slate-500">{format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Button variant="outline" className="rounded-2xl h-12 gap-2 border-slate-200 font-bold" onClick={() => setReviewingBooking(b)}>
                              <Eye className="h-5 w-5" /> التفاصيل
                           </Button>
                           
                           {store.role === 'admin' && b.paymentStatus === 'pending' && (
                             <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-8 font-black" onClick={() => {
                               store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })
                               toast({ title: "تم تأكيد الدفع بنجاح" })
                             }}>تأكيد الحوالة</Button>
                           )}

                           {store.role === 'broker' && b.status === 'admin_approved' && (
                             <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl h-12 px-8 font-black gap-2" onClick={() => {
                               store.updateBooking(b.id, { status: 'confirmed' })
                               toast({ title: "تم التأكيد وإرسال للميدان" })
                             }}>تأكيد نهائي</Button>
                           )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="chalets" className="space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
                   <h3 className="text-2xl font-black text-slate-800">إدارة الوحدات</h3>
                   <Button className="rounded-2xl gap-3 h-14 px-8 bg-primary text-white font-black" onClick={() => setIsAddChaletOpen(true)}>
                     <Plus className="h-6 w-6" /> إضافة شاليه
                   </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredChalets.map(c => (
                    <Card key={c.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-sm bg-white group relative hover:shadow-xl transition-all">
                       <div className="relative h-56">
                         <img src={c.image} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute top-4 right-4 flex gap-2">
                           <Button size="icon" variant="destructive" className="h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => store.deleteChalet(c.id)}>
                             <Trash2 className="h-5 w-5" />
                           </Button>
                         </div>
                       </div>
                       <div className="p-6 text-right space-y-4">
                         <h4 className="font-black text-slate-800 text-xl">{c.name}</h4>
                         <p className="text-xs text-slate-400 font-bold flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>
                         <Button variant="secondary" className="w-full rounded-2xl h-12 font-black text-xs gap-2" onClick={() => setViewingHistoryChalet(c)}>
                           <Clock className="h-4 w-4" /> سجل التشغيل
                         </Button>
                       </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm">
                   <h3 className="text-2xl font-black text-slate-800">فريق العمل</h3>
                   {store.role === 'admin' && (
                    <Button className="rounded-2xl gap-3 h-14 px-8 bg-primary text-white font-black" onClick={() => setIsAddUserOpen(true)}>
                      <Plus className="h-6 w-6" /> إضافة موظف
                    </Button>
                   )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {store.users.map(u => (
                    <Card key={u.id} className="p-6 rounded-[2.5rem] flex justify-between items-center bg-white border-none shadow-sm">
                      <div className="flex items-center gap-5">
                         <div className="bg-slate-50 p-5 rounded-[2rem]"><Briefcase className="text-slate-400 h-8 w-8" /></div>
                         <div className="text-right">
                            <p className="font-black text-slate-800 text-xl">{u.name}</p>
                            <p className="text-xs text-primary font-black uppercase tracking-widest mt-1 bg-primary/5 inline-block px-3 py-1 rounded-full">{u.role === 'broker' ? 'وسيط إداري' : u.role === 'supervisor' ? 'مشرف ميداني' : 'مدير نظام'}</p>
                         </div>
                      </div>
                      {store.role === 'admin' && !u.isApproved && (
                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-6 h-10 font-black" onClick={() => store.updateUser(u.id, { isApproved: true })}>تفعيل الحساب</Button>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ---------------- SUPERVISOR VIEW ---------------- */}
        {store.role === 'supervisor' && (
          <div className="container mx-auto px-4 py-8 space-y-8 animate-slide-up">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 text-right flex justify-between items-center">
               <div>
                 <h2 className="text-3xl font-black text-slate-900">مرحباً كابتن {store.currentUser?.name}</h2>
                 <p className="text-slate-400 font-bold mt-2 text-lg">لديك مهام تسليم واستلام لليوم.</p>
               </div>
               <div className="bg-green-100 p-4 rounded-3xl"><ClipboardCheck className="h-10 w-10 text-green-600" /></div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredBookings.map(b => (
                <Card key={b.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm relative overflow-hidden">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-right space-y-4 flex-1">
                       <div className="flex items-center gap-4">
                         <h3 className="text-2xl font-black text-slate-800">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                         <Badge className={`px-4 py-1 rounded-full font-black ${b.opStatus === 'waiting' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                           {b.opStatus === 'waiting' ? 'بانتظار العميل' : 'العميل بالداخل'}
                         </Badge>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-[2rem] grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">العميل</p>
                            <p className="text-xl font-black text-slate-900">{b.clientName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">الهاتف</p>
                            <p className="text-xl font-black text-primary flex items-center gap-2 justify-end"><Phone className="h-5 w-5" /> {b.phoneNumber}</p>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                       {b.opStatus === 'waiting' && (
                         <Button className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white rounded-[2rem] h-20 px-12 font-black gap-3 shadow-xl shadow-primary/20" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>
                           <CheckCircle2 className="h-7 w-7" /> تسجيل دخول العميل
                         </Button>
                       )}
                       {b.opStatus === 'checked_in' && (
                         <Button className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white rounded-[2rem] h-20 px-12 font-black gap-3 shadow-xl shadow-orange/20" onClick={() => setOpReportBooking(b)}>
                           <ClipboardCheck className="h-7 w-7" /> تسجيل خروج وفحص
                         </Button>
                       )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-white py-20 mt-20">
         <div className="container mx-auto px-4 text-center space-y-8">
            <h3 className="text-3xl font-black">منتجع فارما بيتش</h3>
            <p className="text-slate-400 font-medium max-w-xl mx-auto leading-relaxed">نظام الإدارة المتكامل لضمان أقصى درجات الرقابة والجودة في التشغيل الفندقي والمالي.</p>
            {!store.role && (
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-full h-14 px-12 font-black" onClick={() => document.getElementById('staff-login')?.scrollIntoView({ behavior: 'smooth' })}>بوابة الموظفين والشركاء</Button>
            )}
         </div>
      </footer>

      {/* Modals */}
      <BookingDialog chalet={selectedChalet} isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} onConfirm={(data) => { store.addBooking(data); toast({ title: "تم إرسال الطلب للمراجعة" }); }} existingBookings={store.bookings} />
      <AddChaletDialog isOpen={isAddChaletOpen} onClose={() => setIsAddChaletOpen(false)} onAdd={(data) => { store.addChalet(data); toast({ title: "تمت إضافة الوحدة" }); }} />
      <AddUserDialog isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} onAdd={(data) => { store.addUser(data); toast({ title: "تمت إضافة الموظف" }); }} chalets={store.chalets} />

      <Dialog open={!!reviewingBooking} onOpenChange={() => setReviewingBooking(null)}>
        <DialogContent className="rounded-[3rem] text-right p-8">
           <DialogHeader><DialogTitle className="text-2xl font-black text-right">تفاصيل الحجز والمالية</DialogTitle></DialogHeader>
           {reviewingBooking && (
             <div className="space-y-6 py-4">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-2">
                   <p className="text-[10px] text-blue-600 font-black uppercase">المرجع البنكي / رقم التحويل</p>
                   <p className="text-2xl font-black text-blue-900">{reviewingBooking.paymentReference}</p>
                   <p className="text-sm font-bold text-blue-700">إجمالي المبلغ: {reviewingBooking.totalAmount} ج.م</p>
                </div>
                {reviewingBooking.conditionReport && (
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                     <p className="text-[10px] text-orange-600 font-black">تقرير فحص الخروج:</p>
                     <p className="text-sm font-medium italic">"{reviewingBooking.conditionReport}"</p>
                  </div>
                )}
             </div>
           )}
           <DialogFooter className="gap-3 flex flex-row-reverse">
              <Button variant="ghost" onClick={() => setReviewingBooking(null)}>إغلاق</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!opReportBooking} onOpenChange={() => setOpReportBooking(null)}>
        <DialogContent className="rounded-[3rem] text-right p-8">
          <div className="bg-orange-600 -m-8 mb-8 p-10 text-white relative overflow-hidden">
            <DialogTitle className="text-2xl font-black text-right relative z-10">فحص الخروج اليدوي</DialogTitle>
            <DialogDescription className="text-white/80 text-right">يرجى تقييم حالة الوحدة وتسجيل أي تلفيات لضمان حقوق كافة الأطراف.</DialogDescription>
            <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
              <ClipboardCheck size={100} />
            </div>
          </div>
          <div className="space-y-6 py-4">
             <div className="space-y-2">
                <Label className="font-black text-slate-600 flex justify-end">الحالة الفنية والملاحظات</Label>
                <Textarea 
                  placeholder="سجل أي تلفيات أو ملاحظات هنا..." 
                  className="rounded-2xl min-h-[140px] text-right bg-slate-50 border-none"
                  value={conditionText}
                  onChange={e => setConditionText(e.target.value)}
                />
             </div>
             <div className="space-y-2">
                <Label className="font-black text-slate-600 flex justify-end">مبلغ التأمين المسترد للعميل</Label>
                <Input 
                  type="number"
                  placeholder="0.00" 
                  className="rounded-2xl h-14 text-right bg-slate-50 border-none"
                  value={depositText}
                  onChange={e => setDepositText(e.target.value)}
                />
             </div>
          </div>
          <DialogFooter className="gap-3 flex flex-row-reverse">
             <Button className="flex-1 rounded-2xl h-14 font-black bg-orange-600 text-white" onClick={() => {
               if (!opReportBooking) return
               store.updateBooking(opReportBooking.id, { 
                 opStatus: 'checked_out', 
                 checkOutTime: new Date().toISOString(),
                 conditionReport: conditionText,
                 securityDeposit: depositText
               })
               setOpReportBooking(null); setConditionText(''); setDepositText('');
               toast({ title: "تم تسجيل الخروج بنجاح" })
             }}>حفظ التقرير والانتهاء</Button>
             <Button variant="ghost" onClick={() => setOpReportBooking(null)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingHistoryChalet} onOpenChange={() => setViewingHistoryChalet(null)}>
        <DialogContent className="rounded-[3rem] text-right max-w-3xl p-0 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black text-right">سجل عمليات الوحدة (Log)</DialogTitle>
            <p className="opacity-60 text-sm">{viewingHistoryChalet?.name}</p>
          </div>
          <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
             {store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).length === 0 ? (
               <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-dashed border-2">
                 <p className="text-slate-400 font-bold">لا توجد سجلات تشغيل لهذه الوحدة حتى الآن.</p>
               </div>
             ) : (
               store.bookings.filter(b => b.chaletId === viewingHistoryChalet?.id).map(b => (
                 <div key={b.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col gap-3 shadow-sm hover:border-primary/20 transition-colors">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                       <p className="font-black text-slate-800">{b.clientName}</p>
                       <Badge variant="outline" className="font-black">{format(new Date(b.startDate), 'dd MMM yyyy')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500">
                       <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> المبلغ: {b.totalAmount} ج.م</span>
                       <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> تأمين مسترد: {b.securityDeposit || 0} ج.م</span>
                    </div>
                    {b.conditionReport && <p className="text-xs italic text-slate-400 border-r-2 border-primary/20 pr-3 mt-1">"{b.conditionReport}"</p>}
                 </div>
               ))
             )}
          </div>
          <DialogFooter className="p-6 border-t border-slate-100">
             <Button variant="ghost" className="w-full h-12 rounded-xl" onClick={() => setViewingHistoryChalet(null)}>إغلاق السجل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
