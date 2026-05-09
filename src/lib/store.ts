
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
  normalPrice: number
  holidayPrice: number
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

// توليد 30 شاليه لمحاكاة الواقع
const generateChalets = (): Chalet[] => {
  const cities = ['الساحل الشمالي', 'العين السخنة', 'شرم الشيخ', 'الغردقة']
  const locations = ['سيدي عبد الرحمن', 'المونت جلالة', 'بورتو السخنة', 'مارينا 7', 'خليج نعمة', 'الجونة']
  
  return Array.from({ length: 30 }).map((_, i) => ({
    id: `c${i + 1}`,
    name: `شاليه لؤلؤة ${i + 1}`,
    normalPrice: 2000 + (Math.floor(Math.random() * 10) * 500),
    holidayPrice: 3000 + (Math.floor(Math.random() * 10) * 500),
    description: `وصف تفصيلي لشاليه لؤلؤة ${i + 1} الفاخر في أرقى المواقع السياحية بمصر.`,
    image: `https://picsum.photos/seed/${i + 100}/800/600`,
    location: locations[i % locations.length],
    city: cities[i % cities.length]
  }))
}

const INITIAL_CHALETS: Chalet[] = generateChalets()

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'المدير العام', role: 'admin' },
  { id: 'u2', name: 'وسيط مبيعات 1', role: 'broker', assignedChaletIds: ['c1', 'c2', 'c3', 'c4', 'c5'] },
  { id: 'u3', name: 'المشرف الميداني', role: 'supervisor', assignedChaletIds: INITIAL_CHALETS.map(c => c.id) }
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
      const usersData = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS
      const foundUser = usersData.find((u: any) => u.role === savedRole)
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
