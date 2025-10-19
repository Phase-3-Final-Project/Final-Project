"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import AIRecommendations from "@/components/AiRecommendation"
// data now comes from the database

export default function FoodDetailPage() {
  const params = useParams()
  const router = useRouter()
  const foodId = params.id as string
  type Food = {
    id: number | string
    name?: string
    description?: string
    photo?: string
    model3D?: string
    origin?: { province?: string; island?: string }
  }

  type User = { id?: string; role?: string }

  const [food, setFood] = useState<Food | null>(null)
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)
  const [user, setUser] = useState<User | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [recommendations, setRecommendations] = useState<Array<Pick<Food, 'id' | 'name' | 'photo' | 'origin'>>>([])
  const [userWishlist, setUserWishlist] = useState<{ id?: string; name?: string }[]>([])

  useEffect(() => {
    ;(async () => {
      // Fetch food from API
      try {
        const res = await fetch(`/api/foods/${params.id}`)
        if (res.ok) {
          const f = await res.json()
          setFood(f)
            // initialize image src (use remote photo if present)
            setImageSrc(f?.photo || "/placeholder.svg")
          // set recommendations from related by island if returned
          if (f?.origin?.island) {
            const relatedRes = await fetch(`/api/foods?island=${encodeURIComponent(f.origin.island)}`)
            if (relatedRes.ok) {
              const related = (await relatedRes.json()) as unknown[]
              const mapped = (related || []).map((r) => {
                const rr = r as Food
                return { id: rr.id, name: rr.name, photo: rr.photo, origin: rr.origin }
              })
              setRecommendations(mapped.filter((r) => r.id !== f.id).slice(0, 3))
            }
          }
        }
      } catch (err) {
        console.error(err)
      }

      // Load user from localStorage and fetch wishlist/history from API if present
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        try {
          const ures = await fetch(`/api/user`)
          if (ures.ok) {
            const body = await ures.json()
            const wishlistFoods = (body.wishlist || []).map((w: { foodId: string; foodName?: string }) => ({ id: w.foodId, name: w.foodName }))
            setUserWishlist(wishlistFoods)
          }
        } catch (err) {
          console.error(err)
        }
      }
    })()
  }, [foodId, params.id])

  const handleWishlistToggle = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    setIsWishlisted(!isWishlisted)
  }

  if (!food) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-amber-50"
          >
            ← Back
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative h-96 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg overflow-hidden">
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={food?.name ?? ""}
                fill
                className="object-cover"
                // bypass Next optimization for problematic remote hosts during dev
                unoptimized
                onError={() => {
                  // when loading fails, fall back to a local image to avoid retry loops
                  setImageSrc("/indonesian-food.jpg")
                }}
              />
            </div>
            <Button
              onClick={handleWishlistToggle}
              className={`w-full ${isWishlisted ? "bg-red-500 hover:bg-red-600" : "bg-amber-600 hover:bg-amber-700"} text-white`}
            >
              {isWishlisted ? "❤️ Remove from Wishlist" : "🤍 Add to Wishlist"}
            </Button>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2">{food?.name}</h1>
              <div className="flex gap-3 text-sm">
                  <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full">📍 {food?.origin?.province}</span>
                  <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full">🏝️ {food?.origin?.island}</span>
              </div>
            </div>

            <Card className="p-6 bg-white border-amber-200">
              <h2 className="font-bold text-amber-900 mb-3">Description</h2>
              <p className="text-amber-800 leading-relaxed">{food?.description}</p>
            </Card>

            <Card className="p-6 bg-white border-amber-200">
              <h2 className="font-bold text-amber-900 mb-3">3D Model</h2>
              <p className="text-sm text-amber-700">3D model viewer would be displayed here: {food?.model3D}</p>
              <div className="mt-4 h-48 bg-gradient-to-br from-amber-100 to-orange-100 rounded flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
            </Card>

            {user && <AIRecommendations foodName={food?.name ?? ''} userHistory={[]} userWishlist={userWishlist} />}
          </div>
        </div>

        {/* AIDescriptionGenerator removed from this page */}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Similar Foods from {food?.origin?.island ?? ''}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  onClick={() => router.push(`/food/${rec.id}`)}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white border-amber-200"
                >
                  <div className="relative h-40 bg-gradient-to-br from-amber-100 to-orange-100">
                    <Image
                      src={rec.photo || "/placeholder.svg"}
                      alt={rec.name ?? ''}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/indonesian-food.jpg"
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-amber-900">{rec.name}</h3>
                    <p className="text-xs text-amber-600 mt-1">📍 {rec.origin?.province ?? ''}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
