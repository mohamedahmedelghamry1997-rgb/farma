"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin } from "lucide-react"
import { Chalet } from "@/lib/store"

interface ChaletCardProps {
  chalet: Chalet
  onBook: (chalet: Chalet) => void
}

export function ChaletCard({ chalet, onBook }: ChaletCardProps) {
  return (
    <Card className="overflow-hidden group border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl bg-white">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={chalet.image}
          alt={chalet.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint="beachfront chalet"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/90 text-primary border-none font-bold py-1 px-3 backdrop-blur-sm">
            ${chalet.price}<span className="text-[10px] opacity-60 ml-1">/night</span>
          </Badge>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <p className="text-white text-sm line-clamp-2">{chalet.description}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline text-xl text-primary font-bold">{chalet.name}</h3>
          <div className="flex items-center gap-1 text-secondary font-bold">
            <Star className="h-4 w-4 fill-secondary" />
            <span>{chalet.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
          <MapPin className="h-4 w-4" />
          <span>Pharma Beach Village, North Coast</span>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
          onClick={() => onBook(chalet)}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  )
}
