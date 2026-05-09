
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
  Zap, Droplets, ShieldAlert, ClipboardCheck
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import Image from 'next/image'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  
  const [viewingDetailsChalet, setViewingDetailsChalet] = useState<Chalet | null>(null)
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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

  const myBookings = useMemo(() => {
    let list = store.bookings
    if (store.role === 'broker') list = store.bookings.filter(b => b.brokerId === store.currentUser?.uid)
    if (store.role === 'supervisor') list = store.bookings.filter(b => b.status === 'confirmed' || b.status === 'admin_approved')
    if (searchQuery) {
      list = list.filter(b => b.clientName.includes(searchQuery) || b.phoneNumber.includes(searchQuery))
    }
    return list
  }, [store.role, store.bookings, searchQuery])

  // Data for Chart
  const revenueData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو']
    return months.map((m, i) => ({
      name: m,
      revenue: store.bookings
        .filter(b => b.paymentStatus === 'verified' && (i === 4)) // Mocking for May
        .reduce((acc, b) => acc + b.totalAmount, 0) || (i * 15000 + 10000)
    }))
  }, [store.bookings])

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center font-black">جاري تحميل المنظومة...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      
      <header className="bg-white border-b sticky top-0 z-50 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-primary p-2 rounded-xl"><Home className="text-white h-5 w-5" /></div>
             <div className="text-right">
                <h1 className="text-xl font-black text-slate-900 leading-none">فارما بيتش</h1>
                <span className="text-[10px] text-primary font-bold">STUDIO FIREBASS AI</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             {store.role && (
                <div className="flex items-center gap-3">
                    <div className="text-left hidden md:block">
                        <p className="text-xs font-black">{store.currentUser?.name || 'مستخدم تجريبي'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{store.role === 'admin' ? 'مدير عام' : store.role === 'broker' ? 'وسيط عقاري' : 'مشرف ميداني'}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none py-1.5 px-4 rounded-full font-black text-xs">
                        {store.role === 'admin' ? 'مدير' : store.role === 'broker' ? 'بروكر' : store.role === 'supervisor' ? 'مشرف' : 'عميل'}
                    </Badge>
                </div>
             )}
             {store.role && <Button variant="ghost" size="sm" onClick={() => store.setRole(null)} className="rounded-xl"><LogOut className="h-4 w-4" /></Button>}
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {(!store.role || store.role === 'client') && (
          <div className="space-y-0">
            <div className="bg-white py-32 border-b">
               <div className="container mx-auto px-4 text-center space-y-8">
                  <Badge variant="secondary" className="px-6 py-2 rounded-full font-black text-primary bg-primary/5 border-primary/10">أهلاً بك في فخر الساحل</Badge>
                  <h2 className="text-6xl font-black text-slate-900 leading-tight">فخامة <span className="text-primary">الساحل</span> بين يديك</h2>
                  <p className="text-xl font-bold text-slate-500 max-w-2xl mx-auto">نظام الإدارة المركزي لضمان أقصى درجات الرقابة والجودة في التشغيل الفندقي.</p>
                  <div className="flex justify-center gap-4">
                    <Button size="lg" className="rounded-full h-16 px-12 text-xl font-black shadow-xl shadow-primary/20" onClick={() => document.getElementById('units')?.scrollIntoView({behavior: 'smooth'})}>استعرض الشاليهات</Button>
                  </div>
               </div>
            </div>
            <div id="units" className="container mx-auto px-4 py-24">
               <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div className="space-y-2 text-right">
                    <h3 className="text-4xl font-black text-slate-900">الوحدات المتاحة</h3>
                    <p className="text-slate-500 font-bold">اختر وحدتك المفضلة وابدأ حجزك الآن</p>
                  </div>
                  <div className="w-full md:w-96 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="ابحث بالاسم أو الموقع..." className="h-14 rounded-2xl pr-12 text-right bg-white shadow-sm border-slate-100" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {store.chalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />
                  ))}
               </div>
            </div>
          </div>
        )}

        {store.role === 'admin' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <StatCard title="إجمالي الإيرادات" val={store.bookings.filter(b => b.paymentStatus === 'verified').reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="النزلاء بالداخل" val={store.bookings.filter(b => b.opStatus === 'checked_in').length} icon={Activity} color="text-blue-600" />
               <StatCard title="حوالات معلقة" val={store.bookings.filter(b => b.paymentStatus === 'pending').length} icon={AlertTriangle} color="text-orange-600" />
               <StatCard title="إشغال اليوم" val="85%" icon={BarChart3} color="text-purple-600" />
            </div>

            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="bg-white p-2 rounded-[2rem] mb-8 flex flex-wrap justify-start border shadow-sm h-auto">
                <TabsTrigger value="bookings" className="rounded-xl px-6 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">المالية والحجوزات</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-xl px-6 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">إدارة الأصول</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-xl px-6 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">التقارير</TabsTrigger>
                <TabsTrigger value="users" className="rounded-xl px-6 py-3 font-black data-[state=active]:bg-primary data-[state=active]:text-white">فريق العمل</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                 {myBookings.map(b => (
                   <Card key={b.id} className="p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6 border-none shadow-xl bg-white">
                      <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
                         <div className={`p-6 rounded-3xl ${b.paymentStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}><Receipt className="h-10 w-10" /></div>
                         <div className="text-right">
                           <p className="font-black text-2xl">{b.clientName}</p>
                           <p className="text-sm font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name} | {b.totalAmount} ج.م</p>
                           <div className="flex gap-2 mt-3">
                              <Badge className={b.paymentStatus === 'verified' ? 'bg-green-100 text-green-700 border-none' : 'bg-orange-100 text-orange-700 border-none'}>
                                {b.paymentStatus === 'verified' ? 'دفع مؤكد' : 'انتظار مراجعة الحوالة'}
                              </Badge>
                              <Badge variant="outline" className="border-slate-200 text-[10px]">مرجع: {b.paymentReference}</Badge>
                           </div>
                         </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        {b.paymentStatus === 'pending' && (
                          <Button className="flex-1 md:flex-none h-14 px-8 bg-green-600 font-black rounded-2xl shadow-lg shadow-green-200" onClick={() => store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })}>تأكيد الحوالة</Button>
                        )}
                        <Button variant="outline" className="flex-1 md:flex-none h-14 px-6 rounded-2xl font-black gap-2 border-slate-200" onClick={() => toast({ title: "جاري تصدير التقرير المالي..." })}><FileSpreadsheet className="h-4 w-4" /> تصدير PDF</Button>
                      </div>
                   </Card>
                 ))}
              </TabsContent>

              <TabsContent value="chalets" className="space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border shadow-sm gap-6">
                   <div className="text-right">
                     <h3 className="text-3xl font-black">إدارة المحفظة العقارية</h3>
                     <p className="text-slate-500 font-bold">تحكم في الأسعار، التوفر، وحالات الصيانة</p>
                   </div>
                   <Button className="w-full md:w-auto rounded-2xl h-16 px-10 font-black gap-2 text-lg shadow-xl shadow-primary/20" onClick={() => setIsAddChaletOpen(true)}><Plus /> إضافة وحدة</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {store.chalets.map(c => (
                      <Card key={c.id} className="rounded-[3rem] overflow-hidden bg-white border-none shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                         <div className="h-56 relative overflow-hidden">
                           <Image src={c.image} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                           <Badge className="absolute top-6 right-6 bg-white/90 text-slate-900 font-black backdrop-blur-md border-none px-4 py-2">{c.city}</Badge>
                         </div>
                         <div className="p-8 space-y-6">
                            <h4 className="font-black text-xl text-right">{c.name}</h4>
                            <div className="flex gap-2">
                               <Button variant="secondary" className="flex-1 h-12 rounded-xl font-black bg-slate-100 text-slate-900" onClick={() => setViewingDetailsChalet(c)}>السجل والتفاصيل</Button>
                               <Button variant="ghost" className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-5 w-5" /></Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl space-y-6">
                       <h3 className="text-2xl font-black text-right flex items-center justify-end gap-2">نمو الإيرادات الشهري <TrendingUp className="text-green-500" /></h3>
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} />
                               <XAxis dataKey="name" />
                               <YAxis />
                               <Tooltip content={<ChartTooltipContent />} />
                               <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </Card>
                    <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl space-y-6">
                       <h3 className="text-2xl font-black text-right flex items-center justify-end gap-2">توزيع الحجوزات <BarChart3 className="text-blue-500" /></h3>
                       <div className="space-y-4">
                          {store.chalets.slice(0, 4).map(c => {
                             const count = store.bookings.filter(b => b.chaletId === c.id).length
                             return (
                               <div key={c.id} className="flex flex-row-reverse justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                  <span className="font-black">{c.name}</span>
                                  <div className="flex items-center gap-4">
                                     <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${(count / 10) * 100}%` }}></div>
                                     </div>
                                     <span className="font-bold text-primary">{count} حجز</span>
                                  </div>
                               </div>
                             )
                          })}
                       </div>
                    </Card>
                 </div>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-6">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border shadow-sm gap-6">
                   <div className="text-right">
                     <h3 className="text-3xl font-black">فريق العمل</h3>
                     <p className="text-slate-500 font-bold">إدارة المشرفين، البروكرز، وصلاحيات الوصول</p>
                   </div>
                   <Button className="w-full md:w-auto rounded-2xl h-16 px-10 font-black gap-2 text-lg shadow-xl shadow-primary/20" onClick={() => setIsAddUserOpen(true)}><Users /> إضافة موظف</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {store.users.map(u => (
                      <Card key={u.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl flex items-center gap-6">
                         <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-primary"><Users className="h-8 w-8" /></div>
                         <div className="text-right flex-1">
                            <p className="font-black text-xl">{u.name}</p>
                            <Badge className="mt-1 bg-slate-50 text-slate-600 border-none">{u.role === 'broker' ? 'وسيط' : 'مشرف'}</Badge>
                         </div>
                         <Button variant="ghost" className="h-10 w-10 text-destructive hover:bg-destructive/10" onClick={() => toast({ title: "لا يمكن حذف موظف تجريبي" })}><XCircle /></Button>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {store.role === 'broker' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatCard title="عمولاتي المستحقة" val={store.bookings.filter(b => b.brokerId === store.currentUser?.uid && b.paymentStatus === 'verified').reduce((acc, b) => acc + (b.brokerCommission || 0), 0).toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="طلبات معلقة" val={myBookings.filter(b => b.status === 'pending').length} icon={Clock} color="text-orange-600" />
               <StatCard title="إجمالي مبيعاتي" val={myBookings.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString() + ' ج.م'} icon={TrendingUp} color="text-blue-600" />
            </div>

            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="bg-white p-2 rounded-[2rem] mb-8 flex border shadow-sm h-auto">
                <TabsTrigger value="inventory" className="rounded-xl px-10 py-3 font-black">الوحدات المتاحة</TabsTrigger>
                <TabsTrigger value="crm" className="rounded-xl px-10 py-3 font-black">العملاء والحجوزات</TabsTrigger>
              </TabsList>

              <TabsContent value="inventory" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {myChalets.map(c => (
                   <ChaletCard key={c.id} chalet={c} onBook={() => setViewingDetailsChalet(c)} />
                 ))}
              </TabsContent>

              <TabsContent value="crm" className="space-y-6">
                 {myBookings.map(b => (
                   <Card key={b.id} className="p-10 rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="text-right flex-1 space-y-3 w-full">
                        <div className="flex items-center gap-3">
                          <p className="font-black text-2xl">{b.clientName}</p>
                          <Badge className="bg-blue-50 text-blue-700 border-none">{b.status === 'pending' ? 'بانتظار موافقة الأدمن' : 'حجز مؤكد'}</Badge>
                        </div>
                        <p className="text-lg font-bold text-slate-500">{b.phoneNumber} | {store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <Button className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black bg-blue-600 shadow-lg shadow-blue-100 gap-2" onClick={() => toast({ title: "سيتم تفعيل الدردشة قريباً" })}><MessageSquare className="h-5 w-5" /> دردشة العميل</Button>
                        <Button variant="outline" className="flex-1 md:flex-none rounded-2xl h-14 px-6 font-black gap-2 border-slate-200" onClick={() => setViewingDetailsChalet(store.chalets.find(c => c.id === b.chaletId) || null)}><History className="h-5 w-5" /> سجل الوحدة</Button>
                      </div>
                   </Card>
                 ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {store.role === 'supervisor' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="مهام اليوم" val={myBookings.length} icon={ClipboardCheck} color="text-primary" />
              <StatCard title="وحدات بحاجة تنظيف" val="2" icon={Sparkles} color="text-orange-600" />
              <StatCard title="المستلزمات" val="متوفر" icon={Box} color="text-green-600" />
            </div>

            <div className="space-y-8">
               <h3 className="text-3xl font-black text-right px-4 flex items-center justify-end gap-3">المهام الميدانية <Activity className="text-primary" /></h3>
               {myBookings.map(b => (
                 <Card key={b.id} className="p-10 rounded-[3.5rem] shadow-2xl border-none bg-white hover:shadow-primary/5 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-10">
                       <div className="text-right space-y-4 flex-1 w-full">
                          <div className="flex items-center gap-4 flex-row-reverse">
                            <h3 className="text-3xl font-black text-slate-900">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                            <Badge className="h-8 px-4 rounded-xl bg-slate-100 text-slate-700 border-none font-black">{b.opStatus === 'waiting' ? 'بانتظار وصول' : 'بالداخل الآن'}</Badge>
                          </div>
                          <p className="text-xl font-bold text-slate-600">النزيل: {b.clientName} | <span className="text-primary underline">{b.phoneNumber}</span></p>
                       </div>
                       <div className="flex flex-col gap-4 w-full md:w-auto min-w-[250px]">
                          {b.opStatus === 'waiting' && (
                            <Button className="h-20 rounded-[1.5rem] font-black bg-primary text-white text-xl shadow-xl shadow-primary/20" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>تسجيل دخول العميل</Button>
                          )}
                          {b.opStatus === 'checked_in' && (
                            <Button className="h-20 rounded-[1.5rem] font-black bg-orange-600 text-white text-xl shadow-xl shadow-orange-100" onClick={() => toast({ title: "تم فتح نموذج الفحص النهائي والمخزون" })}>تسجيل خروج وفحص</Button>
                          )}
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
          </div>
        )}

      </main>

      <RoleSwitcher currentRole={store.role} onRoleChange={store.setRole} />

      <footer className="bg-slate-900 text-white py-24 mt-24 border-t-8 border-primary">
         <div className="container mx-auto px-4 text-center space-y-8">
            <h3 className="text-4xl font-black">فارما بيتش ريزورت</h3>
            <p className="text-slate-400 font-bold max-w-2xl mx-auto leading-loose text-lg">نظام الإدارة المركزي المتكامل لمنتجع فارما بيتش</p>
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
