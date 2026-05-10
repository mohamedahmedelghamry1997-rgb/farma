
"use client"

import { useState, useMemo } from 'react'
import { Chalet, Booking, UserRole } from '@/lib/store'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addMonths, subMonths, isSameDay } from 'date-fns'
import { ar } from 'date-fns/locale'
import { ChevronRight, ChevronLeft, Search, Info, User, DollarSign, Calendar as CalendarIcon, Plus, Maximize2, Hash, Minimize2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

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
      const nameMatch = (c.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const codeMatch = (c.code || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSearch = nameMatch || codeMatch
      
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
    const allForDay = bookings.filter(b => 
      b.chaletId === chaletId && 
      isWithinInterval(day, { start: new Date(b.startDate), end: new Date(b.endDate) })
    )
    
    const active = allForDay.find(b => b.status !== 'cancelled')
    return active || allForDay[0]
  }

  return (
    <div className={cn(
      "bg-white rounded-[2rem] shadow-xl overflow-hidden border border-slate-100 transition-all duration-300",
      isExpanded ? "fixed inset-0 z-[150] rounded-none md:rounded-[2rem] md:inset-4" : "relative"
    )}>
      <div className="p-4 md:p-8 border-b bg-slate-50/80 backdrop-blur-sm sticky top-0 z-30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 md:gap-4 flex-row-reverse w-full md:w-auto justify-between">
          <div className="flex items-center gap-2 flex-row-reverse">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12 bg-white shadow-sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <h2 className="text-sm md:text-2xl font-black text-slate-900 min-w-[100px] md:min-w-[150px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ar })}
            </h2>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-12 md:w-12 bg-white shadow-sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </div>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10 text-primary border-primary/20" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input 
                placeholder="بحث..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-xl pr-10 border-none bg-white shadow-sm h-10 md:h-12 text-right text-xs md:text-sm"
             />
          </div>
          <div className="relative flex-1 md:w-48">
             <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input 
                type="date"
                value={searchDate} 
                onChange={e => setSearchDate(e.target.value)}
                className="rounded-xl pr-10 border-none bg-white shadow-sm h-10 md:h-12 text-right text-xs md:text-sm"
             />
          </div>
        </div>
      </div>

      <div className={cn(
        "overflow-auto custom-scrollbar bg-slate-50",
        isExpanded ? "h-[calc(100vh-160px)] md:h-[calc(100vh-250px)]" : "max-h-[500px] md:max-h-[600px]"
      )}>
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="bg-slate-100/80 border-b sticky top-0 z-20">
              <th className="p-3 md:p-4 min-w-[140px] md:min-w-[280px] sticky right-0 bg-slate-100 z-30 border-l font-black text-slate-600 text-[10px] md:text-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                اسم الشاليه
              </th>
              {days.map(day => (
                <th key={day.toString()} className={cn(
                  "p-2 min-w-[45px] md:min-w-[60px] text-center border-l text-[9px] md:text-[11px] font-black uppercase tracking-tighter transition-colors",
                  format(day, 'E') === 'Fri' || format(day, 'E') === 'Sat' ? 'bg-primary/10 text-primary' : 'text-slate-500',
                  isSameDay(day, new Date()) ? 'bg-yellow-400/20 text-yellow-800' : ''
                )}>
                  {format(day, 'd')}<br/><span className="opacity-60">{format(day, 'EEE', { locale: ar })}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredChalets.map(chalet => (
              <tr key={chalet.id} className="border-b bg-white hover:bg-slate-50 transition-colors group">
                <td className="p-2 md:p-4 sticky right-0 bg-white z-10 border-l shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group-hover:bg-slate-50">
                  <div className="flex flex-col gap-0.5 cursor-pointer text-right" onClick={() => onSelectChalet(chalet)}>
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <span className="font-black text-slate-800 text-[10px] md:text-base truncate max-w-[80px] md:max-w-none">{chalet.name}</span>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[8px] md:text-[10px] font-black px-1 md:px-2 py-0 rounded-md">
                        {chalet.code}
                      </Badge>
                    </div>
                    <div className="flex gap-1 justify-end items-center opacity-70">
                      <span className="text-[8px] md:text-[11px] font-bold text-slate-400">{chalet.city}</span>
                      <span className="text-[9px] md:text-[12px] font-black text-primary">{chalet.normalPrice.toLocaleString()}ج.م</span>
                    </div>
                  </div>
                </td>
                {days.map(day => {
                  const booking = getCellStatus(chalet.id, day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <td 
                      key={day.toString()} 
                      className={cn(
                        "p-0 border-l h-14 md:h-16 relative transition-colors",
                        booking ? "cursor-pointer" : "cursor-cell hover:bg-primary/5",
                        isToday ? "bg-yellow-50/40" : ""
                      )}
                      onClick={() => {
                        if (booking) {
                          onSelectChalet(chalet, booking);
                        } else if (onAddBooking && (userRole === 'admin' || userRole === 'broker')) {
                          onAddBooking(chalet, day);
                        }
                      }}
                    >
                      {booking && (
                        <div className={cn(
                          "absolute inset-0.5 md:inset-1 rounded-sm md:rounded-lg shadow-sm flex items-center justify-center transition-all hover:scale-105 z-10",
                          booking.status === 'confirmed' ? 'bg-green-500' : 
                          booking.status === 'admin_approved' ? 'bg-blue-500' : 
                          booking.status === 'cancelled' ? 'bg-red-500' : 'bg-orange-400'
                        )}>
                          <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-white animate-pulse"></div>
                          <span className="text-[7px] md:text-[9px] text-white font-black mr-0.5 md:mr-1 truncate max-w-full px-0.5">
                            {booking.clientName.split(' ')[0]}
                          </span>
                        </div>
                      )}
                      {!booking && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/5 flex items-center justify-center transition-opacity">
                           <Plus className="h-3 w-3 md:h-4 md:w-4 text-primary/40" />
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
      
      <div className="p-3 md:p-6 border-t bg-white flex flex-wrap gap-3 md:gap-6 justify-center text-[8px] md:text-xs font-black text-slate-500 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500"></div> مؤكد</div>
        <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-blue-500"></div> موافقة</div>
        <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-orange-400"></div> انتظار</div>
        <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-red-500"></div> ملغي</div>
        {isExpanded && <Button variant="secondary" size="sm" className="rounded-full h-8 px-4 font-black text-[10px]" onClick={() => setIsExpanded(false)}>إغلاق المكبر</Button>}
      </div>
    </div>
  )
}
