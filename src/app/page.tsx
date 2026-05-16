
"use client"

import { useState, useMemo, useEffect } from 'react'
import { useAppStore, Booking, Chalet, UserProfile, UserRole } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Users, Wallet, Receipt, Search, Activity, Info, 
  LayoutDashboard, UserPlus, ArrowUpRight, Filter, Calendar as LucideCalendar,
  LogIn, UserCircle, Eye, Waves, Sun, Anchor, Palmtree, Settings,
  LogOut, Phone, Menu, Plus, FileText, Trash2, Pencil, Image as ImageIcon, Clock, CheckCircle2,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BookingDialog } from '@/components/BookingDialog'
import { ChaletCard } from '@/components/ChaletCard'
import { AddChaletDialog } from '@/components/AddChaletDialog'
import { EditChaletDialog } from '@/components/EditChaletDialog'
import { AddUserDialog } from '@/components/AddUserDialog'
import { EditUserDialog } from '@/components/EditUserDialog'
import { ChaletDetailsDialog } from '@/components/ChaletDetailsDialog'
import { SupervisorActionDialog } from '@/components/SupervisorActionDialog'
import { ChaletSpreadsheet } from '@/components/ChaletSpreadsheet'
import { ChaletReportDialog } from '@/components/ChaletReportDialog'
import { WithdrawalDialog } from '@/components/WithdrawalDialog'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { BottomNav } from '@/components/BottomNav'
import { SidebarNav } from '@/components/SidebarNav'
import { ChaletFinancialReport } from '@/components/ChaletFinancialReport'
import Image from 'next/image'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { useAuth } from '@/firebase'
import { cn } from '@/lib/utils'
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
  const [editingChalet, setEditingChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isAddChaletOpen, setIsAddChaletOpen] = useState(false)
  const [isEditChaletOpen, setIsEditChaletOpen] = useState(false)
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

  const [financialReportChalet, setFinancialReportChalet] = useState<Chalet | null>(null)

  const [vCash, setVCash] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const [manualRole, setManualRole] = useState<UserRole | null>(null)
  const activeRole = manualRole || store.role

  const [activeMobileTab, setActiveMobileTab] = useState('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (activeRole === 'admin') setActiveMobileTab('spreadsheet')
    else if (activeRole === 'broker') setActiveMobileTab('spreadsheet')
    else if (activeRole === 'supervisor') setActiveMobileTab('tasks')
    else if (activeRole === 'client') setActiveMobileTab('my-bookings')
    else setActiveMobileTab('home')
  }, [activeRole])

  useEffect(() => {
    if (store.systemSettings) {
      setVCash(store.systemSettings.vodafoneCash || '')
      setWhatsapp(store.systemSettings.whatsappNumber || '')
    }
  }, [store.systemSettings])

  const handleSaveSettings = () => {
    store.updateSystemSettings({
      vodafoneCash: vCash,
      whatsappNumber: whatsapp
    })
    toast({ title: "تم حفظ إعدادات النظام بنجاح" })
  }

  const brokerStats = useMemo(() => {
    const userId = store.currentUser?.uid || ""; 
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
      relevantBookings = store.bookings.filter(b => b.brokerId === (store.currentUser?.uid || ""));
    }

    const verifiedBookings = relevantBookings.filter(b => b.paymentStatus === 'verified' || b.status === 'admin_approved' || b.status === 'confirmed');
    const totalRevenue = verifiedBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const pendingTransfers = relevantBookings.filter(b => b.paymentStatus === 'pending').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const occupiedToday = store.bookings.filter(b => 
      (b.status === 'confirmed' || b.status === 'admin_approved') && 
      todayStr >= b.startDate.split('T')[0] && 
      todayStr <= b.endDate.split('T')[0]
    ).length;
    
    const totalChaletsCount = store.chalets.length;
    const occupancyRate = totalChaletsCount > 0 ? Math.round((occupiedToday / totalChaletsCount) * 100) : 0;

    return { totalRevenue, pendingTransfers, occupancyRate };
  }, [store.bookings, store.chalets, activeRole, store.currentUser]);

  const myChalets = useMemo(() => {
    let list = store.chalets || []
    if (activeRole === 'broker') {
        list = list.filter(c => c.ownerBrokerId === (store.currentUser?.uid || "") || c.status === 'active')
    }
    if (searchQuery) {
      list = list.filter(c => (c.name || '').includes(searchQuery) || (c.location && c.location.includes(searchQuery)) || (c.code && (c.code || '').includes(searchQuery)))
    }
    return list
  }, [activeRole, store.chalets, searchQuery, store.currentUser]);

  const filteredBookings = useMemo(() => {
    let list = store.bookings || []
    const userId = store.currentUser?.uid || "";
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

  const clientBookings = useMemo(() => {
    if (activeRole !== 'client') return []
    const userPhone = store.currentUser?.phone || ""
    return store.bookings.filter(b => b.phoneNumber === userPhone)
  }, [store.bookings, store.currentUser, activeRole])

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
    const userId = store.currentUser?.uid || "";
    const userName = store.currentUser?.name || "وسيط";
    store.addWithdrawalRequest({
      brokerId: userId,
      brokerName: userName,
      amount: data.amount,
      method: data.method,
      details: data.details
    });
    toast({ title: "تم إرسال طلب السحب بنجاح" });
  }

  const handleDeleteChalet = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الشاليه نهائياً من المنظومة؟')) {
      store.deleteChalet(id);
      toast({ title: "تم حذف الشاليه بنجاح" });
    }
  }

  if (!store.isLoaded) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-primary p-6 rounded-3xl shadow-2xl shadow-primary/30 animate-pulse">
        <Anchor className="text-white h-12 w-12" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-right pb-24 md:pb-0" dir="rtl">
      
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 py-3 md:py-4 px-4 md:px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
             {activeRole && activeRole !== 'client' && (
               <Button variant="ghost" size="icon" className="rounded-xl bg-slate-50" onClick={() => setIsSidebarOpen(true)}>
                 <Menu className="h-5 w-5 text-slate-600" />
               </Button>
             )}
             <div className="bg-primary p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg shadow-primary/20"><Anchor className="text-white h-5 w-5 md:h-6 md:w-6" /></div>
             <div className="text-right">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-none">فارما بيتش</h1>
                <span className="text-[8px] md:text-[10px] text-primary font-bold tracking-widest uppercase">Management System</span>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             {store.authUser ? (
               <>
                 <div className="text-left hidden sm:block">
                    <p className="text-xs md:text-sm font-black text-slate-900">{store.currentUser?.name || store.authUser.email}</p>
                    <Badge className={cn("bg-primary/10 text-primary border-none py-1 px-3 rounded-full font-black", "text-[10px]")}>
                        {activeRole === 'admin' ? 'مدير النظام' : activeRole === 'broker' ? 'وسيط' : activeRole === 'supervisor' ? 'مشرف' : 'عميل'}
                    </Badge>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="rounded-xl md:rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-colors"><LogOut className="h-5 w-5" /></Button>
               </>
             ) : (
               <Button onClick={() => setIsAuthOpen(true)} className="rounded-xl md:rounded-2xl h-10 md:h-12 px-4 md:px-8 font-black gap-2 shadow-lg shadow-primary/20 text-xs md:text-sm">
                 <LogIn className="h-4 w-4 md:h-5 md:w-5" /> دخول النظام
               </Button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {(!activeRole || activeRole === 'client') ? (
          activeMobileTab === 'home' ? (
            <div className="space-y-0">
              <div className="bg-white py-12 md:py-32 border-b relative overflow-hidden text-right">
                <div className="container mx-auto px-4 text-center space-y-6 md:space-y-12 relative z-10">
                    <div className="flex justify-center gap-3 md:gap-8 mb-2">
                      <div className="bg-primary/5 p-3 md:p-6 rounded-2xl md:rounded-[2rem] text-primary animate-bounce delay-75"><Waves size={24} className="md:w-12 md:h-12" /></div>
                      <div className="bg-primary/5 p-3 md:p-6 rounded-2xl md:rounded-[2rem] text-primary animate-bounce delay-150"><Sun size={24} className="md:w-12 md:h-12" /></div>
                      <div className="bg-primary/5 p-3 md:p-6 rounded-2xl md:rounded-[2rem] text-primary animate-bounce delay-300"><Palmtree size={24} className="md:w-12 md:h-12" /></div>
                    </div>
                    <h2 className="text-3xl md:text-7xl font-black text-slate-900 leading-tight">أهلاً بك في <span className="text-primary">فارما بيتش</span><br/>مع مستر اكس</h2>
                    <p className="text-sm md:text-2xl font-bold text-slate-500 max-w-3xl mx-auto leading-relaxed px-2">استكشف أفخم شاليهات فارما بيتش واحجز عطلتك القادمة بضغطة زر.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6 px-4">
                      <Button size="lg" className="rounded-2xl md:rounded-[2rem] h-14 md:h-20 px-10 md:px-16 text-lg md:text-2xl font-black shadow-2xl shadow-primary/30 transition-transform hover:scale-105" onClick={() => document.getElementById('units')?.scrollIntoView({behavior: 'smooth'})}>تصفح الشاليهات</Button>
                      {!store.authUser && (
                        <Button size="lg" variant="outline" className="rounded-2xl md:rounded-[2rem] h-14 md:h-20 px-10 md:px-16 text-lg md:text-2xl font-black border-2 border-slate-200" onClick={() => setIsAuthOpen(true)}>سجل دخولك</Button>
                      )}
                    </div>
                </div>
              </div>
              <div id="units" className="container mx-auto px-4 py-12 md:py-32 text-right">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-16 gap-6">
                    <div className="space-y-1 text-right w-full md:w-auto">
                      <h3 className="text-2xl md:text-5xl font-black text-slate-900">الوحدات المتاحة</h3>
                      <p className="text-slate-400 font-bold text-xs md:text-lg">اختر وحدتك المثالية من مجموعتنا الحصرية</p>
                    </div>
                    <div className="w-full md:w-[450px] relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
                      <Input placeholder="ابحث عن موقع أو شاليه..." className="h-12 md:h-16 rounded-2xl md:rounded-[1.5rem] pr-12 text-right bg-white shadow-lg border-none text-sm md:text-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                    {myChalets.map(c => (
                      <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="container mx-auto px-4 py-8 md:py-16 space-y-8">
               <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm text-right">
                  <h2 className="text-2xl md:text-4xl font-black text-slate-900">حجوزاتي الخاصة</h2>
                  <p className="text-slate-500 font-bold mt-1">تتبع حالة إقامتك واستلامك للوحدات في فارما بيتش</p>
               </div>

               {clientBookings.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 space-y-4">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-300"><LucideCalendar size={40} /></div>
                    <p className="text-xl font-black text-slate-400">لم تقم بإجراء أي حجوزات بعد</p>
                    <Button variant="link" className="text-primary font-bold" onClick={() => setActiveMobileTab('home')}>تصفح الشاليهات الآن</Button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clientBookings.map(b => (
                      <Card key={b.id} className="p-6 md:p-8 rounded-[2.5rem] bg-white border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer" onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}>
                         <div className="flex items-start justify-between flex-row-reverse gap-4 mb-6">
                            <div className="text-right flex-1">
                               <p className="text-[10px] font-black text-primary uppercase tracking-widest">{store.chalets.find(c => c.id === b.chaletId)?.code}</p>
                               <h4 className="text-xl font-black text-slate-900">{store.chalets.find(c => c.id === b.chaletId)?.name}</h4>
                            </div>
                            <Badge className={cn(
                              b.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500',
                              "text-white px-4 py-1.5 rounded-full font-black text-[10px] border-none"
                            )}>
                               {b.status === 'confirmed' ? 'حجز مؤكد' : 'بانتظار التأكيد'}
                            </Badge>
                         </div>

                         <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 p-3 rounded-2xl text-right">
                               <p className="text-[8px] font-black text-slate-400 uppercase">تاريخ الوصول</p>
                               <p className="text-sm font-black">{format(new Date(b.startDate), 'dd MMMM', { locale: ar })}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-2xl text-right">
                               <p className="text-[8px] font-black text-slate-400 uppercase">تاريخ المغادرة</p>
                               <p className="text-sm font-black">{format(new Date(b.endDate), 'dd MMMM', { locale: ar })}</p>
                            </div>
                         </div>

                         <div className="flex items-center justify-between flex-row-reverse pt-4 border-t">
                            <div className="flex items-center gap-2 flex-row-reverse">
                               <div className={cn(
                                 "h-8 w-8 rounded-full flex items-center justify-center",
                                 b.opStatus === 'checked_in' ? 'bg-blue-100 text-blue-600' : 
                                 b.opStatus === 'checked_out' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                               )}>
                                  {b.opStatus === 'checked_in' ? <Activity size={16} /> : 
                                   b.opStatus === 'checked_out' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                               </div>
                               <span className="text-xs font-black text-slate-600">
                                  {b.opStatus === 'checked_in' ? 'أنت الآن في الوحدة' : 
                                   b.opStatus === 'checked_out' ? 'تم إنهاء الإقامة' : 'بانتظار موعد الاستلام'}
                               </span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary font-black gap-2">التفاصيل <ChevronRight className="h-4 w-4" /></Button>
                         </div>
                      </Card>
                    ))}
                 </div>
               )}
            </div>
          )
        ) : activeRole === 'admin' ? (
          <div className="container mx-auto px-4 py-6 md:py-12 space-y-6 md:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-8">
               <StatCard title="الإيرادات" val={stats.totalRevenue.toLocaleString() + ' ج'} icon={Wallet} color="text-green-600" />
               <StatCard title="الإشغال" val={stats.occupancyRate + "%"} icon={Activity} color="text-blue-600" />
               <StatCard title="حوالات معلقة" val={stats.pendingTransfers} icon={Info} color="text-orange-600" />
            </div>

            <div className="w-full">
              {activeMobileTab === 'spreadsheet' && (
                 <ChaletSpreadsheet 
                    chalets={store.chalets} 
                    bookings={store.bookings} 
                    onSelectChalet={handleOpenSpreadsheetReport} 
                    onAddBooking={handleAddBookingFromSheet}
                    userRole={activeRole} 
                  />
              )}

              {activeMobileTab === 'chalet-reports' && (
                financialReportChalet ? (
                  <ChaletFinancialReport 
                    chalet={financialReportChalet} 
                    bookings={store.bookings} 
                    onUpdateBooking={store.updateBooking}
                    onBack={() => setFinancialReportChalet(null)}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-right">
                        <h3 className="text-xl md:text-2xl font-black">تقارير الشاليهات التفصيلية</h3>
                        <p className="text-slate-500 font-bold text-xs">اختر شاليه لعرض سجلات الليالي والبيانات المالية</p>
                      </div>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="بحث بالكود أو الاسم..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="rounded-xl pr-10 bg-slate-50 border-none h-10 md:h-12 text-xs" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myChalets.map(c => (
                        <Card key={c.id} className="p-4 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all border-none cursor-pointer group" onClick={() => setFinancialReportChalet(c)}>
                          <div className="flex items-center gap-4 flex-row-reverse text-right">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                              <FileText size={24} />
                            </div>
                            <div className="flex-1">
                              <p className="font-black text-lg">{c.name}</p>
                              <Badge className="bg-slate-100 text-slate-600 border-none px-2 py-0 text-[10px]">{c.code}</Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}

              {activeMobileTab === 'ops' && (
                <div className="space-y-4 md:space-y-8">
                  <div className="bg-white p-4 md:p-10 rounded-2xl md:rounded-[3rem] border shadow-sm">
                      <h3 className="text-xl md:text-3xl font-black">سجل المهام الميدانية</h3>
                      <p className="text-slate-500 font-bold text-xs md:text-sm">متابعة استلام وتسليم الوحدات</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:gap-6">
                      {store.bookings.filter(b => b.status === 'confirmed').map(b => (
                        <Card key={b.id} className="p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-white border-none shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 text-right">
                          <div className="flex items-center gap-3 md:gap-6 flex-row-reverse flex-1 w-full">
                              <div className="h-10 w-10 md:h-16 md:w-16 rounded-xl bg-slate-50 text-primary flex items-center justify-center shadow-inner">
                                <Activity className="h-5 w-5 md:h-8 md:w-8" />
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <p className="text-base md:text-xl font-black">{b.clientName}</p>
                                <p className="text-xs font-bold text-slate-500">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                              </div>
                          </div>
                          <Button variant="outline" className="w-full md:w-auto rounded-xl h-10 md:h-12 px-6 font-black border-slate-200 gap-2 text-xs" onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}>
                              <Eye className="h-4 w-4" /> عرض التقرير
                          </Button>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {activeMobileTab === 'bookings' && (
                <div className="space-y-4 md:space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-8 rounded-2xl md:rounded-[3rem] border shadow-sm">
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl flex-row-reverse w-full md:w-auto">
                          <Filter className="h-4 w-4 text-slate-400" />
                          <select className="bg-transparent font-black text-[10px] md:text-sm outline-none px-2 w-full" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                              <option value="all">كل الحالات</option>
                              <option value="pending">حوالات معلقة</option>
                              <option value="verified">دفع مؤكد</option>
                          </select>
                      </div>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-xl pr-10 bg-slate-50 border-none h-10 md:h-12 text-xs" />
                      </div>
                  </div>

                  <div className="space-y-3 md:space-y-6">
                      {filteredBookings.map(b => (
                        <Card key={b.id} className="p-4 md:p-10 rounded-2xl md:rounded-[3rem] border-none shadow-xl bg-white flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8 hover:shadow-2xl transition-all">
                            <div className="flex items-center gap-3 md:gap-8 flex-1 w-full text-right flex-row-reverse">
                              <div className="p-3 md:p-8 rounded-xl md:rounded-[2rem] bg-slate-50 text-primary shadow-inner"><Receipt className="h-6 w-6 md:h-12 md:w-12" /></div>
                              <div className="flex-1 space-y-0.5">
                                <p className="font-black text-lg md:text-3xl text-slate-900">{b.clientName}</p>
                                <p className="text-xs md:text-lg font-bold text-slate-500">{(b.totalAmount || 0).toLocaleString()} ج.م</p>
                                <div className="flex gap-2 justify-end mt-1 flex-wrap">
                                    <Badge className={cn(b.paymentStatus === 'verified' ? 'bg-green-500' : 'bg-orange-500', "text-white border-none py-1 px-3 rounded-full font-black", "text-[10px]")}>
                                      {b.paymentStatus === 'verified' ? 'مؤكد' : 'معلق'}
                                    </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                              {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                                <Button className="h-10 md:h-16 px-4 md:px-8 bg-green-600 font-black rounded-xl md:rounded-2xl flex-1 md:flex-none text-xs" onClick={() => { store.updateBooking(b.id, { paymentStatus: 'verified', status: 'confirmed' }); toast({ title: "تم تأكيد الحجز" }); }}>تأكيد</Button>
                              )}
                              <Button variant="outline" className="h-10 md:h-16 px-4 md:px-8 rounded-xl md:rounded-2xl font-black gap-2 border-slate-200 text-xs flex-1 md:flex-none" onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}><Eye className="h-4 w-4" /> تقرير</Button>
                            </div>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {activeMobileTab === 'withdrawals' && (
                <div className="space-y-4">
                  {store.withdrawals.map(w => (
                    <Card key={w.id} className="p-4 rounded-2xl bg-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-3 text-right">
                        <div className="flex items-center gap-3 flex-row-reverse flex-1 w-full">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Wallet size={20} /></div>
                          <div className="flex-1">
                              <p className="font-black text-sm md:text-lg">{w.brokerName}</p>
                              <p className="font-bold text-primary text-xs">{w.amount.toLocaleString()} ج.م</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                          {w.status === 'pending' ? (
                            <>
                              <Button className="bg-green-600 rounded-xl h-9 px-4 text-[10px] font-black" onClick={() => store.updateWithdrawalStatus(w.id, 'approved')}>موافقة</Button>
                              <Button variant="destructive" className="rounded-xl h-9 px-4 text-[10px] font-black" onClick={() => store.updateWithdrawalStatus(w.id, 'rejected')}>رفض</Button>
                            </>
                          ) : (
                            <Badge className={cn(w.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700', "text-[10px] border-none")}>
                              {w.status === 'approved' ? 'تم الدفع' : 'مرفوض'}
                            </Badge>
                          )}
                        </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeMobileTab === 'chalets' && (
                <div className="space-y-6">
                  <Button className="w-full rounded-2xl h-14 font-black mb-4" onClick={() => setIsAddChaletOpen(true)}>
                      <Plus className="ml-2" /> إضافة شاليه جديد
                  </Button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {store.chalets.map(c => (
                        <Card key={c.id} className="overflow-hidden rounded-2xl md:rounded-[2rem] shadow-xl bg-white text-right">
                          <div className="relative h-40">
                              <Image src={c.image} alt={c.name} fill className="object-cover" />
                              <Badge className="absolute top-3 right-3 bg-primary text-white text-[10px] border-none">{c.code}</Badge>
                          </div>
                          <div className="p-4 space-y-2">
                              <h4 className="font-black text-base">{c.name}</h4>
                              <div className="flex justify-between items-center border-t pt-2">
                                <p className="font-black text-primary text-sm">{c.normalPrice.toLocaleString()} ج.م</p>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => setViewingDetailsChalet(c)} className="h-8 w-8 text-slate-500 hover:text-primary"><Settings size={14} /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => { setEditingChalet(c); setIsEditChaletOpen(true); }} className="h-8 w-8 text-blue-500 hover:text-blue-700"><Pencil size={14} /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteChalet(c.id)} className="h-8 w-8 text-red-500 hover:text-red-700"><Trash2 size={14} /></Button>
                                </div>
                              </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {activeMobileTab === 'users' && (
                <div className="space-y-4">
                  <Button className="w-full rounded-2xl h-12 font-black mb-4" onClick={() => setIsAddUserOpen(true)}>
                      <UserPlus className="ml-2 h-4 w-4" /> إضافة موظف
                  </Button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {store.users.filter(u => u.role !== 'admin').map(u => (
                        <Card key={u.id} className="p-4 rounded-xl bg-white shadow flex items-center justify-between flex-row-reverse text-right">
                          <div className="flex items-center gap-2 flex-row-reverse">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><UserCircle size={18} /></div>
                              <div>
                                <p className="font-black text-xs">{u.name}</p>
                                <Badge variant="outline" className="text-[8px]">{u.role === 'broker' ? 'وسيط' : 'مشرف'}</Badge>
                              </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { setEditingUser(u); setIsEditUserOpen(true); }} className="h-8 w-8"><Settings size={14} /></Button>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {activeMobileTab === 'settings' && (
                <div className="space-y-4">
                  <Card className="p-4 md:p-10 rounded-2xl md:rounded-[3rem] space-y-4 text-right">
                      <h3 className="text-lg font-black">إعدادات الدفع</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500">فودافون كاش</Label>
                            <Input value={vCash} onChange={e => setVCash(e.target.value)} className="rounded-xl h-10 bg-slate-50 border-none text-xs" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500">رقم الواتساب</Label>
                            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="rounded-xl h-10 bg-slate-50 border-none text-xs" />
                        </div>
                        <Button className="w-full h-12 rounded-xl font-black text-sm" onClick={handleSaveSettings}>حفظ الإعدادات</Button>
                      </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ) : activeRole === 'broker' ? (
          <div className="container mx-auto px-4 py-6 md:py-12 space-y-6 md:space-y-12">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-right w-full">
                   <h2 className="text-2xl md:text-3xl font-black">لوحة تحكم الوسيط</h2>
                   <p className="text-slate-500 font-bold text-xs">عمولتك ثابتة 200 ج.م لكل ليلة</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                  <StatCard title="العمولات" val={brokerStats.total.toLocaleString()} icon={ArrowUpRight} color="text-primary" />
                  <StatCard title="حجوزاتي" val={filteredBookings.length} icon={LucideCalendar} color="text-blue-600" />
                </div>
             </div>

             <div className="w-full">
                {activeMobileTab === 'spreadsheet' && (
                   <ChaletSpreadsheet 
                    chalets={store.chalets} 
                    bookings={store.bookings} 
                    onSelectChalet={handleOpenSpreadsheetReport} 
                    onAddBooking={handleAddBookingFromSheet}
                    userRole={activeRole} 
                   />
                )}

                {activeMobileTab === 'ops' && (
                   <div className="space-y-3">
                   {filteredBookings.filter(b => b.status === 'confirmed').map(b => (
                     <Card key={b.id} className="p-4 rounded-xl bg-white shadow flex justify-between items-center flex-row-reverse gap-3">
                         <div className="text-right flex-1">
                            <p className="font-black text-sm">{b.clientName}</p>
                            <Badge className={cn("mt-1", "text-white border-none px-2 py-0.5 text-[8px]")} variant={b.opStatus === 'checked_out' ? 'default' : 'outline'}>
                                {b.opStatus === 'checked_out' ? 'تم الخروج' : b.opStatus === 'checked_in' ? 'بالداخل' : 'انتظار'}
                            </Badge>
                         </div>
                         <Button variant="ghost" size="icon" onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}><Eye size={18} /></Button>
                     </Card>
                   ))}
                </div>
                )}

                {activeMobileTab === 'wallet' && (
                  <div className="space-y-4">
                    <Card className="p-6 rounded-2xl bg-white shadow-xl text-center space-y-3">
                        <p className="text-[10px] font-black text-slate-400">الرصيد القابل للسحب</p>
                        <p className="text-3xl font-black text-primary">{brokerStats.balance.toLocaleString()} ج.م</p>
                        <Button className="w-full rounded-xl h-12 font-black text-sm" onClick={() => setIsWithdrawalOpen(true)} disabled={brokerStats.balance <= 0}>طلب سحب</Button>
                    </Card>
                  </div>
                )}

                {activeMobileTab === 'units' && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {myChalets.map(c => <ChaletCard key={c.id} chalet={c} onBook={(chalet) => setViewingDetailsChalet(chalet)} />)}
                   </div>
                )}
             </div>
          </div>
        ) : activeRole === 'supervisor' ? (
          <div className="container mx-auto px-4 py-6 md:py-12 space-y-6 md:space-y-12">
             <div className="text-right">
                <h2 className="text-2xl md:text-3xl font-black">المهام الميدانية</h2>
                <Badge className={cn("mt-1 bg-orange-100 text-orange-600 border-none px-3 py-0.5", "text-[10px]")}>
                   {filteredBookings.filter(b => b.opStatus !== 'checked_out').length} مهام نشطة
                </Badge>
             </div>

             <div className="w-full">
                {activeMobileTab === 'tasks' && (
                   <div className="space-y-3">
                   {filteredBookings.map(b => (
                     <Card key={b.id} className="p-4 rounded-2xl shadow-lg bg-white flex flex-col gap-3">
                         <div className="text-right flex items-center gap-3 flex-row-reverse text-right">
                           <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${b.opStatus === 'checked_in' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50'}`}><Activity size={20} /></div>
                           <div className="flex-1">
                              <p className="text-base font-black">{b.clientName}</p>
                              <p className="text-slate-500 font-bold text-[10px]">{store.chalets.find(c => c.id === b.chaletId)?.name}</p>
                           </div>
                         </div>
                         <div className="flex gap-2">
                            <Button variant="outline" className="h-10 rounded-xl flex-1 border-slate-200" onClick={() => window.open(`tel:${b.phoneNumber}`)}><Phone size={16} /></Button>
                            <Button 
                              variant="outline" 
                              className="h-10 rounded-xl flex-1 border-slate-200 gap-2 text-xs font-black" 
                              onClick={() => handleOpenSpreadsheetReport(store.chalets.find(c => c.id === b.chaletId)!, b)}
                              disabled={!(b.clientIdCardUrls && b.clientIdCardUrls.length > 0) && !b.clientIdCardUrl}
                            >
                              <ImageIcon size={16} /> البطايق
                            </Button>
                            {b.opStatus !== 'checked_out' && (
                              <Button className={`h-10 rounded-xl font-black flex-[2] text-xs ${b.opStatus === 'checked_in' ? 'bg-orange-600' : 'bg-primary'}`} onClick={() => { setActiveSupervisorBooking(b); setIsSupervisorActionOpen(true); }}>
                                {b.opStatus === 'checked_in' ? 'إخلاء' : 'استلام'}
                              </Button>
                            )}
                         </div>
                     </Card>
                   ))}
                </div>
                )}

                {activeMobileTab === 'spreadsheet' && (
                   <ChaletSpreadsheet 
                    chalets={store.chalets} 
                    bookings={store.bookings} 
                    onSelectChalet={handleOpenSpreadsheetReport} 
                    userRole={activeRole} 
                   />
                )}
             </div>
          </div>
        ) : null}

      </main>

      <footer className="bg-slate-900 text-white py-12 text-center border-t-8 border-primary md:block hidden">
         <p className="text-slate-400 font-bold">فارما بيتش ريزورت - نظام الإدارة الموثوق</p>
      </footer>

      <BottomNav 
        activeTab={activeMobileTab} 
        onTabChange={setActiveMobileTab} 
        role={activeRole} 
      />

      <SidebarNav 
        activeTab={activeMobileTab} 
        onTabChange={setActiveMobileTab} 
        role={activeRole} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
      />

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="p-6 md:p-10 rounded-3xl shadow-2xl bg-white border-none max-w-[90vw] md:max-w-md">
          <DialogHeader className="text-center space-y-2">
             <div className="bg-primary w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20"><LogIn className="text-white h-6 w-6 md:h-8 md:w-8" /></div>
             <DialogTitle className="text-xl md:text-3xl font-black text-slate-900 text-center">{isLoginView ? 'دخول النظام' : 'حساب جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
             {!isLoginView && (
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 mr-2">الاسم</label>
                 <Input placeholder="أدخل اسمك..." value={name} onChange={e => setName(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-right text-xs" />
               </div>
             )}
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 mr-2">البريد الإلكتروني</label>
               <Input type="email" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-right text-xs" />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 mr-2">كلمة المرور</label>
               <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-10 rounded-xl bg-slate-50 border-none text-right text-xs" />
             </div>
          </div>
          <Button className="w-full h-12 rounded-xl font-black text-sm" onClick={handleAuth}>
            {isLoginView ? 'دخول' : 'تسجيل'}
          </Button>
          <Button variant="link" className="text-[10px] text-slate-400" onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخولك'}
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
      <EditChaletDialog chalet={editingChalet} isOpen={isEditChaletOpen} onClose={() => { setIsEditChaletOpen(false); setEditingChalet(null); }} onUpdate={(id, data) => { store.updateChalet(id, data); toast({ title: "تم تحديث بيانات الشاليه بنجاح" }); }} />
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
    <Card className="p-3 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-white border-none shadow-lg flex items-center gap-3 md:gap-6">
       <div className={`${color} bg-slate-50 p-2 md:p-5 rounded-lg md:rounded-[1.5rem]`}><Icon className="h-5 w-5 md:h-8 md:w-8" /></div>
       <div className="text-right flex-1">
         <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase mb-0.5">{title}</p>
         <p className="text-sm md:text-2xl font-black text-slate-900 tracking-tight">{val}</p>
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
      className="fixed bottom-24 md:bottom-24 left-4 md:left-6 bg-[#25D366] text-white p-3 md:p-5 rounded-full shadow-2xl z-[110] hover:scale-110 transition-transform flex items-center justify-center animate-bounce shadow-[#25D366]/20"
      title="تواصل معنا عبر واتساب"
    >
      <svg className="w-5 h-5 md:w-8 md:h-8 fill-current" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  );
}
