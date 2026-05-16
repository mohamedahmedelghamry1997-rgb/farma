
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
  getDoc,
  setDoc,
  writeBatch
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
  status: 'pending' | 'approved' | 'rejected'
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
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setCurrentUser({ ...userData, id: userDoc.id });
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
            await setDoc(userDocRef, newProfile);
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

    const unsubChalets = onSnapshot(collection(db, 'chalets'), (snap) => {
      setChalets(snap.docs.map(d => ({ ...d.data() as Chalet, id: d.id })));
    });

    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), (snap) => {
      setBookings(snap.docs.map(d => ({ ...d.data() as Booking, id: d.id })));
    });

    const unsubWithdrawals = onSnapshot(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')), (snap) => {
      setWithdrawals(snap.docs.map(d => ({ ...d.data() as WithdrawalRequest, id: d.id })));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data() as UserProfile, id: d.id })));
    });

    const unsubSettings = onSnapshot(doc(db, 'config', 'system'), (snap) => {
      if (snap.exists()) {
        setSystemSettings(snap.data() as SystemSettings);
      }
      setIsDataLoading(false);
    }, (err) => {
      setIsDataLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubChalets();
      unsubBookings();
      unsubWithdrawals();
      unsubUsers();
      unsubSettings();
    };
  }, [auth, db]);

  const updateSystemSettings = async (settings: SystemSettings) => {
    try {
      await setDoc(doc(db, 'config', 'system'), settings, { merge: true });
    } catch (e) {
      console.error("Error updating system settings:", e);
    }
  }

  const addBooking = async (data: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    
    try {
      await addDoc(collection(db, 'bookings'), {
        ...cleanData,
        status: data.status || 'pending',
        opStatus: 'waiting',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding booking:", e);
      throw e;
    }
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      await updateDoc(doc(db, 'bookings', id), updates);
    } catch (e) {
      console.error("Error updating booking:", e);
    }
  }

  const addWithdrawalRequest = async (data: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      await addDoc(collection(db, 'withdrawals'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding withdrawal request:", e);
    }
  }

  const updateWithdrawalStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'withdrawals', id), { status });
    } catch (e) {
      console.error("Error updating withdrawal status:", e);
    }
  }

  const addChalet = async (data: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    try {
      await addDoc(collection(db, 'chalets'), { 
        ...cleanData, 
        status: data.status || 'active',
        createdAt: serverTimestamp() 
      });
    } catch (e) {
      console.error("Error adding chalet:", e);
    }
  }

  const updateChalet = async (id: string, updates: Partial<Chalet>) => {
    try {
      await updateDoc(doc(db, 'chalets', id), updates);
    } catch (e) {
      console.error("Error updating chalet:", e);
    }
  }

  const deleteChalet = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'chalets', id));
    } catch (e) {
      console.error("Error deleting chalet:", e);
    }
  }

  const addUser = async (data: any) => {
    try {
      const newUserRef = doc(collection(db, 'users'));
      await setDoc(newUserRef, {
        ...data,
        uid: newUserRef.id,
        isApproved: true,
        status: 'active',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding user:", e);
    }
  }

  const updateUser = async (id: string, updates: Partial<UserProfile>) => {
    try {
      await updateDoc(doc(db, 'users', id), updates);
    } catch (e) {
      console.error("Error updating user:", e);
    }
  }

  return {
    role, currentUser, authUser, isAuthLoading,
    chalets, bookings, users, systemSettings, withdrawals,
    addBooking, updateBooking, addChalet, updateChalet, deleteChalet, addUser, updateUser, updateSystemSettings, addWithdrawalRequest, updateWithdrawalStatus,
    isLoaded: !isAuthLoading && !isDataLoading
  }
}
