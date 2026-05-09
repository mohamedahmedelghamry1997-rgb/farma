"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Chalet } from "@/lib/store"
import { ChevronLeft, MapPin, Star, Waves, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChaletCardProps {
  chalet: Chalet
  onBook: (chalet: Chalet) => void
}

export function ChaletCard({ chalet, onBook }: ChaletCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-xl rounded-[3rem] bg-white text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-4">
      <div className="relative h-80 overflow-hidden">
        <Image
          src={chalet.image}
          alt={chalet.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        
        <div className="absolute top-6 right-6 flex flex-col gap-3">
           <Badge className="bg-white/95 backdrop-blur-md text-slate-800 font-black px-6 py-2.5 rounded-full border-none shadow-xl text-[10px] uppercase tracking-widest">
             {chalet.city}
           </Badge>
           <Badge className="bg-primary/90 backdrop-blur-md text-white font-black px-4 py-2 rounded-full border-none shadow-xl flex items-center gap-1.5">
             <Star className="h-3.5 w-3.5 fill-white" /> 5.0
           </Badge>
        </div>

        <div className="absolute bottom-6 right-6 left-6 text-right">
           <h3 className="text-2xl font-black text-white mb-2">{chalet.name}</h3>
           <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold uppercase tracking-widest">
            <MapPin className="h-3.5 w-3.5 text-primary" /> {chalet.location}
          </div>
        </div>
      </div>
      
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-3xl space-y-1">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">أيام الأسبوع</p>
            <p className="text-slate-800 font-black text-2xl">
              {chalet.normalPrice.toLocaleString()} <span className="text-xs">ج.م</span>
            </p>
          </div>
          <div className="bg-primary/5 p-4 rounded-3xl space-y-1 border border-primary/10">
            <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest">الويك إند</p>
            <p className="text-primary font-black text-2xl">
              {chalet.holidayPrice.toLocaleString()} <span className="text-xs">ج.م</span>
            </p>
          </div>
        </div>

        <button 
          onClick={() => onBook(chalet)}
          className="w-full flex items-center gap-4 justify-center py-6 bg-slate-900 rounded-[2rem] text-white hover:bg-primary transition-all duration-500 font-black text-lg shadow-xl shadow-slate-900/10 group-hover:shadow-primary/30"
        >
          حجز واستلام <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-2" />
        </button>
      </CardContent>
    </Card>
  )
}