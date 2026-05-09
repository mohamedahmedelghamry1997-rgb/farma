
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
  Timestamp
} from 'firebase/firestore'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { useFirestore, useCollection, useAuth } from '@/firebase'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface UserProfile {
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
  gallery?: string[]
  videoUrl?: string
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
  createdAt?: any
}

export function useAppStore() {
  const db = useFirestore()
  const auth = useAuth()
  const [role, setRole] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  
  const { data: chaletsData, loading: chaletsLoading } = useCollection<Chalet>(
    collection(db, 'chalets')
  )
  
  const { data: bookingsData, loading: bookingsLoading } = useCollection<Booking>(
    query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
  )
  
  const { data: usersData, loading: usersLoading } = useCollection<UserProfile>(
    collection(db, 'users')
  )

  useEffect(() => {
    if (!chaletsLoading && chaletsData?.length === 0) {
      const demoChalets = [
        { 
          name: "لؤلؤة الساحل 1", 
          normalPrice: 3500, 
          holidayPrice: 4500, 
          city: "الساحل الشمالي", 
          location: "مارينا 7", 
          description: "شاليه فاخر مكيف بالكامل بفيو مباشر على البحر، يحتوي على 3 غرف نوم وريسبشن واسع.", 
          status: "active", 
          image: "https://picsum.photos/seed/c1/800/600",
          gallery: [
            "https://picsum.photos/seed/c1_1/800/600",
            "https://picsum.photos/seed/c1_2/800/600",
            "https://picsum.photos/seed/c1_3/800/600"
          ],
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
        },
        { 
          name: "ماونتن فيو السخنة", 
          normalPrice: 2800, 
          holidayPrice: 3500, 
          city: "العين السخنة", 
          location: "بلو باي", 
          description: "شاليه مودرن بتشطيبات فندقية وقريب من حمامات السباحة ومنطقة المطاعم.", 
          status: "active", 
          image: "https://picsum.photos/seed/c2/800/600",
          gallery: [
            "https://picsum.photos/seed/c2_1/800/600",
            "https://picsum.photos/seed/c2_2/800/600"
          ]
        },
        { 
          name: "هاسيندا باي لاكشري", 
          normalPrice: 6000, 
          holidayPrice: 7500, 
          city: "الساحل الشمالي", 
          location: "سيدي عبد الرحمن", 
          description: "فيلا مستقلة صف أول بحر بحديقة خاصة وحمام سباحة، قمة الرفاهية والخصوصية.", 
          status: "active", 
          image: "https://picsum.photos/seed/c3/800/600",
          gallery: [
            "https://picsum.photos/seed/c3_1/800/600",
            "https://picsum.photos/seed/c3_2/800/600",
            "https://picsum.photos/seed/c3_3/800/600"
          ]
        }
      ]
      demoChalets.forEach(c => addDoc(collection(db, 'chalets'), { ...c, createdAt: serverTimestamp() }))
    }
  }, [chaletsLoading, chaletsData, db])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile = usersData?.find(u => u.uid === firebaseUser.uid)
        if (profile) {
          setCurrentUser(profile)
          setRole(profile.role)
          localStorage.setItem('pb_role', profile.role)
        } else {
          setRole('client')
        }
      } else {
        const savedRole = localStorage.getItem('pb_role') as UserRole
        if (savedRole) setRole(savedRole)
        else setRole(null)
        setCurrentUser(null)
      }
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [auth, usersData])

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

  const addUser = (userData: Omit<UserProfile, 'id' | 'isApproved'>) => {
    addDoc(collection(db, 'users'), {
      ...userData,
      isApproved: role === 'admin',
      createdAt: serverTimestamp()
    })
  }

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
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
    updateUser: updateUserProfile,
    isLoaded: !chaletsLoading && !bookingsLoading && !usersLoading && !authLoading
  }
}
