
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
  checkOutTime?: string
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

export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  value: number
  expiryDate: string
  isActive: boolean
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
  const [coupons, setCoupons] = useState<Coupon[]>([])
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
            else if (user.email === 'admin1@gmail.com') assignedRole = 'broker';
            else if (user.email === 'admin2@gmail.com') assignedRole = 'supervisor';

            const newProfile: Omit<UserProfile, 'id'> = {
              uid: user.uid,
              name: user.displayName || (user.email === 'admin@gmail.com' ? 'المدير العام' : user.email === 'admin1@gmail.com' ? 'أحمد البروكر' : 'محمود المشرف'),
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
    });

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(d => ({ ...d.data() as Coupon, id: d.id })));
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
      unsubCoupons();
    };
  }, [auth, db]);

  const updateSystemSettings = async (settings: SystemSettings) => {
    try {
      await setDoc(doc(db, 'config', 'system'), settings, { merge: true });
    } catch (e) {
      console.error("Error updating system settings:", e);
    }
  }

  const addBooking = async (data: Omit<Booking, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'bookings'), {
        ...data,
        status: data.status || 'pending',
        opStatus: data.opStatus || 'waiting',
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

  const addChalet = async (data: Omit<Chalet, 'id'>) => {
    try {
      await addDoc(collection(db, 'chalets'), { 
        ...data, 
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

  const seedDatabase = async () => {
    const batch = writeBatch(db);

    const chaletData = [
      { code: "CH-101", name: "فيلا الياقوت - مارينا 5", normalPrice: 5000, holidayPrice: 7500, city: "الساحل الشمالي", location: "مارينا 5، الصف الأول", status: "active", description: "فيلا فاخرة تطل مباشرة على البحر مع حمام سباحة خاص وحديقة واسعة.", image: "https://picsum.photos/seed/beachfront1/800/600", gallery: ["https://picsum.photos/seed/beach1/800/600", "https://picsum.photos/seed/beach2/800/600"] },
      { code: "CH-102", name: "شاليه اللؤلؤة - هاسيندا", normalPrice: 3500, holidayPrice: 5000, city: "الساحل الشمالي", location: "هاسيندا باي، الساحل", status: "active", description: "شاليه مودرن بموقع متميز بالقرب من الكلوب هاوس.", image: "https://picsum.photos/seed/beachfront2/800/600", gallery: ["https://picsum.photos/seed/resort1/800/600"] },
      { code: "CH-103", name: "رويال سويت - العين السخنة", normalPrice: 2500, holidayPrice: 3500, city: "العين السخنة", location: "بورتو سخنة", status: "active", description: "جناح ملكي مع إطلالة بانورامية على الجبل والبحر.", image: "https://picsum.photos/seed/beachfront3/800/600" }
    ];

    const chaletRefs: string[] = [];
    for (const c of chaletData) {
      const ref = doc(collection(db, 'chalets'));
      batch.set(ref, { ...c, createdAt: serverTimestamp() });
      chaletRefs.push(ref.id);
    }

    const today = new Date();
    // توليد حجوزات مؤكدة لوسيط تجريبي ليكون لديه رصيد قابل للسحب
    const bookingData = [
      { 
        chaletId: chaletRefs[0], 
        clientName: "ياسر محمود", 
        phoneNumber: "01011223344", 
        guestCount: 4, 
        startDate: today.toISOString(), 
        endDate: new Date(today.getTime() + 86400000 * 2).toISOString(), 
        status: "confirmed", 
        opStatus: "waiting", 
        paymentStatus: "verified", 
        totalAmount: 15000, 
        brokerId: "admin1_uid",
        brokerName: "أحمد البروكر",
        brokerCommission: 600, 
        paymentMethod: 'vodafone_cash', 
        paymentReference: 'REF123', 
        createdAt: serverTimestamp() 
      },
      { 
        chaletId: chaletRefs[1], 
        clientName: "منى علي", 
        phoneNumber: "01155667788", 
        guestCount: 2, 
        startDate: new Date(today.getTime() + 86400000 * 5).toISOString(), 
        endDate: new Date(today.getTime() + 86400000 * 8).toISOString(), 
        status: "confirmed", 
        opStatus: "waiting", 
        paymentStatus: "verified", 
        totalAmount: 10500, 
        brokerId: "admin1_uid",
        brokerName: "أحمد البروكر",
        brokerCommission: 800, 
        paymentMethod: 'instapay', 
        paymentReference: 'TXN999', 
        createdAt: serverTimestamp() 
      }
    ];

    for (const b of bookingData) {
      const ref = doc(collection(db, 'bookings'));
      batch.set(ref, b);
    }

    await batch.commit();
  }

  return {
    role, currentUser, authUser, isAuthLoading,
    chalets, bookings, users, coupons, systemSettings, withdrawals,
    addBooking, updateBooking, addChalet, updateChalet, addUser, updateUser, seedDatabase, updateSystemSettings, addWithdrawalRequest, updateWithdrawalStatus,
    isLoaded: !isAuthLoading && !isDataLoading
  }
}
