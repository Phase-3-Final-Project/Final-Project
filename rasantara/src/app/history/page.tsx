"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HistoryPage() {
  const router = useRouter()
  type Food = { id?: string; name?: string; photo?: string; description?: string; origin?: { province?: string; island?: string }; viewedAt?: string }
  const [historyFoods, setHistoryFoods] = useState<Food[]>([])
  const [user, setUser] = useState<{ id: string } | null>(null)

  useEffect(() => {
    (async () => {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        router.push("/auth/login")
        return
      }

      const userData = JSON.parse(storedUser)
      setUser(userData)

      try {
        const res = await fetch(`/api/user`)
        if (res.ok) {
          const body = await res.json()
          // If you later implement history, it should be returned here as body.history
          const history = (body.history || []) as unknown[]
          if (history.length > 0) {
            // map to foods with viewedAt
            const foods = (history
              .map((h: unknown) => {
                if (typeof h === 'object' && h !== null && 'food' in h) {
                  const hh = h as { food?: Food; viewedAt?: string }
                  return { ...(hh.food ?? {}), viewedAt: hh.viewedAt }
                }
                return null
              })
              .filter(Boolean) as Food[])
              .sort((a, b) => new Date(b.viewedAt || '').getTime() - new Date(a.viewedAt || '').getTime())
            setHistoryFoods(foods)
          }
        }
      } catch (err) {
        console.error(err)
      }
    })()
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-900">📜 View History {user?.id ? `- ${user.id}` : ''}</h1>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-amber-50"
          >
            ← Back to Explorer
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {historyFoods.length > 0 ? (
          <div className="space-y-4">
            {historyFoods.map((food) => (
              <Card
                key={`${food.id}-${food.viewedAt}`}
                onClick={() => router.push(`/food/${food.id}`)}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white border-amber-200 p-4"
              >
                <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 rounded">
                    <Image
                      src={food.photo || "/placeholder.svg"}
                      alt={food.name ?? ''}
                      fill
                      className="object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/indonesian-food.jpg"
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-amber-900">{food.name}</h3>
                    <p className="text-sm text-amber-700 line-clamp-2 mb-2">{food.description}</p>
                    <div className="flex items-center justify-between text-xs text-amber-600">
                                <span>📍 {food.origin?.province ?? ''}</span>
                                <span className="text-amber-500">Viewed: {food.viewedAt ? new Date(food.viewedAt).toLocaleDateString() : ''}</span>
                              </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-amber-800 text-lg mb-4">Your history is empty</p>
            <Button onClick={() => router.push("/")} className="bg-amber-600 hover:bg-amber-700 text-white">
              Explore Foods
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
