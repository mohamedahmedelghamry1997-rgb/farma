
"use client"

import { useState, useMemo, useEffect } from 'react'
import { useAppStore, Booking, Chalet, UserProfile, UserRole } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, Home, CheckCircle2, XCircle, Plus, Trash2, MapPin, Phone, LogOut, 
  Wallet, Receipt, Search, Activity, BarChart3, TrendingUp, Clock, Star,
  History, Box, AlertTriangle, MessageSquare, Tag, FileSpreadsheet,
  Zap, Droplets, ShieldAlert, ClipboardCheck, LayoutDashboard, Settings, UserPlus,
  ArrowUpRight, Megaphone, Percent, Copy, Filter, Download, Calendar as CalendarIcon,
  LogIn, UserCheck, Construction, ShoppingCart, Briefcase, UserCircle, Database,
  ArrowRightLeft, Eye, Waves, Sun, Anchor, Palmtree
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { EditUserDialog } from '@/components/EditUserDialog'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import { SupervisorActionDialog } from '@/components/SupervisorActionDialog'
import Image from 'next/image'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Area, AreaChart, Pie, PieChart, Cell } from 'recharts'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth } from '@/firebase'

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
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const [viewingDetailsChalet, setViewingDetailsChalet] = useState<Chalet | null>(null)
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [activeSupervisorBooking, setActiveSupervisorBooking] = useState<Booking | null>(null)
  const [isSupervisorActionOpen, setIsSupervisorActionOpen] = useState(false)

  const stats = useMemo(() => {
    let relevantBookings = store.bookings;
    if (store.role === 'broker') {
      relevantBookings = store.bookings.filter(b => b.brokerId === store.currentUser?.uid);
    }

    const verifiedBookings = relevantBookings.filter(b => b.paymentStatus === 'verified');
    const totalRevenue = verifiedBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const pendingTransfers = relevantBookings.filter(b => b.paymentStatus === 'pending').length;
    const activeCoupons = store.coupons.filter(c => c.isActive).length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const occupiedToday = store.bookings.filter(b => 
      (b.status === 'confirmed' || b.status === 'admin_approved') && 
      todayStr >= b.startDate.split('T')[0] && 
      todayStr <= b.endDate.split('T')[0]
    ).length;
    
    const occupancyRate = store.chalets.length > 0 ? Math.round((occupiedToday / store.chalets.length) * 100) : 0;

    return { totalRevenue, pendingTransfers, activeCoupons, occupancyRate };
  }, [store.bookings, store.chalets, store.coupons, store.role, store.currentUser]);

  const myChalets = useMemo(() => {
    let list = store.chalets || []
    if (store.role === 'broker') {
        list = list.filter(c => c.ownerBrokerId === store.currentUser?.uid || c.status === 'active')
    }
    if (searchQuery) {
      list = list.filter(c => c.name.includes(searchQuery) || c.location.includes(searchQuery))
    }
    return list
  }, [store.role, store.chalets, searchQuery, store.currentUser]);

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
  }, [store.role, store.bookings, searchQuery, statusFilter, store.currentUser]);

  const revenueData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    return months.map((m, i) => ({
      name: m,
      revenue: Math.round((stats.totalRevenue / 6) + (i * 2000))
    }))
  }, [stats.totalRevenue]);

  const handleAuth = async () => {
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password)
        toast({ title: "تم تسجيل الدخول بنجاح" })
        setIsAuthOpen(false)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        toast({ title: "تم إنشاء الحساب بنجاح" })
        setIsAuthOpen(false)
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في المصادقة", description: e.message })
    }
  }

  const handleSupervisorConfirm = async (updates: Partial<Booking>) => {
    if (!activeSupervisorBooking) return;
    try {
      await store.updateBooking(activeSupervisorBooking.id, updates);
      toast({ title: "تم تحديث حالة الوحدة يدوياً بنجاح" });
      setIsSupervisorActionOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل تحديث الحالة", description: e.message });
    }
  }

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center font-black bg-slate-50 text-primary animate-pulse text-2xl">جاري تشغيل محرك فارما بيتش...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20"><Anchor className="text-white h-6 w-6" /></div>
             <div className="text-right">
                <h1 className="text-2xl font-black text-slate-900 leading-none">فارما بيتش</h1>
                <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Management System</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {store.authUser ? (
               <>
                 <div className="text-left hidden md:block">
                    <p className="text-sm font-black text-slate-900">{store.currentUser?.name || store.authUser.email}</p>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] py-1 px-3 rounded-full font-black">
                        {store.role === 'admin' ? 'مدير النظام' : store.role === 'broker' ? 'وسيط' : store.role === 'supervisor' ? 'مشرف' : 'عميل'}
                    </Badge>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => signOut(auth)} className="rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-colors"><LogOut className="h-5 w-5" /></Button>
               </>
             ) : (
               <Button onClick={() => setIsAuthOpen(true)} className="rounded-2xl h-12 px-8 font-black gap-2 shadow-lg shadow-primary/20">
                 <LogIn className="h-5 w-5" /> دخول النظام
               </Button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        
        {(!store.role || store.role === 'client') ? (
          <div className="space-y-0">
            <div className="bg-white py-32 border-b relative overflow-hidden">
               <div className="container mx-auto px-4 text-center space-y-12 relative z-10">
                  <div className="flex justify-center gap-8 mb-4">
                    <div className="bg-primary/5 p-6 rounded-[2rem] text-primary animate-bounce delay-75"><Waves size={48} /></div>
                    <div className="bg-primary/5 p-6 rounded-[2rem] text-primary animate-bounce delay-150"><Sun size={48} /></div>
                    <div className="bg-primary/5 p-6 rounded-[2rem] text-primary animate-bounce delay-300"><Palmtree size={48} /></div>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">فخامة <span className="text-primary">الإقامة الساحلية</span><br/>بين يديك الآن</h2>
                  <p className="text-xl md:text-2xl font-bold text-slate-500 max-w-3xl mx-auto leading-relaxed">استكشف أفخم شاليهات فارما بيتش واحجز عطلتك القادمة بضغطة زر. نظام إدارة يدوي بالكامل لضمان الدقة.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <Button size="lg" className="rounded-[2rem] h-20 px-16 text-2xl font-black shadow-2xl shadow-primary/30 transition-transform hover:scale-105" onClick={() => document.getElementById('units')?.scrollIntoView({behavior: 'smooth'})}>تصفح الشاليهات</Button>
                    {!store.authUser && (
                      <Button size="lg" variant="outline" className="rounded-[2rem] h-20 px-16 text-2xl font-black border-2 border-slate-200" onClick={() => setIsAuthOpen(true)}>سجل دخولك</Button>
                    )}
                  </div>
               </div>
            </div>
            <div id="units" className="container mx-auto px-4 py-32">
               <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                  <div className="space-y-3 text-right">
                    <h3 className="text-5xl font-black text-slate-900">الوحدات المتاحة</h3>
                    <p className="text-slate-400 font-bold text-lg">اختر وحدتك المثالية من مجموعتنا الحصرية المطلة على البحر</p>
                  </div>
                  <div className="w-full md:w-[450px] relative">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 h-6 w-6" />
                    <Input placeholder="ابحث عن موقع أو شاليه..." className="h-16 rounded-[1.5rem] pr-14 text-right bg-white shadow-xl border-none text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {myChalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />
                  ))}
               </div>
            </div>
          </div>
        ) : store.role === 'admin' ? (
          <div className="container mx-auto px-4 py-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <StatCard title="إجمالي الإيرادات" val={stats.totalRevenue.toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="إشغال اليوم" val={stats.occupancyRate + "%"} icon={Activity} color="text-blue-600" />
               <StatCard title="حوالات معلقة" val={stats.pendingTransfers} icon={AlertTriangle} color="text-orange-600" />
               <StatCard title="كوبونات نشطة" val={stats.activeCoupons} icon={Tag} color="text-purple-600" />
            </div>

            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="bg-white p-2 rounded-[2.5rem] mb-12 flex flex-wrap justify-start border shadow-sm h-auto gap-3">
                <TabsTrigger value="bookings" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الحجوزات والمالية</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">إدارة الأصول</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">التقارير المالية</TabsTrigger>
                <TabsTrigger value="users" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">فريق العمل</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الإعدادات</TabsTrigger>
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
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="بحث بالاسم أو المرجع..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-xl pr-10 bg-slate-50 border-none" />
                      </div>
                      <Button variant="outline" className="rounded-xl h-10 gap-2 border-slate-200" onClick={() => toast({ title: "جاري إنشاء التقرير المالي..." })}>
                        <Download className="h-4 w-4" /> تصدير
                      </Button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    {filteredBookings.map(b => (
                      <Card key={b.id} className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-2xl transition-all">
                          <div className="flex items-center gap-8 flex-1 w-full text-right flex-row-reverse">
                             <div className={`p-8 rounded-[2rem] ${b.paymentStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'} shadow-inner`}><Receipt className="h-12 w-12" /></div>
                             <div className="flex-1 space-y-2">
                               <p className="font-black text-3xl text-slate-900">{b.clientName}</p>
                               <p className="text-lg font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name} | <span className="text-primary">{(b.totalAmount || 0).toLocaleString()} ج.م</span></p>
                               <div className="flex gap-3 justify-end mt-4">
                                  <Badge className={b.paymentStatus === 'verified' ? 'bg-green-500 text-white border-none py-1.5 px-4' : 'bg-orange-500 text-white border-none py-1.5 px-4'}>
                                    {b.paymentStatus === 'verified' ? 'دفع مؤكد' : 'انتظار المراجعة'}
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-100 bg-slate-50 text-slate-500 font-bold py-1.5 px-4">مرجع: {b.paymentReference}</Badge>
                               </div>
                             </div>
                          </div>
                          <div className="flex gap-4 w-full md:w-auto">
                            {b.paymentStatus === 'pending' && (
                              <Button className="flex-1 md:flex-none h-16 px-12 bg-green-600 hover:bg-green-700 font-black rounded-2xl shadow-xl shadow-green-100" onClick={() => store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })}>تأكيد الحوالة</Button>
                            )}
                            <Button variant="outline" className="flex-1 md:flex-none h-16 px-8 rounded-2xl font-black gap-2 border-slate-200" onClick={() => setViewingDetailsChalet(store.chalets.find(c => c.id === b.chaletId) || null)}><Eye className="h-5 w-5" /> عرض</Button>
                          </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <h3 className="text-3xl font-black text-right">مراقبة الإيرادات الشهرية</h3>
                       <div className="h-[350px] w-full">
                          <ChartContainer config={chartConfig}>
                            <BarChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tickLine={false} axisLine={false} />
                               <YAxis tickLine={false} axisLine={false} />
                               <RechartsTooltip content={<ChartTooltipContent />} />
                               <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[12, 12, 0, 0]} />
                            </BarChart>
                          </ChartContainer>
                       </div>
                    </Card>
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <h3 className="text-3xl font-black text-right">تحليل التدفق النقدي</h3>
                       <div className="h-[350px] w-full">
                          <ChartContainer config={chartConfig}>
                            <AreaChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" tickLine={false} axisLine={false} />
                               <YAxis tickLine={false} axisLine={false} />
                               <RechartsTooltip content={<ChartTooltipContent />} />
                               <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.1} />
                            </AreaChart>
                          </ChartContainer>
                       </div>
                    </Card>
                 </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border shadow-sm gap-6">
                    <div className="text-right">
                       <h3 className="text-3xl font-black">فريق العمل</h3>
                       <p className="text-slate-500 font-bold">إدارة يدوية للوسطاء والمشرفين</p>
                    </div>
                    <Button className="rounded-2xl h-14 px-8 font-black gap-2" onClick={() => setIsAddUserOpen(true)}>
                       <UserPlus className="h-5 w-5" /> إضافة موظف
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {store.users.filter(u => u.role !== 'admin' && u.role !== 'client').map(u => (
                      <Card key={u.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl space-y-6 text-right">
                         <div className="flex items-center justify-between flex-row-reverse">
                            <div className="flex items-center gap-4 flex-row-reverse text-right">
                               <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                  {u.role === 'broker' ? <Briefcase /> : <ClipboardCheck />}
                               </div>
                               <div>
                                  <p className="text-xl font-black">{u.name}</p>
                                  <Badge variant="outline" className={u.status === 'suspended' ? 'text-destructive border-destructive/20' : 'text-primary'}>
                                    {u.role === 'broker' ? 'وسيط' : 'مشرف'} | {u.status === 'suspended' ? 'معطل' : 'نشط'}
                                  </Badge>
                               </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => { setEditingUser(u); setIsEditUserOpen(true); }}><Settings className="h-5 w-5" /></Button>
                         </div>
                         <Button 
                            variant="outline" 
                            className={`w-full h-12 rounded-xl font-black ${u.status === 'suspended' ? 'text-green-600 border-green-100' : 'text-destructive border-destructive/10'}`}
                            onClick={() => store.updateUser(u.id, { status: u.status === 'suspended' ? 'active' : 'suspended' })}
                          >
                            {u.status === 'suspended' ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                         </Button>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                 <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8 text-right">
                    <h3 className="text-3xl font-black">إعدادات النظام</h3>
                    <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-6">
                       <p className="text-slate-500 font-bold">توليد بيانات يدوية حقيقية لتجربة كافة وظائف المنظومة.</p>
                       <Button className="w-full h-16 rounded-2xl font-black gap-3 text-lg" variant="default" onClick={() => { store.seedDatabase(); toast({ title: "تم توليد البيانات بنجاح" }); }}>
                          توليد البيانات الآن <Database className="h-5 w-5" />
                       </Button>
                    </div>
                 </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : store.role === 'broker' ? (
          <div className="container mx-auto px-4 py-12 space-y-12">
             <div className="flex justify-between items-center flex-row-reverse">
                <div className="text-right">
                   <h2 className="text-4xl font-black text-slate-900">لوحة تحكم الوسيط</h2>
                   <p className="text-slate-500 font-bold mt-2">تابع عمولاتك وحجوزاتك النشطة يدوياً</p>
                </div>
                <div className="flex gap-4">
                  <StatCard title="عمولات محققة" val={(stats.totalRevenue * 0.1).toLocaleString() + " ج.م"} icon={TrendingUp} color="text-primary" />
                  <StatCard title="حجوزاتي" val={filteredBookings.length} icon={CalendarIcon} color="text-blue-600" />
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {myChalets.map(c => <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />)}
             </div>
          </div>
        ) : store.role === 'supervisor' ? (
          <div className="container mx-auto px-4 py-12 space-y-12">
             <div className="flex justify-between items-center flex-row-reverse">
                <div className="text-right">
                   <h2 className="text-4xl font-black text-slate-900">المهام الميدانية</h2>
                   <p className="text-slate-500 font-bold mt-2">إدارة الاستلام والتسليم وفحص الوحدات يدوياً</p>
                </div>
                <StatCard title="مهام معلقة" val={filteredBookings.filter(b => b.opStatus === 'waiting').length} icon={ShieldAlert} color="text-orange-600" />
             </div>
             <div className="space-y-6">
                {filteredBookings.map(b => (
                  <Card key={b.id} className="p-8 rounded-[2.5rem] shadow-xl bg-white flex justify-between items-center flex-row-reverse">
                      <div className="text-right flex items-center gap-6 flex-row-reverse">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><ClipboardCheck /></div>
                        <div>
                           <p className="text-2xl font-black">{b.clientName}</p>
                           <p className="text-slate-500 font-bold">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                         <Button variant="outline" className="h-14 px-6 rounded-2xl font-black border-slate-200 gap-2" onClick={() => window.open(`tel:${b.phoneNumber}`)}><Phone className="h-4 w-4" /> اتصال</Button>
                         <Button className="h-14 px-10 rounded-2xl font-black bg-primary text-white" onClick={() => { setActiveSupervisorBooking(b); setIsSupervisorActionOpen(true); }}>إجراء الفحص</Button>
                      </div>
                  </Card>
                ))}
             </div>
          </div>
        ) : null}

      </main>

      <footer className="bg-slate-900 text-white py-12 text-center border-t-8 border-primary">
         <p className="text-slate-400 font-bold">فارما بيتش ريزورت - نظام الإدارة اليدوي الموثوق</p>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="p-10 rounded-[3rem] shadow-2xl bg-white border-none max-w-md">
          <DialogHeader className="text-center space-y-3">
             <div className="bg-primary w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-lg shadow-primary/20"><LogIn className="text-white h-8 w-8" /></div>
             <DialogTitle className="text-3xl font-black text-slate-900 text-center">{isLoginView ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</DialogTitle>
             <p className="text-slate-500 font-bold text-center">مرحباً بك في منظومة فارما بيتش الإدارية</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
          <p className="text-center text-sm font-bold text-slate-400 mt-4">
            {isLoginView ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <button className="text-primary font-black" onClick={() => setIsLoginView(!isLoginView)}>
              {isLoginView ? 'سجل الآن' : 'سجل دخولك'}
            </button>
          </p>
        </DialogContent>
      </Dialog>

      <ChaletDetailsDialog chalet={viewingDetailsChalet} isOpen={!!viewingDetailsChalet} onClose={() => setViewingDetailsChalet(null)} onBook={() => { setSelectedChalet(viewingDetailsChalet); setIsBookingOpen(true); setViewingDetailsChalet(null); }} existingBookings={store.bookings} userRole={store.role} />
      
      <BookingDialog 
        chalet={selectedChalet} 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={(data) => { 
          const payload = { ...data };
          if (store.role === 'broker') (payload as any).brokerId = store.currentUser?.uid;
          store.addBooking(payload);
          toast({ title: "تم إرسال طلب الحجز بنجاح" }); 
        }} 
        existingBookings={store.bookings} 
      />

      <AddChaletDialog isOpen={isAddChaletOpen} onClose={() => setIsAddChaletOpen(false)} onAdd={(data) => { store.addChalet(data); toast({ title: "تمت إضافة الشاليه بنجاح" }); }} />
      <AddUserDialog isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} onAdd={(data) => { store.updateUser(data.uid, data); toast({ title: "تم إنشاء حساب الموظف بنجاح" }); }} chalets={store.chalets} />
      <EditUserDialog user={editingUser} isOpen={isEditUserOpen} onClose={() => { setIsEditUserOpen(false); setEditingUser(null); }} onUpdate={(userId, data) => { store.updateUser(userId, data); toast({ title: "تم تحديث بيانات الموظف بنجاح" }); }} />
      <SupervisorActionDialog isOpen={isSupervisorActionOpen} onClose={() => setIsSupervisorActionOpen(false)} booking={activeSupervisorBooking} chalet={store.chalets.find(c => c.id === activeSupervisorBooking?.chaletId) || null} onConfirm={handleSupervisorConfirm} />

    </div>
  )
}

function StatCard({ title, val, icon: Icon, color }: any) {
  return (
    <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl flex items-center gap-6">
       <div className={`${color} bg-slate-50 p-5 rounded-[1.5rem]`}><Icon className="h-8 w-8" /></div>
       <div className="text-right">
         <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
         <p className="text-2xl font-black text-slate-900 tracking-tight">{val}</p>
       </div>
    </Card>
  )
}
