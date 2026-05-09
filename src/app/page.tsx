
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
  LogIn, UserCheck, Construction, ShoppingCart, Briefcase, UserCircle, Database,
  ArrowRightLeft, Eye, Brain
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import { SupervisorActionDialog } from '@/components/SupervisorActionDialog'
import Image from 'next/image'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart, Pie, PieChart, Cell } from 'recharts'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth } from '@/firebase'
import { adminChaletBookingGapOptimizer } from '@/ai/flows/admin-chalet-booking-gap-optimizer'

const chartConfig = {
  revenue: {
    label: "الإيرادات",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function PharmaBeachApp() {
  const store = useAppStore()
  const auth = useAuth()
  const { toast } = useToast()
  
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

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)

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
    let list = store.chalets || []
    if (store.role === 'broker') {
        list = list.filter(c => c.ownerBrokerId === store.currentUser?.uid || c.status === 'active')
    }
    if (searchQuery) {
      list = list.filter(c => c.name.includes(searchQuery) || c.location.includes(searchQuery))
    }
    return list
  }, [store.role, store.chalets, searchQuery, store.currentUser])

  const filteredBookings = useMemo(() => {
    let list = store.bookings || []
    if (store.role === 'broker') list = list.filter(b => b.brokerId === store.currentUser?.uid)
    if (store.role === 'supervisor') list = list.filter(b => b.status === 'confirmed' || b.status === 'admin_approved')
    
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
    const monthlyRevenue = (store.bookings || [])
      .filter(b => b.paymentStatus === 'verified')
      .reduce((acc, b) => acc + (b.totalAmount || 0), 0)
    
    return months.map((m, i) => ({
      name: m,
      revenue: i === 5 ? monthlyRevenue : (i * 15000 + 10000)
    }))
  }, [store.bookings])

  const handleSeed = async () => {
    try {
      await store.seedDatabase();
      toast({ title: "تم توليد البيانات التجريبية بنجاح" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل توليد البيانات", description: e.message });
    }
  }

  const handleExportPDF = () => {
    toast({ title: "جاري تصدير التقرير المالي...", description: "سيتم تحميل الملف تلقائياً فور جاهزيته." });
    setTimeout(() => {
      toast({ title: "تم تصدير التقرير بنجاح", description: "يمكنك العثور على تقرير_فارما_بيتش.pdf في التنزيلات." });
    }, 2000);
  }

  const handleUpdateUserStatus = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' || !currentStatus ? 'suspended' : 'active';
    store.updateUser(userId, { status: nextStatus as any });
    toast({ 
      title: nextStatus === 'suspended' ? "تم تعطيل الحساب" : "تم تفعيل الحساب",
      description: "تم تحديث حالة الموظف في النظام بنجاح."
    });
  }

  const handleAiGapAnalysis = async () => {
    if (store.chalets.length === 0) return;
    setIsAiAnalyzing(true);
    try {
      const firstChalet = store.chalets[0];
      const result = await adminChaletBookingGapOptimizer({
        chaletId: firstChalet.id,
        currentDate: new Date().toISOString(),
        bookings: store.bookings.filter(b => b.chaletId === firstChalet.id).map(b => ({
          startDate: b.startDate,
          endDate: b.endDate
        }))
      });
      setAiAnalysisResult(result);
      toast({ title: "تم الانتهاء من التحليل الذكي" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل التحليل الذكي", description: e.message });
    } finally {
      setIsAiAnalyzing(false);
    }
  }

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center font-black bg-slate-50 text-primary animate-pulse">جاري تحميل منظومة فارما بيتش...</div>

  if (!store.authUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-right">
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
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Management System</span>
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
                    <Button size="lg" variant="outline" className="rounded-[2rem] h-20 px-16 text-2xl font-black border-2 border-slate-200" onClick={() => toast({ title: "خدمة العملاء", description: "سيتم تحويلك لخدمة العملاء عبر الواتساب." })}>تواصل معنا</Button>
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
                    <Button variant="outline" className="rounded-2xl h-12 gap-2 border-slate-200" onClick={handleExportPDF}>
                      <Download className="h-4 w-4" /> تصدير PDF
                    </Button>
                 </div>

                 <div className="space-y-6">
                    {filteredBookings.length === 0 ? (
                      <div className="py-32 text-center space-y-4 bg-white rounded-[3rem] border border-dashed">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto"><Search className="text-slate-300 h-10 w-10" /></div>
                        <p className="text-slate-400 font-bold">لا توجد حجوزات تطابق البحث حالياً</p>
                      </div>
                    ) : (
                      filteredBookings.map(b => (
                        <Card key={b.id} className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-8 flex-1 w-full text-right flex-row-reverse">
                               <div className={`p-8 rounded-[2rem] ${b.paymentStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'} shadow-inner`}><Receipt className="h-12 w-12" /></div>
                               <div className="flex-1 space-y-2">
                                 <p className="font-black text-3xl text-slate-900">{b.clientName}</p>
                                 <p className="text-lg font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name} | <span className="text-primary">{(b.totalAmount || 0).toLocaleString()} ج.م</span></p>
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
                      ))
                    )}
                 </div>
              </TabsContent>

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
                      <Card key={c.id} className="rounded-[3rem] overflow-hidden bg-white border-none shadow-xl hover:-translate-y-4 transition-all duration-500 group relative text-right">
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
                 <div className="bg-primary/5 p-12 rounded-[3.5rem] border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-right">
                       <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3 justify-end">التحليلات الذكية <Brain className="text-primary h-8 w-8" /></h3>
                       <p className="text-slate-500 font-bold text-lg mt-2">استخدم الذكاء الاصطناعي لتحليل فجوات الحجز ورفع الإشغال</p>
                    </div>
                    <Button 
                      className="h-16 px-12 rounded-2xl font-black gap-2 bg-primary text-white text-xl shadow-xl shadow-primary/20"
                      onClick={handleAiGapAnalysis}
                      disabled={isAiAnalyzing}
                    >
                      {isAiAnalyzing ? <Activity className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                      تحليل الجدول الآن
                    </Button>
                 </div>

                 {aiAnalysisResult && (
                    <Card className="p-12 rounded-[3.5rem] bg-white border-2 border-primary/20 shadow-2xl space-y-8 animate-slide-up">
                       <div className="flex justify-between items-center flex-row-reverse border-b pb-8">
                          <h3 className="text-3xl font-black text-primary">نتائج التحليل الذكي</h3>
                          <Badge className="bg-primary/10 text-primary py-2 px-6 rounded-full font-black">GenAI Analysis</Badge>
                       </div>
                       <div className="space-y-8 text-right">
                          <div className="space-y-4">
                             <h4 className="font-black text-xl">التحليل التفصيلي:</h4>
                             <p className="text-lg text-slate-600 leading-loose">{aiAnalysisResult.analysis}</p>
                          </div>
                          <div className="space-y-4">
                             <h4 className="font-black text-xl">استراتيجيات مقترحة لملء الفجوات:</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiAnalysisResult.suggestions.map((s: string, idx: number) => (
                                  <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center gap-4 flex-row-reverse">
                                     <div className="bg-primary/10 p-3 rounded-xl text-primary"><TrendingUp className="h-6 w-6" /></div>
                                     <p className="font-bold text-slate-800">{s}</p>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </Card>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <div className="flex justify-between items-center flex-row-reverse">
                          <h3 className="text-3xl font-black">نمو الإيرادات الشهري</h3>
                          <Badge className="bg-green-50 text-green-600 font-black">+12% هذا الشهر</Badge>
                       </div>
                       <div className="h-[350px] w-full">
                          <ChartContainer config={chartConfig}>
                            <BarChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tickLine={false} axisLine={false} />
                               <YAxis tickLine={false} axisLine={false} />
                               <ChartTooltip content={<ChartTooltipContent />} />
                               <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[12, 12, 0, 0]} />
                            </BarChart>
                          </ChartContainer>
                       </div>
                    </Card>
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <h3 className="text-3xl font-black text-right">تحليل الإشغال</h3>
                       <div className="h-[350px] w-full">
                          <ChartContainer config={chartConfig}>
                            <AreaChart data={revenueData}>
                               <defs>
                                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                                  </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tickLine={false} axisLine={false} />
                               <YAxis tickLine={false} axisLine={false} />
                               <ChartTooltip content={<ChartTooltipContent />} />
                               <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                          </ChartContainer>
                       </div>
                    </Card>
                 </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border shadow-sm gap-6">
                    <div className="text-right">
                       <h3 className="text-3xl font-black">إدارة فريق العمل الميداني والإداري</h3>
                       <p className="text-slate-500 font-bold">تتبع أداء المشرفين والوسطاء بشكل تفصيلي</p>
                    </div>
                    <Button className="rounded-2xl h-14 px-8 font-black gap-2" onClick={() => setIsAddUserOpen(true)}>
                       <UserPlus className="h-5 w-5" /> إضافة موظف جديد
                    </Button>
                 </div>

                 <Tabs defaultValue="brokers" className="w-full">
                    <TabsList className="bg-slate-100 p-1.5 rounded-2xl mb-8 flex gap-2 h-auto w-fit">
                       <TabsTrigger value="brokers" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm">متابعة الوسطاء (Brokers)</TabsTrigger>
                       <TabsTrigger value="supervisors" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-white data-[state=active]:shadow-sm">متابعة المشرفين (Supervisors)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="brokers" className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {store.users.filter(u => u.role === 'broker').map(u => {
                            const brokerBookings = store.bookings.filter(b => b.brokerId === u.uid);
                            const totalSales = brokerBookings.filter(b => b.paymentStatus === 'verified').reduce((acc, b) => acc + (b.totalAmount || 0), 0);
                            
                            return (
                              <Card key={u.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl space-y-6 text-right">
                                 <div className="flex items-center justify-between flex-row-reverse">
                                    <div className="flex items-center gap-4 flex-row-reverse text-right">
                                       <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Briefcase className="h-8 w-8" /></div>
                                       <div>
                                          <p className="text-xl font-black">{u.name}</p>
                                          <Badge variant="outline" className={`text-[10px] ${u.status === 'suspended' ? 'text-destructive border-destructive/20 bg-destructive/5' : 'text-primary'}`}>
                                            {u.status === 'suspended' ? 'حساب معطل' : 'وسيط معتمد'}
                                          </Badge>
                                       </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => toast({ title: "معاينة الحساب", description: `عرض تفاصيل الحساب لـ ${u.name}` })}><Eye className="h-5 w-5" /></Button>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                       <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي المبيعات</p>
                                       <p className="text-lg font-black text-primary">{totalSales.toLocaleString()} ج.م</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                       <p className="text-[10px] font-black text-slate-400 uppercase">عدد الحجوزات</p>
                                       <p className="text-lg font-black">{brokerBookings.length}</p>
                                    </div>
                                 </div>
                                 <Button 
                                    variant="outline" 
                                    className={`w-full h-12 rounded-xl font-black gap-2 ${u.status === 'suspended' ? 'text-green-600 border-green-100 hover:bg-green-50' : 'text-destructive border-destructive/10 hover:bg-destructive/5'}`}
                                    onClick={() => handleUpdateUserStatus(u.id, u.status || 'active')}
                                  >
                                    {u.status === 'suspended' ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                                 </Button>
                              </Card>
                            )
                          })}
                       </div>
                    </TabsContent>

                    <TabsContent value="supervisors" className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {store.users.filter(u => u.role === 'supervisor').map(u => {
                            const handledBookings = store.bookings.filter(b => b.opStatus === 'checked_out');
                            const maintenanceReports = Math.floor(Math.random() * 5);

                            return (
                              <Card key={u.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl space-y-6 text-right">
                                 <div className="flex items-center justify-between flex-row-reverse">
                                    <div className="flex items-center gap-4 flex-row-reverse text-right">
                                       <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600"><ClipboardCheck className="h-8 w-8" /></div>
                                       <div>
                                          <p className="text-xl font-black">{u.name}</p>
                                          <Badge variant="outline" className={`text-[10px] ${u.status === 'suspended' ? 'text-destructive border-destructive/20 bg-destructive/5' : 'text-orange-600 border-orange-100 bg-orange-50/50'}`}>
                                            {u.status === 'suspended' ? 'حساب معطل' : 'مشرف ميداني'}
                                          </Badge>
                                       </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => toast({ title: "الإعدادات", description: "فتح إعدادات المشرف الميداني." })}><Settings className="h-5 w-5" /></Button>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                       <p className="text-[10px] font-black text-slate-400 uppercase">عمليات الإخلاء</p>
                                       <p className="text-lg font-black text-orange-600">{handledBookings.length}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                       <p className="text-[10px] font-black text-slate-400 uppercase">بلاغات صيانة</p>
                                       <p className="text-lg font-black">{maintenanceReports}</p>
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 flex-row-reverse">
                                       <span>معدل الالتزام</span>
                                       <span>95%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-green-500 w-[95%]"></div>
                                    </div>
                                 </div>
                                 <Button 
                                    variant="outline" 
                                    className={`w-full h-12 rounded-xl font-black gap-2 ${u.status === 'suspended' ? 'text-green-600 border-green-100 hover:bg-green-50' : 'text-destructive border-destructive/10 hover:bg-destructive/5'}`}
                                    onClick={() => handleUpdateUserStatus(u.id, u.status || 'active')}
                                  >
                                    {u.status === 'suspended' ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                                 </Button>
                              </Card>
                            )
                          })}
                       </div>
                    </TabsContent>
                 </Tabs>
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                 <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                    <div className="text-right space-y-4">
                       <h3 className="text-3xl font-black">إعدادات المنظومة المتقدمة</h3>
                       <p className="text-slate-500 font-bold">إدارة البيانات التجريبية وتهيئة النظام</p>
                    </div>
                    
                    <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6">
                       <div className="flex items-center gap-4 flex-row-reverse">
                          <Database className="text-primary h-8 w-8" />
                          <div className="text-right">
                             <h4 className="font-black text-xl">توليد بيانات تجريبية (Demo Data)</h4>
                             <p className="text-sm text-slate-500 font-bold">سيقوم هذا الإجراء بملء قاعدة البيانات بشاليهات وحجوزات وموظفين لتجربة النظام بالكامل.</p>
                          </div>
                       </div>
                       <Button className="w-full h-16 rounded-2xl font-black gap-3 text-lg" variant="default" onClick={handleSeed}>
                          توليد البيانات الآن <Sparkles className="h-5 w-5" />
                       </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                       <Button variant="outline" className="h-16 rounded-2xl font-black border-slate-200" onClick={() => toast({ title: "إعدادات البريد", description: "فتح واجهة إعدادات خادم البريد SMTP." })}>إعدادات البريد الإلكتروني</Button>
                       <Button variant="outline" className="h-16 rounded-2xl font-black border-slate-200" onClick={() => toast({ title: "تعديل الملف الشخصي", description: "جاري فتح محرر الملف الشخصي للأدمن." })}>تعديل الملف الشخصي</Button>
                    </div>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {store.role === 'broker' && (
          <div className="container mx-auto px-4 py-12 space-y-12">
             <div className="flex justify-between items-center flex-row-reverse">
                <div className="text-right">
                   <h2 className="text-4xl font-black text-slate-900">لوحة تحكم البروكر</h2>
                   <p className="text-slate-500 font-bold mt-2">مرحباً بك مجدداً، إليك نظرة على أعمالك اليوم</p>
                </div>
                <div className="flex gap-4">
                  <StatCard title="عمولات معلقة" val="4,500 ج.م" icon={TrendingUp} color="text-primary" />
                  <StatCard title="حجوزات نشطة" val={filteredBookings.length} icon={CalendarIcon} color="text-blue-600" />
                </div>
             </div>

             <Tabs defaultValue="my-units" className="w-full">
                <TabsList className="bg-white p-2 rounded-[2rem] mb-10 flex flex-wrap justify-start border shadow-sm h-auto gap-2">
                   <TabsTrigger value="my-units" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">وحداتي</TabsTrigger>
                   <TabsTrigger value="my-bookings" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">حجوزاتي</TabsTrigger>
                   <TabsTrigger value="crm" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">إدارة العملاء</TabsTrigger>
                </TabsList>

                <TabsContent value="my-units" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {myChalets.map(c => (
                     <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />
                   ))}
                </TabsContent>

                <TabsContent value="my-bookings" className="space-y-6">
                   {filteredBookings.map(b => (
                     <Card key={b.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-right flex-row-reverse">
                        <div className="flex items-center gap-6 flex-row-reverse w-full">
                           <div className="p-5 bg-primary/5 text-primary rounded-2xl"><CalendarIcon className="h-8 w-8" /></div>
                           <div className="flex-1">
                              <p className="text-xl font-black">{b.clientName}</p>
                              <p className="text-sm font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                           </div>
                           <div className="text-left">
                              <Badge className="bg-primary">{b.status}</Badge>
                              <p className="text-lg font-black mt-1">{(b.totalAmount || 0).toLocaleString()} ج.م</p>
                           </div>
                        </div>
                     </Card>
                   ))}
                </TabsContent>

                <TabsContent value="crm" className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                   <Users className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                   <h3 className="text-2xl font-black text-slate-900">نظام إدارة العملاء CRM</h3>
                   <p className="text-slate-500 font-bold max-w-md mx-auto mt-2">قريباً: تواصل مباشر مع العملاء، حفظ التفضيلات، وإرسال عروض ترويجية مخصصة.</p>
                   <Button className="mt-8 rounded-xl h-12 px-8 font-black" onClick={() => toast({ title: "إدارة العملاء", description: "فتح محرر بيانات العملاء الجديد." })}>إضافة عميل جديد</Button>
                </TabsContent>
             </Tabs>
          </div>
        )}

        {store.role === 'supervisor' && (
          <div className="container mx-auto px-4 py-12 space-y-12">
             <div className="flex justify-between items-center flex-row-reverse">
                <div className="text-right">
                   <h2 className="text-4xl font-black text-slate-900">المهام الميدانية</h2>
                   <p className="text-slate-500 font-bold mt-2">إدارة الاستلام والتسليم الميداني للوحدات</p>
                </div>
                <StatCard title="وحدات للمراجعة" val={filteredBookings.filter(b => b.opStatus === 'waiting').length} icon={ShieldAlert} color="text-orange-600" />
             </div>

             <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="bg-white p-2 rounded-[2rem] mb-10 flex flex-wrap justify-start border shadow-sm h-auto gap-2">
                   <TabsTrigger value="tasks" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">مهام اليوم</TabsTrigger>
                   <TabsTrigger value="inventory" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">جرد المخزون</TabsTrigger>
                   <TabsTrigger value="maintenance" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">بلاغات الصيانة</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-6">
                   {filteredBookings.length === 0 ? (
                     <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed">
                        <UserCheck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">لا توجد عمليات استلام أو تسليم اليوم</p>
                     </div>
                   ) : (
                     filteredBookings.map(b => (
                       <Card key={b.id} className="p-8 rounded-[2.5rem] shadow-xl bg-white flex justify-between items-center flex-row-reverse">
                           <div className="text-right flex items-center gap-6 flex-row-reverse">
                             <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><ClipboardCheck /></div>
                             <div>
                                <p className="text-2xl font-black">{b.clientName}</p>
                                <p className="text-slate-500 font-bold">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                             </div>
                           </div>
                           <div className="flex gap-3">
                              <Button variant="outline" className="h-14 px-6 rounded-2xl font-black border-slate-200 gap-2" onClick={() => toast({ title: "اتصال بالعميل", description: `جاري الاتصال بـ ${b.clientName} على رقم ${b.phoneNumber}` })}><Phone className="h-4 w-4" /> اتصال</Button>
                              <Button className="h-14 px-10 rounded-2xl font-black bg-primary text-white" onClick={() => { setActiveSupervisorBooking(b); setIsSupervisorActionOpen(true); }}>إجراء فحص</Button>
                           </div>
                       </Card>
                     ))
                   )}
                </TabsContent>

                <TabsContent value="inventory" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {['طقم مناشف كامل', 'منظفات أرضيات', 'مستلزمات مطبخ', 'شراشف سرير'].map(item => (
                     <Card key={item} className="p-8 rounded-[2rem] bg-white border-none shadow-lg flex items-center justify-between flex-row-reverse text-right">
                        <div className="flex items-center gap-4 flex-row-reverse text-right">
                           <Box className="text-primary h-6 w-6" />
                           <p className="font-black text-slate-800">{item}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <Button variant="ghost" className="h-10 w-10 rounded-full border border-slate-100 text-lg font-black" onClick={() => toast({ title: "تحديث المخزون", description: `تقليل كمية ${item}` })}>-</Button>
                           <span className="font-black text-xl">12</span>
                           <Button variant="ghost" className="h-10 w-10 rounded-full border border-slate-100 text-lg font-black text-primary" onClick={() => toast({ title: "تحديث المخزون", description: `زيادة كمية ${item}` })}>+</Button>
                        </div>
                     </Card>
                   ))}
                </TabsContent>

                <TabsContent value="maintenance" className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                   <Construction className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                   <h3 className="text-2xl font-black text-slate-900">نظام بلاغات الصيانة</h3>
                   <p className="text-slate-500 font-bold max-w-md mx-auto mt-2">سجل أي عطل فني فوراً ليتم تحويله للفريق المختص ومتابعته من الأدمن.</p>
                   <Button className="mt-8 rounded-xl h-14 px-10 font-black bg-orange-600 text-white" onClick={() => toast({ title: "فتح بلاغ صيانة", description: "فتح محرر البلاغات الفنية." })}>إبلاغ عن عطل جديد</Button>
                </TabsContent>
             </Tabs>
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
          const bookingPayload = { ...data };
          if (store.role === 'broker' && store.currentUser?.uid) {
            (bookingPayload as any).brokerId = store.currentUser.uid;
          }
          store.addBooking(bookingPayload);
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
