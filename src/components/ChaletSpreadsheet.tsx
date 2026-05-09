
"use client"

import { useState, useMemo } from 'react'
import { Chalet, Booking, UserRole } from '@/lib/store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addMonths, subMonths, isSameDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ChevronRight, ChevronLeft, Search, Info, User, DollarSign, Calendar as CalendarIcon, Plus, Maximize2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'

interface ChaletSpreadsheetProps {
  chalets: Chalet[]
  bookings: Booking[]
  onSelectChalet: (chalet: Chalet, booking?: Booking) => void
  onAddBooking?: (chalet: Chalet, date: Date) => void
  userRole?: UserRole | null
}

export function ChaletSpreadsheet({ chalets, bookings, onSelectChalet, onAddBooking, userRole }: ChaletSpreadsheetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchDate, setSearchDate] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    })
  }, [currentDate])

  const filteredChalets = useMemo(() => {
    return chalets.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            c.code.toLowerCase().includes(searchQuery.toLowerCase())
      
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
    <div className={`bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 transition-all duration-500 ${isExpanded ? 'fixed inset-4 z-[100] rounded-3xl' : 'relative'}`}>
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
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-slate-400" onClick={() => setIsExpanded(!isExpanded)}>
            <Maximize2 className="h-5 w-5" />
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

      <div className={`overflow-auto custom-scrollbar ${isExpanded ? 'h-[calc(100vh-250px)]' : 'max-h-[600px]'}`}>
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 min-w-[280px] sticky right-0 bg-slate-50 z-20 border-l font-black text-slate-500 text-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">اسم وكود الشاليه</th>
              {days.map(day => (
                <th key={day.toString()} className={`p-2 min-w-[50px] text-center border-l text-[10px] font-black uppercase tracking-tighter ${format(day, 'E') === 'Fri' || format(day, 'E') === 'Sat' ? 'bg-primary/5 text-primary' : 'text-slate-400'}`}>
                  {format(day, 'd')}<br/>{format(day, 'EEE', { locale: ar })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredChalets.map(chalet => (
              <tr key={chalet.id} className="border-b hover:bg-slate-50/50 transition-colors">
                <td className="p-4 sticky right-0 bg-white z-10 border-l group shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center justify-between flex-row-reverse">
                    <div className="flex flex-col gap-1 cursor-pointer text-right" onClick={() => onSelectChalet(chalet)}>
                      <span className="font-black text-slate-900 group-hover:text-primary transition-colors">{chalet.name}</span>
                      <div className="flex gap-2 justify-end">
                        <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-400">{chalet.code}</Badge>
                        <span className="text-[10px] font-black text-primary">{chalet.normalPrice} ج.م</span>
                      </div>
                    </div>
                  </div>
                </td>
                {days.map(day => {
                  const booking = getCellStatus(chalet.id, day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <td 
                      key={day.toString()} 
                      className={`p-0 border-l h-16 relative group ${booking ? 'cursor-pointer' : 'cursor-cell'} ${isToday ? 'bg-yellow-50/30' : ''}`}
                      onClick={() => {
                        if (booking) {
                          onSelectChalet(chalet, booking);
                        } else if (onAddBooking && (userRole === 'admin' || userRole === 'broker')) {
                          onAddBooking(chalet, day);
                        }
                      }}
                    >
                      {booking && (
                        <div className={`absolute inset-1 rounded-lg shadow-md flex items-center justify-center transition-all hover:scale-105 z-10 ${
                          booking.status === 'confirmed' ? 'bg-green-500' : 
                          booking.status === 'admin_approved' ? 'bg-blue-500' : 'bg-orange-400'
                        }`}>
                          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                          {isExpanded && <span className="text-[8px] text-white font-black mr-1 hidden md:inline truncate px-1">{booking.clientName}</span>}
                        </div>
                      )}
                      {!booking && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/10 flex items-center justify-center transition-opacity">
                           <Plus className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 border-t bg-slate-50/50 flex flex-wrap gap-8 justify-center text-xs font-black text-slate-500">
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500"></div> حجز مؤكد</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-blue-500"></div> موافقة إدارية</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-orange-400"></div> انتظار المراجعة</div>
        <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-lg border border-slate-200"></div> متاح (اضغط للإضافة)</div>
        {isExpanded && <Button variant="outline" size="sm" className="rounded-full px-6 font-black border-slate-200" onClick={() => setIsExpanded(false)}>إغلاق العرض المكبر</Button>}
      </div>
    </div>
  )
}
