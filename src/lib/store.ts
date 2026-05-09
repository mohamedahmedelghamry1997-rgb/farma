
"use client"

import { useState, useEffect } from 'react'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface User {
  id: string
  name: string
  role: UserRole
  assignedChaletIds: string[]
  isApproved: boolean // لاعتماد البروكرز والمشرفين الجدد
}

export interface Chalet {
  id: string
  name: string
  normalPrice: number
  holidayPrice: number
  description: string
  image: string
  location: string
  city: string
  status: 'pending' | 'active' // البروكر يضيف شاليه والادمن يعتمده
}

export interface Booking {
  id: string
  chaletId: string
  clientName: string
  phoneNumber: string
  guestCount: number
  startDate: string
  endDate: string
  status: 'pending' | 'admin_approved' | 'confirmed' | 'cancelled'
  opStatus: 'waiting' | 'checked_in' | 'checked_out'
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  conditionReport?: string
  securityDeposit?: string
  brokerId?: string 
}

const generateChalets = (): Chalet[] => {
  const cities = ['الساحل الشمالي', 'العين السخنة']
  const locations = ['سيدي عبد الرحمن', 'المونت جلالة', 'بورتو السخنة', 'مارينا 7']
  
  return Array.from({ length: 30 }).map((_, i) => ({
    id: `c${i + 1}`,
    name: `شاليه لؤلؤة ${i + 1}`,
    normalPrice: 2000 + (Math.floor(Math.random() * 10) * 500),
    holidayPrice: 3000 + (Math.floor(Math.random() * 10) * 500),
    description: `وصف تفصيلي لشاليه لؤلؤة ${i + 1} الفاخر.`,
    image: `https://picsum.photos/seed/${i + 100}/800/600`,
    location: locations[i % locations.length],
    city: cities[i % cities.length],
    status: 'active'
  }))
}

const INITIAL_CHALETS: Chalet[] = generateChalets()

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'المدير العام', role: 'admin', assignedChaletIds: INITIAL_CHALETS.map(c => c.id), isApproved: true },
  { id: 'u2', name: 'أحمد السيلز (بروكر)', role: 'broker', assignedChaletIds: ['c1', 'c2', 'c3'], isApproved: true },
  { id: 'u3', name: 'محمد المشرف', role: 'supervisor', assignedChaletIds: INITIAL_CHALETS.map(c => c.id), isApproved: true }
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

    if (savedRole) setRole(savedRole)
    if (savedChalets) setChalets(JSON.parse(savedChalets))
    if (savedBookings) setBookings(JSON.parse(savedBookings))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      if (role) {
        localStorage.setItem('pb_role', role)
        const user = users.find(u => u.role === role)
        setCurrentUser(user || null)
      }
      localStorage.setItem('pb_chalets', JSON.stringify(chalets))
      localStorage.setItem('pb_bookings', JSON.stringify(bookings))
      localStorage.setItem('pb_users', JSON.stringify(users))
    }
  }, [role, chalets, bookings, users, isLoaded])

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'opStatus'>) => {
    const newBooking: Booking = {
      ...bookingData,
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

  const addChalet = (chalet: Omit<Chalet, 'id' | 'status'>) => {
    const newChalet: Chalet = { 
      ...chalet, 
      id: 'c' + (chalets.length + 1), 
      status: role === 'admin' ? 'active' : 'pending' 
    }
    setChalets(prev => [...prev, newChalet])
  }

  const deleteChalet = (id: string) => {
    setChalets(prev => prev.filter(c => c.id !== id))
  }

  const updateChalet = (id: string, updates: Partial<Chalet>) => {
    setChalets(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const addUser = (userData: Omit<User, 'id' | 'isApproved'>) => {
    const newUser: User = { 
      ...userData,
      assignedChaletIds: userData.assignedChaletIds || [],
      id: 'u' + (users.length + 1), 
      isApproved: role === 'admin' 
    }
    setUsers(prev => [...prev, newUser])
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u))
  }

  return {
    role,
    currentUser,
    setRole,
    chalets,
    bookings,
    users,
    addBooking,
    updateBooking,
    addChalet,
    deleteChalet,
    updateChalet,
    addUser,
    updateUser,
    isLoaded
  }
}
