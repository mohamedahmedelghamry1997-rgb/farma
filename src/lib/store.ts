
"use client"

import { useState, useEffect } from 'react'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore'
import { useFirestore, useCollection } from '@/firebase'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface User {
  id: string
  uid: string
  name: string
  role: UserRole
  assignedChaletIds: string[]
  isApproved: boolean 
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
  status: 'pending' | 'active'
  addedBy?: string
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
  paymentMethod?: string
  paymentReference?: string
  paymentStatus?: 'pending' | 'verified' | 'rejected'
  totalAmount?: number
}

export function useAppStore() {
  const db = useFirestore()
  const [role, setRole] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  // Real-time collections
  const { data: chaletsData, loading: chaletsLoading } = useCollection<Chalet>(
    collection(db, 'chalets')
  )
  
  const { data: bookingsData, loading: bookingsLoading } = useCollection<Booking>(
    query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  )
  
  const { data: usersData, loading: usersLoading } = useCollection<User>(
    collection(db, 'users')
  )

  useEffect(() => {
    const savedRole = localStorage.getItem('pb_role') as UserRole
    if (savedRole) setRole(savedRole)
  }, [])

  useEffect(() => {
    if (role && usersData) {
      localStorage.setItem('pb_role', role)
      const user = usersData.find(u => u.role === role)
      setCurrentUser(user || null)
    }
  }, [role, usersData])

  const addBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'opStatus' | 'paymentStatus'>) => {
    addDoc(collection(db, 'bookings'), {
      ...bookingData,
      status: 'pending',
      opStatus: 'waiting',
      paymentStatus: 'pending',
      createdAt: serverTimestamp()
    })
  }

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    updateDoc(doc(db, 'bookings', id), updates)
  }

  const deleteBooking = (id: string) => {
    deleteDoc(doc(db, 'bookings', id))
  }

  const addChalet = (chalet: Omit<Chalet, 'id' | 'status'>) => {
    addDoc(collection(db, 'chalets'), {
      ...chalet,
      status: role === 'admin' ? 'active' : 'pending',
      addedBy: currentUser?.uid || 'anonymous',
      createdAt: serverTimestamp()
    })
  }

  const deleteChalet = (id: string) => {
    deleteDoc(doc(db, 'chalets', id))
  }

  const updateChalet = (id: string, updates: Partial<Chalet>) => {
    updateDoc(doc(db, 'chalets', id), updates)
  }

  const addUser = (userData: Omit<User, 'id' | 'isApproved'>) => {
    addDoc(collection(db, 'users'), {
      ...userData,
      isApproved: role === 'admin',
      createdAt: serverTimestamp()
    })
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    updateDoc(doc(db, 'users', id), updates)
  }

  return {
    role,
    currentUser,
    setRole,
    chalets: chaletsData || [],
    bookings: bookingsData || [],
    users: usersData || [],
    addBooking,
    updateBooking,
    deleteBooking,
    addChalet,
    deleteChalet,
    updateChalet,
    addUser,
    updateUser,
    isLoaded: !chaletsLoading && !bookingsLoading && !usersLoading
  }
}
