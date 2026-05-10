
"use client"

import { useState, useMemo, useEffect } from 'react'
import { useAppStore, Booking, Chalet, UserProfile, UserRole } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, Home, CheckCircle2, XCircle, Plus, Trash2, MapPin, Phone, LogOut, 
  Wallet, Receipt, Search, Activity, BarChart3, TrendingUp, Clock, Star,
  History, Box, AlertTriangle, MessageSquare, Tag, FileSpreadsheet,
  Zap, Droplets, ShieldAlert, ClipboardCheck, LayoutDashboard, Settings, UserPlus,
  ArrowUpRight, Megaphone, Percent, Copy, Filter, Download, Calendar as CalendarIcon,
  LogIn, UserCheck, Construction, ShoppingCart, Briefcase, UserCircle, Database,
  ArrowRightLeft, Eye, Waves, Sun, Anchor, Palmtree, TableProperties, CreditCard, Save,
  ArrowDownToLine, Check, Ban
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { EditUserDialog } from '@/components/EditUserDialog'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import { SupervisorActionDialog } from '@/components/SupervisorActionDialog'
import { ChaletSpreadsheet } from '@/components/ChaletSpreadsheet'
import { ChaletReportDialog } from '@/components/ChaletReportDialog'
import { WithdrawalDialog } from '@/components/WithdrawalDialog'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import Image from 'next/image'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth } from '@/firebase'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

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
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [activeSupervisorBooking, setActiveSupervisorBooking] = useState<Booking | null>(null)
  const [isSupervisorActionOpen, setIsSupervisorActionOpen] = useState(false)

  const [reportChalet, setReportChalet] = useState<Chalet | null>(null)
  const [reportBooking, setReportBooking] = useState<Booking | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const [vCash, setVCash] = useState('')
  const [iPay, setIPay] = useState('')
  const [bankInfo, setBankInfo] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const [manualRole, setManualRole] = useState<UserRole | null>(null)
  const activeRole = manualRole || store.role

  useEffect(() => {
    if (store.systemSettings) {
      setVCash(store.systemSettings.vodafoneCash || '')
      setIPay(store.systemSettings.instaPay || '')
      setBankInfo(store.systemSettings.bankAccount || '')
      setWhatsapp(store.systemSettings.whatsappNumber || '')
    }
  }, [store.systemSettings])

  const handleSaveSettings = () => {
    store.updateSystemSettings({
      vodafoneCash: vCash,
      instaPay: iPay,
      bankAccount: bankInfo,
      whatsappNumber: whatsapp
    })
    toast({ title: "تم حفظ إعدادات النظام بنجاح" })
  }

  const brokerStats = useMemo(() => {
    const userId = store.currentUser?.uid || "admin1_uid"; 
    if (activeRole !== 'broker') return { total: 0, withdrawn: 0, pending: 0, balance: 0 };
    
    const totalCommissions = store.bookings
      .filter(b => b.brokerId === userId && b.status === 'confirmed')
      .reduce((acc, b) => acc + (b.brokerCommission || 0), 0);
    
    const withdrawn = store.withdrawals
      .filter(w => w.brokerId === userId && w.status === 'approved')
      .reduce((acc, w) => acc + w.amount, 0);
    
    const pending = store.withdrawals
      .filter(w => w.brokerId === userId && w.status === 'pending')
      .reduce((acc, w) => acc + w.amount, 0);
    
    return { 
      total: totalCommissions, 
      withdrawn, 
      pending, 
      balance: totalCommissions - withdrawn - pending 
    };
  }, [store.bookings, store.withdrawals, activeRole, store.currentUser]);

  const stats = useMemo(() => {
    let relevantBookings = store.bookings;
    if (activeRole === 'broker') {
      relevantBookings = store.bookings.filter(b => b.brokerId === (store.currentUser?.uid || "admin1_uid"));
    }

    const verifiedBookings = relevantBookings.filter(b => b.paymentStatus === 'verified' || b.status === 'admin_approved' || b.status === 'confirmed');
    const totalRevenue = verifiedBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const pendingTransfers = relevantBookings.filter(b => b.paymentStatus === 'pending').length;
    const activeCoupons = store.coupons.filter(c => c.isActive).length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const occupiedToday = store.bookings.filter(b => 
      (b.status === 'confirmed' || b.status === 'admin_approved') && 
      todayStr >= b.startDate.split('T')[0] && 
      todayStr <= b.endDate.split('T')[0]
    ).length;
    
    const totalChaletsCount = store.chalets.length;
    const occupancyRate = totalChaletsCount > 0 ? Math.round((occupiedToday / totalChaletsCount) * 100) : 0;

    return { totalRevenue, pendingTransfers, activeCoupons, occupancyRate };
  }, [store.bookings, store.chalets, store.coupons, activeRole, store.currentUser]);

  const myChalets = useMemo(() => {
    let list = store.chalets || []
    if (activeRole === 'broker') {
        list = list.filter(c => c.ownerBrokerId === (store.currentUser?.uid || "admin1_uid") || c.status === 'active')
    }
    if (searchQuery) {
      list = list.filter(c => (c.name || '').includes(searchQuery) || (c.location && c.location.includes(searchQuery)) || (c.code && (c.code || '').includes(searchQuery)))
    }
    return list
  }, [activeRole, store.chalets, searchQuery, store.currentUser]);

  const filteredBookings = useMemo(() => {
    let list = store.bookings || []
    const userId = store.currentUser?.uid || "admin1_uid";
    if (activeRole === 'broker') list = list.filter(b => b.brokerId === userId)
    if (activeRole === 'supervisor') list = list.filter(b => b.status === 'confirmed' || b.status === 'admin_approved')
    
    if (statusFilter !== 'all') {
      list = list.filter(b => b.status === statusFilter || b.paymentStatus === statusFilter || b.opStatus === statusFilter)
    }

    if (searchQuery) {
      list = list.filter(b => b.clientName.includes(searchQuery) || b.phoneNumber.includes(searchQuery))
    }
    return list
  }, [activeRole, store.bookings, searchQuery, statusFilter, store.currentUser]);

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

  const handleOpenSpreadsheetReport = (chalet: Chalet, booking?: Booking) => {
    setReportChalet(chalet)
    setReportBooking(booking || null)
    setIsReportOpen(true)
  }

  const handleViewFullHistory = (chalet: Chalet) => {
    setIsReportOpen(false);
    setViewingDetailsChalet(chalet);
  }

  const handleAddBookingFromSheet = (chalet: Chalet, date: Date) => {
    setSelectedChalet(chalet);
    setIsBookingOpen(true);
  }

  const handleWithdrawRequest = (data: any) => {
    const userId = store.currentUser?.uid || "admin1_uid";
    const userName = store.currentUser?.name || "أحمد البروكر";
    store.addWithdrawalRequest({
      brokerId: userId,
      brokerName: userName,
      amount: data.amount,
      method: data.method,
      details: data.details
    });
    toast({ title: "تم إرسال طلب السحب بنجاح" });
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
                        {activeRole === 'admin' ? 'مدير النظام' : activeRole === 'broker' ? 'وسيط' : activeRole === 'supervisor' ? 'مشرف' : 'عميل'}
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
        
        {(!activeRole || activeRole === 'client') ? (
          <div className="space-y-0">
            <div className="bg-white py-32 border-b relative overflow-hidden text-right">
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
            <div id="units" className="container mx-auto px-4 py-32 text-right">
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
        ) : activeRole === 'admin' ? (
          <div className="container mx-auto px-4 py-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               <StatCard title="إجمالي الإيرادات" val={stats.totalRevenue.toLocaleString() + ' ج.م'} icon={Wallet} color="text-green-600" />
               <StatCard title="إشغال اليوم" val={stats.occupancyRate + "%"} icon={Activity} color="text-blue-600" />
               <StatCard title="حوالات معلقة" val={stats.pendingTransfers} icon={AlertTriangle} color="text-orange-600" />
               <StatCard title="كوبونات نشطة" val={stats.activeCoupons} icon={Tag} color="text-purple-600" />
            </div>

            <Tabs defaultValue="spreadsheet" className="w-full">
              <TabsList className="bg-white p-2 rounded-[2.5rem] mb-12 flex flex-wrap justify-start border shadow-sm h-auto gap-3">
                <TabsTrigger value="spreadsheet" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><TableProperties className="h-4 w-4" /> جدول الجدولة (الشيت)</TabsTrigger>
                <TabsTrigger value="bookings" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">المالية والحوالات</TabsTrigger>
                <TabsTrigger value="ops" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">متابعة المشرفين</TabsTrigger>
                <TabsTrigger value="withdrawals" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">طلبات السحب</TabsTrigger>
                <TabsTrigger value="chalets" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">إدارة الأصول</TabsTrigger>
                <TabsTrigger value="users" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">فريق العمل</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الإعدادات</TabsTrigger>
              </TabsList>

              <TabsContent value="spreadsheet" className="space-y-8">
                 <ChaletSpreadsheet 
                    chalets={store.chalets} 
                    bookings={store.bookings} 
                    onSelectChalet={handleOpenSpreadsheetReport} 
                    onAddBooking={handleAddBookingFromSheet}
                    userRole={activeRole} 
                  />
              </TabsContent>

              <TabsContent value="ops" className="space-y-8">
                 <div className="bg-white p-10 rounded-[3rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-right">
                       <h3 className="text-3xl font-black">سجل المهام الميدانية</h3>
                       <p className="text-slate-500 font-bold">متابعة استلام وتسليم الوحدات وقراءات العدادات</p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black">إجمالي المهام: {store.bookings.filter(b => b.status === 'confirmed').length}</Badge>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {store.bookings.filter(b => b.status === 'confirmed').map(b => (
                      <Card key={b.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-right">
                         <div className="flex items-center gap-6 flex-row-reverse flex-1 w-full">
                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner ${b.opStatus === 'checked_out' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                               <ClipboardCheck className="h-8 w-8" />
                            </div>
                            <div className="flex-1 space-y-1">
                               <p className="text-xl font-black">{b.clientName}</p>
                               <p className="font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name} | {b.opStatus === 'checked_out' ? 'تم الخروج' : b.opStatus === 'checked_in' ? 'تم الاستلام' : 'بانتظار المشرف'}</p>
                            </div>
                         </div>
                         <Button variant="outline" className="rounded-2xl h-12 px-8 font-black border-slate-200 gap-2" onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}>
                            <Eye className="h-4 w-4" /> عرض تقرير المشرف
                         </Button>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

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
                                  <Badge className={b.paymentStatus === 'verified' ? 'bg-green-500' : 'bg-orange-500'}>
                                    {b.paymentStatus === 'verified' ? 'دفع مؤكد' : 'انتظار المراجعة'}
                                  </Badge>
                                  <Badge variant="outline" className="border-slate-100 bg-slate-50 text-slate-500 font-bold py-1.5 px-4">مرجع: {b.paymentReference}</Badge>
                               </div>
                             </div>
                          </div>
                          <div className="flex gap-3 w-full md:w-auto flex-wrap justify-end">
                            {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                              <>
                                <Button 
                                  className="h-16 px-8 bg-green-600 hover:bg-green-700 font-black rounded-2xl shadow-lg shadow-green-100" 
                                  onClick={() => {
                                    store.updateBooking(b.id, { paymentStatus: 'verified', status: 'confirmed' });
                                    toast({ title: "تم تأكيد الحجز بنجاح" });
                                  }}
                                >
                                  تأكيد الحجز
                                </Button>
                                <Button 
                                  variant="destructive"
                                  className="h-16 px-8 font-black rounded-2xl shadow-lg shadow-red-100" 
                                  onClick={() => {
                                    if (confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
                                      store.updateBooking(b.id, { status: 'cancelled' });
                                      toast({ title: "تم إلغاء الحجز" });
                                    }
                                  }}
                                >
                                  إلغاء الحجز
                                </Button>
                              </>
                            )}
                            <Button variant="outline" className="h-16 px-8 rounded-2xl font-black gap-2 border-slate-200" onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}><Eye className="h-5 w-5" /> عرض التقرير</Button>
                          </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="withdrawals" className="space-y-8">
                 <div className="bg-white p-10 rounded-[3rem] border shadow-sm text-right">
                    <h3 className="text-3xl font-black">طلبات سحب العمولات</h3>
                    <p className="text-slate-500 font-bold">مراجعة وتنفيذ طلبات تحويل الأرباح للمسوقين</p>
                 </div>

                 <div className="space-y-6">
                    {store.withdrawals.map(w => (
                      <Card key={w.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-right">
                         <div className="flex items-center gap-6 flex-row-reverse flex-1 w-full">
                            <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><Wallet className="h-8 w-8" /></div>
                            <div className="flex-1 space-y-1">
                               <p className="text-xl font-black">{w.brokerName}</p>
                               <p className="font-bold text-primary">{w.amount.toLocaleString()} ج.م <span className="text-slate-400 text-xs">({w.method === 'vodafone_cash' ? 'فودافون كاش' : w.method === 'instapay' ? 'انستا باي' : 'بنك'})</span></p>
                               <p className="text-sm font-bold text-slate-500">{w.details}</p>
                            </div>
                         </div>
                         <div className="flex gap-3 w-full md:w-auto justify-end">
                            {w.status === 'pending' ? (
                              <>
                                <Button className="rounded-xl bg-green-600 hover:bg-green-700 font-black h-12 px-6" onClick={() => store.updateWithdrawalStatus(w.id, 'approved')}>تأكيد الدفع <Check className="ml-2 h-4 w-4" /></Button>
                                <Button variant="destructive" className="rounded-xl font-black h-12 px-6" onClick={() => store.updateWithdrawalStatus(w.id, 'rejected')}>رفض <Ban className="ml-2 h-4 w-4" /></Button>
                              </>
                            ) : (
                              <Badge className={w.status === 'approved' ? 'bg-green-100 text-green-700 px-6 py-2' : 'bg-red-100 text-red-700 px-6 py-2'}>
                                {w.status === 'approved' ? 'تم الدفع' : 'مرفوض'}
                              </Badge>
                            )}
                         </div>
                      </Card>
                    ))}
                    {store.withdrawals.length === 0 && (
                      <div className="text-center py-20 text-slate-400 font-bold">لا توجد طلبات سحب حالياً</div>
                    )}
                 </div>
              </TabsContent>

              <TabsContent value="chalets" className="space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border shadow-sm gap-6">
                    <div className="text-right">
                       <h3 className="text-3xl font-black">إدارة الأصول العقارية</h3>
                       <p className="text-slate-500 font-bold">إضافة وتعديل بيانات الشاليهات يدوياً</p>
                    </div>
                    <Button className="rounded-2xl h-14 px-8 font-black gap-2" onClick={() => setIsAddChaletOpen(true)}>
                       <Plus className="h-5 w-5" /> إضافة شاليه جديد
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {store.chalets.map(c => (
                      <Card key={c.id} className="overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-white flex flex-col text-right group">
                         <div className="relative h-48">
                            <Image src={c.image} alt={c.name} fill className="object-cover" />
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                               <Badge className={`${c.status === 'active' ? 'bg-green-500' : c.status === 'maintenance' ? 'bg-orange-500' : 'bg-slate-500'} text-white border-none px-4 py-1 rounded-full font-black`}>
                                 {c.status === 'active' ? 'نشط' : c.status === 'maintenance' ? 'صيانة' : 'مغلق'}
                               </Badge>
                               <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-none shadow-sm">{c.code}</Badge>
                            </div>
                         </div>
                         <div className="p-6 space-y-4">
                            <h4 className="text-xl font-black">{c.name}</h4>
                            <div className="flex justify-between items-center flex-row-reverse border-t pt-4">
                               <div className="text-right">
                                  <p className="text-[10px] text-slate-400 font-black uppercase">السعر الأساسي</p>
                                  <p className="text-lg font-black text-primary">{c.normalPrice.toLocaleString()} ج.م</p>
                               </div>
                               <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" className="rounded-full bg-slate-50" onClick={() => setViewingDetailsChalet(c)}><Settings className="h-4 w-4" /></Button>
                               </div>
                            </div>
                         </div>
                      </Card>
                    ))}
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
                      </Card>
                    ))}
                 </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl space-y-8 text-right">
                       <h3 className="text-2xl font-black flex items-center gap-2 justify-end">إعدادات النظام والدفع <CreditCard className="text-primary" /></h3>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <Label className="font-bold text-slate-500">رقم فودافون كاش</Label>
                             <Input placeholder="01xxxxxxxxx" value={vCash} onChange={e => setVCash(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none text-right" />
                          </div>
                          <div className="space-y-2">
                             <Label className="font-bold text-slate-500">معرف انستا باي (InstaPay ID)</Label>
                             <Input placeholder="name@instapay" value={iPay} onChange={e => setIPay(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none text-right" />
                          </div>
                          <div className="space-y-2">
                             <Label className="font-bold text-slate-500">بيانات الحساب البنكي</Label>
                             <Textarea placeholder="اسم البنك، رقم الحساب، IBAN..." value={bankInfo} onChange={e => setBankInfo(e.target.value)} className="rounded-2xl min-h-[100px] bg-slate-50 border-none text-right" />
                          </div>
                          <div className="space-y-2">
                             <Label className="font-bold text-slate-500">رقم الواتساب العائم (بدون 00)</Label>
                             <Input placeholder="201xxxxxxxxx" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none text-right" />
                          </div>
                          <Button className="w-full h-16 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20" onClick={handleSaveSettings}>
                             <Save className="h-5 w-5" /> حفظ إعدادات النظام
                          </Button>
                       </div>
                    </Card>

                    <Card className="p-10 rounded-[3rem] bg-white border-none shadow-xl space-y-8 text-right flex flex-col justify-between">
                       <div>
                          <h3 className="text-2xl font-black flex items-center gap-2 justify-end">صيانة المنظومة <Settings className="text-slate-400" /></h3>
                          <p className="text-slate-500 font-bold mt-4">توليد بيانات يدوية حقيقية لتجربة كافة وظائف المنظومة بشكل سريع.</p>
                       </div>
                       <Button className="w-full h-16 rounded-2xl font-black gap-3 text-lg bg-slate-900 hover:bg-slate-800" variant="default" onClick={() => { store.seedDatabase(); toast({ title: "تم توليد البيانات بنجاح" }); }}>
                          توليد البيانات الآن <Database className="h-5 w-5" />
                       </Button>
                    </Card>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : activeRole === 'broker' ? (
          <div className="container mx-auto px-4 py-12 space-y-12">
             <div className="flex justify-between items-center flex-row-reverse">
                <div className="text-right">
                   <h2 className="text-4xl font-black text-slate-900">لوحة تحكم الوسيط</h2>
                   <p className="text-slate-500 font-bold mt-2">تابع عمولاتك (200 ج.م لليلة) وجدول حجوزاتك</p>
                </div>
                <div className="flex gap-4">
                  <StatCard title="إجمالي العمولات" val={brokerStats.total.toLocaleString() + " ج.م"} icon={TrendingUp} color="text-primary" />
                  <StatCard title="حجوزاتي" val={filteredBookings.length} icon={CalendarIcon} color="text-blue-600" />
                </div>
             </div>

             <Tabs defaultValue="spreadsheet" className="w-full">
                <TabsList className="bg-white p-2 rounded-[2.5rem] mb-12 flex justify-start border shadow-sm h-auto gap-3">
                   <TabsTrigger value="spreadsheet" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><TableProperties className="h-4 w-4" /> جدول الجدولة</TabsTrigger>
                   <TabsTrigger value="ops" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><ClipboardCheck className="h-4 w-4" /> متابعة التنفيذ</TabsTrigger>
                   <TabsTrigger value="wallet" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><Wallet className="h-4 w-4" /> المحفظة والأرباح</TabsTrigger>
                   <TabsTrigger value="units" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all">تصفح الوحدات</TabsTrigger>
                </TabsList>

                <TabsContent value="spreadsheet">
                   <ChaletSpreadsheet 
                    chalets={store.chalets} 
                    bookings={store.bookings} 
                    onSelectChalet={handleOpenSpreadsheetReport} 
                    onAddBooking={handleAddBookingFromSheet}
                    userRole={activeRole} 
                   />
                </TabsContent>

                <TabsContent value="ops" className="space-y-8">
                   <div className="bg-white p-10 rounded-[3rem] border shadow-sm text-right">
                      <h3 className="text-3xl font-black">متابعة تنفيذ حجوزاتي</h3>
                      <p className="text-slate-500 font-bold">تأكد من استلام عملائك للوحدات في الموعد</p>
                   </div>
                   <div className="grid grid-cols-1 gap-6">
                      {filteredBookings.filter(b => b.status === 'confirmed').map(b => (
                        <Card key={b.id} className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-right">
                           <div className="text-right flex-1">
                              <p className="text-xl font-black">{b.clientName}</p>
                              <p className="text-sm font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                           </div>
                           <div className="flex items-center gap-4">
                              <Badge className={b.opStatus === 'checked_out' ? 'bg-green-500' : b.opStatus === 'checked_in' ? 'bg-blue-500' : 'bg-orange-500'}>
                                {b.opStatus === 'checked_out' ? 'تم الخروج' : b.opStatus === 'checked_in' ? 'تم الاستلام' : 'بانتظار المشرف'}
                              </Badge>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}><Eye className="h-5 w-5" /></Button>
                           </div>
                        </Card>
                      ))}
                   </div>
                </TabsContent>

                <TabsContent value="wallet" className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl text-center space-y-4">
                         <p className="text-xs font-black text-slate-400 uppercase">الرصيد القابل للسحب</p>
                         <p className="text-4xl font-black text-primary">{brokerStats.balance.toLocaleString()} ج.م</p>
                         <Button className="w-full rounded-2xl h-14 font-black gap-2 mt-4" onClick={() => setIsWithdrawalOpen(true)} disabled={brokerStats.balance <= 0}>
                            طلب سحب الرصيد <ArrowDownToLine className="h-5 w-5" />
                         </Button>
                      </Card>
                      <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl text-center space-y-4">
                         <p className="text-xs font-black text-slate-400 uppercase">بانتظار المراجعة</p>
                         <p className="text-4xl font-black text-orange-500">{brokerStats.pending.toLocaleString()} ج.م</p>
                      </Card>
                      <Card className="p-8 rounded-[2.5rem] bg-white border-none shadow-xl text-center space-y-4">
                         <p className="text-xs font-black text-slate-400 uppercase">إجمالي المسحوبات</p>
                         <p className="text-4xl font-black text-green-600">{brokerStats.withdrawn.toLocaleString()} ج.م</p>
                      </Card>
                   </div>
                </TabsContent>

                <TabsContent value="units">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {myChalets.map(c => <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />)}
                   </div>
                </TabsContent>
             </Tabs>
          </div>
        ) : activeRole === 'supervisor' ? (
          <div className="container mx-auto px-4 py-12 space-y-12">
             <div className="flex justify-between items-center flex-row-reverse">
                <div className="text-right">
                   <h2 className="text-4xl font-black text-slate-900">المهام الميدانية للمشرف</h2>
                   <p className="text-slate-500 font-bold mt-2">إدارة الاستلام والتسليم وفحص الوحدات يدوياً</p>
                </div>
                <StatCard title="مهام قيد الانتظار" val={filteredBookings.filter(b => b.opStatus !== 'checked_out').length} icon={ShieldAlert} color="text-orange-600" />
             </div>

             <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="bg-white p-2 rounded-[2.5rem] mb-12 flex justify-start border shadow-sm h-auto gap-3">
                   <TabsTrigger value="tasks" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><ClipboardCheck className="h-4 w-4" /> مهام اليوم</TabsTrigger>
                   <TabsTrigger value="spreadsheet" className="rounded-2xl px-8 py-4 font-black data-[state=active]:bg-primary data-[state=active]:text-white transition-all gap-2"><TableProperties className="h-4 w-4" /> جدول الإشغال (مشاهدة)</TabsTrigger>
                </TabsList>

                <TabsContent value="tasks" className="space-y-6">
                   {filteredBookings.map(b => (
                     <Card key={b.id} className="p-8 rounded-[2.5rem] shadow-xl bg-white flex flex-col md:flex-row justify-between items-center flex-row-reverse gap-6">
                         <div className="text-right flex items-center gap-6 flex-row-reverse flex-1 w-full">
                           <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner ${b.opStatus === 'checked_in' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}><ClipboardCheck /></div>
                           <div>
                              <p className="text-2xl font-black">{b.clientName}</p>
                              <p className="text-slate-500 font-bold">{store.chalets.find(c => c.id === b.chaletId)?.name} | {b.opStatus === 'checked_out' ? 'تم الخروج' : b.opStatus === 'checked_in' ? 'تم الاستلام - بانتظار الخروج' : 'لم يستلم بعد'}</p>
                              <div className="flex gap-2 mt-2 justify-end">
                                 <Badge variant="outline" className="border-slate-100 text-[10px]">{format(new Date(b.startDate), 'dd MMM')} - {format(new Date(b.endDate), 'dd MMM')}</Badge>
                              </div>
                           </div>
                         </div>
                         <div className="flex gap-3 w-full md:w-auto">
                            <Button variant="outline" className="h-14 px-6 rounded-2xl font-black border-slate-200 gap-2 flex-1 md:flex-none" onClick={() => window.open(`tel:${b.phoneNumber}`)}><Phone className="h-4 w-4" /> اتصال بالعميل</Button>
                            {b.opStatus !== 'checked_out' && (
                              <Button className={`h-14 px-10 rounded-2xl font-black text-white flex-1 md:flex-none ${b.opStatus === 'checked_in' ? 'bg-orange-600' : 'bg-primary'}`} onClick={() => { setActiveSupervisorBooking(b); setIsSupervisorActionOpen(true); }}>
                                {b.opStatus === 'checked_in' ? 'إجراء إخلاء' : 'إجراء استلام'}
                              </Button>
                            )}
                         </div>
                     </Card>
                   ))}
                   {filteredBookings.length === 0 && (
                     <div className="text-center py-20 bg-white rounded-[3rem] border-dashed border-2 text-slate-300 font-black">لا توجد مهام حجز مؤكدة حالياً</div>
                   )}
                </TabsContent>

                <TabsContent value="spreadsheet">
                   <ChaletSpreadsheet 
                    chalets={store.chalets} 
                    bookings={store.bookings} 
                    onSelectChalet={handleOpenSpreadsheetReport} 
                    userRole={activeRole} 
                   />
                </TabsContent>
             </Tabs>
          </div>
        ) : null}

      </main>

      <footer className="bg-slate-900 text-white py-12 text-center border-t-8 border-primary">
         <p className="text-slate-400 font-bold">فارما بيتش ريزورت - نظام الإدارة اليدوي الموثوق</p>
      </footer>

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
        </DialogContent>
      </Dialog>

      <ChaletDetailsDialog chalet={viewingDetailsChalet} isOpen={!!viewingDetailsChalet} onClose={() => setViewingDetailsChalet(null)} onBook={() => { setSelectedChalet(viewingDetailsChalet); setIsBookingOpen(true); setViewingDetailsChalet(null); }} existingBookings={store.bookings} userRole={activeRole} />
      
      <BookingDialog 
        chalet={selectedChalet} 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onConfirm={(data) => { 
          store.addBooking(data);
          toast({ title: "تم إرسال طلب الحجز بنجاح" }); 
        }} 
        existingBookings={store.bookings}
        currentUser={store.currentUser}
      />

      <ChaletReportDialog 
        chalet={reportChalet} 
        booking={reportBooking} 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        onViewFullHistory={handleViewFullHistory}
        userRole={activeRole} 
        allBookings={store.bookings}
      />

      <AddChaletDialog isOpen={isAddChaletOpen} onClose={() => setIsAddChaletOpen(false)} onAdd={(data) => { store.addChalet(data); toast({ title: "تمت إضافة الشاليه بنجاح" }); }} />
      <AddUserDialog isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} onAdd={(data) => { store.addUser(data); toast({ title: "تم إنشاء حساب الموظف بنجاح" }); }} chalets={store.chalets} />
      <EditUserDialog user={editingUser} isOpen={isEditUserOpen} onClose={() => { setIsEditUserOpen(false); setEditingUser(null); }} onUpdate={(userId, data) => { store.updateUser(userId, data); toast({ title: "تم تحديث بيانات الموظف بنجاح" }); }} />
      <SupervisorActionDialog isOpen={isSupervisorActionOpen} onClose={() => setIsSupervisorActionOpen(false)} booking={activeSupervisorBooking} chalet={store.chalets.find(c => c.id === activeSupervisorBooking?.chaletId) || null} onConfirm={(updates) => store.updateBooking(activeSupervisorBooking!.id, updates)} />
      <WithdrawalDialog isOpen={isWithdrawalOpen} onClose={() => setIsWithdrawalOpen(false)} availableBalance={brokerStats.balance} onConfirm={handleWithdrawRequest} />

      <RoleSwitcher currentRole={activeRole} onRoleChange={setManualRole} />

      <WhatsAppButton number={store.systemSettings?.whatsappNumber} />

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

function WhatsAppButton({ number }: { number?: string }) {
  if (!number) return null;
  const link = `https://wa.me/${number.replace(/\s+/g, '')}`;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 left-6 bg-[#25D366] text-white p-5 rounded-full shadow-2xl z-[60] hover:scale-110 transition-transform flex items-center justify-center animate-bounce shadow-[#25D366]/20"
      title="تواصل معنا عبر واتساب"
    >
      <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  );
}
