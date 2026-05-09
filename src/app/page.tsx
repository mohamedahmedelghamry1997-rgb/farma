
"use client"

import { useState, useEffect } from 'react'
import { useAppStore, Booking, Chalet, User } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Home, 
  Calendar as CalendarIcon, 
  ClipboardList, 
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
  RotateCcw,
  Filter,
  LogOut,
  Mail,
  Map
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-pulse font-bold text-primary">جاري تحميل فارما بيتش...</div></div>

  const handleBookingConfirm = (data: any) => {
    store.addBooking({
      ...data,
      brokerId: store.role === 'broker' ? store.currentUser?.id : undefined
    })
    toast({ title: "تم إرسال الطلب بنجاح", description: "سيقوم الإدمن بمراجعة حجزك قريباً." })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right" dir="rtl">
      {/* Top Bar - Purple Gradient */}
      <div className="top-bar-gradient text-white py-2 px-4">
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
              <span className="font-bold">+20 100 123 4567</span>
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
               <span>العربية</span>
               <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <nav className="hidden md:flex items-center gap-8 text-slate-700 font-bold">
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">الرئيسية</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">من نحن</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">اتصل بنا</a>
            <a href="#" className="text-primary border-b-2 border-primary pb-1">الشاليهات</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="text-left hidden md:block">
              <h1 className="text-lg font-black text-slate-800 leading-none">فارما بيتش</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pharma Beach Resort</p>
            </div>
            <div className="bg-[#fecaca] p-2 rounded-full h-12 w-12 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-2 ring-primary/10">
               <Home className="text-[#991b1b] h-6 w-6" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {!store.role ? (
          <div className="container mx-auto px-4 py-20 max-w-lg">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">مرحباً بك في فارما بيتش</h2>
                <p className="text-slate-400 font-medium text-sm">نظام إدارة الشاليهات المتكامل</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button onClick={() => store.setRole('client')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 shadow-none">دخول كعميل</Button>
                <Button onClick={() => store.setRole('broker')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 shadow-none">دخول كبروكر</Button>
                <Button onClick={() => store.setRole('supervisor')} size="lg" className="h-16 text-lg rounded-2xl bg-slate-50 text-slate-900 border-2 border-slate-100 hover:bg-slate-100 shadow-none">دخول كمشرف</Button>
                <Button onClick={() => store.setRole('admin')} size="lg" className="h-16 text-lg rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">دخول كأدمن</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8 pb-32">
            
            {/* ---------------- CLIENT VIEW ---------------- */}
            {store.role === 'client' && (
              <div className="space-y-12">
                {/* Advanced Filter Section - Light Blue Background */}
                <div className="filter-container">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    <div className="space-y-1">
                      <Select>
                        <SelectTrigger className="bg-white rounded-md border-none shadow-sm h-12 text-right">
                          <SelectValue placeholder="فلتر حسب المدينة (الكل)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north-coast">الساحل الشمالي</SelectItem>
                          <SelectItem value="sokhna">العين السخنة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Select>
                        <SelectTrigger className="bg-white rounded-md border-none shadow-sm h-12 text-right">
                          <SelectValue placeholder="فلتر حسب السعر (الكل)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">من الأقل للأعلى</SelectItem>
                          <SelectItem value="high">من الأعلى للأقل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Select>
                        <SelectTrigger className="bg-white rounded-md border-none shadow-sm h-12 text-right">
                          <SelectValue placeholder="فلتر حسب النطاق السعري" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000-2000">1000 - 2000 ج.م</SelectItem>
                          <SelectItem value="2000-5000">2000 - 5000 ج.م</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] h-12 rounded-md gap-2 font-bold text-white shadow-lg shadow-blue-500/20">
                       <Filter className="h-4 w-4" /> تصفية النتائج
                    </Button>
                    <Button variant="outline" className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] h-12 rounded-md border-none font-bold">
                       <RotateCcw className="h-4 w-4" /> إعادة ضبط
                    </Button>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-black text-slate-800 relative inline-block">
                    شاليهاتنا المميزة في مصر
                    <div className="h-1.5 w-16 bg-primary mx-auto mt-4 rounded-full"></div>
                  </h2>
                  <p className="text-slate-400 font-medium">اختر وجهتك المثالية لقضاء أجمل الأوقات في الساحل والسخنة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {store.chalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => { setSelectedChalet(chalet); setIsBookingOpen(true); }} />
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- BROKER VIEW ---------------- */}
            {store.role === 'broker' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="text-right">
                    <h2 className="text-2xl font-black text-primary">لوحة تحكم البروكر</h2>
                    <p className="text-slate-500 font-bold">أهلاً بك، {store.currentUser?.name}</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-2xl flex items-center gap-4 border border-primary/20">
                     <div className="text-right">
                       <p className="text-[10px] font-bold text-primary uppercase">كود الإحالة الخاص بك</p>
                       <p className="text-sm font-black text-slate-800">PB-REF-{store.currentUser?.id}</p>
                     </div>
                     <Button size="sm" variant="outline" className="rounded-xl font-bold border-primary/20 text-primary">نسخ الرابط</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">حجوزات عملائك <Badge className="bg-primary/10 text-primary">{store.bookings.filter(b => b.brokerId === store.currentUser?.id).length}</Badge></h3>
                    <div className="grid grid-cols-1 gap-4">
                      {store.bookings.filter(b => b.brokerId === store.currentUser?.id).length === 0 ? (
                        <Card className="p-20 text-center text-slate-400 border-dashed rounded-3xl bg-white/50">لا توجد حجوزات مسجلة باسمك بعد</Card>
                      ) : (
                        store.bookings.filter(b => b.brokerId === store.currentUser?.id).map(b => (
                          <Card key={b.id} className="p-6 rounded-2xl flex justify-between items-center hover:shadow-lg transition-all border-none bg-white">
                            <div className="text-right space-y-2">
                               <div className="flex items-center gap-2">
                                  <p className="font-black text-primary text-lg">{b.clientName}</p>
                                  <Badge variant="outline" className="text-[10px] font-bold">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                               </div>
                               <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                 <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</span>
                                 <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.guestCount} أشخاص</span>
                               </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                               <Badge className={`rounded-lg px-4 py-1.5 font-bold ${b.status === 'confirmed' ? 'bg-green-500' : b.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}`}>
                                 {b.status === 'confirmed' ? 'حجز مؤكد' : b.status === 'cancelled' ? 'تم الإلغاء' : 'في انتظار الأدمن'}
                               </Badge>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-black text-xl text-slate-800">الشاليهات المسؤولة</h3>
                    <div className="grid grid-cols-1 gap-4">
                       {store.chalets.filter(c => store.currentUser?.assignedChaletIds?.includes(c.id)).map(c => (
                         <Card key={c.id} className="p-4 rounded-2xl flex gap-4 items-center border-none shadow-sm bg-white hover:scale-[1.02] transition-transform">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md">
                               <img src={c.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-800">{c.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                <MapPin className="h-3 w-3" /> {c.location}
                              </div>
                              <p className="text-red-500 font-black text-xs mt-2">{c.normalPrice} ج.م</p>
                            </div>
                         </Card>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- SUPERVISOR VIEW ---------------- */}
            {store.role === 'supervisor' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border-r-8 border-r-primary">
                  <h2 className="text-2xl font-black text-slate-900">إدارة العمليات الميدانية</h2>
                  <p className="text-slate-500 font-bold">تسجيل الدخول والخروج ومعاينة الحالة</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {store.bookings.filter(b => b.status === 'confirmed' && b.opStatus !== 'checked_out').length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                      <ClipboardList size={64} className="mb-4 opacity-20" />
                      <p className="font-bold text-xl">لا توجد عمليات حجز نشطة حالياً</p>
                    </div>
                  ) : (
                    store.bookings.filter(b => b.status === 'confirmed' && b.opStatus !== 'checked_out').map(b => (
                      <Card key={b.id} className="overflow-hidden rounded-3xl border-none shadow-xl bg-white">
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                               <Badge className="bg-primary/10 text-primary font-bold px-4 rounded-full border-none">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                               <div className={`h-3 w-3 rounded-full animate-pulse ${b.opStatus === 'checked_in' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                            </div>
                            
                            <div className="text-right space-y-1">
                               <h3 className="text-2xl font-black text-slate-800">{b.clientName}</h3>
                               <p className="text-sm font-bold text-slate-400 flex items-center justify-end gap-2">{b.phoneNumber} <Phone className="h-3 w-3" /></p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                               <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">تاريخ الحجز</p>
                                  <p className="text-sm font-black">{format(new Date(b.startDate), 'dd MMMM', { locale: ar })}</p>
                               </div>
                               <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">عدد الضيوف</p>
                                  <p className="text-sm font-black">{b.guestCount} أشخاص</p>
                               </div>
                            </div>

                             <div className="space-y-4 pt-4">
                                {b.opStatus === 'waiting' ? (
                                  <div className="space-y-4">
                                     <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-600">وقت الدخول الفعلي</Label>
                                        <Input type="time" onChange={(e) => store.updateBooking(b.id, { checkInTime: e.target.value })} className="rounded-xl h-12 bg-slate-50 border-none" />
                                     </div>
                                     <Button className="w-full h-14 rounded-2xl gap-2 font-black text-lg shadow-lg shadow-primary/20" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in' })}>
                                       <CheckCircle2 className="h-5 w-5" /> تأكيد دخول العميل
                                     </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                     <div className="grid grid-cols-2 gap-4">
                                       <div className="space-y-2">
                                         <Label className="text-xs font-black text-slate-600 text-right block">وقت الخروج</Label>
                                         <Input type="time" onChange={(e) => store.updateBooking(b.id, { checkOutTime: e.target.value })} className="rounded-xl h-12 bg-slate-50 border-none" />
                                       </div>
                                       <div className="space-y-2">
                                         <Label className="text-xs font-black text-slate-600 text-right block">مبلغ التأمين المسترد</Label>
                                         <Input type="number" placeholder="ج.م" onChange={(e) => store.updateBooking(b.id, { securityDeposit: parseInt(e.target.value) })} className="rounded-xl h-12 bg-slate-50 border-none" />
                                       </div>
                                     </div>
                                     <div className="space-y-2">
                                       <Label className="text-xs font-black text-slate-600 text-right block">تقرير حالة الشاليه</Label>
                                       <Textarea placeholder="اكتب ملاحظاتك عن نظافة وحالة الشاليه عند الاستلام..." className="rounded-2xl h-24 bg-slate-50 border-none" onChange={(e) => store.updateBooking(b.id, { conditionReport: e.target.value })} />
                                     </div>
                                     <Button variant="destructive" className="w-full h-14 rounded-2xl gap-2 font-black text-lg shadow-lg shadow-red-500/20" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_out' })}>
                                       <LogOut className="h-5 w-5" /> إنهاء الإقامة وتسليم العهدة
                                     </Button>
                                  </div>
                                )}
                             </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ---------------- ADMIN VIEW ---------------- */}
            {store.role === 'admin' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 gap-6">
                   <div className="text-right space-y-1">
                      <h2 className="text-3xl font-black text-slate-900 leading-none">إدارة منتجع فارما بيتش مصر</h2>
                      <p className="text-slate-400 font-bold">لوحة تحكم المدير العام</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl text-center min-w-[100px] border border-blue-100">
                        <p className="text-[10px] font-black text-blue-400 uppercase">إجمالي الشاليهات</p>
                        <p className="text-2xl font-black text-blue-600">{store.chalets.length}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl text-center min-w-[100px] border border-purple-100">
                        <p className="text-[10px] font-black text-purple-400 uppercase">حجوزات اليوم</p>
                        <p className="text-2xl font-black text-purple-600">{store.bookings.filter(b => b.status === 'confirmed').length}</p>
                      </div>
                   </div>
                </div>

                <Tabs dir="rtl" defaultValue="bookings" className="w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                     <TabsList className="bg-white p-1 rounded-2xl shadow-sm h-14 border border-slate-100">
                       <TabsTrigger value="bookings" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">طابور الحجوزات</TabsTrigger>
                       <TabsTrigger value="chalets" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">الشاليهات</TabsTrigger>
                       <TabsTrigger value="users" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-black">إدارة الموظفين</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="bookings" className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {store.bookings.length === 0 ? (
                        <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                           <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
                           <p className="font-bold text-slate-400">لا توجد طلبات حجز حالياً</p>
                        </div>
                      ) : (
                        store.bookings.map(b => (
                          <Card key={b.id} className="p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl transition-all bg-white border-none">
                            <div className="flex gap-6 items-center w-full md:w-auto">
                               <div className="bg-primary/5 p-4 rounded-2xl">
                                 <CalendarIcon className="text-primary h-8 w-8" />
                               </div>
                               <div className="text-right space-y-2">
                                  <div className="flex items-center gap-3">
                                    <p className="font-black text-xl text-slate-800">{b.clientName}</p>
                                    <Badge variant="outline" className="text-[10px] font-black px-3 rounded-full border-primary/20 text-primary">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                                  </div>
                                  <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</span>
                                    <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {b.phoneNumber}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                               {b.status === 'pending' ? (
                                 <div className="flex gap-2">
                                   <Button variant="ghost" className="text-red-500 font-black rounded-xl hover:bg-red-50" onClick={() => store.updateBooking(b.id, { status: 'cancelled' })}><XCircle className="ml-2 h-5 w-5" /> رفض</Button>
                                   <Button className="bg-green-600 hover:bg-green-700 font-black rounded-xl px-10 h-12 shadow-lg shadow-green-600/20" onClick={() => store.updateBooking(b.id, { status: 'confirmed' })}><CheckCircle2 className="ml-2 h-5 w-5" /> اعتماد الحجز</Button>
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-4">
                                   <Badge className={`rounded-lg px-6 py-2 font-black ${b.status === 'confirmed' ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-red-500'}`}>
                                     {b.status === 'confirmed' ? 'تم الاعتماد' : 'مرفوض'}
                                   </Badge>
                                   <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-500" onClick={() => store.updateBooking(b.id, { status: 'cancelled' })}><Trash2 className="h-5 w-5" /></Button>
                                 </div>
                               )}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="chalets" className="space-y-8">
                    <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                       <h3 className="font-black text-xl text-slate-800">إدارة المعروض العقاري</h3>
                       <Button className="rounded-xl font-black h-12 gap-2 shadow-lg shadow-primary/20" onClick={() => store.addChalet({
                         name: 'شاليه لؤلؤة البحر',
                         normalPrice: 3000,
                         holidayPrice: 4500,
                         description: 'وصف شاليه جديد...',
                         image: 'https://picsum.photos/seed/newchalet/800/600',
                         location: 'الساحل الشمالي - مراسي',
                         city: 'الساحل الشمالي'
                       })}><Plus className="h-5 w-5" /> إضافة شاليه جديد</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {store.chalets.map(c => (
                        <Card key={c.id} className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-white hover:scale-[1.02] transition-transform duration-300">
                           <div className="relative h-56">
                             <img src={c.image} className="h-full w-full object-cover" />
                             <div className="absolute top-4 right-4 flex gap-2">
                               <Button variant="destructive" size="icon" className="rounded-full shadow-lg" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-4 w-4" /></Button>
                             </div>
                             <div className="absolute bottom-4 left-4">
                               <Badge className="bg-white/90 backdrop-blur-md text-slate-900 font-bold px-4 py-1.5 rounded-full border-none">{c.city}</Badge>
                             </div>
                           </div>
                           <div className="p-8 text-right space-y-4">
                             <div className="space-y-1">
                               <h4 className="font-black text-xl text-slate-800">{c.name}</h4>
                               <p className="text-sm font-bold text-slate-400 flex items-center justify-end gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>
                             </div>
                             <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                               <div className="text-center">
                                 <p className="text-[10px] text-slate-400 font-bold">الأيام العادية</p>
                                 <p className="font-black text-red-500">{c.normalPrice} ج.م</p>
                               </div>
                               <div className="w-px h-8 bg-slate-200"></div>
                               <div className="text-center">
                                 <p className="text-[10px] text-slate-400 font-bold">الإجازات</p>
                                 <p className="font-black text-red-600">{c.holidayPrice} ج.م</p>
                               </div>
                             </div>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-8">
                    <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                       <h3 className="font-black text-xl text-slate-800">إدارة فريق العمل</h3>
                       <Button className="rounded-xl font-black h-12 gap-2 shadow-lg shadow-primary/20" onClick={() => store.addUser({
                         name: 'محمد المندوب',
                         role: 'broker',
                         assignedChaletIds: ['c1', 'c2']
                       })}><UserPlus className="h-5 w-5" /> إضافة عضو جديد</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {store.users.map(u => (
                        <Card key={u.id} className="p-6 rounded-3xl flex justify-between items-center border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                           <div className="flex gap-4 items-center">
                             <div className="bg-slate-100 p-4 rounded-2xl text-slate-400">
                               {u.role === 'admin' ? <ShieldCheck className="h-8 w-8 text-primary" /> : u.role === 'broker' ? <Users className="h-8 w-8 text-blue-500" /> : <ClipboardList className="h-8 w-8 text-amber-500" />}
                             </div>
                             <div className="text-right">
                               <p className="font-black text-lg text-slate-800">{u.name}</p>
                               <Badge className="bg-slate-100 text-slate-500 font-bold px-4 rounded-full mt-1">
                                 {u.role === 'admin' ? 'مدير عام' : u.role === 'broker' ? 'وسيط مبيعات' : 'مشرف عمليات'}
                               </Badge>
                               {u.assignedChaletIds && (
                                 <p className="text-[10px] text-slate-400 font-bold mt-2">مسؤول عن: {u.assignedChaletIds.length} شاليهات</p>
                               )}
                             </div>
                           </div>
                           {u.role !== 'admin' && (
                             <Button variant="ghost" size="icon" className="text-red-300 hover:text-red-500 hover:bg-red-50 h-12 w-12 rounded-xl" onClick={() => store.deleteUser(u.id)}><Trash2 className="h-5 w-5" /></Button>
                           )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-6 text-right">
             <div className="flex items-center gap-3 justify-end">
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white">فارما بيتش</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Pharma Beach Resort Egypt</p>
                </div>
                <div className="bg-[#fecaca] p-2 rounded-full h-12 w-12 flex items-center justify-center">
                   <Home className="text-[#991b1b] h-6 w-6" />
                </div>
             </div>
             <p className="text-slate-400 leading-relaxed font-bold">وجهتك الأولى للفخامة والراحة على شواطئ مصر الساحرة. نقدم أرقى الشاليهات بخدمات متكاملة تضمن لك قضاء أجمل اللحظات.</p>
             <div className="flex gap-4 justify-end">
               <Twitter className="h-6 w-6 text-slate-500 hover:text-white cursor-pointer transition-colors" />
               <Instagram className="h-6 w-6 text-slate-500 hover:text-white cursor-pointer transition-colors" />
               <Facebook className="h-6 w-6 text-slate-500 hover:text-white cursor-pointer transition-colors" />
             </div>
           </div>

           <div className="space-y-6 text-right">
              <h4 className="text-xl font-black border-r-4 border-primary pr-4 leading-none">تواصل معنا</h4>
              <ul className="space-y-4">
                 <li className="flex items-center gap-3 justify-end text-slate-400 font-bold">
                    <span>+20 100 123 4567</span>
                    <Phone className="h-5 w-5 text-primary" />
                 </li>
                 <li className="flex items-center gap-3 justify-end text-slate-400 font-bold">
                    <span>info@pharmabeach.eg</span>
                    <Mail className="h-5 w-5 text-primary" />
                 </li>
                 <li className="flex items-center gap-3 justify-end text-slate-400 font-bold">
                    <span>الساحل الشمالي، مصر</span>
                    <MapPin className="h-5 w-5 text-primary" />
                 </li>
              </ul>
           </div>

           <div className="space-y-6 text-right">
              <h4 className="text-xl font-black border-r-4 border-primary pr-4 leading-none">موقعنا</h4>
              <div className="rounded-3xl overflow-hidden h-48 bg-slate-800 relative group">
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button className="font-black rounded-xl">افتح الخريطة <Map className="ml-2 h-4 w-4" /></Button>
                </div>
                <div className="h-full w-full flex items-center justify-center text-slate-600">
                   <MapPin size={48} className="animate-bounce" />
                </div>
              </div>
           </div>
        </div>
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm font-bold">
           جميع الحقوق محفوظة &copy; {new Date().getFullYear()} فارما بيتش ريزورت مصر
        </div>
      </footer>

      {/* Dev Role Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 z-50 shadow-2xl border border-primary/20 animate-in slide-in-from-bottom-10">
         <div className="text-[10px] font-black text-primary opacity-50 ml-2 uppercase">تبديل الأدوار</div>
         <div className="flex gap-2">
            {(['client', 'broker', 'supervisor', 'admin'] as const).map(r => (
               <Button 
                key={r} 
                onClick={() => store.setRole(r)}
                variant={store.role === r ? 'default' : 'ghost'} 
                className={`rounded-full h-10 px-5 text-xs font-black transition-all ${store.role === r ? 'bg-primary shadow-lg shadow-primary/20' : 'text-slate-400'}`}
               >
                 {r === 'admin' ? 'أدمن' : r === 'broker' ? 'بروكر' : r === 'supervisor' ? 'مشرف' : 'عميل'}
               </Button>
            ))}
         </div>
      </div>

      <BookingDialog 
        chalet={selectedChalet}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleBookingConfirm}
        existingBookings={store.bookings}
      />
    </div>
  )
}
