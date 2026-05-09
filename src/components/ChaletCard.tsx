
"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Chalet } from "@/lib/store"
import { ChevronLeft, MapPin, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChaletCardProps {
  chalet: Chalet
  onBook: (chalet: Chalet) => void
}

export function ChaletCard({ chalet, onBook }: ChaletCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-xl rounded-[3rem] bg-white text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
      <div className="relative h-72 overflow-hidden">
        <Image
          src={chalet.image}
          alt={chalet.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
          data-ai-hint="beachfront luxury chalet"
        />
        <div className="absolute top-5 right-5 flex flex-col gap-2">
           <Badge className="bg-white/95 backdrop-blur-md text-slate-800 font-black px-5 py-2 rounded-full border-none shadow-lg text-[10px] uppercase tracking-wider">
             {chalet.city}
           </Badge>
           <Badge className="bg-primary/90 backdrop-blur-md text-white font-black px-4 py-1.5 rounded-full border-none shadow-lg flex items-center gap-1">
             <Star className="h-3 w-3 fill-white" /> 5.0
           </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
           <p className="text-white font-bold text-sm text-right leading-relaxed">{chalet.description.substring(0, 60)}...</p>
        </div>
      </div>
      
      <CardContent className="p-8 space-y-5">
        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-black uppercase tracking-widest">
          <MapPin className="h-3.5 w-3.5 text-primary" /> {chalet.location}
        </div>
        
        <h3 className="text-2xl font-black text-slate-800 group-hover:text-primary transition-colors duration-300">{chalet.name}</h3>
        
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">الأيام العادية</p>
            <p className="text-red-500 font-black text-xl">
              {chalet.normalPrice} <span className="text-xs">ج.م</span>
            </p>
          </div>
          <div className="space-y-1 border-r border-slate-100">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">أيام الإجازات</p>
            <p className="text-red-600 font-black text-xl">
              {chalet.holidayPrice} <span className="text-xs">ج.م</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => onBook(chalet)}
          className="w-full flex items-center gap-3 justify-center py-5 bg-slate-50 rounded-3xl text-slate-600 hover:bg-primary hover:text-white transition-all duration-500 font-black text-sm shadow-sm group-hover:shadow-lg"
        >
          عرض التفاصيل والتواريخ <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        </button>
      </CardContent>
    </Card>
  )
}
