
"use client"

import { useState, useMemo } from 'react'
import { Chalet, Booking, UserRole } from '@/lib/store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, addMonths, subMonths, isSameMonth } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ChevronRight, ChevronLeft, Search, Info, User, DollarSign, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface ChaletSpreadsheetProps {
  chalets: Chalet[]
  bookings: Booking[]
  onSelectChalet: (chalet: Chalet, booking?: Booking) => void
  userRole?: UserRole | null
}

export function ChaletSpreadsheet({ chalets, bookings, onSelectChalet, userRole }: ChaletSpreadsheetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDate, setSearchDate] = useState('')

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    })
  }, [currentDate])

  const filteredChalets = useMemo(() => {
    return chalets.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (searchDate) {
        const targetDate = new Date(searchDate)
        const isOccupied = bookings.some(b => 
          b.chaletId === c.id && 
          b.status !== 'cancelled' &&
          isWithinInterval(targetDate, { start: new Date(b.startDate), end: new Date(b.endDate) })
        )
        return matchesSearch && !isOccupied
      }
      
      return matchesSearch
    })
  }, [chalets, searchQuery, searchDate, bookings])

  const getCellStatus = (chaletId: string, day: Date) => {
    return bookings.find(b => 
      b.chaletId === chaletId && 
      b.status !== 'cancelled' &&
      isWithinInterval(day, { start: new Date(b.startDate), end: new Date(b.endDate) })
    )
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
      <div className="p-8 border-b bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 flex-row-reverse">
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronRight className="h-6 w-6" />
          </Button>
          <h2 className="text-2xl font-black text-slate-900 min-w-[150px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ar })}
          </h2>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 justify-end w-full md:w-auto">
          <div className="relative w-full md:w-64">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input 
                placeholder="بحث باسم أو كود الشاليه..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-xl pr-10 border-none bg-white shadow-sm h-12 text-right"
             />
          </div>
          <div className="relative w-full md:w-56">
             <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input 
                type="date"
                value={searchDate} 
                onChange={e => setSearchDate(e.target.value)}
                className="rounded-xl pr-10 border-none bg-white shadow-sm h-12 text-right"
             />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 min-w-[250px] sticky right-0 bg-slate-50 z-10 border-l font-black text-slate-500 text-sm">اسم وكود الشاليه</th>
              {days.map(day => (
                <th key={day.toString()} className={`p-2 min-w-[45px] text-center border-l text-[10px] font-black uppercase tracking-tighter ${format(day, 'E') === 'Fri' || format(day, 'E') === 'Sat' ? 'bg-primary/5 text-primary' : 'text-slate-400'}`}>
                  {format(day, 'd')}<br/>{format(day, 'EEE', { locale: ar })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredChalets.map(chalet => (
              <tr key={chalet.id} className="border-b hover:bg-slate-50/50 transition-colors">
                <td className="p-4 sticky right-0 bg-white z-10 border-l group">
                  <div className="flex flex-col gap-1 cursor-pointer" onClick={() => onSelectChalet(chalet)}>
                    <span className="font-black text-slate-900 group-hover:text-primary transition-colors">{chalet.name}</span>
                    <Badge variant="outline" className="w-fit text-[10px] font-bold border-slate-200 text-slate-400">{chalet.code}</Badge>
                  </div>
                </td>
                {days.map(day => {
                  const booking = getCellStatus(chalet.id, day);
                  return (
                    <td 
                      key={day.toString()} 
                      className={`p-0 border-l h-14 relative group ${booking ? 'cursor-pointer' : ''}`}
                      onClick={() => booking && onSelectChalet(chalet, booking)}
                    >
                      {booking && (
                        <div className={`absolute inset-1 rounded-lg shadow-sm flex items-center justify-center transition-transform hover:scale-105 ${
                          booking.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-400'
                        }`}>
                          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                        </div>
                      )}
                      {!booking && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/5 transition-opacity"></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 border-t bg-slate-50/50 flex flex-wrap gap-6 justify-center text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500"></div> حجز مؤكد</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-orange-400"></div> انتظار الموافقة</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-lg border border-slate-200"></div> يوم متاح</div>
      </div>
    </div>
  )
}
