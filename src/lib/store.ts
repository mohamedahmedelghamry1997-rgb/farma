
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
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setCurrentUser({ ...userData, id: userDoc.id });
            setRoleState(userData.role);
          } else {
            const isAdmin = user.email === 'admin@gmail.com';
            const newProfile: Omit<UserProfile, 'id'> = {
              uid: user.uid,
              name: user.displayName || 'مستخدم جديد',
              role: isAdmin ? 'admin' : 'client',
              isApproved: true,
              assignedChaletIds: []
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser({ ...newProfile, id: user.uid } as UserProfile);
            setRoleState(newProfile.role);
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
    }, (err) => console.error("Firestore error (chalets):", err));

    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), (snap) => {
      setBookings(snap.docs.map(d => ({ ...d.data() as Booking, id: d.id })));
    }, (err) => console.error("Firestore error (bookings):", err));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data() as UserProfile, id: d.id })));
    }, (err) => console.error("Firestore error (users):", err));

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snap) => {
      setCoupons(snap.docs.map(d => ({ ...d.data() as Coupon, id: d.id })));
      setIsDataLoading(false);
    }, (err) => {
      console.error("Firestore error (coupons):", err);
      setIsDataLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubChalets();
      unsubBookings();
      unsubUsers();
      unsubCoupons();
    };
  }, [auth, db]);

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

  const addChalet = async (data: Omit<Chalet, 'id'>) => {
    try {
      await addDoc(collection(db, 'chalets'), { ...data, createdAt: serverTimestamp() });
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

  const addUser = async (data: Omit<UserProfile, 'id'>) => {
    try {
      await addDoc(collection(db, 'users'), { ...data, createdAt: serverTimestamp() });
    } catch (e) {
      console.error("Error adding user:", e);
    }
  }

  const addCoupon = async (data: Omit<Coupon, 'id'>) => {
    try {
      await addDoc(collection(db, 'coupons'), { ...data, isActive: true });
    } catch (e) {
      console.error("Error adding coupon:", e);
    }
  }

  const deleteCoupon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
    } catch (e) {
      console.error("Error deleting coupon:", e);
    }
  }

  const seedDatabase = async () => {
    const batch = writeBatch(db);

    // 1. Seed Chalets
    const chaletData = [
      { name: "فيلا الياقوت - مارينا 5", normalPrice: 5000, holidayPrice: 7500, city: "الساحل الشمالي", location: "مارينا 5، الصف الأول", status: "active", description: "فيلا فاخرة تطل مباشرة على البحر مع حمام سباحة خاص وحديقة واسعة.", image: "https://picsum.photos/seed/v1/800/600" },
      { name: "شاليه اللؤلؤة - هاسيندا", normalPrice: 3500, holidayPrice: 5000, city: "الساحل الشمالي", location: "هاسيندا باي، الساحل", status: "active", description: "شاليه مودرن بموقع متميز بالقرب من الكلوب هاوس.", image: "https://picsum.photos/seed/v2/800/600" },
      { name: "رويال سويت - العين السخنة", normalPrice: 2500, holidayPrice: 3500, city: "العين السخنة", location: "بورتو سخنة", status: "active", description: "جناح ملكي مع إطلالة بانورامية على الجبل والبحر.", image: "https://picsum.photos/seed/v3/800/600" },
      { name: "شاليه فينيسيا - سيدي عبد الرحمن", normalPrice: 4000, holidayPrice: 6000, city: "الساحل الشمالي", location: "مراسي، سيدي عبد الرحمن", status: "active", description: "تصميم إيطالي فريد وخصوصية تامة للعائلات.", image: "https://picsum.photos/seed/v4/800/600" }
    ];

    const chaletRefs: string[] = [];
    for (const c of chaletData) {
      const ref = doc(collection(db, 'chalets'));
      batch.set(ref, { ...c, createdAt: serverTimestamp() });
      chaletRefs.push(ref.id);
    }

    // 2. Seed Users (Profiles)
    const userData = [
      { uid: "demo-broker-1", name: "أحمد السمسار", role: "broker", isApproved: true, assignedChaletIds: [chaletRefs[0], chaletRefs[1]] },
      { uid: "demo-super-1", name: "محمود المشرف", role: "supervisor", isApproved: true, assignedChaletIds: chaletRefs }
    ];

    for (const u of userData) {
      const ref = doc(db, 'users', u.uid);
      batch.set(ref, { ...u, createdAt: serverTimestamp() });
    }

    // 3. Seed Bookings
    const bookingData = [
      { chaletId: chaletRefs[0], clientName: "ياسر محمود", phoneNumber: "01011223344", guestCount: 4, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000 * 3).toISOString(), status: "admin_approved", opStatus: "waiting", paymentStatus: "verified", totalAmount: 15000, brokerId: "demo-broker-1" },
      { chaletId: chaletRefs[1], clientName: "سارة أحمد", phoneNumber: "01233445566", guestCount: 2, startDate: new Date(Date.now() - 86400000 * 5).toISOString(), endDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: "confirmed", opStatus: "checked_out", paymentStatus: "verified", totalAmount: 7000, brokerId: "demo-broker-1" },
      { chaletId: chaletRefs[2], clientName: "خالد علي", phoneNumber: "01144556677", guestCount: 6, startDate: new Date(Date.now() + 86400000 * 10).toISOString(), endDate: new Date(Date.now() + 86400000 * 15).toISOString(), status: "pending", opStatus: "waiting", paymentStatus: "pending", totalAmount: 12500 }
    ];

    for (const b of bookingData) {
      const ref = doc(collection(db, 'bookings'));
      batch.set(ref, { ...b, createdAt: serverTimestamp() });
    }

    // 4. Seed Coupons
    const couponData = [
      { code: "PHARMA20", discountType: "percentage", value: 20, expiryDate: "2025-12-31", isActive: true },
      { code: "SUMMER500", discountType: "fixed", value: 500, expiryDate: "2025-09-01", isActive: true }
    ];

    for (const cp of couponData) {
      const ref = doc(collection(db, 'coupons'));
      batch.set(ref, cp);
    }

    await batch.commit();
  }

  return {
    role, currentUser, authUser, isAuthLoading,
    chalets, bookings, users, coupons,
    addBooking, updateBooking, addChalet, updateChalet, deleteChalet, addUser, addCoupon, deleteCoupon, seedDatabase,
    isLoaded: !isAuthLoading && !isDataLoading
  }
}
