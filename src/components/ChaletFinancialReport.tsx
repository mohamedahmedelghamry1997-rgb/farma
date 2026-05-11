
"use client"

import { useState, useMemo } from 'react'
import { Chalet, Booking } from '@/lib/store'
import { format, differenceInDays } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ChevronRight, Save, DollarSign, Calculator, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChaletFinancialReportProps {
  chalet: Chalet
  bookings: Booking[]
  onUpdateBooking: (id: string, updates: any) => void
  onBack: () => void
}

export function ChaletFinancialReport({ chalet, bookings, onUpdateBooking, onBack }: ChaletFinancialReportProps) {
  const [editingValues, setEditingValues] = useState<Record<string, { permitFee: string, expenses: string, ownerShare: string }>>({})

  const chaletBookings = useMemo(() => {
    return bookings
      .filter(b => b.chaletId === chalet.id && b.status !== 'cancelled')
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }, [bookings, chalet.id])

  const handleInputChange = (bookingId: string, field: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [bookingId]: {
        ...(prev[bookingId] || { 
          permitFee: String(chaletBookings.find(b => b.id === bookingId)?.permitFee || '0'),
          expenses: String(chaletBookings.find(b => b.id === bookingId)?.expenses || '0'),
          ownerShare: String(chaletBookings.find(b => b.id === bookingId)?.ownerShare || '0')
        }),
        [field]: value
      }
    }))
  }

  const handleSave = async (bookingId: string) => {
    const vals = editingValues[bookingId]
    if (!vals) return
    
    await onUpdateBooking(bookingId, {
      permitFee: parseFloat(vals.permitFee) || 0,
      expenses: parseFloat(vals.expenses) || 0,
      ownerShare: parseFloat(vals.ownerShare) || 0
    })
    
    setEditingValues(prev => {
      const next = { ...prev }
      delete next[bookingId]
      return next
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border">
        <div className="flex items-center gap-4 flex-row-reverse">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-slate-50">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900">{chalet.name}</h2>
            <p className="text-primary font-bold text-sm tracking-widest">{chalet.code}</p>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl flex items-center gap-2 font-black">
          <Calculator className="h-5 w-5" /> سجل التقارير المالية
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="text-right min-w-[1300px]" dir="rtl">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right font-black">عدد الليالي</TableHead>
                <TableHead className="text-right font-black">الوصول</TableHead>
                <TableHead className="text-right font-black">المغادرة</TableHead>
                <TableHead className="text-right font-black">سعر الليلة</TableHead>
                <TableHead className="text-right font-black">الإجمالي</TableHead>
                <TableHead className="text-right font-black">العمولة</TableHead>
                <TableHead className="text-right font-black bg-orange-50/50">التصريح</TableHead>
                <TableHead className="text-right font-black bg-orange-50/50">مصاريف</TableHead>
                <TableHead className="text-right font-black bg-green-50/50">الصافي</TableHead>
                <TableHead className="text-right font-black bg-blue-50/50">وصل المالك</TableHead>
                <TableHead className="text-right font-black bg-purple-50/50">أرباح الإدارة</TableHead>
                <TableHead className="text-center font-black">حفظ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chaletBookings.map(b => {
                const nights = differenceInDays(new Date(b.endDate), new Date(b.startDate)) + 1
                const nightPrice = b.totalAmount / nights
                const currentVals = editingValues[b.id] || {
                  permitFee: String(b.permitFee || 0),
                  expenses: String(b.expenses || 0),
                  ownerShare: String(b.ownerShare || 0)
                }
                
                const permit = parseFloat(currentVals.permitFee) || 0
                const exp = parseFloat(currentVals.expenses) || 0
                const net = b.totalAmount - (b.brokerCommission || 0) - permit - exp
                const ownerShareVal = parseFloat(currentVals.ownerShare) || 0
                const adminProfit = net - ownerShareVal

                return (
                  <TableRow key={b.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold">{nights}</TableCell>
                    <TableCell className="font-bold text-slate-500">{format(new Date(b.startDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-bold text-slate-500">{format(new Date(b.endDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-black text-slate-700">{Math.round(nightPrice).toLocaleString()}</TableCell>
                    <TableCell className="font-black text-slate-900">{b.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="font-black text-red-600">{(b.brokerCommission || 0).toLocaleString()}</TableCell>
                    <TableCell className="bg-orange-50/20">
                      <Input 
                        type="number" 
                        value={currentVals.permitFee} 
                        onChange={e => handleInputChange(b.id, 'permitFee', e.target.value)}
                        className="w-20 h-9 rounded-lg border-orange-100 bg-white text-center font-black"
                      />
                    </TableCell>
                    <TableCell className="bg-orange-50/20">
                      <Input 
                        type="number" 
                        value={currentVals.expenses} 
                        onChange={e => handleInputChange(b.id, 'expenses', e.target.value)}
                        className="w-20 h-9 rounded-lg border-orange-100 bg-white text-center font-black"
                      />
                    </TableCell>
                    <TableCell className="bg-green-50/20 font-black text-green-700">
                      {net.toLocaleString()}
                    </TableCell>
                    <TableCell className="bg-blue-50/20">
                      <Input 
                        type="number" 
                        value={currentVals.ownerShare} 
                        onChange={e => handleInputChange(b.id, 'ownerShare', e.target.value)}
                        className="w-24 h-9 rounded-lg border-blue-100 bg-white text-center font-black text-blue-700"
                      />
                    </TableCell>
                    <TableCell className="bg-purple-50/20 font-black text-purple-700 text-lg">
                      {adminProfit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-primary hover:bg-primary/90 h-9 w-9 p-0"
                        onClick={() => handleSave(b.id)}
                        disabled={!editingValues[b.id]}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
