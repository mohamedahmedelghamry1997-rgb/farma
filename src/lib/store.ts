
"use client"

import { useState, useEffect } from 'react'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface Chalet {
  id: string
  name: string
  price: number
  description: string
  image: string
  rating: number
}

export interface Booking {
  id: string
  chaletId: string
  clientName: string
  phoneNumber: string
  guestCount: number
  startDate: string
  endDate: string
  status: 'pending' | 'confirmed' | 'cancelled'
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  conditionReport?: string
  securityDeposit?: number
}

const INITIAL_CHALETS: Chalet[] = [
  {
    id: '1',
    name: 'شاليه رويال بلو',
    price: 450,
    description: 'استمتع بالفخامة المطلقة في شاليه رويال بلو مع وصول مباشر للشاطئ وحمام سباحة خاص.',
    image: 'https://picsum.photos/seed/chalet1/800/600',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'منتجع الرمال الذهبية',
    price: 380,
    description: 'ملاذ هادئ يقع في موقع مثالي لمشاهدة غروب الشمس الساحر فوق قرية فارما.',
    image: 'https://picsum.photos/seed/chalet2/800/600',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'جناح اللؤلؤة اللازوردية',
    price: 520,
    description: 'جناحنا المتميز الذي يتميز بنوافذ بانورامية ومرافق عصرية متكاملة.',
    image: 'https://picsum.photos/seed/chalet3/800/600',
    rating: 4.9,
  },
]

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    chaletId: '1',
    clientName: 'أحمد عمر',
    phoneNumber: '0123456789',
    guestCount: 4,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'confirmed',
    notes: 'يحتاج مناشف إضافية',
  }
]

export function useAppStore() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [chalets, setChalets] = useState<Chalet[]>(INITIAL_CHALETS)
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedRole = localStorage.getItem('sfa_role') as UserRole
    const savedChalets = localStorage.getItem('sfa_chalets')
    const savedBookings = localStorage.getItem('sfa_bookings')

    if (savedRole) setRole(savedRole)
    if (savedChalets) setChalets(JSON.parse(savedChalets))
    if (savedBookings) setBookings(JSON.parse(savedBookings))
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      if (role) localStorage.setItem('sfa_role', role)
      localStorage.setItem('sfa_chalets', JSON.stringify(chalets))
      localStorage.setItem('sfa_bookings', JSON.stringify(bookings))
    }
  }, [role, chalets, bookings, isLoaded])

  const addBooking = (booking: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
    }
    setBookings(prev => [...prev, newBooking])
    return newBooking
  }

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const updateBookingDetails = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const updateChalet = (id: string, updates: Partial<Chalet>) => {
    setChalets(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  return {
    role,
    setRole,
    chalets,
    bookings,
    addBooking,
    updateBookingStatus,
    updateBookingDetails,
    updateChalet,
    isLoaded
  }
}
