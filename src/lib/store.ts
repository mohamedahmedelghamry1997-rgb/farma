
"use client"

import { useState, useEffect } from 'react'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface User {
  id: string
  name: string
  role: UserRole
  assignedChaletIds?: string[]
}

export interface Chalet {
  id: string
  name: string
  normalPrice: number // أيام عادية
  holidayPrice: number // إجازات
  description: string
  image: string
  location: string
  city: string
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
  opStatus?: 'waiting' | 'checked_in' | 'checked_out'
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  conditionReport?: string
  securityDeposit?: number
  brokerId?: string 
}

const INITIAL_CHALETS: Chalet[] = [
  {
    id: 'c1',
    name: 'شالية لؤلؤة الساحل',
    normalPrice: 3500,
    holidayPrice: 4500,
    description: 'إطلالة مباشرة على البحر في أرقى قرى الساحل الشمالي.',
    image: 'https://picsum.photos/seed/p1/800/600',
    location: 'الساحل الشمالي - سيدي عبد الرحمن',
    city: 'الساحل الشمالي'
  },
  {
    id: 'c2',
    name: 'فيلا الجوهرة الملكية',
    normalPrice: 5000,
    holidayPrice: 6500,
    description: 'تصميم عصري مع حمام سباحة خاص وحديقة واسعة.',
    image: 'https://picsum.photos/seed/p2/800/600',
    location: 'العين السخنة - المونت جلالة',
    city: 'العين السخنة'
  },
  {
    id: 'c3',
    name: 'جناح مارينا بورتو',
    normalPrice: 2800,
    holidayPrice: 3800,
    description: 'خصوصية تامة بالقرب من الخدمات والممشى السياحي.',
    image: 'https://picsum.photos/seed/p3/800/600',
    location: 'العين السخنة - بورتو السخنة',
    city: 'العين السخنة'
  },
  {
    id: 'c4',
    name: 'شالية الفيروز الهادئ',
    normalPrice: 2200,
    holidayPrice: 3200,
    description: 'إقامة مريحة وهادئة للعائلات مع إطلالة بانورامية.',
    image: 'https://picsum.photos/seed/p4/800/600',
    location: 'الساحل الشمالي - مارينا 7',
    city: 'الساحل الشمالي'
  }
]

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'أحمد الإدمن', role: 'admin' },
  { id: 'u2', name: 'سامي مندوب', role: 'broker', assignedChaletIds: ['c1', 'c2'] },
  { id: 'u3', name: 'محمود المشرف', role: 'supervisor', assignedChaletIds: ['c1', 'c2', 'c3', 'c4'] }
]

export function useAppStore() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [chalets, setChalets] = useState<Chalet[]>(INITIAL_CHALETS)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedRole = localStorage.getItem('pb_role') as UserRole
    const savedChalets = localStorage.getItem('pb_chalets')
    const savedBookings = localStorage.getItem('pb_bookings')
    const savedUsers = localStorage.getItem('pb_users')

    if (savedRole) {
      setRole(savedRole)
      const foundUser = (savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS).find((u: any) => u.role === savedRole)
      setCurrentUser(foundUser || null)
    }
    if (savedChalets) setChalets(JSON.parse(savedChalets))
    if (savedBookings) setBookings(JSON.parse(savedBookings))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      if (role) localStorage.setItem('pb_role', role)
      localStorage.setItem('pb_chalets', JSON.stringify(chalets))
      localStorage.setItem('pb_bookings', JSON.stringify(bookings))
      localStorage.setItem('pb_users', JSON.stringify(users))
    }
  }, [role, chalets, bookings, users, isLoaded])

  const changeRole = (newRole: UserRole) => {
    setRole(newRole)
    const user = users.find(u => u.role === newRole) || null
    setCurrentUser(user)
  }

  const addBooking = (booking: Omit<Booking, 'id' | 'status'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      opStatus: 'waiting'
    }
    setBookings(prev => [...prev, newBooking])
    return newBooking
  }

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const addChalet = (chalet: Omit<Chalet, 'id'>) => {
    const newChalet = { ...chalet, id: 'c' + (chalets.length + 1) }
    setChalets(prev => [...prev, newChalet])
  }

  const deleteChalet = (id: string) => {
    setChalets(prev => prev.filter(c => c.id !== id))
  }

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: 'u' + (users.length + 1) }
    setUsers(prev => [...prev, newUser])
  }

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  return {
    role,
    currentUser,
    setRole: changeRole,
    chalets,
    bookings,
    users,
    addBooking,
    updateBooking,
    addChalet,
    deleteChalet,
    addUser,
    deleteUser,
    isLoaded
  }
}
