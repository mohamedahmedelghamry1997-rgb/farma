
"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Chalet } from "@/lib/store"
import { ChevronLeft, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChaletCardProps {
  chalet: Chalet
  onBook: (chalet: Chalet) => void
}

export function ChaletCard({ chalet, onBook }: ChaletCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={chalet.image}
          alt={chalet.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint="beachfront chalet"
        />
        <div className="absolute top-4 right-4">
           <Badge className="bg-white/90 backdrop-blur-md text-slate-800 font-bold px-4 py-1.5 rounded-full border-none shadow-sm">
             {chalet.city}
           </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <CardContent className="p-8 space-y-4">
        <div className="flex items-center justify-center gap-1 text-slate-400 text-xs font-bold">
          <MapPin className="h-3 w-3" /> {chalet.location}
        </div>
        
        <h3 className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">{chalet.name}</h3>
        
        <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-50">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-bold uppercase">الأيام العادية</p>
            <p className="text-red-500 font-black text-lg">
              {chalet.normalPrice} <span className="text-xs">ر.ع</span>
            </p>
          </div>
          <div className="space-y-1 border-r border-slate-100">
            <p className="text-slate-400 text-[10px] font-bold uppercase">الإجازات</p>
            <p className="text-red-600 font-black text-lg">
              {chalet.holidayPrice} <span className="text-xs">ر.ع</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => onBook(chalet)}
          className="w-full flex items-center gap-2 justify-center py-4 bg-slate-50 rounded-2xl text-slate-600 hover:bg-primary hover:text-white transition-all duration-300 font-black text-sm"
        >
          عرض التفاصيل والحجز <ChevronLeft className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}
