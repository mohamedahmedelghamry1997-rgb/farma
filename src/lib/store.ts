
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
  serverTimestamp,
  where,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useFirestore, useCollection, useAuth } from '@/firebase'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface UserProfile {
  id: string
  uid: string
  name: string
  role: UserRole
  assignedChaletIds: string[]
  isApproved: boolean
  phone?: string
  email?: string
  commissionRate?: number
  status?: 'active' | 'suspended'
}

export interface Chalet {
  id: string
  name: string
  normalPrice: number
  holidayPrice: number
  weeklyPrice?: number
  monthlyPrice?: number
  description: string
  image: string
  gallery?: string[]
  videoUrl?: string
  location: string
  city: string
  status: 'active' | 'maintenance' | 'closed' | 'pending'
  addedBy?: string
  ownerBrokerId?: string
  maxGuests?: number
  amenities?: string[]
  inventory?: {
    towels: number
    sheets: number
    soap: number
  }
}

export interface Booking {
  id: string
  chaletId: string
  clientName: string
  phoneNumber: string
  clientEmail?: string
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
  supervisorId?: string
  paymentMethod?: string
  paymentReference?: string
  paymentStatus?: 'pending' | 'verified' | 'rejected'
  totalAmount: number
  brokerCommission?: number
  couponCode?: string
  electricityReading?: string
  waterReading?: string
  createdAt?: any
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  value: number
  expiryDate: string
  isActive: boolean
}

export function useAppStore() {
  const db = useFirestore()
  const auth = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  
  const { data: chalets, loading: chaletsLoading } = useCollection<Chalet>(
    collection(db, 'chalets')
  )
  
  const { data: bookings, loading: bookingsLoading } = useCollection<Booking>(
    query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  )
  
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(
    collection(db, 'users')
  )

  const { data: coupons } = useCollection<Coupon>(
    collection(db, 'coupons')
  )

  useEffect(() => {
    // Inject Demo Data if empty
    if (!chaletsLoading && chalets?.length === 0) {
      const demoChalets = [
        { 
          name: "فيلا الملكة هاسيندا", normalPrice: 8000, holidayPrice: 10000, city: "الساحل الشمالي", location: "سيدي عبد الرحمن", 
          description: "فيلا صف أول بحر بحديقة خاصة وحمام سباحة إنفينيتي.", status: "active", maxGuests: 10,
          image: "https://picsum.photos/seed/h1/800/600", amenities: ["واي فاي", "تكييف", "مسبح"],
          ownerBrokerId: "broker_uid_1", gallery: ["https://picsum.photos/seed/h2/800/600", "https://picsum.photos/seed/h3/800/600"]
        },
        { 
          name: "لؤلؤة السخنة 7", normalPrice: 3000, holidayPrice: 4500, city: "العين السخنة", location: "تلال", 
          description: "شاليه مودرن بفيو بانورامي على البحر الأحمر.", status: "active", maxGuests: 4,
          image: "https://picsum.photos/seed/s1/800/600", ownerBrokerId: "broker_uid_1"
        },
        { 
          name: "جولف بورتو مارينا", normalPrice: 2000, holidayPrice: 3000, city: "الساحل الشمالي", location: "مارينا", 
          description: "شاليه في قلب بورتو مارينا قريب من كافة الخدمات والنوادي.", status: "active", maxGuests: 6,
          image: "https://picsum.photos/seed/m1/800/600", ownerBrokerId: "broker_uid_1"
        }
      ]
      demoChalets.forEach(c => addDoc(collection(db, 'chalets'), { ...c, createdAt: serverTimestamp() }))
    }

    if (!usersLoading && users?.length === 0) {
      const demoUsers = [
        { uid: "admin_uid", name: "أدمن فارما", role: "admin", isApproved: true, status: 'active' },
        { uid: "broker_uid_1", name: "محمود البروكر", role: "broker", isApproved: true, commissionRate: 10, status: 'active' },
        { uid: "super_uid_1", name: "كابتن شريف", role: "supervisor", isApproved: true, status: 'active' }
      ]
      demoUsers.forEach(u => addDoc(collection(db, 'users'), { ...u, createdAt: serverTimestamp() }))
    }

    if (coupons?.length === 0) {
      const demoCoupons = [
        { code: "PHARMA10", discountType: "percentage", value: 10, isActive: true, expiryDate: "2025-12-31" },
        { code: "EID2024", discountType: "fixed", value: 500, isActive: true, expiryDate: "2024-06-30" }
      ]
      demoCoupons.forEach(cp => addDoc(collection(db, 'coupons'), cp))
    }
  }, [chaletsLoading, usersLoading, db, coupons])

  const addBooking = (data: Omit<Booking, 'id' | 'createdAt'>) => {
    addDoc(collection(db, 'bookings'), { ...data, createdAt: serverTimestamp() })
  }

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    updateDoc(doc(db, 'bookings', id), updates)
  }

  const addChalet = (data: Omit<Chalet, 'id'>) => {
    addDoc(collection(db, 'chalets'), { ...data, createdAt: serverTimestamp() })
  }

  const updateChalet = (id: string, updates: Partial<Chalet>) => {
    updateDoc(doc(db, 'chalets', id), updates)
  }

  const deleteChalet = (id: string) => {
    deleteDoc(doc(db, 'chalets', id))
  }

  const addUser = (data: Omit<UserProfile, 'id'>) => {
    addDoc(collection(db, 'users'), { ...data, createdAt: serverTimestamp() })
  }

  const updateUser = (id: string, updates: Partial<UserProfile>) => {
    updateDoc(doc(db, 'users', id), updates)
  }

  return {
    role, setRole, currentUser, users: users || [],
    chalets: chalets || [], bookings: bookings || [], coupons: coupons || [],
    addBooking, updateBooking, addChalet, updateChalet, deleteChalet, addUser, updateUser,
    isLoaded: !chaletsLoading && !bookingsLoading && !usersLoading
  }
}
