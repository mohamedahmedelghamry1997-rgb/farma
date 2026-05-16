
"use client"

import { useState, useMemo } from 'react'
import { UserProfile, Booking, WithdrawalRequest, Chalet } from '@/lib/store'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { 
  Users, Search, ChevronRight, UserCircle, Wallet, 
  TrendingUp, History, Box, Briefcase, FileText,
  Calendar as CalendarIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface BrokersManagementProps {
  users: UserProfile[]
  bookings: Booking[]
  withdrawals: WithdrawalRequest[]
  chalets: Chalet[]
}

export function BrokersManagement({ users, bookings, withdrawals, chalets }: BrokersManagementProps) {
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const brokers = useMemo(() => {
    return users.filter(u => u.role === 'broker' && (u.name || '').includes(searchQuery))
  }, [users, searchQuery])

  const selectedBroker = useMemo(() => {
    return users.find(u => u.uid === selectedBrokerId) || null
  }, [users, selectedBrokerId])

  const brokerStats = useMemo(() => {
    if (!selectedBrokerId) return null
    
    const brokerBookings = bookings.filter(b => b.brokerId === selectedBrokerId && b.status === 'confirmed')
    const totalCommissions = brokerBookings.reduce((acc, b) => acc + (b.brokerCommission || 0), 0)
    
    const brokerWithdrawals = withdrawals.filter(w => w.brokerId === selectedBrokerId && w.status === 'approved')
    const totalWithdrawn = brokerWithdrawals.reduce((acc, w) => acc + w.amount, 0)
    
    const pendingWithdrawals = withdrawals.filter(w => w.brokerId === selectedBrokerId && w.status === 'pending')
    const totalPending = pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0)

    const brokerChalets = chalets.filter(c => selectedBroker?.assignedChaletIds?.includes(c.id))

    return {
      totalCommissions,
      totalWithdrawn,
      totalPending,
      balance: totalCommissions - totalWithdrawn,
      bookingsCount: brokerBookings.length,
      chaletsCount: brokerChalets.length,
      brokerBookings,
      brokerWithdrawals,
      brokerChalets
    }
  }, [selectedBrokerId, bookings, withdrawals, chalets, selectedBroker])

  if (selectedBrokerId && selectedBroker && brokerStats) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border">
          <div className="flex items-center gap-4 flex-row-reverse">
            <Button variant="ghost" size="icon" onClick={() => setSelectedBrokerId(null)} className="rounded-full bg-slate-50">
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-900">{selectedBroker.name}</h2>
              <Badge className="bg-primary/10 text-primary border-none text-[10px]">تقرير الوسيط المفصل</Badge>
            </div>
          </div>
          <div className="bg-primary p-3 rounded-2xl text-white">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="إجمالي العمولات" value={brokerStats.totalCommissions.toLocaleString() + ' ج.م'} icon={TrendingUp} color="text-green-600" />
          <StatCard title="تم سحبه" value={brokerStats.totalWithdrawn.toLocaleString() + ' ج.م'} icon={Wallet} color="text-blue-600" />
          <StatCard title="الرصيد الحالي" value={brokerStats.balance.toLocaleString() + ' ج.م'} icon={TrendingUp} color="text-primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-6 rounded-[2rem] border-none shadow-xl bg-white space-y-6">
            <h3 className="text-xl font-black text-right flex items-center justify-end gap-2">البيانات الشخصية <UserCircle size={20} className="text-primary" /></h3>
            <div className="space-y-4 text-right">
              <DetailItem label="البريد الإلكتروني" value={selectedBroker.email || '---'} />
              <DetailItem label="رقم الهاتف" value={selectedBroker.phone || '---'} />
              <DetailItem label="قيمة العمولة لليلة" value={`${selectedBroker.commissionRate || 200} ج.م`} />
              <DetailItem label="الحالة" value={selectedBroker.status === 'active' ? 'نشط' : 'معطل'} status={selectedBroker.status} />
            </div>

            <hr className="border-slate-100" />

            <h3 className="text-xl font-black text-right flex items-center justify-end gap-2">الشاليهات المرتبطة <Box size={20} className="text-primary" /></h3>
            <div className="space-y-3">
              {brokerStats.brokerChalets.length === 0 ? (
                <p className="text-slate-400 text-xs text-center font-bold py-4">لا توجد شاليهات مرتبطة</p>
              ) : (
                brokerStats.brokerChalets.map(c => (
                  <div key={c.id} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between flex-row-reverse">
                    <span className="font-black text-sm">{c.name}</span>
                    <Badge variant="outline" className="text-[10px]">{c.code}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-6 rounded-[2rem] border-none shadow-xl bg-white space-y-6">
            <h3 className="text-xl font-black text-right flex items-center justify-end gap-2">سجل الحجوزات الناجحة <History size={20} className="text-primary" /></h3>
            <div className="overflow-x-auto">
              <Table dir="rtl" className="text-right">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right font-black">العميل</TableHead>
                    <TableHead className="text-right font-black">الشاليه</TableHead>
                    <TableHead className="text-right font-black">التاريخ</TableHead>
                    <TableHead className="text-right font-black">العمولة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokerStats.brokerBookings.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-bold">{b.clientName}</TableCell>
                      <TableCell className="text-slate-500 font-bold">{chalets.find(c => c.id === b.chaletId)?.name || '---'}</TableCell>
                      <TableCell className="text-xs font-bold">{format(new Date(b.startDate), 'dd MMM yyyy', { locale: ar })}</TableCell>
                      <TableCell className="font-black text-primary">{(b.brokerCommission || 0).toLocaleString()} ج</TableCell>
                    </TableRow>
                  ))}
                  {brokerStats.brokerBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-400 font-bold">لا توجد حجوزات مؤكدة بعد</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2rem] border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-right">
          <h2 className="text-2xl font-black text-slate-900">تقارير الوسطاء</h2>
          <p className="text-slate-500 font-bold text-xs">متابعة أداء الوسطاء والعمولات المستحقة</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input 
            placeholder="ابحث عن وسيط بالاسم..." 
            className="rounded-xl pr-10 bg-slate-50 border-none h-12 text-right text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {brokers.map(broker => (
          <Card 
            key={broker.uid} 
            className="p-6 rounded-[2rem] border-none shadow-lg hover:shadow-2xl transition-all cursor-pointer bg-white group"
            onClick={() => setSelectedBrokerId(broker.uid)}
          >
            <div className="flex items-center gap-4 flex-row-reverse text-right">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                <Users size={32} />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-xl text-slate-900">{broker.name}</h4>
                <div className="flex gap-2 justify-end">
                  <Badge variant="outline" className="text-[10px] font-bold">{broker.status === 'active' ? 'نشط' : 'معطل'}</Badge>
                  <Badge className="bg-slate-100 text-slate-600 border-none text-[10px]">وسيط</Badge>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center flex-row-reverse">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">العمولة الحالية</p>
                <p className="text-lg font-black text-primary">
                  {(bookings.filter(b => b.brokerId === broker.uid && b.status === 'confirmed').reduce((acc, b) => acc + (b.brokerCommission || 0), 0) - withdrawals.filter(w => w.brokerId === broker.uid && w.status === 'approved').reduce((acc, w) => acc + w.amount, 0)).toLocaleString()} ج.م
                </p>
              </div>
              <Button size="sm" variant="ghost" className="rounded-xl font-black text-primary group-hover:bg-primary/10">عرض التقرير <ChevronRight size={16} className="mr-1 rotate-180" /></Button>
            </div>
          </Card>
        ))}
        {brokers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-dashed border-2 border-slate-200">
            <Users className="mx-auto text-slate-200 h-16 w-16 mb-4" />
            <p className="text-slate-400 font-bold">لا يوجد وسطاء بهذا الاسم حالياً</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="p-6 rounded-[2rem] border-none shadow-lg bg-white flex items-center gap-4 flex-row-reverse text-right">
      <div className={cn("p-4 rounded-2xl bg-slate-50", color)}><Icon size={24} /></div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </Card>
  )
}

function DetailItem({ label, value, status }: any) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase">{label}</p>
      <p className={cn(
        "font-bold text-sm",
        status === 'active' ? 'text-green-600' : status === 'suspended' ? 'text-red-600' : 'text-slate-700'
      )}>{value}</p>
    </div>
  )
}
