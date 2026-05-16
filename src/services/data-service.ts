
'use client';

/**
 * @fileOverview Data Service
 * 
 * طبقة الخدمات لفصل منطق Firebase عن واجهة المستخدم.
 * هذا الملف يسهل عملية "النقل" أو تغيير قاعدة البيانات مستقبلاً.
 */

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
  Firestore
} from 'firebase/firestore';
import { Booking, Chalet, UserProfile, WithdrawalRequest, SystemSettings } from '@/lib/store';

export class DataService {
  constructor(private db: Firestore) {}

  // الشاليهات
  subscribeToChalets(callback: (chalets: Chalet[]) => void) {
    return onSnapshot(collection(this.db, 'chalets'), (snap) => {
      callback(snap.docs.map(d => ({ ...d.data() as Chalet, id: d.id })));
    });
  }

  async addChalet(data: any) {
    return addDoc(collection(this.db, 'chalets'), { 
      ...data, 
      createdAt: serverTimestamp() 
    });
  }

  async updateChalet(id: string, updates: Partial<Chalet>) {
    return updateDoc(doc(this.db, 'chalets', id), updates);
  }

  // الحجوزات
  subscribeToBookings(callback: (bookings: Booking[]) => void) {
    const q = query(collection(this.db, 'bookings'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ ...d.data() as Booking, id: d.id })));
    });
  }

  async addBooking(data: any) {
    return addDoc(collection(this.db, 'bookings'), {
      ...data,
      status: data.status || 'pending',
      opStatus: 'waiting',
      createdAt: serverTimestamp()
    });
  }

  async updateBooking(id: string, updates: Partial<Booking>) {
    return updateDoc(doc(this.db, 'bookings', id), updates);
  }

  // المستخدمين
  subscribeToUsers(callback: (users: UserProfile[]) => void) {
    return onSnapshot(collection(this.db, 'users'), (snap) => {
      callback(snap.docs.map(d => ({ ...d.data() as UserProfile, id: d.id })));
    });
  }

  async getUserProfile(uid: string) {
    const userDoc = await getDoc(doc(this.db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as UserProfile : null;
  }

  async setUserProfile(uid: string, profile: any) {
    return setDoc(doc(this.db, 'users', uid), profile, { merge: true });
  }

  // الإعدادات
  subscribeToSettings(callback: (settings: SystemSettings) => void) {
    return onSnapshot(doc(this.db, 'config', 'system'), (snap) => {
      if (snap.exists()) callback(snap.data() as SystemSettings);
    });
  }
}
