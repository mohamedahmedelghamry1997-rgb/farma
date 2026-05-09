
"use client"

import { useState } from 'react'
import { useAppStore, Booking, Chalet, User } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
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
  LogIn, 
  LogOut, 
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
  Filter
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

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center bg-white"><div className="animate-bounce font-bold text-primary">جاري تحميل فارما بيتش...</div></div>

  const handleBookingConfirm = (data: any) => {
    store.addBooking({
      ...data,
      brokerId: store.role === 'broker' ? store.currentUser?.id : undefined
    })
    toast({ title: "تم إرسال الطلب", description: "سيقوم الإدمن بمراجعة حجزك وتأكيده قريباً." })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="bg-[#9333ea] text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-xs md:text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              <Instagram className="h-4 w-4" />
              <Facebook className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span>1234567890</span>
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
               <span>العربية</span>
               <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-6 text-slate-700 font-bold">
              <a href="#" className="hover:text-primary transition-colors">الشاليهات</a>
              <a href="#" className="hover:text-primary transition-colors">اتصل بنا</a>
              <a href="#" className="hover:text-primary transition-colors">من نحن</a>
              <a href="#" className="text-primary border-b-2 border-primary pb-1">الرئيسية</a>
            </nav>
            <div className="md:hidden">
               <Home className="text-primary h-6 w-6" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-[#fecaca] p-2 rounded-full h-12 w-12 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
               <Home className="text-[#991b1b] h-6 w-6" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-32">
        {!store.role ? (
          <div className="max-w-md mx-auto space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">مرحباً بك في فارما بيتش</h2>
              <p className="text-slate-500">اختر هويتك للبدء</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => store.setRole('client')} size="lg" className="h-16 text-lg rounded-xl bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 shadow-sm">دخول كعميل</Button>
              <Button onClick={() => store.setRole('broker')} size="lg" className="h-16 text-lg rounded-xl bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 shadow-sm">دخول كبروكر</Button>
              <Button onClick={() => store.setRole('supervisor')} size="lg" className="h-16 text-lg rounded-xl bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 shadow-sm">دخول كمشرف</Button>
              <Button onClick={() => store.setRole('admin')} size="lg" className="h-16 text-lg rounded-xl bg-primary text-white shadow-xl shadow-primary/20">دخول كأدمن</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* ---------------- CLIENT VIEW ---------------- */}
            {store.role === 'client' && (
              <div className="space-y-8">
                {/* Filter Section */}
                <div className="filter-container">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    <Select>
                      <SelectTrigger className="bg-white rounded-md border-none shadow-sm h-11 text-right">
                        <SelectValue placeholder="فلتر حسب المدينة (الكل)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salalah">صلالة</SelectItem>
                        <SelectItem value="seeb">السيب</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="bg-white rounded-md border-none shadow-sm h-11 text-right">
                        <SelectValue placeholder="فلتر حسب السعر (الكل)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">من الأقل للأعلى</SelectItem>
                        <SelectItem value="high">من الأعلى للأقل</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select>
                      <SelectTrigger className="bg-white rounded-md border-none shadow-sm h-11 text-right">
                        <SelectValue placeholder="فلتر حسب السعر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10-20">10 - 20 ر.ع</SelectItem>
                        <SelectItem value="20-50">20 - 50 ر.ع</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] h-11 rounded-md gap-2 font-bold">
                       <Filter className="h-4 w-4" /> فلتر
                    </Button>
                    <Button variant="outline" className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] h-11 rounded-md border-none font-bold">
                       <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-center mb-12">
                  <h2 className="text-2xl font-bold text-slate-800 relative inline-block">
                    شاليهات مميزة
                    <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full"></div>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {store.chalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={(chalet) => { setSelectedChalet(chalet); setIsBookingOpen(true); }} />
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- BROKER VIEW ---------------- */}
            {store.role === 'broker' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="text-right">
                    <h2 className="text-2xl font-bold">لوحة تحكم البروكر</h2>
                    <p className="text-slate-500">أهلاً بك، يمكنك متابعة شاليهاتك وعملائك.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg">الحجوزات الخاصة بك</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {store.bookings.filter(b => b.brokerId === store.currentUser?.id).length === 0 ? (
                        <Card className="p-12 text-center text-slate-400 border-dashed rounded-xl">لا توجد حجوزات مسجلة باسمك بعد</Card>
                      ) : (
                        store.bookings.filter(b => b.brokerId === store.currentUser?.id).map(b => (
                          <Card key={b.id} className="p-6 rounded-xl flex justify-between items-center hover:bg-white transition-colors border-none shadow-sm">
                            <div className="text-right space-y-1">
                               <p className="font-bold text-primary">{b.clientName}</p>
                               <p className="text-xs text-slate-500">شاليه: {store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                               <p className="text-[10px] font-medium">{format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <Badge className={b.status === 'confirmed' ? 'bg-green-500' : b.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}>
                                 {b.status === 'confirmed' ? 'مؤكد' : b.status === 'cancelled' ? 'ملغي' : 'بانتظار الإدمن'}
                               </Badge>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">الشاليهات المسؤولة</h3>
                    <div className="grid grid-cols-1 gap-4">
                       {store.chalets.filter(c => store.currentUser?.assignedChaletIds?.includes(c.id)).map(c => (
                         <Card key={c.id} className="p-4 rounded-xl flex gap-4 items-center border-none shadow-sm">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                               <img src={c.image} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{c.name}</p>
                              <p className="text-[10px] text-slate-500">{c.location}</p>
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
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-slate-900">العمليات الميدانية</h2>
                  <p className="text-slate-500">إدارة تسجيل الدخول والخروج</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {store.bookings.filter(b => b.status === 'confirmed' && b.opStatus !== 'checked_out').length === 0 ? (
                    <Card className="p-12 text-center text-slate-400 border-dashed rounded-xl">لا توجد عمليات نشطة حالياً</Card>
                  ) : (
                    store.bookings.filter(b => b.status === 'confirmed' && b.opStatus !== 'checked_out').map(b => (
                      <Card key={b.id} className="overflow-hidden rounded-xl border-none shadow-sm">
                        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse">
                          <div className="p-6 flex-1 text-right space-y-4">
                            <div>
                               <Badge className="bg-primary/10 text-primary border-none mb-2">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                               <h3 className="text-xl font-bold">{b.clientName}</h3>
                               <p className="text-sm text-slate-500">{b.phoneNumber}</p>
                            </div>
                            <div className="flex justify-end gap-6 text-xs font-bold text-slate-400">
                               <div className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMMM', { locale: ar })}</div>
                               <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.guestCount} أشخاص</div>
                            </div>
                          </div>
                          <div className="p-6 flex-1 bg-slate-50 space-y-4 text-right">
                             {b.opStatus === 'waiting' ? (
                               <div className="space-y-4">
                                  <Label className="text-sm font-bold">تسجيل وقت الدخول</Label>
                                  <div className="flex gap-2">
                                    <Input type="time" onChange={(e) => store.updateBooking(b.id, { checkInTime: e.target.value })} className="bg-white rounded-md" />
                                    <Button className="w-full rounded-md gap-2 font-bold" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in' })}>
                                      <LogIn className="h-4 w-4" /> تأكيد الدخول
                                    </Button>
                                  </div>
                               </div>
                             ) : (
                               <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <Label className="text-xs font-bold">وقت الخروج</Label>
                                      <Input type="time" onChange={(e) => store.updateBooking(b.id, { checkOutTime: e.target.value })} className="bg-white rounded-md h-10" />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs font-bold">تأمين مسترد (ر.ع)</Label>
                                      <Input type="number" onChange={(e) => store.updateBooking(b.id, { securityDeposit: parseInt(e.target.value) })} className="bg-white rounded-md h-10" />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold">ملاحظات الحالة</Label>
                                    <Textarea placeholder="وصف حالة الشاليه..." className="bg-white rounded-md border-slate-200 min-h-[80px]" onChange={(e) => store.updateBooking(b.id, { conditionReport: e.target.value })} />
                                  </div>
                                  <Button variant="destructive" className="w-full rounded-md gap-2 font-bold h-12" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_out' })}>
                                    <LogOut className="h-4 w-4" /> إنهاء الحجز
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
                <Tabs dir="rtl" defaultValue="bookings" className="w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                     <h2 className="text-2xl font-bold">لوحة تحكم المدير</h2>
                     <TabsList className="bg-white p-1 rounded-xl shadow-sm h-12">
                       <TabsTrigger value="bookings" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">الحجوزات</TabsTrigger>
                       <TabsTrigger value="chalets" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">الشاليهات</TabsTrigger>
                       <TabsTrigger value="users" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">الموظفين</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="bookings" className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {store.bookings.length === 0 ? (
                        <Card className="p-12 text-center text-slate-400 border-dashed rounded-xl">لا توجد حجوزات في النظام</Card>
                      ) : (
                        store.bookings.map(b => (
                          <Card key={b.id} className="p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow bg-white border-none">
                            <div className="flex gap-4 items-center w-full md:w-auto">
                               <div className="bg-primary/5 p-3 rounded-lg">
                                 <CalendarIcon className="text-primary h-6 w-6" />
                               </div>
                               <div className="text-right space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg">{b.clientName}</p>
                                    <Badge variant="outline" className="text-[10px]">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                               {b.status === 'pending' ? (
                                 <>
                                   <Button variant="ghost" size="sm" className="text-red-500 font-bold" onClick={() => store.updateBooking(b.id, { status: 'cancelled' })}><XCircle className="ml-1 h-4 w-4" /> إلغاء</Button>
                                   <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold rounded-lg px-6" onClick={() => store.updateBooking(b.id, { status: 'confirmed' })}><CheckCircle2 className="ml-1 h-4 w-4" /> تأكيد</Button>
                                 </>
                               ) : (
                                 <Badge className={b.status === 'confirmed' ? 'bg-primary' : 'bg-red-500'}>
                                   {b.status === 'confirmed' ? 'حجز مؤكد' : 'ملغي'}
                                 </Badge>
                               )}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="chalets" className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-lg">الشاليهات</h3>
                       <Button size="sm" className="rounded-lg font-bold" onClick={() => store.addChalet({
                         name: 'شاليه جديد',
                         normalPrice: 30,
                         holidayPrice: 35,
                         description: 'وصف جديد...',
                         image: 'https://picsum.photos/seed/new/800/600',
                         location: 'صلالة',
                         city: 'صلالة'
                       })}><Plus className="ml-1 h-4 w-4" /> إضافة شاليه</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {store.chalets.map(c => (
                        <Card key={c.id} className="rounded-xl overflow-hidden border-none shadow-sm">
                           <div className="relative h-40">
                             <img src={c.image} className="h-full w-full object-cover" />
                           </div>
                           <div className="p-4 text-right space-y-2">
                             <div className="flex justify-between items-start">
                               <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 h-8 w-8" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-4 w-4" /></Button>
                               <p className="font-bold">{c.name}</p>
                             </div>
                             <p className="text-xs text-slate-500">{c.location}</p>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-lg">إدارة الموظفين</h3>
                       <Button size="sm" className="rounded-lg font-bold" onClick={() => store.addUser({
                         name: 'موظف جديد',
                         role: 'broker',
                         assignedChaletIds: ['c1']
                       })}><UserPlus className="ml-1 h-4 w-4" /> إضافة موظف</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {store.users.map(u => (
                        <Card key={u.id} className="p-4 rounded-xl flex justify-between items-center border-none shadow-sm bg-white">
                           <div className="flex gap-3 items-center">
                             <div className="bg-slate-100 p-2 rounded-lg text-slate-400">
                               {u.role === 'admin' ? <ShieldCheck /> : u.role === 'broker' ? <Users /> : <ClipboardList />}
                             </div>
                             <div className="text-right">
                               <p className="font-bold text-sm">{u.name}</p>
                               <Badge variant="ghost" className="text-[10px] p-0 opacity-60">
                                 {u.role === 'admin' ? 'مدير' : u.role === 'broker' ? 'بروكر' : 'مشرف'}
                               </Badge>
                             </div>
                           </div>
                           {u.role !== 'admin' && (
                             <Button variant="ghost" size="icon" className="text-red-400 h-8 w-8" onClick={() => store.deleteUser(u.id)}><Trash2 className="h-4 w-4" /></Button>
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

      {/* Role Switcher for testing */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 z-50 shadow-2xl flex-row-reverse border border-primary/20">
         <div className="text-[10px] font-bold text-primary opacity-50 ml-2">تجربة الأدوار</div>
         <div className="flex gap-2">
            {(['client', 'broker', 'supervisor', 'admin'] as const).map(r => (
               <Button 
                key={r} 
                onClick={() => store.setRole(r)}
                variant={store.role === r ? 'default' : 'ghost'} 
                className={`rounded-full h-9 px-4 text-xs font-bold ${store.role === r ? 'bg-primary' : 'text-slate-500'}`}
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
