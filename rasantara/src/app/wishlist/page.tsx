"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"

type Food = {
  id?: string
  name?: string
  description?: string
  photo?: string
  model3D?: string
  origin?: { province?: string; island?: string }
}

export default function WishlistPage() {
  const router = useRouter()
  const [wishlistFoods, setWishlistFoods] = useState<Food[]>([])
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
          // body.wishlist is an array of { wishlistId, food }
          type Enriched = { wishlistId?: string; food?: { id?: string; name?: string; photo?: string; description?: string; origin?: { province?: string; island?: string } } }
          const foods = (body.wishlist || [])
            .map((w: unknown): Enriched['food'] | undefined => {
              if (typeof w === 'object' && w !== null && 'food' in w) return (w as Enriched).food
              return undefined
            })
            .filter((f: Enriched['food'] | undefined): f is Enriched['food'] => !!f)
          setWishlistFoods(foods)
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
          <h1 className="text-2xl font-bold text-amber-900">❤️ My Wishlist {user?.id ? `- ${user.id}` : ''}</h1>
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
        {wishlistFoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistFoods.map((food) => (
              <Card
                  key={`${food.id ?? food.name ?? ''}`}
                  onClick={() => router.push(`/food/${food.id ?? ''}`)}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white border-amber-200"
              >
                <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
                  <Image
                      src={food.photo || "/placeholder.svg"}
                      alt={food.name ?? ''}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/indonesian-food.jpg"
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-amber-900 mb-2">{food.name}</h3>
                  <p className="text-sm text-amber-700 line-clamp-2 mb-3">{food.description}</p>
                  <div className="flex items-center justify-between text-xs text-amber-600">
                      <span>📍 {food.origin?.province ?? ''}</span>
                      <span className="bg-amber-100 px-2 py-1 rounded-full">{food.origin?.island ?? ''}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-amber-800 text-lg mb-4">Your wishlist is empty</p>
            <Button onClick={() => router.push("/")} className="bg-amber-600 hover:bg-amber-700 text-white">
              Explore Foods
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
