
"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Chalet } from "@/lib/store"
import { ChevronLeft } from "lucide-react"

interface ChaletCardProps {
  chalet: Chalet
  onBook: (chalet: Chalet) => void
}

export function ChaletCard({ chalet, onBook }: ChaletCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-lg rounded-none bg-white text-center hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={chalet.image}
          alt={chalet.name}
          fill
          className="object-cover"
          data-ai-hint="luxury chalet"
        />
      </div>
      <CardContent className="p-6 space-y-3">
        <div className="text-slate-400 text-sm font-medium">
          {chalet.location}
        </div>
        
        <div className="space-y-1">
          <p className="text-red-500 text-sm">
            أيام عادية بسعر: <span className="font-bold">{chalet.normalPrice} ر.ع</span>
          </p>
          <p className="text-red-500 text-sm">
            اجازات بسعر: <span className="font-bold">{chalet.holidayPrice} ر.ع</span>
          </p>
        </div>

        <h3 className="text-xl font-bold text-slate-800">{chalet.name}</h3>
        
        <button 
          onClick={() => onBook(chalet)}
          className="flex items-center gap-1 justify-center mx-auto text-slate-600 hover:text-primary transition-colors font-medium"
        >
          عرض التفاصيل <ChevronLeft className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}
