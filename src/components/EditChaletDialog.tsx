
"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Chalet } from "@/lib/store"
import { Home, MapPin, DollarSign, Hash, Video, Image as ImageIcon, Pencil } from "lucide-react"

interface EditChaletDialogProps {
  chalet: Chalet | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, data: any) => void
}

export function EditChaletDialog({ chalet, isOpen, onClose, onUpdate }: EditChaletDialogProps) {
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

  useEffect(() => {
    if (chalet) {
      setName(chalet.name)
      setCode(chalet.code)
      setNormalPrice(String(chalet.normalPrice))
      setHolidayPrice(String(chalet.holidayPrice))
      setCity(chalet.city === 'الساحل الشمالي' ? 'sc' : 'sh')
      setLocation(chalet.location)
      setDescription(chalet.description)
      setMainImage(chalet.image)
      setGalleryLinks(chalet.gallery || [''])
      setVideoUrl(chalet.videoUrl || '')
    }
  }, [chalet])

  const handleUpdateGalleryLink = (index: number, value: string) => {
    const newLinks = [...galleryLinks]
    newLinks[index] = value
    setGalleryLinks(newLinks)
  }

  const handleUpdate = () => {
    if (!chalet) return
    onUpdate(chalet.id, {
      name,
      code,
      normalPrice: parseInt(normalPrice),
      holidayPrice: parseInt(holidayPrice),
      city: city === 'sc' ? 'الساحل الشمالي' : 'العين السخنة',
      location,
      description,
      image: mainImage,
      gallery: galleryLinks.filter(link => link.trim() !== ''),
      videoUrl: videoUrl
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[2.5rem] border-none text-right max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right flex items-center justify-end gap-2">
            تعديل بيانات الشاليه <Pencil className="h-6 w-6 text-primary" />
          </DialogTitle>
          <DialogDescription className="text-right">تحديث معلومات الوحدة الحالية في المنظومة.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">اسم الشاليه</Label>
                <Input value={name} onChange={e => setName(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">كود الشاليه</Label>
                <Input value={code} onChange={e => setCode(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">رابط الصورة الرئيسية</Label>
                <Input value={mainImage} onChange={e => setMainImage(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">رابط الفيديو</Label>
                <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">السعر (عادي)</Label>
                <Input type="number" value={normalPrice} onChange={e => setNormalPrice(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">السعر (إجازة)</Label>
                <Input type="number" value={holidayPrice} onChange={e => setHolidayPrice(e.target.value)} className="rounded-2xl h-12 text-right bg-slate-50 border-slate-100" />
              </div>
           </div>

           <div className="space-y-2">
              <Label className="font-bold text-slate-600 flex items-center gap-2 justify-end text-xs">الوصف</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="rounded-2xl min-h-[100px] text-right bg-slate-50 border-slate-100" />
           </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-3 pb-2">
           <Button className="flex-1 rounded-2xl h-14 font-black bg-primary text-white" onClick={handleUpdate}>
             حفظ التعديلات
           </Button>
           <Button variant="ghost" className="rounded-2xl h-14 font-bold text-slate-400" onClick={onClose}>إلغاء</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
