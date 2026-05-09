
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
  onSnapshot,
  Timestamp,
  where,
  getDoc
} from 'firebase/firestore'
import { useFirestore, useCollection } from '@/firebase'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface UserProfile {
  id: string
  uid: string
  name: string
  role: UserRole
  assignedChaletIds: string[]
  isApproved: boolean
  phone?: string
  status?: 'active' | 'suspended'
  commissionRate?: number
  image?: string
  performanceScore?: number
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
  maxGuests?: number
  amenities?: string[]
  ownerBrokerId?: string
  cleaningFee?: number
  insuranceFee?: number
  minStay?: number
  maxStay?: number
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
  paymentMethod?: string
  paymentReference?: string
  paymentStatus?: 'pending' | 'verified' | 'rejected'
  totalAmount: number
  brokerId?: string
  supervisorId?: string
  notes?: string
  conditionReport?: string
  electricityReading?: string
  waterReading?: string
  brokerCommission?: number
  couponCode?: string
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
  const [role, setRoleState] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  const { data: chalets, loading: chaletsLoading } = useCollection<Chalet>(
    collection(db, 'chalets')
  )
  
  const { data: bookings, loading: bookingsLoading } = useCollection<Booking>(
    query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  )
  
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(
    collection(db, 'users')
  )

  const { data: coupons, loading: couponsLoading } = useCollection<Coupon>(
    collection(db, 'coupons')
  )

  useEffect(() => {
    if (!chaletsLoading && chalets?.length === 0) {
      const demoChalets = [
        { 
          name: "فيلا رويال هاسيندا", normalPrice: 12000, holidayPrice: 15000, city: "الساحل الشمالي", location: "سيدي عبد الرحمن", 
          description: "فيلا ملكية صف أول على البحر مباشرة مع حمام سباحة خاص وجاكوزي خارجي. خصوصية تامة.", status: "active", maxGuests: 12,
          image: "https://picsum.photos/seed/h1/800/600", amenities: ["تكييف مركزي", "مسبح", "فيو بحر"],
          gallery: ["https://picsum.photos/seed/h2/800/600", "https://picsum.photos/seed/h3/800/600"],
          cleaningFee: 500, insuranceFee: 2000
        },
        { 
          name: "شاليه لؤلؤة السخنة", normalPrice: 3500, holidayPrice: 5000, city: "العين السخنة", location: "تلال", 
          description: "إطلالة بانورامية ساحرة على البحر الأحمر. تصميم مودرن وأثاث فاخر ونظيف.", status: "active", maxGuests: 5,
          image: "https://picsum.photos/seed/s1/800/600", amenities: ["تكييف", "مطبخ كامل", "فيو بحر"],
          cleaningFee: 200, insuranceFee: 1000
        }
      ]
      demoChalets.forEach(c => addDoc(collection(db, 'chalets'), { ...c, createdAt: serverTimestamp() }))
    }

    if (!usersLoading && users?.length === 0) {
      const demoUsers = [
        { uid: "admin_1", name: "مدير المنظومة", role: "admin", isApproved: true },
        { uid: "broker_1", name: "أحمد البروكر", role: "broker", isApproved: true, commissionRate: 10 },
        { uid: "super_1", name: "محمد المشرف", role: "supervisor", isApproved: true }
      ]
      demoUsers.forEach(u => addDoc(collection(db, 'users'), { ...u, createdAt: serverTimestamp() }))
    }
  }, [chaletsLoading, usersLoading, db])

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
    if (newRole && users) {
      const user = users.find(u => u.role === newRole);
      if (user) setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }

  const cleanData = (data: any) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) acc[key] = value;
      return acc;
    }, {} as any);
  };

  const addBooking = (data: Omit<Booking, 'id' | 'createdAt'>) => {
    addDoc(collection(db, 'bookings'), { 
      ...cleanData(data), 
      status: data.status || 'pending',
      opStatus: data.opStatus || 'waiting',
      paymentStatus: data.paymentStatus || 'pending',
      createdAt: serverTimestamp() 
    })
  }

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    updateDoc(doc(db, 'bookings', id), cleanData(updates))
  }

  const addChalet = (data: Omit<Chalet, 'id'>) => {
    addDoc(collection(db, 'chalets'), { ...cleanData(data), createdAt: serverTimestamp() })
  }

  const updateChalet = (id: string, updates: Partial<Chalet>) => {
    updateDoc(doc(db, 'chalets', id), cleanData(updates))
  }

  const deleteChalet = (id: string) => {
    deleteDoc(doc(db, 'chalets', id))
  }

  const addUser = (data: Omit<UserProfile, 'id'>) => {
    addDoc(collection(db, 'users'), { ...cleanData(data), createdAt: serverTimestamp() })
  }

  const addCoupon = (data: Omit<Coupon, 'id'>) => {
    addDoc(collection(db, 'coupons'), { ...cleanData(data), isActive: true })
  }

  const deleteCoupon = (id: string) => {
    deleteDoc(doc(db, 'coupons', id))
  }

  return {
    role, setRole, currentUser, users: users || [],
    chalets: chalets || [], bookings: bookings || [], coupons: coupons || [],
    addBooking, updateBooking, addChalet, updateChalet, deleteChalet, addUser, addCoupon, deleteCoupon,
    isLoaded: !chaletsLoading && !bookingsLoading && !usersLoading && !couponsLoading
  }
}
