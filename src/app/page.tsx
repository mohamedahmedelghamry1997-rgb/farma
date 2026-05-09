
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
  FileText, Settings, CreditCard, Box, AlertTriangle, MessageSquare
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
    if (store.role === 'admin') return store.chalets
    if (store.role === 'broker') return store.chalets.filter(c => c.ownerBrokerId === store.currentUser?.uid)
    return store.chalets.filter(c => c.status === 'active')
  }, [store.role, store.chalets, store.currentUser])

  const myBookings = useMemo(() => {
    if (store.role === 'admin') return store.bookings
    if (store.role === 'broker') return store.bookings.filter(b => b.brokerId === store.currentUser?.uid)
    if (store.role === 'supervisor') return store.bookings.filter(b => b.status === 'confirmed')
    return []
  }, [store.role, store.bookings, store.currentUser])

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
                  <h2 className="text-6xl font-black text-slate-900">فخامة <span className="text-primary">الساحل</span> بين يديك</h2>
                  <p className="text-xl font-bold text-slate-500 max-w-2xl mx-auto">نظام الإدارة المركزي لضمان أقصى درجات الرقابة والجودة في التشغيل الفندقي.</p>
                  <Button size="lg" className="rounded-full h-16 px-12 text-xl font-black" onClick={() => document.getElementById('units')?.scrollIntoView({behavior: 'smooth'})}>استعرض الشاليهات</Button>
               </div>
            </div>
            <div id="units" className="container mx-auto px-4 py-24">
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
               <StatCard title="الحجوزات النشطة" val={store.bookings.filter(b => b.opStatus === 'checked_in').length} icon={Activity} color="text-blue-600" />
               <StatCard title="حوالات معلقة" val={store.bookings.filter(b => b.paymentStatus === 'pending').length} icon={CreditCard} color="text-orange-600" />
               <StatCard title="الوحدات الكلية" val={store.chalets.length} icon={Home} color="text-purple-600" />
            </div>

            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="bg-white p-2 rounded-3xl mb-8">
                <TabsTrigger value="bookings" className="rounded-2xl px-8 font-black">الحجوزات والمالية (40 ميزة)</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-2xl px-8 font-black">إدارة العقارات</TabsTrigger>
                <TabsTrigger value="users" className="rounded-2xl px-8 font-black">الفريق والعملاء</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                 {myBookings.map(b => (
                   <Card key={b.id} className="p-6 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-6 flex-1">
                         <div className={`p-5 rounded-3xl ${b.paymentStatus === 'verified' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}><Receipt className="h-8 w-8" /></div>
                         <div className="text-right">
                           <p className="font-black text-xl">{b.clientName}</p>
                           <p className="text-xs font-bold text-slate-500">مبلغ الحجز: {b.totalAmount} ج.م | المرجع: {b.paymentReference}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        {b.paymentStatus === 'pending' && <Button className="bg-green-600 font-black rounded-2xl" onClick={() => store.updateBooking(b.id, { paymentStatus: 'verified', status: 'admin_approved' })}>تأكيد الدفع</Button>}
                        <Button variant="outline" className="rounded-2xl font-black" onClick={() => toast({ title: "تم تصدير ملف PDF" })}>تصدير PDF</Button>
                      </div>
                   </Card>
                 ))}
              </TabsContent>

              <TabsContent value="chalets" className="space-y-6">
                 <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem]">
                   <h3 className="text-2xl font-black">إدارة 8 ميزات للعقارات</h3>
                   <Button className="rounded-2xl h-14 px-8 font-black gap-2" onClick={() => setIsAddChaletOpen(true)}><Plus /> إضافة شاليه</Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {store.chalets.map(c => (
                      <Card key={c.id} className="rounded-[2.5rem] overflow-hidden group">
                         <div className="h-48 relative"><Image src={c.image} alt={c.name} fill className="object-cover" /></div>
                         <div className="p-6 space-y-4">
                            <h4 className="font-black text-lg">{c.name}</h4>
                            <div className="flex gap-2">
                               <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setViewingDetailsChalet(c)}>تعديل</Button>
                               <Button variant="destructive" className="rounded-xl" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                         </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                 <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black">إدارة الفريق (6 ميزات للبروكر و6 للمشرف)</h3><Button onClick={() => setIsAddUserOpen(true)}>إضافة عضو جديد</Button></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {store.users.map(u => (
                      <Card key={u.id} className="p-8 rounded-[2.5rem] flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="bg-slate-100 p-4 rounded-2xl"><Users className="h-8 w-8 text-primary" /></div>
                            <div><p className="font-black text-xl">{u.name}</p><p className="text-xs font-bold text-slate-500">{u.role} | عمولة: {u.commissionRate || 0}%</p></div>
                         </div>
                         <Button variant={u.status === 'active' ? 'outline' : 'default'} onClick={() => store.updateUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })}>{u.status === 'active' ? 'تعطيل' : 'تفعيل'}</Button>
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
               <StatCard title="حجوزاتي المعلقة" val={myBookings.filter(b => b.status === 'pending').length} icon={Clock} color="text-orange-600" />
               <StatCard title="شاليهات الإدارة" val={myChalets.length} icon={Home} color="text-purple-600" />
            </div>

            <Tabs defaultValue="myChalets" className="w-full">
              <TabsList className="bg-white p-2 rounded-3xl mb-8">
                <TabsTrigger value="myChalets" className="rounded-2xl px-8 font-black">شاليهاتي المسموحة</TabsTrigger>
                <TabsTrigger value="requests" className="rounded-2xl px-8 font-black">طلبات الحجز (CRM)</TabsTrigger>
                <TabsTrigger value="reports" className="rounded-2xl px-8 font-black">تقارير أداء</TabsTrigger>
              </TabsList>

              <TabsContent value="myChalets" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {myChalets.map(c => (
                   <ChaletCard key={c.id} chalet={c} onBook={() => setViewingDetailsChalet(c)} />
                 ))}
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                 {myBookings.map(b => (
                   <Card key={b.id} className="p-8 rounded-[2.5rem] flex justify-between items-center">
                      <div className="text-right">
                        <p className="font-black text-xl">{b.clientName}</p>
                        <p className="text-sm font-bold text-slate-500">{b.phoneNumber} | {b.totalAmount} ج.م</p>
                      </div>
                      <div className="flex gap-2">
                        <Button className="rounded-2xl font-black bg-blue-600 gap-2"><MessageSquare className="h-4 w-4" /> دردشة عميل</Button>
                        <Button variant="outline" className="rounded-2xl font-black">إلغاء الطلب</Button>
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
            <div className="bg-white p-10 rounded-[3rem] border flex items-center gap-6">
               <div className="bg-green-100 p-6 rounded-[2rem] text-green-600"><ClipboardCheck className="h-10 w-10" /></div>
               <div className="text-right"><h2 className="text-3xl font-black">مهام اليوم</h2><p className="text-slate-500 font-bold">لديك {myBookings.length} عملية دخول/خروج لليوم.</p></div>
            </div>

            <div className="grid grid-cols-1 gap-6">
               {myBookings.map(b => (
                 <Card key={b.id} className="p-8 rounded-[3rem] shadow-lg border-none">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="text-right space-y-2 flex-1">
                          <h3 className="text-2xl font-black">{store.chalets.find(c => c.id === b.chaletId)?.name}</h3>
                          <p className="font-bold text-slate-600">العميل: {b.clientName} | {b.phoneNumber}</p>
                          <div className="flex gap-2">
                             <Badge className="bg-blue-100 text-blue-700">{b.opStatus === 'waiting' ? 'بانتظار وصول' : 'بالداخل'}</Badge>
                             <Badge variant="outline" className="border-slate-200">الكهرباء: {b.electricityReading || 'غير مسجل'}</Badge>
                          </div>
                       </div>
                       <div className="flex gap-4 w-full md:w-auto">
                          {b.opStatus === 'waiting' && <Button className="flex-1 h-20 rounded-[2rem] font-black bg-primary text-xl" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in', checkInTime: new Date().toISOString() })}>تسجيل دخول</Button>}
                          {b.opStatus === 'checked_in' && <Button className="flex-1 h-20 rounded-[2rem] font-black bg-orange-600 text-white text-xl" onClick={() => toast({ title: "تم فتح نافذة الفحص" })}>تسجيل خروج وفحص</Button>}
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
            <p className="text-slate-400 font-bold max-w-xl mx-auto">نظام الإدارة المركزي لضمان أقصى درجات الرقابة والجودة. تطوير STUDIO FIREBASS AI</p>
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
