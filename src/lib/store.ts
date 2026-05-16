
"use client"

import { useState, useEffect, useMemo } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useFirestore, useAuth } from '@/firebase'
import { DataService } from '@/services/data-service'

export type UserRole = 'client' | 'broker' | 'supervisor' | 'admin'

export interface UserProfile {
  id: string
  uid: string
  name: string
  role: UserRole
  assignedChaletIds: string[]
  isApproved: boolean
  email?: string
  phone?: string
  status?: 'active' | 'suspended'
  commissionRate?: number
  image?: string
  password?: string
}

export interface Chalet {
  id: string
  name: string
  code: string 
  normalPrice: number
  holidayPrice: number
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
  brokerName?: string 
  brokerCommission: number 
  supervisorId?: string
  notes?: string
  createdAt?: any
  conditionReport?: string
  electricityReading?: string
  waterReading?: string
  checkInTime?: string
  checkOutTime?: string
  permitFee?: number
  expenses?: number
  ownerShare?: number
  clientIdCardUrl?: string 
  clientIdCardUrls?: string[] 
}

export interface WithdrawalRequest {
  id: string
  brokerId: string
  brokerName: string
  amount: number
  method: 'vodafone_cash' | 'instapay' | 'bank'
  details: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: any
}

export interface SystemSettings {
  vodafoneCash?: string
  instaPay?: string
  bankAccount?: string
  whatsappNumber?: string
}

export function useAppStore() {
  const db = useFirestore()
  const auth = useAuth()
  
  // إنشاء نسخة من طبقة الخدمات
  const dataService = useMemo(() => new DataService(db), [db]);
  
  const [role, setRoleState] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const [chalets, setChalets] = useState<Chalet[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({})
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user)
      if (user) {
        try {
          const userData = await dataService.getUserProfile(user.uid);
          if (userData) {
            setCurrentUser({ ...userData, id: user.uid });
            setRoleState(userData.role);
          } else {
            let assignedRole: UserRole = 'client';
            if (user.email === 'admin@gmail.com') assignedRole = 'admin';

            const newProfile: Omit<UserProfile, 'id'> = {
              uid: user.uid,
              name: user.displayName || (user.email === 'admin@gmail.com' ? 'المدير العام' : 'مستخدم جديد'),
              role: assignedRole,
              isApproved: true,
              assignedChaletIds: [],
              status: 'active',
              commissionRate: assignedRole === 'broker' ? 200 : 0,
              email: user.email || ""
            };
            await dataService.setUserProfile(user.uid, newProfile);
            setCurrentUser({ ...newProfile, id: user.uid } as UserProfile);
            setRoleState(assignedRole);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setCurrentUser(null);
        setRoleState(null);
      }
      setIsAuthLoading(false);
    });

    const unsubChalets = dataService.subscribeToChalets(setChalets);
    const unsubBookings = dataService.subscribeToBookings(setBookings);
    const unsubUsers = dataService.subscribeToUsers(setUsers);
    const unsubSettings = dataService.subscribeToSettings(setSystemSettings);

    // التحميل المبدئي للبيانات
    setIsDataLoading(false);

    return () => {
      unsubscribeAuth();
      unsubChalets();
      unsubBookings();
      unsubUsers();
      unsubSettings();
    };
  }, [auth, dataService]);

  // العمليات (تم توجيهها الآن لطبقة الخدمات)
  const addBooking = (data: any) => dataService.addBooking(data);
  const updateBooking = (id: string, updates: Partial<Booking>) => dataService.updateBooking(id, updates);
  const addChalet = (data: any) => dataService.addChalet(data);
  const updateChalet = (id: string, updates: Partial<Chalet>) => dataService.updateChalet(id, updates);
  const addUser = (data: any) => dataService.setUserProfile(data.uid, data);
  const updateUser = (id: string, updates: Partial<UserProfile>) => dataService.setUserProfile(id, updates);

  return {
    role, currentUser, authUser, isAuthLoading,
    chalets, bookings, users, systemSettings, withdrawals,
    addBooking, updateBooking, addChalet, updateChalet, addUser, updateUser,
    isLoaded: !isAuthLoading && !isDataLoading
  }
}
