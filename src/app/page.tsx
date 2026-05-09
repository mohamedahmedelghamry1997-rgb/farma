
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
  ArrowUpRight, Megaphone, Percent, Copy, Filter, Download, Calendar as CalendarIcon
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import { SupervisorActionDialog } from '@/components/SupervisorActionDialog'
import Image from 'next/image'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts'
import { format } from 'date-fns'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  
  const [viewingDetailsChalet, setViewingDetailsChalet] = useState<Chalet | null>(null)
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Supervisor specific state
  const [activeSupervisorBooking, setActiveSupervisorBooking] = useState<Booking | null>(null)
  const [isSupervisorActionOpen, setIsSupervisorActionOpen] = useState(false)

  const myChalets = useMemo(() => {
    let list = store.chalets
    if (store.role === 'broker') {
        list = store.chalets.filter(c => c.ownerBrokerId === store.currentUser?.uid || c.status === 'active')
    }
    if (searchQuery) {
      list = list.filter(c => c.name.includes(searchQuery) || c.location.includes(searchQuery))
    }
    return list
  }, [store.role, store.chalets, searchQuery])

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
  }, [store.role, store.bookings, searchQuery, statusFilter])

  // Data for Charts
  const revenueData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    return months.map((m, i) => ({
      name: m,
      revenue: i === 4 ? store.bookings.filter(b => b.paymentStatus === 'verified').reduce((acc, b) => acc + b.totalAmount, 0) : (i * 15000 + 10000)
    }))
  }, [store.bookings])

  const exportData = (type: string) => {
    toast({ title: `جاري تصدير البيانات بصيغة ${type}...`, description: "ستكون الملفات جاهزة خلال ثوانٍ." })
  }

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center font-black bg-slate-50 text-primary animate-pulse">جاري تحميل منظومة فارما بيتش...</div>

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
             {store.role && (
                <div className="flex items-center gap-4">
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-black text-slate-900">{store.currentUser?.name || 'مدير النظام'}</p>
                        <p className="text-[10px] text-primary font-black uppercase">{store.role === 'admin' ? 'الإدارة العامة' : store.role === 'broker' ? 'قسم المبيعات' : 'فريق التشغيل'}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none py-2 px-5 rounded-full font-black text-xs shadow-sm">
                        {store.role === 'admin' ? 'مدير' : store.role === 'broker' ? 'بروكر' : store.role === 'supervisor' ? 'مشرف' : 'عميل'}
                    </Badge>
                </div>
             )}
             {store.role && <Button variant="ghost" size="sm" onClick={() => store.setRole(null)} className="rounded-2xl hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-5 w-5" /></Button>}
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
                <TabsTrigger value="bookings" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الحجوزات والمالية</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">إدارة الأصول</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">التقارير الذكية</TabsTrigger>
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
                        <Button variant="outline" className="flex-1 md:flex-none rounded-xl h-12 font-black gap-2 border-slate-200" onClick={() => exportData('PDF')}><Download className="h-4 w-4" /> تصدير تقرير</Button>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">الأيام العادية</p>
                                    <p className="text-xl font-black text-slate-900">{c.normalPrice} <span className="text-xs">ج.م</span></p>
                                </div>
                                <div className="bg-primary/5 p-4 rounded-2xl text-right border border-primary/10">
                                    <p className="text-[10px] font-black text-primary uppercase mb-1">الويك إند</p>
                                    <p className="text-xl font-black text-primary">{c.holidayPrice} <span className="text-xs">ج.م</span></p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                               <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black bg-slate-100 text-slate-900 hover:bg-slate-200" onClick={() => setViewingDetailsChalet(c)}>السجل الكامل</Button>
                               <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-200 text-blue-600 hover:bg-blue-50" onClick={() => { store.addChalet({ ...c, name: `${c.name} (نسخة)` }); toast({ title: "تم نسخ الشاليه بنجاح" }) }}><Copy className="h-5 w-5" /></Button>
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
                       <div className="flex justify-between items-center flex-row-reverse">
                          <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">نمو الإيرادات الشهري <TrendingUp className="text-green-500" /></h3>
                          <Badge className="bg-slate-100 text-slate-500 border-none px-4 py-1.5 font-bold">2024</Badge>
                       </div>
                       <div className="h-[350px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                               <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                               <Tooltip content={<ChartTooltipContent />} />
                               <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[12, 12, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </Card>
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <h3 className="text-3xl font-black text-right flex items-center justify-end gap-3">توزيع الحجوزات <BarChart3 className="text-blue-500" /></h3>
                       <div className="space-y-6">
                          {store.chalets.slice(0, 5).map(c => {
                             const count = store.bookings.filter(b => b.chaletId === c.id).length
                             return (
                               <div key={c.id} className="flex flex-row-reverse justify-between items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all">
                                  <span className="font-black text-lg text-slate-900">{c.name}</span>
                                  <div className="flex items-center gap-6">
                                     <div className="h-3 w-40 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-primary shadow-lg" style={{ width: `${Math.min((count / 15) * 100, 100)}%` }}></div>
                                     </div>
                                     <span className="font-black text-primary text-xl">{count} حجز</span>
                                  </div>
                               </div>
                             )
                          })}
                       </div>
                    </Card>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ReportSummaryCard title="أكثر الشاليهات ربحية" val="فيلا رويال" desc="إجمالي: 120,000 ج.م" icon={Star} color="text-yellow-500" />
                    <ReportSummaryCard title="أفضل بروكر مبيعاً" val="أحمد البروكر" desc="12 حجز مؤكد" icon={Users} color="text-blue-500" />
                    <ReportSummaryCard title="معدل الإلغاء" val="4.2%" desc="أقل من الشهر السابق" icon={TrendingUp} color="text-green-500" />
                 </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-10">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-12 rounded-[3.5rem] border shadow-xl gap-8">
                   <div className="text-right">
                     <h3 className="text-4xl font-black text-slate-900">إدارة فريق العمل</h3>
                     <p className="text-slate-500 font-bold text-lg mt-2">تحكم في الصلاحيات، نسب العمولات، والورديات الميدانية</p>
                   </div>
                   <Button className="w-full md:w-auto rounded-[1.5rem] h-20 px-12 font-black gap-3 text-xl shadow-2xl shadow-primary/30" onClick={() => setIsAddUserOpen(true)}><UserPlus className="h-6 w-6" /> إضافة موظف جديد</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {store.users.map(u => (
                      <Card key={u.id} className="p-10 rounded-[3rem] bg-white border-none shadow-xl flex items-center gap-8 group hover:shadow-2xl transition-all">
                         <div className="h-20 w-20 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner"><Users className="h-10 w-10" /></div>
                         <div className="text-right flex-1 space-y-2">
                            <p className="font-black text-2xl text-slate-900">{u.name}</p>
                            <div className="flex gap-2 justify-end">
                                <Badge className={`mt-1 border-none font-black px-4 py-1.5 ${u.role === 'broker' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                                    {u.role === 'broker' ? 'وسيط إداري' : 'مشرف ميداني'}
                                </Badge>
                                {u.role === 'broker' && <Badge className="bg-green-50 text-green-700 border-none px-4 py-1.5 font-black">عمولة: {u.commissionRate}%</Badge>}
                            </div>
                         </div>
                         <Button variant="ghost" className="h-14 w-14 rounded-2xl text-destructive hover:bg-destructive/10" onClick={() => toast({ title: "لا يمكن حذف موظف تجريبي في النسخة الحالية" })}><Trash2 className="h-6 w-6" /></Button>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <h3 className="text-3xl font-black text-right flex items-center justify-end gap-3">إدارة الكوبونات <Tag className="text-primary" /></h3>
                       <div className="space-y-6">
                          <div className="flex gap-4 flex-row-reverse">
                             <Input placeholder="كود الكوبون" className="h-14 rounded-2xl text-right bg-slate-50 border-none font-black" id="couponCode" />
                             <Input placeholder="القيمة (%)" type="number" className="h-14 rounded-2xl text-right bg-slate-50 border-none font-black w-32" id="couponVal" />
                             <Button className="h-14 rounded-2xl font-black px-8" onClick={() => {
                                const code = (document.getElementById('couponCode') as HTMLInputElement).value
                                const val = (document.getElementById('couponVal') as HTMLInputElement).value
                                if(code && val) {
                                   store.addCoupon({ code, value: parseInt(val), discountType: 'percentage', expiryDate: '2025-12-31', isActive: true })
                                   toast({ title: "تم تفعيل الكوبون الجديد بنجاح" })
                                }
                             }}>إضافة</Button>
                          </div>
                          <div className="space-y-4">
                             {store.coupons.map(c => (
                               <div key={c.id} className="flex flex-row-reverse justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                  <div className="text-right">
                                     <span className="font-black text-xl text-slate-900">{c.code}</span>
                                     <p className="text-xs text-slate-400 font-bold">خصم: {c.value}% | صالح حتى: {c.expiryDate}</p>
                                  </div>
                                  <Button variant="ghost" className="text-destructive h-10 w-10 p-0 rounded-xl" onClick={() => store.deleteCoupon(c.id)}><Trash2 className="h-5 w-5" /></Button>
                               </div>
                             ))}
                          </div>
                       </div>
                    </Card>
                    <Card className="p-12 rounded-[3.5rem] bg-white border-none shadow-2xl space-y-8">
                       <h3 className="text-3xl font-black text-right flex items-center justify-end gap-3">الإعدادات العامة <Settings className="text-slate-400" /></h3>
                       <div className="space-y-6 text-right">
                          <div className="space-y-3">
                             <label className="font-black text-slate-700 text-sm">رسوم النظافة الافتراضية</label>
                             <Input placeholder="500" defaultValue="500" className="h-14 rounded-2xl text-right bg-slate-50 border-none font-black" />
                          </div>
                          <div className="space-y-3">
                             <label className="font-black text-slate-700 text-sm">قيمة التأمين المسترد</label>
                             <Input placeholder="2000" defaultValue="2000" className="h-14 rounded-2xl text-right bg-slate-50 border-none font-black" />
                          </div>
                          <div className="space-y-3">
                             <label className="font-black text-slate-700 text-sm">موسم الذروة الحالي</label>
                             <select className="h-14 w-full rounded-2xl text-right bg-slate-50 border-none font-black px-4 outline-none">
                                <option>موسم الصيف (يونيو - سبتمبر)</option>
                                <option>موسم الأعياد</option>
                                <option>الموسم الشتوي</option>
                             </select>
                          </div>
                          <Button className="w-full h-16 rounded-2xl font-black text-lg mt-6" onClick={() => toast({ title: "تم حفظ الإعدادات بنجاح" })}>حفظ كافة التغييرات</Button>
                       </div>
                    </Card>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {store.role === 'broker' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <StatCard title="عمولاتي المستحقة" val={store.bookings.filter(b => b.brokerId === store.currentUser?.uid && b.paymentStatus === 'verified').reduce((acc, b) => acc + (b.brokerCommission || 0), 0).toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="طلبات معلقة" val={filteredBookings.filter(b => b.status === 'pending').length} icon={Clock} color="text-orange-600" />
               <StatCard title="إجمالي مبيعاتي" val={filteredBookings.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString() + ' ج.م'} icon={TrendingUp} color="text-blue-600" />
               <StatCard title="قوة الأداء" val="92%" icon={Zap} color="text-yellow-600" />
            </div>

            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="bg-white p-2 rounded-[2rem] mb-8 flex flex-wrap justify-start border shadow-sm h-auto gap-2">
                <TabsTrigger value="inventory" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">الوحدات والتشغيل</TabsTrigger>
                <TabsTrigger value="crm" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">العملاء والطلبات</TabsTrigger>
                <TabsTrigger value="broker_reports" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">تقارير أدائي</TabsTrigger>
                <TabsTrigger value="actions" className="rounded-xl px-8 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">طلبات إدارية</TabsTrigger>
              </TabsList>

              <TabsContent value="inventory" className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {myChalets.map(c => (
                      <Card key={c.id} className="rounded-[3rem] overflow-hidden bg-white border-none shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                         <div className="h-56 relative overflow-hidden">
                           <Image src={c.image} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                           <Badge className={`absolute top-6 right-6 font-black px-4 py-2 rounded-full ${c.status === 'active' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                              {c.status === 'active' ? 'جاهز للسكن' : 'تحت الصيانة'}
                           </Badge>
                         </div>
                         <div className="p-8 space-y-4">
                            <h4 className="font-black text-xl text-right">{c.name}</h4>
                            <div className="flex gap-2">
                               <Button variant="secondary" className="flex-1 h-12 rounded-xl font-black bg-slate-100 text-slate-900" onClick={() => setViewingDetailsChalet(c)}>السجل الكامل</Button>
                               <Button variant="outline" className="h-12 w-12 rounded-xl text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => toast({ title: "تم إرسال بلاغ صيانة عاجل للأدمن" })}><AlertTriangle className="h-5 w-5" /></Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="crm" className="space-y-6">
                 <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border shadow-sm mb-6 flex-row-reverse">
                    <h3 className="text-2xl font-black">إدارة العملاء والطلبات</h3>
                    <Button className="rounded-xl font-black gap-2 h-12 px-6" onClick={() => setIsAddUserOpen(true)}><UserPlus className="h-4 w-4" /> إضافة عميل جديد</Button>
                 </div>
                 {filteredBookings.map(b => (
                   <Card key={b.id} className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="text-right flex-1 space-y-3 w-full">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <p className="font-black text-2xl">{b.clientName}</p>
                          <Badge className={b.status === 'pending' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}>
                             {b.status === 'pending' ? 'بانتظار موافقة الأدمن' : 'حجز معتمد'}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold text-slate-500">{b.phoneNumber} | {store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                        <div className="flex gap-4 justify-end">
                           <span className="text-xs font-bold text-slate-400">مرجع الدفع: {b.paymentReference || 'لا يوجد'}</span>
                           <span className="text-xs font-bold text-slate-400">القيمة: {b.totalAmount} ج.م</span>
                        </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <Button className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black bg-blue-600 shadow-lg shadow-blue-100 gap-2" onClick={() => toast({ title: "تذكير SMS: تم إرسال رسالة تذكير للعميل بموعد الحجز" })}><Megaphone className="h-5 w-5" /> تذكير العميل</Button>
                        <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 px-6 font-black gap-2 border-slate-200" onClick={() => setViewingDetailsChalet(store.chalets.find(c => c.id === b.chaletId) || null)}><History className="h-5 w-5" /> سجل الوحدة</Button>
                      </div>
                   </Card>
                 ))}
              </TabsContent>

              <TabsContent value="broker_reports" className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl space-y-6">
                       <h3 className="text-2xl font-black text-right flex items-center justify-end gap-2">مبيعاتي الشهرية <TrendingUp className="text-blue-500" /></h3>
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" />
                               <YAxis />
                               <Tooltip content={<ChartTooltipContent />} />
                               <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </Card>
                    <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl space-y-6">
                       <h3 className="text-2xl font-black text-right">أداء المشرفين الميدانيين</h3>
                       <div className="space-y-6">
                          {store.users.filter(u => u.role === 'supervisor').map(s => (
                            <div key={s.id} className="flex flex-row-reverse justify-between items-center p-6 bg-slate-50 rounded-3xl">
                               <div className="text-right">
                                  <p className="font-black">{s.name}</p>
                                  <p className="text-xs text-slate-500 font-bold">نسبة تسليم دقيقة: 98%</p>
                               </div>
                               <Badge className="bg-primary/10 text-primary border-none font-black px-4">12 عملية دخول</Badge>
                            </div>
                          ))}
                       </div>
                    </Card>
                 </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ActionRequestCard 
                       title="طلب زيادة عمولة" 
                       desc="رفع طلب للأدمن لزيادة نسبة العمولة بناءً على حجم المبيعات" 
                       icon={ArrowUpRight} 
                       onClick={() => toast({ title: "تم إرسال طلب زيادة العمولة للمراجعة الإدارية" })} 
                    />
                    <ActionRequestCard 
                       title="إضافة شاليه جديد" 
                       desc="طلب إضافة وحدة عقارية جديدة تحت إدارتي وتسويقي" 
                       icon={Plus} 
                       onClick={() => setIsAddChaletOpen(true)} 
                    />
                    <ActionRequestCard 
                       title="إنشاء كوبون خاص" 
                       desc="إنشاء رمز خصم حصري لعملائي المميزين لزيادة المبيعات" 
                       icon={Percent} 
                       onClick={() => toast({ title: "سيتم تفعيل لوحة إدارة الكوبونات قريباً" })} 
                    />
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {store.role === 'supervisor' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="مهام اليوم" val={filteredBookings.length} icon={ClipboardCheck} color="text-primary" />
              <StatCard title="وحدات بحاجة تنظيف" val="2" icon={Sparkles} color="text-orange-600" />
              <StatCard title="المستلزمات" val="متوفر" icon={Box} color="text-green-600" />
            </div>

            <Tabs defaultValue="tasks" className="w-full">
               <TabsList className="bg-white p-2 rounded-[2.5rem] mb-8 border shadow-sm h-auto flex gap-2">
                 <TabsTrigger value="tasks" className="rounded-2xl px-8 py-4 font-black flex items-center gap-2">
                   <LayoutDashboard className="h-4 w-4" /> مهام التشغيل
                 </TabsTrigger>
                 <TabsTrigger value="units" className="rounded-2xl px-8 py-4 font-black flex items-center gap-2">
                   <Home className="h-4 w-4" /> حالة الوحدات
                 </TabsTrigger>
                 <TabsTrigger value="inventory" className="rounded-2xl px-8 py-4 font-black flex items-center gap-2">
                   <Box className="h-4 w-4" /> عهدة المستلزمات
                 </TabsTrigger>
               </TabsList>

               <TabsContent value="tasks" className="space-y-8">
                  <h3 className="text-3xl font-black text-right px-4 flex items-center justify-end gap-3">المهام الميدانية المباشرة <Activity className="text-primary" /></h3>
                  {filteredBookings.map(b => (
                    <Card key={b.id} className="p-10 rounded-[3.5rem] shadow-2xl border-none bg-white hover:shadow-primary/5 transition-all">
                       <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                          <div className="text-right space-y-4 flex-1 w-full">
                             <div className="flex items-center gap-4 flex-row-reverse">
                               <h3 className="text-3xl font-black text-slate-900">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                               <Badge className="h-8 px-4 rounded-xl bg-slate-100 text-slate-700 border-none font-black">{b.opStatus === 'waiting' ? 'بانتظار وصول' : 'بالداخل الآن'}</Badge>
                             </div>
                             <div className="flex flex-col gap-2">
                               <p className="text-xl font-bold text-slate-600">النزيل: {b.clientName}</p>
                               <div className="flex items-center gap-3 justify-end">
                                 <a href={`tel:${b.phoneNumber}`} className="text-primary font-black flex items-center gap-1">{b.phoneNumber} <Phone className="h-4 w-4" /></a>
                               </div>
                             </div>
                          </div>
                          <div className="flex flex-col gap-4 w-full md:w-auto min-w-[250px]">
                             {b.opStatus === 'waiting' && (
                               <Button className="h-20 rounded-[1.5rem] font-black bg-primary text-white text-xl shadow-xl shadow-primary/20" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>تسجيل دخول العميل</Button>
                             )}
                             {b.opStatus === 'checked_in' && (
                               <Button 
                                 className="h-20 rounded-[1.5rem] font-black bg-orange-600 text-white text-xl shadow-xl shadow-orange-100" 
                                 onClick={() => {
                                   setActiveSupervisorBooking(b)
                                   setIsSupervisorActionOpen(true)
                                 }}
                               >
                                 تسجيل خروج وفحص
                               </Button>
                             )}
                          </div>
                       </div>
                    </Card>
                  ))}
               </TabsContent>

               <TabsContent value="units" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {store.chalets.map(c => (
                    <Card key={c.id} className="p-6 rounded-[2.5rem] bg-white border-none shadow-xl space-y-4 text-right">
                       <div className="flex justify-between items-center flex-row-reverse">
                         <h4 className="font-black text-xl">{c.name}</h4>
                         <Badge className={c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}>
                           {c.status === 'active' ? 'نظيف' : 'تحت الصيانة'}
                         </Badge>
                       </div>
                       <div className="space-y-2">
                         <p className="text-xs text-slate-500 font-bold">آخر قراءة عداد: {store.bookings.find(b => b.chaletId === c.id)?.electricityReading || 'غير مسجلة'}</p>
                         <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" className="rounded-xl font-black gap-2" onClick={() => toast({ title: "تم التبليغ عن عطل فني للأدمن" })}><AlertTriangle className="h-3 w-3" /> عطل فني</Button>
                            <Button variant="outline" size="sm" className="rounded-xl font-black gap-2" onClick={() => toast({ title: "تم تحديث الحالة لـ بحاجة تنظيف" })}><Sparkles className="h-3 w-3" /> طلب تنظيف</Button>
                         </div>
                       </div>
                    </Card>
                  ))}
               </TabsContent>

               <TabsContent value="inventory" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {['مناشف', 'شراشف', 'صابون', 'مناديل'].map(item => (
                      <Card key={item} className="p-8 rounded-[2rem] bg-white text-right space-y-4">
                        <Box className="h-8 w-8 text-primary" />
                        <h4 className="font-black text-xl">{item}</h4>
                        <div className="flex items-center justify-between flex-row-reverse">
                           <span className="text-2xl font-black">24</span>
                           <Button variant="secondary" size="sm" className="rounded-xl" onClick={() => toast({ title: `تم طلب توريد ${item}` })}>طلب توريد</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
               </TabsContent>
            </Tabs>
          </div>
        )}

      </main>

      <RoleSwitcher currentRole={store.role} onRoleChange={store.setRole} />

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
          const payload = { 
            ...data, 
            brokerId: store.role === 'broker' ? store.currentUser?.uid : 'direct' 
          }
          store.addBooking(payload)
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

function ReportSummaryCard({ title, val, desc, icon: Icon, color }: any) {
    return (
      <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl flex flex-col items-center text-center gap-4">
         <div className={`${color} bg-slate-50 p-4 rounded-full`}><Icon className="h-8 w-8" /></div>
         <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase">{title}</p>
            <p className="text-2xl font-black text-slate-900">{val}</p>
            <p className="text-xs text-primary font-bold">{desc}</p>
         </div>
      </Card>
    )
  }

function ActionRequestCard({ title, desc, icon: Icon, onClick }: any) {
  return (
    <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl space-y-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={onClick}>
       <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Icon className="h-6 w-6" /></div>
       <div className="text-right">
          <h4 className="font-black text-xl mb-2">{title}</h4>
          <p className="text-xs text-slate-500 font-bold leading-relaxed">{desc}</p>
       </div>
    </Card>
  )
}
