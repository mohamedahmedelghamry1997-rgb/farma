
"use client"

import { useState, useMemo } from 'react'
import { useAppStore, Booking, Chalet, UserProfile, UserRole } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, Home, CheckCircle2, XCircle, Plus, Trash2, MapPin, Phone, LogOut, 
  Wallet, Receipt, Search, Activity, BarChart3, TrendingUp, Clock, Star,
  History, Sparkles, Box, AlertTriangle, MessageSquare, Tag, FileSpreadsheet,
  Zap, Droplets, ShieldAlert, ClipboardCheck, LayoutDashboard, Settings, UserPlus,
  ArrowUpRight, Megaphone, Percent, Copy, Filter, Download, Calendar as CalendarIcon,
  LogIn
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import { SupervisorActionDialog } from '@/components/SupervisorActionDialog'
import Image from 'next/image'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth } from '@/firebase'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const auth = useAuth()
  const { toast } = useToast()
  
  // Auth Form State
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [viewingDetailsChalet, setViewingDetailsChalet] = useState<Chalet | null>(null)
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [activeSupervisorBooking, setActiveSupervisorBooking] = useState<Booking | null>(null)
  const [isSupervisorActionOpen, setIsSupervisorActionOpen] = useState(false)

  const handleAuth = async () => {
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password)
        toast({ title: "تم تسجيل الدخول بنجاح" })
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        toast({ title: "تم إنشاء الحساب بنجاح" })
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في المصادقة", description: e.message })
    }
  }

  const myChalets = useMemo(() => {
    let list = store.chalets
    if (store.role === 'broker') {
        list = store.chalets.filter(c => c.ownerBrokerId === store.currentUser?.uid || c.status === 'active')
    }
    if (searchQuery) {
      list = list.filter(c => c.name.includes(searchQuery) || c.location.includes(searchQuery))
    }
    return list
  }, [store.role, store.chalets, searchQuery, store.currentUser])

  const filteredBookings = useMemo(() => {
    let list = store.bookings
    if (store.role === 'broker') list = store.bookings.filter(b => b.brokerId === store.currentUser?.uid)
    if (store.role === 'supervisor') list = store.bookings.filter(b => b.status === 'confirmed' || b.status === 'admin_approved')
    
    if (statusFilter !== 'all') {
      list = list.filter(b => b.status === statusFilter || b.paymentStatus === statusFilter)
    }

    if (searchQuery) {
      list = list.filter(b => b.clientName.includes(searchQuery) || b.phoneNumber.includes(searchQuery))
    }
    return list
  }, [store.role, store.bookings, searchQuery, statusFilter, store.currentUser])

  const revenueData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    return months.map((m, i) => ({
      name: m,
      revenue: i === 4 ? store.bookings.filter(b => b.paymentStatus === 'verified').reduce((acc, b) => acc + b.totalAmount, 0) : (i * 15000 + 10000)
    }))
  }, [store.bookings])

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center font-black bg-slate-50 text-primary animate-pulse">جاري تحميل منظومة فارما بيتش...</div>

  if (!store.authUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-8 bg-white border-none">
          <div className="text-center space-y-3">
             <div className="bg-primary w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-lg shadow-primary/20"><LogIn className="text-white h-8 w-8" /></div>
             <h2 className="text-3xl font-black text-slate-900">{isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
             <p className="text-slate-500 font-bold">مرحباً بك في منظومة فارما بيتش الإدارية</p>
          </div>
          
          <div className="space-y-4">
             {!isLoginView && (
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 mr-2">الاسم بالكامل</label>
                 <Input placeholder="أدخل اسمك..." value={name} onChange={e => setName(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none text-right" />
               </div>
             )}
             <div className="space-y-2">
               <label className="text-xs font-black text-slate-400 mr-2">البريد الإلكتروني</label>
               <Input type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none text-right" />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-black text-slate-400 mr-2">كلمة المرور</label>
               <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none text-right" />
             </div>
          </div>

          <Button className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20" onClick={handleAuth}>
            {isLoginView ? 'دخول للنظام' : 'تسجيل حساب جديد'}
          </Button>

          <p className="text-center text-sm font-bold text-slate-400">
            {isLoginView ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <button className="text-primary font-black" onClick={() => setIsLoginView(!isLoginView)}>
              {isLoginView ? 'سجل الآن' : 'سجل دخولك'}
            </button>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      
      <header className="bg-white border-b sticky top-0 z-50 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20"><Home className="text-white h-6 w-6" /></div>
             <div className="text-right">
                <h1 className="text-2xl font-black text-slate-900 leading-none">فارما بيتش</h1>
                <span className="text-[10px] text-primary font-bold tracking-widest">STUDIO FIREBASS AI</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-left hidden md:block">
                <p className="text-sm font-black text-slate-900">{store.currentUser?.name || store.authUser.email}</p>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] py-1 px-3 rounded-full font-black">
                    {store.role === 'admin' ? 'مدير النظام' : store.role === 'broker' ? 'وسيط' : store.role === 'supervisor' ? 'مشرف' : 'عميل'}
                </Badge>
             </div>
             <Button variant="ghost" size="sm" onClick={() => signOut(auth)} className="rounded-2xl hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        
        {(!store.role || store.role === 'client') && (
          <div className="space-y-0">
            <div className="bg-white py-32 border-b relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
               <div className="container mx-auto px-4 text-center space-y-10 relative z-10">
                  <Badge variant="secondary" className="px-8 py-2.5 rounded-full font-black text-primary bg-primary/5 border-primary/20 animate-bounce">فخر الساحل الشمالي</Badge>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">فخامة <span className="text-primary">الساحل</span><br/>بين يديك الآن</h2>
                  <p className="text-xl md:text-2xl font-bold text-slate-500 max-w-3xl mx-auto leading-relaxed">استمتع بتجربة حجز فريدة في أرقى شاليهات فارما بيتش. نظام إدارة ذكي لضمان راحتك وخصوصيتك.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Button size="lg" className="rounded-[2rem] h-20 px-16 text-2xl font-black shadow-2xl shadow-primary/30 transition-transform hover:scale-105" onClick={() => document.getElementById('units')?.scrollIntoView({behavior: 'smooth'})}>استعرض الوحدات</Button>
                    <Button size="lg" variant="outline" className="rounded-[2rem] h-20 px-16 text-2xl font-black border-2 border-slate-200">تواصل معنا</Button>
                  </div>
               </div>
            </div>
            <div id="units" className="container mx-auto px-4 py-32">
               <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="space-y-3 text-right">
                    <h3 className="text-5xl font-black text-slate-900">الوحدات المتاحة</h3>
                    <p className="text-slate-400 font-bold text-lg">اختر وحدتك المثالية من بين مجموعتنا المختارة</p>
                  </div>
                  <div className="w-full md:w-[450px] relative">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 h-6 w-6" />
                    <Input placeholder="ابحث عن شاليه، موقع، أو مدينة..." className="h-16 rounded-[1.5rem] pr-14 text-right bg-white shadow-xl border-none text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {myChalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />
                  ))}
               </div>
            </div>
          </div>
        )}

        {store.role === 'admin' && (
          <div className="container mx-auto px-4 py-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <StatCard title="إجمالي الإيرادات" val={store.bookings.filter(b => b.paymentStatus === 'verified').reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="إشغال اليوم" val="92%" icon={Activity} color="text-blue-600" />
               <StatCard title="حوالات معلقة" val={store.bookings.filter(b => b.paymentStatus === 'pending').length} icon={AlertTriangle} color="text-orange-600" />
               <StatCard title="كوبونات نشطة" val={store.coupons.filter(c => c.isActive).length} icon={Tag} color="text-purple-600" />
            </div>

            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="bg-white p-2 rounded-[2.5rem] mb-12 flex flex-wrap justify-start border shadow-sm h-auto gap-3">
                <TabsTrigger value="bookings" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white">الحجوزات والمالية</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white">إدارة الأصول</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white">التقارير الذكية</TabsTrigger>
                <TabsTrigger value="users" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white">فريق العمل</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white">الإعدادات</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] border shadow-sm mb-4">
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl flex-row-reverse w-full md:w-auto">
                        <Filter className="h-5 w-5 text-slate-400" />
                        <select className="bg-transparent font-black text-sm outline-none px-4" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">كل الحالات</option>
                            <option value="pending">حوالات معلقة</option>
                            <option value="verified">دفع مؤكد</option>
                            <option value="admin_approved">موافق عليه</option>
                        </select>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-12 font-black gap-2 border-slate-200" onClick={() => toast({ title: "جاري استخراج التقرير..." })}><Download className="h-4 w-4" /> تصدير تقرير</Button>
                        <Button className="flex-1 md:flex-none rounded-xl h-12 font-black gap-2" onClick={() => toast({ title: "سيتم تفعيل إضافة حجز يدوي قريباً" })}><Plus className="h-4 w-4" /> حجز يدوي</Button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {filteredBookings.map(b => (
                      <Card key={b.id} className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-2xl transition-all">
                          <div className="flex items-center gap-8 flex-1 w-full text-right flex-row-reverse">
                             <div className={`p-8 rounded-[2rem] ${b.paymentStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'} shadow-inner`}><Receipt className="h-12 w-12" /></div>
                             <div className="flex-1 space-y-2">
                               <p className="font-black text-3xl text-slate-900">{b.clientName}</p>
                               <p className="text-lg font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name} | <span className="text-primary">{b.totalAmount.toLocaleString()} ج.م</span></p>
                               <div className="flex gap-3 justify-end mt-4">
                                  <Badge className={b.paymentStatus === 'verified' ? 'bg-green-500 text-white border-none py-1.5 px-4' : 'bg-orange-500 text-white border-none py-1.5 px-4'}>
                                    {b.paymentStatus === 'verified' ? 'دفع مؤكد' : 'انتظار مراجعة الحوالة'}
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-100 bg-slate-50 text-slate-500 font-bold py-1.5 px-4">مرجع: {b.paymentReference}</Badge>
                               </div>
                             </div>
                          </div>
                          <div className="flex gap-4 w-full md:w-auto">
                            {b.paymentStatus === 'pending' && (
                              <Button className="flex-1 md:flex-none h-16 px-12 bg-green-600 hover:bg-green-700 font-black rounded-2xl shadow-xl shadow-green-100" onClick={() => store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })}>تأكيد العملية</Button>
                            )}
                            <Button variant="outline" className="flex-1 md:flex-none h-16 px-8 rounded-2xl font-black gap-2 border-slate-200" onClick={() => setViewingDetailsChalet(store.chalets.find(c => c.id === b.chaletId) || null)}><History className="h-5 w-5" /> التفاصيل</Button>
                          </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              {/* ... Rest of Admin Content (Same as previous, just ensure roles are correct) ... */}
              <TabsContent value="chalets" className="space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-12 rounded-[3.5rem] border shadow-xl gap-8">
                   <div className="text-right">
                     <h3 className="text-4xl font-black text-slate-900">إدارة المحفظة العقارية</h3>
                     <p className="text-slate-500 font-bold text-lg mt-2">تحكم في أسعار الويك إند، المواسم، وحالات التوافر</p>
                   </div>
                   <Button className="w-full md:w-auto rounded-[1.5rem] h-20 px-12 font-black gap-3 text-xl shadow-2xl shadow-primary/30" onClick={() => setIsAddChaletOpen(true)}><Plus className="h-6 w-6" /> إضافة وحدة جديدة</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {store.chalets.map(c => (
                      <Card key={c.id} className="rounded-[3rem] overflow-hidden bg-white border-none shadow-xl hover:-translate-y-4 transition-all duration-500 group relative">
                         <div className="h-64 relative overflow-hidden">
                           <Image src={c.image} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                           <Badge className="absolute top-6 right-6 bg-white/95 text-slate-900 font-black backdrop-blur-md border-none px-6 py-2.5 rounded-full shadow-xl">{c.city}</Badge>
                         </div>
                         <div className="p-10 space-y-8">
                            <div className="flex justify-between items-center flex-row-reverse">
                                <h4 className="font-black text-2xl text-slate-900">{c.name}</h4>
                                <Badge className={c.status === 'active' ? 'bg-green-100 text-green-700 border-none' : 'bg-orange-100 text-orange-700 border-none'}>
                                    {c.status === 'active' ? 'نشط' : 'تحت الصيانة'}
                                </Badge>
                            </div>
                            <div className="flex gap-3">
                               <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black bg-slate-100 text-slate-900 hover:bg-slate-200" onClick={() => setViewingDetailsChalet(c)}>السجل الكامل</Button>
                               <Button variant="ghost" className="h-14 w-14 rounded-2xl text-destructive hover:bg-destructive/10" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-5 w-5" /></Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <h3 className="text-3xl font-black text-right">نمو الإيرادات الشهري</h3>
                       <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" />
                               <YAxis />
                               <Tooltip />
                               <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </Card>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ... Other Roles Content (Same logic as Admin, checking store.role) ... */}
        {store.role === 'broker' && (
          <div className="container mx-auto px-4 py-10">
             <h2 className="text-4xl font-black text-slate-900 mb-10">لوحة تحكم البروكر</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {myChalets.map(c => (
                 <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />
               ))}
             </div>
          </div>
        )}

        {store.role === 'supervisor' && (
          <div className="container mx-auto px-4 py-10">
             <h2 className="text-4xl font-black text-slate-900 mb-10">المهام الميدانية</h2>
             {filteredBookings.map(b => (
               <Card key={b.id} className="p-8 rounded-[2rem] shadow-xl mb-6 bg-white flex justify-between items-center flex-row-reverse">
                  <div className="text-right">
                    <p className="text-2xl font-black">{b.clientName}</p>
                    <p className="text-slate-500 font-bold">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                  </div>
                  <Button className="h-16 px-10 rounded-2xl font-black bg-primary" onClick={() => { setActiveSupervisorBooking(b); setIsSupervisorActionOpen(true); }}>إجراء فحص</Button>
               </Card>
             ))}
          </div>
        )}

      </main>

      <footer className="bg-slate-900 text-white py-24 mt-24 border-t-8 border-primary">
         <div className="container mx-auto px-4 text-center space-y-8">
            <h3 className="text-4xl font-black">فارما بيتش ريزورت</h3>
            <p className="text-slate-400 font-bold max-w-2xl mx-auto leading-loose text-lg">نظام الإدارة المركزي المتكامل لمنتجع فارما بيتش - STUDIO FIREBASS AI</p>
         </div>
      </footer>

      <ChaletDetailsDialog chalet={viewingDetailsChalet} isOpen={!!viewingDetailsChalet} onClose={() => setViewingDetailsChalet(null)} onBook={() => { setSelectedChalet(viewingDetailsChalet); setIsBookingOpen(true); setViewingDetailsChalet(null); }} existingBookings={store.bookings} userRole={store.role} />
      
      <BookingDialog 
        chalet={selectedChalet} 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={(data) => { 
          store.addBooking({ ...data, brokerId: store.role === 'broker' ? store.currentUser?.uid : undefined })
          toast({ title: "تم إرسال الطلب للمراجعة المالية" }); 
        }} 
        existingBookings={store.bookings} 
      />

      <AddChaletDialog isOpen={isAddChaletOpen} onClose={() => setIsAddChaletOpen(false)} onAdd={(data) => { store.addChalet(data); toast({ title: "تمت إضافة الشاليه وبانتظار الاعتماد" }); }} />
      <AddUserDialog isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} onAdd={(data) => { store.addUser(data); toast({ title: "تم إنشاء حساب الموظف الجديد" }); }} chalets={store.chalets} />

      <SupervisorActionDialog 
        isOpen={isSupervisorActionOpen} 
        onClose={() => setIsSupervisorActionOpen(false)} 
        booking={activeSupervisorBooking} 
        chalet={store.chalets.find(c => c.id === activeSupervisorBooking?.chaletId) || null}
        onConfirm={(updates) => {
          if (activeSupervisorBooking) {
            store.updateBooking(activeSupervisorBooking.id, updates)
            toast({ title: "تم تسجيل الخروج وتحديث حالة الوحدة" })
          }
        }}
      />

    </div>
  )
}

function StatCard({ title, val, icon: Icon, color }: any) {
  return (
    <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl flex items-center gap-8 hover:-translate-y-2 transition-all duration-300">
       <div className={`${color} bg-slate-50 p-6 rounded-[2rem] shadow-sm`}><Icon className="h-10 w-10" /></div>
       <div className="text-right">
         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
         <p className="text-3xl font-black text-slate-900 tracking-tight">{val}</p>
       </div>
    </Card>
  )
}
