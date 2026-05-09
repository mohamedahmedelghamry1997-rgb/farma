
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, MapPin, DollarSign, Hash, Video, Image as ImageIcon, PlusCircle } from "lucide-react"

interface AddChaletDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (data: any) => void
}

export function AddChaletDialog({ isOpen, onClose, onAdd }: AddChaletDialogProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [normalPrice, setNormalPrice] = useState('')
  const [holidayPrice, setHolidayPrice] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [mainImage, setMainImage] = useState('')
  const [galleryLinks, setGalleryLinks] = useState<string[]>([''])
  const [videoUrl, setVideoUrl] = useState('')

  const handleAddGalleryLink = () => {
    setGalleryLinks([...galleryLinks, ''])
  }

  const handleUpdateGalleryLink = (index: number, value: string) => {
    const newLinks = [...galleryLinks]
    newLinks[index] = value
    setGalleryLinks(newLinks)
  }

  const handleAdd = () => {
    onAdd({
      name,
      code,
      normalPrice: parseInt(normalPrice),
      holidayPrice: parseInt(holidayPrice),
      city: city === 'sc' ? 'الساحل الشمالي' : 'العين السخنة',
      location,
      description,
      image: mainImage || `https://picsum.photos/seed/${Math.random()}/800/600`,
      gallery: galleryLinks.filter(link => link.trim() !== ''),
      videoUrl: videoUrl,
      status: 'active'
    })
    // Reset
    setName('')
    setCode('')
    setNormalPrice('')
    setHolidayPrice('')
    setCity('')
    setLocation('')
    setDescription('')
    setMainImage('')
    setGalleryLinks([''])
    setVideoUrl('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right">إضافة شاليه جديد للمنظومة</DialogTitle>
          <DialogDescription className="text-right">يرجى ملء البيانات وإضافة روابط الصور والفيديوهات بدقة.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">اسم الشاليه <Home className="h-3.5" /></Label>
                <Input placeholder="مثال: لؤلؤة الساحل 1" value={name} onChange={e => setName(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">كود الشاليه <Hash className="h-3.5" /></Label>
                <Input placeholder="CH-101" value={code} onChange={e => setCode(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">رابط الصورة الرئيسية <ImageIcon className="h-3.5" /></Label>
                <Input placeholder="https://example.com/image.jpg" value={mainImage} onChange={e => setMainImage(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">رابط الفيديو (YouTube/Drive) <Video className="h-3.5" /></Label>
                <Input placeholder="https://youtube.com/..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="space-y-3">
              <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">صور إضافية للمعرض (Links)</Label>
              {galleryLinks.map((link, idx) => (
                <Input 
                  key={idx} 
                  placeholder={`رابط صورة ${idx + 1}`} 
                  value={link} 
                  onChange={e => handleUpdateGalleryLink(idx, e.target.value)} 
                  className="rounded-xl h-10 text-right bg-slate-50 border-slate-100 mb-2" 
                />
              ))}
              <Button variant="outline" size="sm" onClick={handleAddGalleryLink} className="rounded-xl gap-2 font-bold border-dashed border-2">
                <PlusCircle className="h-4 w-4" /> إضافة رابط صورة آخر
              </Button>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">السعر (الأيام العادية) <DollarSign className="h-3.5" /></Label>
                <Input type="number" placeholder="2000" value={normalPrice} onChange={e => setNormalPrice(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">السعر (الإجازات) <DollarSign className="h-3.5" /></Label>
                <Input type="number" placeholder="3000" value={holidayPrice} onChange={e => setHolidayPrice(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">المدينة</Label>
                <Select onValueChange={setCity}>
                  <SelectTrigger className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sc">الساحل الشمالي</SelectItem>
                    <SelectItem value="sh">العين السخنة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">الموقع بالتحديد <MapPin className="h-3.5" /></Label>
                <Input placeholder="مثال: مارينا 7" value={location} onChange={e => setLocation(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="space-y-2">
              <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">وصف الشاليه ومميزاته</Label>
              <Textarea placeholder="اكتب تفاصيل الشاليه هنا..." value={description} onChange={e => setDescription(e.target.value)} className="rounded-2xl min-h-[100px] text-right bg-slate-50 border-slate-100" />
           </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-3 pb-2">
           <Button className="flex-1 rounded-2xl h-14 font-black bg-primary text-white" onClick={handleAdd} disabled={!name || !code || !normalPrice || !city}>
             إضافة الشاليه للمنظومة
           </Button>
           <Button variant="ghost" className="rounded-2xl h-14 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
