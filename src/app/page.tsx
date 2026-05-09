
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
import { 
  Users, 
  Home, 
  Calendar, 
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
  CircleDollarSign
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'

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

  // Views rendering
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-white p-2 rounded-xl">
               <Home className="text-primary h-6 w-6" />
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight">فارما بيتش</h1>
               <p className="text-[10px] opacity-80 uppercase tracking-widest font-light">Pharma Beach Management</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
             <Badge variant="outline" className="text-white border-white/40 text-[10px]">
               {store.role === 'admin' ? 'مدير النظام' : 
                store.role === 'broker' ? 'وسيط مبيعات' : 
                store.role === 'supervisor' ? 'مشرف ميداني' : 'عميل'}
             </Badge>
             <span className="text-sm font-medium">{store.currentUser?.name || 'زائر'}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-32">
        {!store.role ? (
          <div className="max-w-md mx-auto space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">مرحباً بك في فارما بيتش</h2>
              <p className="text-slate-500">اختر هويتك للبدء (لأغراض التجربة فقط)</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={() => store.setRole('client')} size="lg" className="h-20 text-lg rounded-2xl bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 hover:border-primary/20 shadow-sm">دخول كعميل</Button>
              <Button onClick={() => store.setRole('broker')} size="lg" className="h-20 text-lg rounded-2xl bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 hover:border-primary/20 shadow-sm">دخول كبروكر</Button>
              <Button onClick={() => store.setRole('supervisor')} size="lg" className="h-20 text-lg rounded-2xl bg-white text-slate-900 border-2 border-slate-100 hover:bg-slate-50 hover:border-primary/20 shadow-sm">دخول كمشرف</Button>
              <Button onClick={() => store.setRole('admin')} size="lg" className="h-20 text-lg rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">دخول كأدمن</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* ---------------- CLIENT VIEW ---------------- */}
            {store.role === 'client' && (
              <div className="space-y-8">
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-slate-900">شاليهات متاحة</h2>
                  <p className="text-slate-500">اختر شاليهك المفضل في منتجع فارما بيتش الفاخر</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {store.chalets.map(c => (
                    <Card key={c.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 rounded-3xl border-none">
                       <div className="relative h-48">
                         <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-primary shadow-lg border border-white/20">
                           {c.price} $ <span className="text-[10px] opacity-60">/ليلة</span>
                         </div>
                       </div>
                       <CardHeader className="text-right">
                         <CardTitle className="text-xl font-bold">{c.name}</CardTitle>
                         <CardDescription className="flex items-center gap-1 justify-end text-xs"><MapPin className="h-3 w-3" /> {c.location}</CardDescription>
                       </CardHeader>
                       <CardContent className="text-right text-sm text-slate-600 line-clamp-2">
                         {c.description}
                       </CardContent>
                       <CardFooter>
                         <Button className="w-full rounded-xl h-12 text-md font-bold" onClick={() => { setSelectedChalet(c); setIsBookingOpen(true); }}>احجز الآن</Button>
                       </CardFooter>
                    </Card>
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
                    <p className="text-slate-500">أهلاً بك، يمكنك إضافة عملاء ومتابعة الشاليهات المسموح لك بها.</p>
                  </div>
                  <Button className="rounded-xl gap-2 font-bold" onClick={() => { setSelectedChalet(store.chalets[0]); setIsBookingOpen(true); }}>
                    <UserPlus className="h-4 w-4" /> إضافة حجز جديد
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg">الحجوزات الخاصة بك</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {store.bookings.filter(b => b.brokerId === store.currentUser?.id).length === 0 ? (
                        <Card className="p-12 text-center text-slate-400 border-dashed rounded-3xl">لا توجد حجوزات مسجلة باسمك بعد</Card>
                      ) : (
                        store.bookings.filter(b => b.brokerId === store.currentUser?.id).map(b => (
                          <Card key={b.id} className="p-6 rounded-2xl flex justify-between items-center hover:bg-white transition-colors">
                            <div className="text-right space-y-1">
                               <p className="font-bold text-primary">{b.clientName}</p>
                               <p className="text-xs text-slate-500">شاليه: {store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                               <p className="text-[10px] font-medium">{format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <Badge className={b.status === 'confirmed' ? 'bg-green-500' : b.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}>
                                 {b.status === 'confirmed' ? 'مؤكد' : b.status === 'cancelled' ? 'ملغي' : 'بانتظار الإدمن'}
                               </Badge>
                               {b.conditionReport && <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600">يوجد ملاحظات مشرف</Badge>}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">الشاليهات المتاحة لك</h3>
                    <div className="grid grid-cols-1 gap-4">
                       {store.chalets.filter(c => store.currentUser?.assignedChaletIds?.includes(c.id)).map(c => (
                         <Card key={c.id} className="p-4 rounded-2xl flex gap-4 items-center">
                            <img src={c.image} className="w-16 h-16 rounded-xl object-cover" />
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
                  <p className="text-slate-500">تسجيل الدخول والخروج وحالة الشاليهات</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {store.bookings.filter(b => b.status === 'confirmed' && b.opStatus !== 'checked_out').length === 0 ? (
                    <Card className="p-12 text-center text-slate-400 border-dashed rounded-3xl">لا توجد عمليات نشطة حالياً</Card>
                  ) : (
                    store.bookings.filter(b => b.status === 'confirmed' && b.opStatus !== 'checked_out').map(b => (
                      <Card key={b.id} className="overflow-hidden rounded-3xl border-none shadow-md">
                        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse">
                          <div className="p-6 flex-1 text-right space-y-4">
                            <div>
                               <Badge className="bg-primary/10 text-primary border-none mb-2">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                               <h3 className="text-xl font-bold">{b.clientName}</h3>
                               <p className="text-sm text-slate-500">{b.phoneNumber}</p>
                            </div>
                            <div className="flex justify-end gap-6 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                               <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMMM', { locale: ar })}</div>
                               <div className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.guestCount} أشخاص</div>
                            </div>
                          </div>
                          <div className="p-6 flex-1 bg-slate-50 space-y-4 text-right">
                             {b.opStatus === 'waiting' ? (
                               <div className="space-y-4">
                                  <Label className="text-sm font-bold">تسجيل وقت الدخول</Label>
                                  <div className="flex gap-2">
                                    <Input type="time" onChange={(e) => store.updateBooking(b.id, { checkInTime: e.target.value })} className="bg-white rounded-xl" />
                                    <Button className="w-full rounded-xl gap-2 font-bold" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_in' })}>
                                      <LogIn className="h-4 w-4" /> تأكيد الدخول
                                    </Button>
                                  </div>
                               </div>
                             ) : (
                               <div className="space-y-4 animate-in fade-in">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <Label className="text-xs font-bold">وقت الخروج</Label>
                                      <Input type="time" onChange={(e) => store.updateBooking(b.id, { checkOutTime: e.target.value })} className="bg-white rounded-xl h-10" />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs font-bold">التأمين / غرامات ($)</Label>
                                      <Input type="number" onChange={(e) => store.updateBooking(b.id, { securityDeposit: parseInt(e.target.value) })} className="bg-white rounded-xl h-10" />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs font-bold">تقرير حالة الشاليه (ملاحظات)</Label>
                                    <Textarea placeholder="صف حالة الشاليه عند الخروج..." className="bg-white rounded-xl border-none min-h-[80px]" onChange={(e) => store.updateBooking(b.id, { conditionReport: e.target.value })} />
                                  </div>
                                  <Button variant="destructive" className="w-full rounded-xl gap-2 font-bold h-12" onClick={() => store.updateBooking(b.id, { opStatus: 'checked_out' })}>
                                    <LogOut className="h-4 w-4" /> إنهاء الحجز وتسجيل الخروج
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
                     <TabsList className="bg-white p-1 rounded-2xl shadow-sm h-12">
                       <TabsTrigger value="bookings" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">الحجوزات</TabsTrigger>
                       <TabsTrigger value="chalets" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">الشاليهات</TabsTrigger>
                       <TabsTrigger value="users" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">الموظفين</TabsTrigger>
                     </TabsList>
                  </div>

                  <TabsContent value="bookings" className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {store.bookings.length === 0 ? (
                        <Card className="p-12 text-center text-slate-400 border-dashed rounded-3xl">لا توجد حجوزات في النظام</Card>
                      ) : (
                        store.bookings.map(b => (
                          <Card key={b.id} className="p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow bg-white border-none">
                            <div className="flex gap-4 items-center w-full md:w-auto">
                               <div className="bg-primary/5 p-3 rounded-2xl">
                                 <Calendar className="text-primary h-6 w-6" />
                               </div>
                               <div className="text-right space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-lg">{b.clientName}</p>
                                    <Badge variant="outline" className="text-[10px]">{store.chalets.find(c => c.id === b.chaletId)?.name}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</span>
                                    {b.brokerId && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> عبر: {store.users.find(u => u.id === b.brokerId)?.name}</span>}
                                  </div>
                               </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                               {b.status === 'pending' ? (
                                 <>
                                   <Button variant="ghost" size="sm" className="text-red-500 font-bold" onClick={() => store.updateBooking(b.id, { status: 'cancelled' })}><XCircle className="ml-1 h-4 w-4" /> إلغاء</Button>
                                   <Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold rounded-xl px-6" onClick={() => store.updateBooking(b.id, { status: 'confirmed' })}><CheckCircle2 className="ml-1 h-4 w-4" /> تأكيد الحجز</Button>
                                 </>
                               ) : (
                                 <div className="flex items-center gap-4">
                                    {b.opStatus === 'checked_out' && (
                                      <div className="text-right flex flex-col items-end gap-1">
                                         <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">مكتمل</Badge>
                                         <p className="text-[10px] text-slate-400">تأمين: ${b.securityDeposit || 0}</p>
                                      </div>
                                    )}
                                    <Badge className={b.status === 'confirmed' ? 'bg-primary' : 'bg-red-500'}>
                                      {b.status === 'confirmed' ? 'حجز مؤكد' : 'ملغي'}
                                    </Badge>
                                 </div>
                               )}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="chalets" className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-lg">قائمة الشاليهات</h3>
                       <Button size="sm" className="rounded-xl font-bold" onClick={() => store.addChalet({
                         name: 'شاليه جديد',
                         price: 400,
                         description: 'وصف جديد...',
                         image: 'https://picsum.photos/seed/new/800/600',
                         location: 'فارما بيتش'
                       })}><Plus className="ml-1 h-4 w-4" /> إضافة شاليه</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {store.chalets.map(c => (
                        <Card key={c.id} className="rounded-2xl overflow-hidden border-none shadow-sm">
                           <img src={c.image} className="h-40 w-full object-cover" />
                           <div className="p-4 text-right space-y-2">
                             <div className="flex justify-between items-start">
                               <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 h-8 w-8" onClick={() => store.deleteChalet(c.id)}><Trash2 className="h-4 w-4" /></Button>
                               <p className="font-bold">{c.name}</p>
                             </div>
                             <p className="text-xs text-slate-500">{c.location}</p>
                             <p className="text-primary font-bold">${c.price}</p>
                           </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-lg">الموظفين (بروكرز ومشرفين)</h3>
                       <Button size="sm" className="rounded-xl font-bold" onClick={() => store.addUser({
                         name: 'موظف جديد',
                         role: 'broker',
                         assignedChaletIds: ['c1']
                       })}><UserPlus className="ml-1 h-4 w-4" /> إضافة موظف</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {store.users.map(u => (
                        <Card key={u.id} className="p-4 rounded-2xl flex justify-between items-center border-none shadow-sm bg-white">
                           <div className="flex gap-3 items-center">
                             <div className="bg-slate-100 p-2 rounded-xl text-slate-400">
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

      {/* Footer Nav for Mobile (Role Switcher for testing) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10 flex-row-reverse border-primary/20">
         <div className="text-[10px] font-bold text-primary opacity-50 ml-2">تبديل الهوية (للتجربة)</div>
         <div className="flex gap-2">
            {(['client', 'broker', 'supervisor', 'admin'] as const).map(r => (
               <Button 
                key={r} 
                onClick={() => store.setRole(r)}
                variant={store.role === r ? 'default' : 'ghost'} 
                className={`rounded-full h-10 px-4 text-xs font-bold ${store.role === r ? 'bg-primary' : 'text-slate-500'}`}
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
