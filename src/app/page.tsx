
"use client"

import { useState, useMemo } from 'react'
import { useAppStore, Booking, Chalet, UserProfile, UserRole } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, Home, CheckCircle2, XCircle, Plus, Trash2, MapPin, Phone, LogOut, Briefcase, 
  ClipboardCheck, Wallet, Receipt, Search, Activity, ShieldCheck, ArrowRight, 
  TrendingUp, Clock, LayoutDashboard, Star, ChevronLeft, Calendar as CalendarIcon, 
  FileText, Settings, CreditCard, Box, AlertTriangle, MessageSquare, Tag, Scissors,
  Percent, FileSpreadsheet, ShieldAlert, Droplets, Zap, Sparkles
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
  
  // States
  const [viewingDetailsChalet, setViewingDetailsChalet] = useState<Chalet | null>(null)
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtered Logic
  const myChalets = useMemo(() => {
    let list = store.chalets
    if (store.role === 'broker') list = store.chalets.filter(c => c.ownerBrokerId === store.currentUser?.uid || c.status === 'active')
    if (searchQuery) {
      list = list.filter(c => c.name.includes(searchQuery) || c.location.includes(searchQuery))
    }
    return list
  }, [store.role, store.chalets, store.currentUser, searchQuery])

  const myBookings = useMemo(() => {
    let list = store.bookings
    if (store.role === 'broker') list = store.bookings.filter(b => b.brokerId === store.currentUser?.uid)
    if (store.role === 'supervisor') list = store.bookings.filter(b => b.status === 'confirmed')
    if (searchQuery) {
      list = list.filter(b => b.clientName.includes(searchQuery) || b.phoneNumber.includes(searchQuery))
    }
    return list
  }, [store.role, store.bookings, store.currentUser, searchQuery])

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center font-black">جاري تحميل المنظومة...</div>

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-50 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-primary p-2 rounded-xl"><Home className="text-white h-5 w-5" /></div>
             <h1 className="text-xl font-black text-slate-900 leading-none">فارما بيتش <span className="text-[10px] text-primary block">STUDIO FIREBASS AI</span></h1>
          </div>
          <div className="flex items-center gap-4">
             {store.role && <Badge className="bg-slate-100 text-slate-900 py-1.5 px-4 rounded-full font-black text-xs">{store.role === 'admin' ? 'مدير' : store.role === 'broker' ? 'بروكر' : store.role === 'supervisor' ? 'مشرف' : 'عميل'}</Badge>}
             {store.role && <Button variant="ghost" size="sm" onClick={() => store.setRole(null)}><LogOut className="h-4 w-4" /></Button>}
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* LANDING PAGE */}
        {(!store.role || store.role === 'client') && (
          <div className="space-y-0">
            <div className="bg-white py-32 border-b">
               <div className="container mx-auto px-4 text-center space-y-8">
                  <Badge variant="secondary" className="px-6 py-2 rounded-full font-black text-primary">أهلاً بك في فخر الساحل</Badge>
                  <h2 className="text-6xl font-black text-slate-900 leading-tight">فخامة <span className="text-primary">الساحل</span> بين يديك</h2>
                  <p className="text-xl font-bold text-slate-500 max-w-2xl mx-auto">نظام الإدارة المركزي لضمان أقصى درجات الرقابة والجودة في التشغيل الفندقي. استمتع بأرقى الشاليهات في الساحل والسخنة.</p>
                  <div className="flex justify-center gap-4">
                    <Button size="lg" className="rounded-full h-16 px-12 text-xl font-black" onClick={() => document.getElementById('units')?.scrollIntoView({behavior: 'smooth'})}>استعرض الشاليهات</Button>
                    <Button size="lg" variant="outline" className="rounded-full h-16 px-12 text-xl font-black">احجز بالهاتف</Button>
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
                    <Input placeholder="ابحث بالاسم أو الموقع..." className="h-14 rounded-2xl pr-12 text-right bg-white shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {store.chalets.filter(c => c.status === 'active').map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />
                  ))}
               </div>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {store.role === 'admin' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <StatCard title="إجمالي الإيرادات" val={store.bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="النزلاء بالداخل" val={store.bookings.filter(b => b.opStatus === 'checked_in').length} icon={Activity} color="text-blue-600" />
               <StatCard title="كوبونات نشطة" val={store.coupons?.filter(c => c.isActive).length || 0} icon={Percent} color="text-orange-600" />
               <StatCard title="الوحدات الكلية" val={store.chalets.length} icon={Home} color="text-purple-600" />
            </div>

            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="bg-white p-2 rounded-3xl mb-8 flex flex-wrap justify-start">
                <TabsTrigger value="bookings" className="rounded-2xl px-6 font-black">الحجوزات والمالية</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-2xl px-6 font-black">إدارة العقارات</TabsTrigger>
                <TabsTrigger value="users" className="rounded-2xl px-6 font-black">الفريق</TabsTrigger>
                <TabsTrigger value="marketing" className="rounded-2xl px-6 font-black">التسويق والكوبونات</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-2xl px-6 font-black">التقارير</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                 {myBookings.map(b => (
                   <Card key={b.id} className="p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-6 flex-1">
                         <div className={`p-5 rounded-3xl ${b.paymentStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}><Receipt className="h-8 w-8" /></div>
                         <div className="text-right">
                           <p className="font-black text-xl">{b.clientName}</p>
                           <p className="text-xs font-bold text-slate-500">مبلغ الحجز: {b.totalAmount} ج.م | المرجع: {b.paymentReference}</p>
                           <Badge variant="outline" className="mt-2">{b.paymentStatus === 'verified' ? 'دفع مؤكد' : 'انتظار تأكيد مالي'}</Badge>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        {b.paymentStatus === 'pending' && <Button className="bg-green-600 font-black rounded-2xl" onClick={() => store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })}>تأكيد الدفع</Button>}
                        <Button variant="outline" className="rounded-2xl font-black gap-2"><FileSpreadsheet className="h-4 w-4" /> تصدير PDF</Button>
                      </div>
                   </Card>
                 ))}
              </TabsContent>

              <TabsContent value="chalets" className="space-y-6">
                 <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem]">
                   <h3 className="text-2xl font-black">إدارة الأصول والعقارات</h3>
                   <div className="flex gap-3">
                     <Button variant="outline" className="rounded-2xl font-black" onClick={() => toast({ title: "تم تحديث الأسعار الموسمية" })}>تحديث أسعار المواسم</Button>
                     <Button className="rounded-2xl h-14 px-8 font-black gap-2" onClick={() => setIsAddChaletOpen(true)}><Plus /> إضافة شاليه</Button>
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {store.chalets.map(c => (
                      <Card key={c.id} className="rounded-[2.5rem] overflow-hidden group">
                         <div className="h-48 relative"><Image src={c.image} alt={c.name} fill className="object-cover" /></div>
                         <div className="p-6 space-y-4">
                            <h4 className="font-black text-lg">{c.name}</h4>
                            <div className="flex flex-wrap gap-2">
                               <Badge className="bg-slate-100 text-slate-600">{c.city}</Badge>
                               <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{c.status === 'active' ? 'نشط' : 'تحت الصيانة'}</Badge>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setViewingDetailsChalet(c)}>تفاصيل وسجل</Button>
                               <Button variant="destructive" className="rounded-xl" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="marketing" className="space-y-6">
                 <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem]">
                   <h3 className="text-2xl font-black">إدارة كوبونات الخصم والعروض</h3>
                   <Button className="rounded-2xl h-14 px-8 font-black gap-2"><Tag /> إنشاء كوبون</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {store.coupons?.map(cp => (
                      <Card key={cp.id} className="p-6 rounded-[2rem] border-dashed border-2 flex justify-between items-center bg-white">
                         <div className="text-right">
                           <p className="font-black text-2xl text-primary">{cp.code}</p>
                           <p className="text-xs font-bold text-slate-500">خصم {cp.value}{cp.discountType === 'percentage' ? '%' : ' ج.م'}</p>
                         </div>
                         <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-5 w-5" /></Button>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* BROKER DASHBOARD */}
        {store.role === 'broker' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatCard title="عمولاتي المستحقة" val={(store.bookings.filter(b => b.brokerId === store.currentUser?.uid && b.paymentStatus === 'verified').reduce((acc, b) => acc + (b.brokerCommission || 0), 0)).toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="طلبات معلقة" val={myBookings.filter(b => b.status === 'pending').length} icon={Clock} color="text-orange-600" />
               <StatCard title="أدائي الشهري" val="92%" icon={TrendingUp} color="text-blue-600" />
            </div>

            <Tabs defaultValue="myChalets" className="w-full">
              <TabsList className="bg-white p-2 rounded-3xl mb-8 flex flex-wrap">
                <TabsTrigger value="myChalets" className="rounded-2xl px-8 font-black">الشاليهات المتاحة</TabsTrigger>
                <TabsTrigger value="requests" className="rounded-2xl px-8 font-black">طلبات الحجز و CRM</TabsTrigger>
                <TabsTrigger value="internal" className="rounded-2xl px-8 font-black">ملاحظات ودردشة</TabsTrigger>
              </TabsList>

              <TabsContent value="myChalets" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {myChalets.map(c => (
                   <ChaletCard key={c.id} chalet={c} onBook={() => setViewingDetailsChalet(c)} />
                 ))}
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                 {myBookings.map(b => (
                   <Card key={b.id} className="p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center bg-white gap-6">
                      <div className="text-right flex-1">
                        <p className="font-black text-xl">{b.clientName}</p>
                        <p className="text-sm font-bold text-slate-500">{b.phoneNumber} | {b.totalAmount} ج.م</p>
                        <Badge className="mt-2 bg-blue-50 text-blue-600 border-none">{b.status === 'pending' ? 'انتظار الموافقة' : 'مؤكد'}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button className="rounded-2xl font-black bg-blue-600 gap-2"><MessageSquare className="h-4 w-4" /> دردشة العميل</Button>
                        <Button variant="outline" className="rounded-2xl font-black" onClick={() => toast({ title: "تم إرسال طلب الصيانة للمشرف" })}><Settings className="h-4 w-4 ml-2" /> طلب صيانة</Button>
                      </div>
                   </Card>
                 ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* SUPERVISOR DASHBOARD */}
        {store.role === 'supervisor' && (
          <div className="container mx-auto px-4 py-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="مهام اليوم" val={myBookings.length} icon={ClipboardCheck} color="text-primary" />
              <StatCard title="حالات الطوارئ" val="0" icon={AlertTriangle} color="text-red-600" />
              <StatCard title="مخزون المستلزمات" val="كافي" icon={Box} color="text-green-600" />
            </div>

            <div className="grid grid-cols-1 gap-6">
               <h3 className="text-2xl font-black text-right px-4">العمليات الميدانية</h3>
               {myBookings.map(b => (
                 <Card key={b.id} className="p-8 rounded-[3rem] shadow-lg border-none bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="text-right space-y-3 flex-1">
                          <h3 className="text-2xl font-black text-slate-900">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                          <p className="font-bold text-slate-600">العميل: {b.clientName} | {b.phoneNumber}</p>
                          <div className="flex flex-wrap gap-2">
                             <Badge className="bg-blue-100 text-blue-700 py-2 px-4 rounded-xl">{b.opStatus === 'waiting' ? 'بانتظار وصول' : 'بالداخل'}</Badge>
                             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl text-xs font-bold">
                               <Zap className="h-3 w-3 text-yellow-500" /> كهرباء: {b.electricityReading || 'لم يسجل'}
                             </div>
                             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl text-xs font-bold">
                               <Droplets className="h-3 w-3 text-blue-500" /> مياه: {b.waterReading || 'لم يسجل'}
                             </div>
                          </div>
                       </div>
                       <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                          {b.opStatus === 'waiting' && (
                            <Button className="h-16 rounded-2xl font-black bg-primary text-lg" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>تسجيل دخول</Button>
                          )}
                          {b.opStatus === 'checked_in' && (
                            <Button className="h-16 rounded-2xl font-black bg-orange-600 text-white text-lg" onClick={() => toast({ title: "تم فتح نافذة الفحص النهائي" })}>تسجيل خروج وفحص</Button>
                          )}
                          <Button variant="outline" className="h-12 rounded-xl font-bold gap-2 text-slate-500"><Sparkles className="h-4 w-4" /> طلب مستلزمات</Button>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
          </div>
        )}

      </main>

      <RoleSwitcher currentRole={store.role} onRoleChange={store.setRole} />

      <footer className="bg-slate-900 text-white py-20 mt-20 border-t-8 border-primary">
         <div className="container mx-auto px-4 text-center space-y-6">
            <h3 className="text-3xl font-black">فارما بيتش ريزورت</h3>
            <p className="text-slate-400 font-bold max-w-xl mx-auto">نظام الإدارة المركزي المتكامل لضمان أقصى درجات الرقابة والجودة. تطوير STUDIO FIREBASS AI</p>
         </div>
      </footer>

      {/* DIALOGS */}
      <ChaletDetailsDialog chalet={viewingDetailsChalet} isOpen={!!viewingDetailsChalet} onClose={() => setViewingDetailsChalet(null)} onBook={() => { setSelectedChalet(viewingDetailsChalet); setIsBookingOpen(true); setViewingDetailsChalet(null); }} existingBookings={store.bookings} />
      <BookingDialog chalet={selectedChalet} isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} onConfirm={(data) => { store.addBooking({ ...data, brokerId: store.role === 'broker' ? store.currentUser?.uid : undefined }); toast({ title: "تم إرسال الطلب للمراجعة" }); }} existingBookings={store.bookings} />
      <AddChaletDialog isOpen={isAddChaletOpen} onClose={() => setIsAddChaletOpen(false)} onAdd={(data) => { store.addChalet(data); toast({ title: "تمت إضافة الشاليه" }); }} />
      <AddUserDialog isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} onAdd={(data) => { store.addUser(data); toast({ title: "تمت إضافة الموظف" }); }} chalets={store.chalets} />

    </div>
  )
}

function StatCard({ title, val, icon: Icon, color }: any) {
  return (
    <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-sm flex items-center gap-6">
       <div className={`${color} bg-slate-50 p-4 rounded-3xl`}><Icon className="h-8 w-8" /></div>
       <div className="text-right">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
         <p className="text-2xl font-black text-slate-900">{val}</p>
       </div>
    </Card>
  )
}
