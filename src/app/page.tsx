"use client"

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppStore, Booking, Chalet, Broker } from '@/lib/store'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ChaletCard } from '@/components/ChaletCard'
import { BookingDialog } from '@/components/BookingDialog'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Home, 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Copy,
  ShieldAlert,
  UserCheck,
  ShieldCheck,
  Zap,
  FileText
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts"

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  
  // تتبع رابط الإحالة
  const [activeBrokerId, setActiveBrokerId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      const broker = store.brokers.find(b => b.referralCode === refCode)
      if (broker) {
        setActiveBrokerId(broker.id)
        toast({
          title: "تم تفعيل رابط الإحالة",
          description: `أهلاً بك! أنت تتصفح الآن برعاية ${broker.name}`,
        })
      }
    }
  }, [searchParams, store.brokers, toast])

  // Revenue Data for Chart
  const revenueData = useMemo(() => {
    return store.chalets.map(c => ({
      name: c.name,
      total: store.bookings
        .filter(b => b.chaletId === c.id && b.status === 'confirmed')
        .length * c.price
    }))
  }, [store.bookings, store.chalets])

  // Current Broker Identity
  const currentBroker = store.brokers[0] 

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center bg-background"><Clock className="animate-spin text-primary" /></div>

  const handleBook = (chalet: Chalet) => {
    setSelectedChalet(chalet)
    setIsBookingOpen(true)
  }

  const handleConfirmBooking = (bookingData: Omit<Booking, 'id' | 'status'>) => {
    store.addBooking({
      ...bookingData,
      brokerId: activeBrokerId 
    })
    toast({
      title: "تم استلام الطلب",
      description: "تم إرسال طلب الحجز الخاص بك إلى الإدارة للمراجعة.",
    })
  }

  const copyReferralLink = (code: string) => {
    const url = `${window.location.origin}${window.location.pathname}?ref=${code}`
    navigator.clipboard.writeText(url)
    toast({ title: "تم النسخ", description: "تم نسخ رابط الإحالة الخاص بك." })
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Home className="text-white h-5 w-5" />
            </div>
            <h1 className="font-headline text-lg font-black text-primary tracking-tighter">STUDIO FIREBASS</h1>
          </div>
          <div className="flex items-center gap-4">
             {activeBrokerId && (
               <Badge className="bg-secondary text-white font-bold gap-2">
                 <UserCheck className="h-3 w-3" />
                 حجز عبر وسيط
               </Badge>
             )}
             <Badge variant="outline" className="hidden md:flex bg-secondary/10 text-secondary border-secondary/20 font-bold">
               قرية فارما بيتش
             </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!store.role ? (
          <div className="max-w-md mx-auto text-center space-y-8 mt-20">
            <div className="space-y-4">
              <h2 className="text-4xl font-headline font-black text-primary">مرحباً بك</h2>
              <p className="text-muted-foreground">اختر هويتك لاستكشاف نظام إدارة قرية فارما بيتش.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 'client', label: 'دخول كعميل' },
                { id: 'broker', label: 'دخول كوسيط (مدير مبيعات)' },
                { id: 'supervisor', label: 'دخول كمشرف' },
                { id: 'admin', label: 'دخول كمدير نظام' }
              ].map((r) => (
                <Button key={r.id} onClick={() => store.setRole(r.id as any)} size="lg" className="h-16 text-lg rounded-2xl">
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* CLIENT VIEW */}
            {store.role === 'client' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-headline font-black text-primary">استكشف الشاليهات</h2>
                    <p className="text-muted-foreground">ابحث عن إقامتك المثالية في فارما بيتش.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {store.chalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={handleBook} />
                  ))}
                </div>
              </div>
            )}

            {/* SUPERVISOR VIEW */}
            {store.role === 'supervisor' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold text-primary">مركز العمليات الميدانية</h2>
                <div className="grid grid-cols-1 gap-6">
                  {store.bookings.filter(b => b.status === 'confirmed').map(b => {
                    const chalet = store.chalets.find(c => c.id === b.chaletId)
                    return (
                      <Card key={b.id} className="rounded-2xl border-none shadow-md overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-6 flex-1 space-y-4 border-l">
                            <div>
                              <Badge className="mb-2 bg-primary/10 text-primary border-none">{chalet?.name}</Badge>
                              <h3 className="text-xl font-bold">{b.clientName}</h3>
                              <p className="text-sm text-muted-foreground">{b.phoneNumber}</p>
                            </div>
                            <div className="flex gap-4">
                               <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase text-muted-foreground">الدخول</p>
                                 <Input type="time" defaultValue={b.checkInTime} onBlur={(e) => store.updateBookingDetails(b.id, { checkInTime: e.target.value })} />
                               </div>
                               <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase text-muted-foreground">الخروج</p>
                                 <Input type="time" defaultValue={b.checkOutTime} onBlur={(e) => store.updateBookingDetails(b.id, { checkOutTime: e.target.value })} />
                               </div>
                            </div>
                          </div>
                          <div className="p-6 flex-1 bg-muted/20 space-y-4">
                            <label className="text-xs font-bold uppercase text-muted-foreground">تقرير الحالة اليدوي</label>
                            <Textarea 
                              placeholder="صف حالة الشاليه، احتياجات الصيانة، أو أي ملاحظات يدوية..." 
                              className="bg-white border-none min-h-[100px]"
                              defaultValue={b.conditionReport}
                              onBlur={(e) => store.updateBookingDetails(b.id, { conditionReport: e.target.value })}
                            />
                            <div className="flex justify-between items-center">
                               <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase text-muted-foreground">تأمين الصيانة ($)</p>
                                 <Input type="number" defaultValue={b.securityDeposit} onBlur={(e) => store.updateBookingDetails(b.id, { securityDeposit: parseInt(e.target.value) })} className="w-32 bg-white" />
                               </div>
                               <Button size="sm" variant="outline" className="font-bold gap-2">
                                 <FileText className="h-4 w-4" />
                                 حفظ التقرير
                               </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ADMIN & BROKER DASHBOARD */}
            {(store.role === 'admin' || store.role === 'broker') && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-headline font-black text-primary">
                      {store.role === 'admin' ? 'لوحة تحكم المدير' : `لوحة تحكم المبيعات: ${currentBroker.name}`}
                    </h2>
                    <p className="text-muted-foreground">إدارة العمليات يدوياً لقرية فارما بيتش</p>
                  </div>
                  
                  {store.role === 'broker' && (
                    <Card className="rounded-2xl border-none shadow-sm bg-primary text-white p-4 flex flex-row items-center gap-4">
                       <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase opacity-80">رابط الإحالة الخاص بك</p>
                          <p className="font-mono text-xs mt-1">?ref={currentBroker.referralCode}</p>
                       </div>
                       <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyReferralLink(currentBroker.referralCode)}>
                         <Copy className="h-4 w-4" />
                       </Button>
                    </Card>
                  )}

                  {store.role === 'admin' && (
                    <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border">
                      <div className="flex items-center gap-2">
                         <Label htmlFor="broker-confirm" className="text-xs font-bold cursor-pointer">السماح للوسطاء بتأكيد الحجوزات</Label>
                         <Switch id="broker-confirm" checked={store.allowBrokerConfirm} onCheckedChange={store.setAllowBrokerConfirm} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="rounded-2xl border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-bold uppercase">إجمالي الحجوزات</CardDescription>
                      <CardTitle className="text-4xl text-primary">{store.bookings.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-2xl border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-bold uppercase">الإيرادات الفعلية</CardDescription>
                      <CardTitle className="text-4xl text-secondary">${store.bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (store.chalets.find(c => c.id === b.chaletId)?.price || 0), 0)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-2xl border-none shadow-md bg-primary text-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-bold uppercase text-white/70">نسبة الإشغال اليدوية</CardDescription>
                      <CardTitle className="text-4xl">88%</CardTitle>
                    </CardHeader>
                  </Card>
                   <Card className="rounded-2xl border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-bold uppercase">بانتظار الموافقة</CardDescription>
                      <CardTitle className="text-4xl text-red-500">{store.bookings.filter(b => b.status === 'pending' || b.status === 'approved').length}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Charts & Manual Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        تحليل الإيرادات لكل شاليه
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                          <YAxis hide />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }} 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-primary text-white p-2 rounded-lg text-xs font-bold">
                                    {payload[0].value}$
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="total" radius={[10, 10, 10, 10]}>
                            {revenueData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1e3a8a' : '#f59e0b'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-muted p-6 border-b">
                      <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                        <ClipboardCheck className="h-5 w-5" />
                        بلاغات الصيانة اليدوية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-auto max-h-[300px]">
                       <div className="divide-y">
                          {store.bookings.filter(b => b.conditionReport).length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">لا توجد بلاغات حالياً</div>
                          ) : (
                            store.bookings.filter(b => b.conditionReport).map(b => (
                              <div key={b.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                                 <Badge variant="outline" className="mt-1 text-[10px]">ملاحظة</Badge>
                                 <div className="space-y-1">
                                    <p className="font-bold text-xs">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                                    <p className="text-xs opacity-70 line-clamp-2">{b.conditionReport}</p>
                                 </div>
                              </div>
                            ))
                          )}
                       </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Booking Queue */}
                  <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-primary/5 p-6 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        طابور المراجعة والاعتماد اليدوي
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {store.bookings.length === 0 ? (
                          <div className="p-12 text-center opacity-40">لا توجد حجوزات</div>
                        ) : (
                          store.bookings.map(b => {
                            const broker = store.brokers.find(br => br.id === b.brokerId)
                            const isMyReferral = store.role === 'broker' && b.brokerId === currentBroker.id
                            
                            return (
                              <div key={b.id} className="p-6 flex justify-between items-center hover:bg-muted/10 transition-colors">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-primary">{b.clientName}</p>
                                    {broker && (
                                      <Badge variant="secondary" className="text-[10px] h-5 py-0">عبر: {broker.name}</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Home className="h-3 w-3" /> {store.chalets.find(c => c.id === b.chaletId)?.name}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.guestCount}</span>
                                  </div>
                                  <p className="text-[10px] opacity-60 font-bold">{format(new Date(b.startDate), 'dd MMMM', { locale: ar })} - {format(new Date(b.endDate), 'dd MMMM', { locale: ar })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge className={
                                      b.status === 'confirmed' ? 'bg-green-500' : 
                                      b.status === 'approved' ? 'bg-blue-500' : 
                                      b.status === 'cancelled' ? 'bg-red-500' : 
                                      'bg-yellow-500'
                                    }>
                                      {b.status === 'confirmed' ? 'مؤكد نهائياً' : 
                                       b.status === 'approved' ? 'موافقة مبدئية' : 
                                       b.status === 'cancelled' ? 'ملغي' : 
                                       'بانتظار المراجعة'}
                                    </Badge>

                                    <div className="flex items-center gap-1 mt-2">
                                      {store.role === 'admin' && b.status === 'pending' && (
                                        <Button size="sm" variant="outline" className="text-xs h-7 border-blue-500 text-blue-600 font-bold" onClick={() => store.updateBookingStatus(b.id, 'approved')}>
                                          <ShieldCheck className="h-3 w-3 ml-1" /> موافقة الإدارة
                                        </Button>
                                      )}
                                      {store.role === 'admin' && (b.status === 'pending' || b.status === 'approved') && (
                                        <>
                                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => store.updateBookingStatus(b.id, 'cancelled')}><XCircle /></Button>
                                          <Button size="sm" className="text-xs h-7 bg-green-600 font-bold" onClick={() => store.updateBookingStatus(b.id, 'confirmed')}>تأكيد نهائي</Button>
                                        </>
                                      )}

                                      {store.role === 'broker' && b.status === 'approved' && isMyReferral && (
                                        <Button size="sm" className="text-xs h-7 bg-orange-500 hover:bg-orange-600 font-bold" onClick={() => store.updateBookingStatus(b.id, 'confirmed')}>
                                          <Zap className="h-3 w-3 ml-1" /> تأكيد الوسيط النهائي
                                        </Button>
                                      )}
                                      
                                      {store.role === 'broker' && b.status === 'pending' && isMyReferral && (
                                        <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                                          <ShieldAlert className="h-3 w-3" /> بانتظار موافقة الأدمن
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BookingDialog 
        chalet={selectedChalet}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleConfirmBooking}
        existingBookings={store.bookings}
      />

      <RoleSwitcher currentRole={store.role} onRoleChange={store.setRole} />
    </div>
  )
}
