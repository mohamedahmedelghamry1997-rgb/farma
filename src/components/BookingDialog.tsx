"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Chalet, Booking } from "@/lib/store"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { CalendarIcon, Users, Phone, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingDialogProps {
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (booking: Omit<Booking, 'id' | 'status'>) => void
  existingBookings: Booking[]
}

export function BookingDialog({ chalet, isOpen, onClose, onConfirm, existingBookings }: BookingDialogProps) {
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(1)

  const handleConfirm = () => {
    if (!chalet || !date?.from || !date?.to || !name || !phone) return
    onConfirm({
      chaletId: chalet.id,
      clientName: name,
      phoneNumber: phone,
      guestCount: guests,
      startDate: date.from.toISOString(),
      endDate: date.to.toISOString(),
    })
    onClose()
  }

  // Back-to-back logic helper
  const isDateDisabled = (day: Date) => {
    return isBefore(day, startOfDay(new Date())) || existingBookings.some(b => {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      return day >= start && day <= end && b.chaletId === chalet?.id
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className="bg-primary p-6 text-white">
          <DialogTitle className="font-headline text-2xl">Book {chalet?.name}</DialogTitle>
          <DialogDescription className="text-white/80 mt-1">
            Complete the form to request your luxury stay.
          </DialogDescription>
        </div>
        
        <div className="p-6 space-y-6 bg-white">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="h-3 w-3" /> Select Dates
            </Label>
            <Calendar
              mode="range"
              selected={{ from: date?.from, to: date?.to }}
              onSelect={(range: any) => setDate(range)}
              disabled={isDateDisabled}
              className="rounded-xl border shadow-sm"
              numberOfMonths={1}
            />
            {date?.from && date?.to && (
              <p className="text-xs text-primary font-medium px-1">
                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <User className="h-3 w-3" /> Full Name
              </Label>
              <Input 
                placeholder="Enter your name" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="rounded-xl border-muted h-12"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Phone
                </Label>
                <Input 
                  placeholder="01xxxxxxxxx" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="rounded-xl border-muted h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Users className="h-3 w-3" /> Guests
                </Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={guests} 
                  onChange={e => setGuests(parseInt(e.target.value))}
                  className="rounded-xl border-muted h-12"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 bg-white">
          <Button variant="outline" onClick={onClose} className="rounded-xl h-12">Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!date?.to || !name || !phone}
            className="rounded-xl h-12 bg-primary text-white flex-1"
          >
            Confirm Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
