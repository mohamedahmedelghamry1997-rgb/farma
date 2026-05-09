
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
  where,
  getDoc,
  setDoc
} from 'firebase/firestore'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useFirestore, useAuth } from '@/firebase'

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
}

export interface Chalet {
  id: string
  name: string
  normalPrice: number
  holidayPrice: number
  description: string
  image: string
  gallery?: string[]
  location: string
  city: string
  status: 'active' | 'maintenance' | 'closed' | 'pending'
  maxGuests?: number
  amenities?: string[]
  ownerBrokerId?: string
  cleaningFee?: number
  insuranceFee?: number
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
  paymentStatus?: 'pending' | 'verified' | 'rejected'
  paymentMethod?: string
  paymentReference?: string
  totalAmount: number
  brokerId?: string
  supervisorId?: string
  notes?: string
  createdAt?: any
  conditionReport?: string
  electricityReading?: string
  waterReading?: string
  checkInTime?: string
  checkOutTime?: string
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
  
  const [role, setRoleState] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const [chalets, setChalets] = useState<Chalet[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user)
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile
          setCurrentUser({ ...userData, id: userDoc.id })
          setRoleState(userData.role)
        } else {
          const isAdmin = user.email === 'admin@gmail.com'
          const newProfile: Omit<UserProfile, 'id'> = {
            uid: user.uid,
            name: user.displayName || 'مستخدم جديد',
            role: isAdmin ? 'admin' : 'client',
            isApproved: true,
            assignedChaletIds: []
          }
          await setDoc(doc(db, 'users', user.uid), newProfile)
          setCurrentUser({ ...newProfile, id: user.uid } as UserProfile)
          setRoleState(newProfile.role)
        }
      } else {
        setCurrentUser(null)
        setRoleState(null)
      }
      setIsAuthLoading(false)
    })

    const unsubChalets = onSnapshot(collection(db, 'chalets'), (snap) => {
      setChalets(snap.docs.map(d => ({ ...d.data() as Chalet, id: d.id })))
    })

    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), (snap) => {
      setBookings(snap.docs.map(d => ({ ...d.data() as Booking, id: d.id })))
    })

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data() as UserProfile, id: d.id })))
    })

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(d => ({ ...d.data() as Coupon, id: d.id })))
      setIsDataLoading(false)
    })

    return () => {
      unsubscribeAuth()
      unsubChalets()
      unsubBookings()
      unsubUsers()
      unsubCoupons()
    }
  }, [auth, db])

  const cleanData = (data: any) => {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) acc[key] = value;
      return acc;
    }, {} as any);
  };

  const addBooking = (data: Omit<Booking, 'id' | 'createdAt'>) => {
    const finalData = cleanData({
      ...data,
      status: 'pending',
      opStatus: 'waiting',
      paymentStatus: 'pending',
      createdAt: serverTimestamp()
    });
    addDoc(collection(db, 'bookings'), finalData)
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
    role, currentUser, authUser, isAuthLoading,
    chalets, bookings, users, coupons,
    addBooking, updateBooking, addChalet, updateChalet, deleteChalet, addUser, addCoupon, deleteCoupon,
    isLoaded: !isAuthLoading && !isDataLoading
  }
}
