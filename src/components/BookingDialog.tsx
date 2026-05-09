
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Chalet, Booking } from "@/lib/store"
import { format, isBefore, startOfDay, isSameDay, isWithinInterval } from "date-fns"
import { ar } from "date-fns/locale"
import { CalendarIcon, Users, Phone, User } from "lucide-react"
import { DateRange } from "react-day-picker"

interface BookingDialogProps {
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (booking: Omit<Booking, 'id' | 'status'>) => void
  existingBookings: Booking[]
}

export function BookingDialog({ chalet, isOpen, onClose, onConfirm, existingBookings }: BookingDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(1)

  const handleConfirm = () => {
    if (!chalet || !dateRange?.from || !dateRange?.to || !name || !phone) return
    onConfirm({
      chaletId: chalet.id,
      clientName: name,
      phoneNumber: phone,
      guestCount: guests,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
    })
    // Reset state after confirm
    setDateRange(undefined)
    setName('')
    setPhone('')
    setGuests(1)
    onClose()
  }

  const isDateDisabled = (day: Date) => {
    const today = startOfDay(new Date())
    if (isBefore(day, today)) return true

    return existingBookings.some(b => {
      if (b.chaletId !== chalet?.id || b.status === 'cancelled') return false
      const start = startOfDay(new Date(b.startDate))
      const end = startOfDay(new Date(b.endDate))
      return (isSameDay(day, start) || isSameDay(day, end) || isWithinInterval(day, { start, end }))
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl text-right">
        <div className="bg-primary p-6 text-white">
          <DialogTitle className="font-headline text-2xl text-right">حجز {chalet?.name}</DialogTitle>
          <DialogDescription className="text-white/80 mt-1 text-right">
            أكمل البيانات أدناه لطلب حجز إقامتك الفاخرة.
          </DialogDescription>
        </div>
        
        <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[75vh]">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 justify-end">
               اختر التواريخ <CalendarIcon className="h-3 w-3" />
            </Label>
            <div className="flex justify-center border rounded-2xl p-2 bg-muted/5">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={isDateDisabled}
                className="rounded-xl"
                locale={ar}
              />
            </div>
            {dateRange?.from && dateRange?.to && (
              <p className="text-sm text-primary font-bold text-center bg-primary/5 py-2 rounded-lg">
                {format(dateRange.from, "dd MMMM", { locale: ar })} - {format(dateRange.to, "dd MMMM y", { locale: ar })}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 justify-end">
                الاسم بالكامل <User className="h-3 w-3" />
              </Label>
              <Input 
                placeholder="أدخل اسمك" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="rounded-xl border-muted h-12 text-right"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 justify-end">
                  رقم الهاتف <Phone className="h-3 w-3" />
                </Label>
                <Input 
                  placeholder="01xxxxxxxxx" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="rounded-xl border-muted h-12 text-right"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 justify-end">
                  الضيوف <Users className="h-3 w-3" />
                </Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={guests} 
                  onChange={e => setGuests(parseInt(e.target.value) || 1)}
                  className="rounded-xl border-muted h-12 text-right"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 bg-white gap-2 flex flex-row-reverse">
          <Button 
            onClick={handleConfirm} 
            disabled={!dateRange?.from || !dateRange?.to || !name || !phone}
            className="rounded-xl h-12 bg-primary text-white flex-1 font-bold text-lg"
          >
            تأكيد الطلب
          </Button>
          <Button variant="outline" onClick={onClose} className="rounded-xl h-12 font-bold">إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
