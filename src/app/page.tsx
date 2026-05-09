"use client"

import { useState, useMemo } from 'react'
import { useAppStore, Booking, Chalet } from '@/lib/store'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { ChaletCard } from '@/components/ChaletCard'
import { BookingDialog } from '@/components/BookingDialog'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutDashboard, Calendar, Users, Home, Settings, ClipboardCheck, Info, Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { analyzeChaletConditionNotes } from '@/ai/flows/admin-chalet-condition-analyzer'
import { adminChaletBookingGapOptimizer } from '@/ai/flows/admin-chalet-booking-gap-optimizer'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function PharmaBeachApp() {
  const store = useAppStore()
  const { toast } = useToast()
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null)

  if (!store.isLoaded) return <div className="h-screen flex items-center justify-center bg-background"><Clock className="animate-spin text-primary" /></div>

  const handleBook = (chalet: Chalet) => {
    setSelectedChalet(chalet)
    setIsBookingOpen(true)
  }

  const handleConfirmBooking = (bookingData: Omit<Booking, 'id' | 'status'>) => {
    store.addBooking(bookingData)
    toast({
      title: "Booking Requested",
      description: "Your request has been submitted to the administrator.",
    })
  }

  const runConditionAI = async (booking: Booking, notes: string) => {
    setAiAnalyzing(booking.id)
    try {
      const result = await analyzeChaletConditionNotes({ notes, chaletId: booking.chaletId })
      setAiAnalysisResult(result)
      store.updateBookingDetails(booking.id, { conditionReport: notes })
      toast({ title: "AI Analysis Complete", description: `Priority: ${result.priority}` })
    } catch (e) {
      toast({ title: "AI Error", description: "Failed to analyze notes" })
    } finally {
      setAiAnalyzing(null)
    }
  }

  const runGapOptimizer = async (chaletId: string) => {
    setAiAnalyzing(`gap-${chaletId}`)
    try {
      const result = await adminChaletBookingGapOptimizer({
        chaletId,
        currentDate: new Date().toISOString(),
        bookings: store.bookings.filter(b => b.chaletId === chaletId).map(b => ({
          startDate: b.startDate,
          endDate: b.endDate
        }))
      })
      toast({
        title: "Gap Analysis Ready",
        description: result.hasGaps ? `Found ${result.gapDetails.length} gaps` : "Perfect occupancy!"
      })
      console.log("Gap Optimization Result:", result)
    } catch (e) {
      toast({ title: "AI Error", description: "Failed to optimize gaps" })
    } finally {
      setAiAnalyzing(null)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Home className="text-white h-5 w-5" />
            </div>
            <h1 className="font-headline text-lg font-black text-primary tracking-tighter">STUDIO FIREBASS AI</h1>
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="hidden md:flex bg-secondary/10 text-secondary border-secondary/20 font-bold">
               Pharma Beach Village
             </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!store.role ? (
          <div className="max-w-md mx-auto text-center space-y-8 mt-20">
            <div className="space-y-4">
              <Sparkles className="h-12 w-12 text-secondary mx-auto" />
              <h2 className="text-4xl font-headline font-black text-primary">Welcome</h2>
              <p className="text-muted-foreground">Select your role to explore the Pharma Beach Village ecosystem.</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {['client', 'broker', 'supervisor', 'admin'].map((r) => (
                <Button key={r} onClick={() => store.setRole(r as any)} size="lg" className="h-16 text-lg rounded-2xl capitalize">
                  Enter as {r}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* CLIENT VIEW */}
            {store.role === 'client' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-headline font-black text-primary">Explore Chalets</h2>
                    <p className="text-muted-foreground">Find the perfect stay at Pharma Beach.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {store.chalets.map(c => (
                    <ChaletCard key={c.id} chalet={c} onBook={handleBook} />
                  ))}
                </div>
              </div>
            )}

            {/* BROKER VIEW */}
            {store.role === 'broker' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-headline font-bold text-primary">Broker Dashboard</h2>
                 </div>
                 <Tabs defaultValue="chalets">
                   <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                     <TabsTrigger value="chalets" className="h-10">Manage Chalets</TabsTrigger>
                     <TabsTrigger value="bookings" className="h-10">Booking Reports</TabsTrigger>
                   </TabsList>
                   <TabsContent value="chalets" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {store.chalets.map(c => (
                        <Card key={c.id} className="rounded-2xl border-none shadow-md">
                          <CardHeader>
                            <CardTitle className="text-lg">{c.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                             <div className="space-y-1">
                               <label className="text-xs font-bold uppercase text-muted-foreground">Nightly Rate</label>
                               <Input type="number" value={c.price} onChange={(e) => store.updateChalet(c.id, { price: parseInt(e.target.value) })} />
                             </div>
                             <div className="space-y-1">
                               <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                               <Textarea value={c.description} onChange={(e) => store.updateChalet(c.id, { description: e.target.value })} />
                             </div>
                          </CardContent>
                        </Card>
                      ))}
                   </TabsContent>
                   <TabsContent value="bookings">
                      <div className="space-y-4">
                        {store.bookings.map(b => (
                          <Card key={b.id} className="rounded-2xl border-none shadow-sm p-4 flex justify-between items-center">
                            <div>
                              <p className="font-bold">{b.clientName}</p>
                              <p className="text-xs text-muted-foreground">{format(new Date(b.startDate), 'PPP')} - {format(new Date(b.endDate), 'PPP')}</p>
                            </div>
                            <Badge className={b.status === 'confirmed' ? 'bg-green-500' : b.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'}>
                              {b.status}
                            </Badge>
                          </Card>
                        ))}
                      </div>
                   </TabsContent>
                 </Tabs>
              </div>
            )}

            {/* SUPERVISOR VIEW */}
            {store.role === 'supervisor' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-headline font-bold text-primary">Operations Center</h2>
                <div className="grid grid-cols-1 gap-6">
                  {store.bookings.filter(b => b.status === 'confirmed').map(b => {
                    const chalet = store.chalets.find(c => c.id === b.chaletId)
                    return (
                      <Card key={b.id} className="rounded-2xl border-none shadow-md overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="p-6 flex-1 space-y-4 border-r">
                            <div>
                              <Badge className="mb-2 bg-primary/10 text-primary border-none">{chalet?.name}</Badge>
                              <h3 className="text-xl font-bold">{b.clientName}</h3>
                              <p className="text-sm text-muted-foreground">{b.phoneNumber}</p>
                            </div>
                            <div className="flex gap-4">
                               <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase text-muted-foreground">Check-in</p>
                                 <Input type="time" defaultValue={b.checkInTime} onBlur={(e) => store.updateBookingDetails(b.id, { checkInTime: e.target.value })} />
                               </div>
                               <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase text-muted-foreground">Check-out</p>
                                 <Input type="time" defaultValue={b.checkOutTime} onBlur={(e) => store.updateBookingDetails(b.id, { checkOutTime: e.target.value })} />
                               </div>
                            </div>
                          </div>
                          <div className="p-6 flex-1 bg-muted/20 space-y-4">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Condition Notes</label>
                            <Textarea 
                              placeholder="Describe chalet condition, maintenance needs, or issues..." 
                              className="bg-white border-none min-h-[100px]"
                              defaultValue={b.conditionReport}
                              onBlur={(e) => store.updateBookingDetails(b.id, { conditionReport: e.target.value })}
                            />
                            <div className="flex justify-between items-center">
                               <div className="space-y-1">
                                 <p className="text-[10px] font-bold uppercase text-muted-foreground">Security Deposit ($)</p>
                                 <Input type="number" defaultValue={b.securityDeposit} onBlur={(e) => store.updateBookingDetails(b.id, { securityDeposit: parseInt(e.target.value) })} className="w-32 bg-white" />
                               </div>
                               <Button size="sm" onClick={() => runConditionAI(b, b.conditionReport || "")} disabled={aiAnalyzing === b.id} className="bg-secondary text-white font-bold gap-2">
                                 {aiAnalyzing === b.id ? <Clock className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                 AI Analyze
                               </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ADMIN VIEW */}
            {store.role === 'admin' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-headline font-black text-primary">Administration Panel</h2>
                  <Badge className="bg-primary text-white font-bold h-8 px-4">System Master</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="rounded-2xl border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-bold uppercase">Total Bookings</CardDescription>
                      <CardTitle className="text-4xl text-primary">{store.bookings.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-2xl border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-bold uppercase">Revenue Forecast</CardDescription>
                      <CardTitle className="text-4xl text-secondary">${store.bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (store.chalets.find(c => c.id === b.chaletId)?.price || 0), 0)}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-2xl border-none shadow-md bg-primary text-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs font-bold uppercase text-white/70">Occupancy Efficiency</CardDescription>
                      <CardTitle className="text-4xl">94%</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-primary/5 p-6 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Booking Queue
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y">
                        {store.bookings.map(b => (
                          <div key={b.id} className="p-6 flex justify-between items-center hover:bg-muted/10 transition-colors">
                            <div className="space-y-1">
                              <p className="font-bold text-primary">{b.clientName}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Home className="h-3 w-3" /> {store.chalets.find(c => c.id === b.chaletId)?.name}</span>
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.guestCount}</span>
                              </div>
                              <p className="text-[10px] opacity-60 font-bold">{format(new Date(b.startDate), 'MMM dd')} - {format(new Date(b.endDate), 'MMM dd')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {b.status === 'pending' ? (
                                <>
                                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => store.updateBookingStatus(b.id, 'cancelled')}><XCircle /></Button>
                                  <Button size="icon" variant="ghost" className="text-green-500" onClick={() => store.updateBookingStatus(b.id, 'confirmed')}><CheckCircle2 /></Button>
                                </>
                              ) : (
                                <Badge className={b.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'}>{b.status}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
                    <CardHeader className="bg-secondary/10 p-6 border-b">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-secondary" />
                        AI Occupancy Optimizer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <p className="text-sm text-muted-foreground">
                        Our AI analyzes historical data and future bookings to identify gaps and suggest promotions to ensure 100% back-to-back occupancy.
                      </p>
                      <div className="space-y-4">
                        {store.chalets.map(c => (
                          <div key={c.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
                             <span className="font-bold text-sm">{c.name}</span>
                             <Button size="sm" variant="outline" className="text-xs h-8 rounded-full font-bold border-secondary text-secondary hover:bg-secondary hover:text-white" onClick={() => runGapOptimizer(c.id)} disabled={aiAnalyzing === `gap-${c.id}`}>
                               {aiAnalyzing === `gap-${c.id}` ? "Optimizing..." : "Analyze Gaps"}
                             </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BookingDialog 
        chalet={selectedChalet}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleConfirmBooking}
        existingBookings={store.bookings}
      />

      <RoleSwitcher currentRole={store.role} onRoleChange={store.setRole} />
    </div>
  )
}
