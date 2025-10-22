"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { GiChickenOven } from "react-icons/gi";
import { ImLocation2 } from "react-icons/im";
import { GiIsland } from "react-icons/gi";
import { FaUtensils } from "react-icons/fa";
import AIRecommendations from "@/components/AiRecommendation"
import View3DModal from "@/components/View3DModal"
import { isValid3DModelUrl } from "@/helpers/validate3DModel"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export default function FoodDetailPage() {
  const params = useParams()
  const router = useRouter()
  const foodId = params.id as string
  type Food = {
    _id: number | string
    name?: string
    description?: string
    photo?: string
    model3D?: string
    origin?: { province?: string; island?: string; city_or_region?: string }
    category?: string
    course?: string
  }

  type User = { id?: string; role?: string }

  const [food, setFood] = useState<Food | null>(null)
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined)
  const [user, setUser] = useState<User | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [currentWishlistId, setCurrentWishlistId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Array<Pick<Food, '_id' | 'name' | 'photo' | 'origin'>>>([])
  const [userWishlist, setUserWishlist] = useState<{ id?: string; name?: string }[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [showNoModelNotification, setShowNoModelNotification] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const [modelError, setModelError] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      // Fetch food from API
      try {
        const res = await fetch(`/api/foods/${foodId}`)
        if (res.ok) {
          const f = await res.json()
          setFood(f)
            // initialize image src (use remote photo if present)
            setImageSrc(f?.photo || "/placeholder.svg")
          // set recommendations from related to island if returned
          if (f?.origin?.island) {
            const relatedRes = await fetch(`/api/foods?island=${encodeURIComponent(f.origin.island)}`)
            if (relatedRes.ok) {
              const related = (await relatedRes.json()) as unknown[]
              const mapped = (related || []).map((r) => {
                const rr = r as Food
                return { _id: rr._id, name: rr.name, photo: rr.photo, origin: rr.origin }
              })
              setRecommendations(mapped.filter((r) => r._id !== f._id).slice(0, 3))
            }
          }
        }
      } catch (err) {
        console.error(err)
      }

      // Load user from session (cookie-based) or localStorage
      try {
        const me = await fetch('/api/user/me')
        if (me.ok) {
          const body = await me.json()
          const userData = body.user
          setUser(userData)

          // Fetch wishlist
          const ures = await fetch(`/api/user`)
          if (ures.ok) {
            const body2 = await ures.json()
            type WishlistItem = { wishlistId?: string; food?: { id?: string; _id?: string; name?: string } }
            const wishlistItems = (body2.wishlist || []) as WishlistItem[]
            const wishlistFoods = wishlistItems.map((w) => ({ id: w.food?.id || w.food?._id, name: w.food?.name }))
            setUserWishlist(wishlistFoods)
            
            // Check if current food is in wishlist
            const currentFoodInWishlist = wishlistItems.find((w) => {
              const wFoodId = w.food?.id || w.food?._id
              return wFoodId && String(wFoodId) === String(foodId)
            })
            if (currentFoodInWishlist) {
              setIsWishlisted(true)
              setCurrentWishlistId(currentFoodInWishlist.wishlistId || null)
            }
          }
          return
        }
      } catch (err) {
        console.warn('Server-side session check failed, falling back to localStorage', err)
      }

      // Fallback: Load user from localStorage
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        try {
          const ures = await fetch(`/api/user`)
          if (ures.ok) {
            const body = await ures.json()
            type WishlistItem = { wishlistId?: string; food?: { id?: string; _id?: string; name?: string } }
            const wishlistItems = (body.wishlist || []) as WishlistItem[]
            const wishlistFoods = wishlistItems.map((w) => ({ id: w.food?.id || w.food?._id, name: w.food?.name }))
            setUserWishlist(wishlistFoods)
            
            // Check if current food is in wishlist
            const currentFoodInWishlist = wishlistItems.find((w) => {
              const wFoodId = w.food?.id || w.food?._id
              return wFoodId && String(wFoodId) === String(foodId)
            })
            if (currentFoodInWishlist) {
              setIsWishlisted(true)
              setCurrentWishlistId(currentFoodInWishlist.wishlistId || null)
            }
          }
        } catch (err) {
          console.error(err)
        }
      }
    })()
  }, [foodId, params.id])

  // Load 3D model preview in card
  useEffect(() => {
    if (!mountRef.current || !food?.model3D || !isValid3DModelUrl(food.model3D)) return

    setModelLoading(true)
    setModelError(false)

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = null

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 3

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    })
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    )
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountRef.current.appendChild(renderer.domElement)

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(3, 3, 3)
    scene.add(directionalLight)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-3, -3, -3)
    scene.add(directionalLight2)

    // Controls - disabled for card preview (only auto-rotate)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = false
    controls.enableRotate = false
    controls.enablePan = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.5

    // Load model
    const loader = new GLTFLoader()
    const proxyUrl = `/api/proxy-model?url=${encodeURIComponent(food.model3D)}`
    
    loader.load(
      proxyUrl,
      (gltf) => {
        const model = gltf.scene

        // Center and scale model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2.5 / maxDim
        model.scale.multiplyScalar(scale)

        model.position.sub(center.multiplyScalar(scale))

        scene.add(model)
        setModelLoading(false)
      },
      undefined,
      (error) => {
        console.error("Error loading 3D model preview:", error)
        setModelError(true)
        setModelLoading(false)
      }
    )

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        try {
          mountRef.current.removeChild(renderer.domElement)
        } catch (e) {
          console.warn("Renderer already removed")
        }
      }
      
      renderer.dispose()
      controls.dispose()
      
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (object.material instanceof THREE.Material) {
            object.material.dispose()
          }
        }
      })
      scene.clear()
    }
  }, [food])

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    try {
      if (isWishlisted && currentWishlistId) {
        // Remove from wishlist
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wishlistId: currentWishlistId }),
        })
        if (res.ok) {
          setIsWishlisted(false)
          setCurrentWishlistId(null)
          console.log('Removed from wishlist successfully');
        } else {
          const error = await res.json();
          console.error('Failed to remove from wishlist:', error);
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foodId: String(food?._id) }),
        })
        if (res.ok) {
          const result = await res.json();
          console.log('Added to wishlist:', result);
          setIsWishlisted(true)
          
          // Fetch updated wishlist to get the new wishlistId
          const ures = await fetch(`/api/user`)
          if (ures.ok) {
            const body = await ures.json()
            type WishlistItem = { wishlistId?: string; food?: { id?: string; _id?: string; name?: string } }
            const wishlistItems = (body.wishlist || []) as WishlistItem[]
            
            // Find the wishlist item for this food
            const currentFoodInWishlist = wishlistItems.find((w) => {
              const wFoodId = w.food?.id || w.food?._id
              return wFoodId && String(wFoodId) === String(foodId)
            })
            
            if (currentFoodInWishlist && currentFoodInWishlist.wishlistId) {
              setCurrentWishlistId(currentFoodInWishlist.wishlistId)
              console.log('Set wishlistId:', currentFoodInWishlist.wishlistId);
            }
          }
        } else {
          const error = await res.json();
          console.error('Failed to add to wishlist:', error);
        }
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err)
    }
  }

  const handleView3D = () => {
    if (!food?.model3D || !isValid3DModelUrl(food.model3D)) {
      setShowNoModelNotification(true)
      setTimeout(() => setShowNoModelNotification(false), 3000)
      return
    }
    setModalOpen(true)
  }

  if (!food) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const hasValid3DModel = isValid3DModelUrl(food?.model3D)

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
              <h1 className="text-4xl font-bold text-amber-900 mb-4">{food?.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full text-sm font-medium">
                  <ImLocation2 />
                  {[food?.origin?.city_or_region, food?.origin?.province].filter(Boolean).join(', ')}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-900 px-3 py-1.5 rounded-full text-sm font-medium">
                  <GiIsland />
                  {food?.origin?.island}
                </span>
                {food?.category && (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-900 px-3 py-1.5 rounded-full text-sm font-medium">
                    <FaUtensils />
                    {food.category}
                  </span>
                )}
                {food?.course && (
                  <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-900 px-3 py-1.5 rounded-full text-sm font-medium">
                    <GiChickenOven className="w-4 h-4" />
                    {food.course}
                  </span>
                )}
              </div>
            </div>

            <Card className="p-6 bg-white border-amber-200">
              <h2 className="font-bold text-amber-900 mb-3">Description</h2>
              <p className="text-amber-800 leading-relaxed">{food?.description}</p>
            </Card>

            <Card 
              className={`p-6 bg-white border-amber-200 ${hasValid3DModel ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
              onClick={hasValid3DModel ? handleView3D : undefined}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-amber-900">3D Model</h2>
                {hasValid3DModel ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    ✓ Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                    ✗ Not Available
                  </span>
                )}
              </div>
              <p className="text-sm text-amber-700 mb-3">
                {hasValid3DModel 
                  ? "Click to view 3D model in full screen" 
                  : "3D model not available for this food"}
              </p>
              <div className="relative mt-4 h-64 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg overflow-hidden">
                {hasValid3DModel ? (
                  <>
                    {/* 3D Model Container - pointer-events-none to prevent interaction */}
                    <div ref={mountRef} className="w-full h-full pointer-events-none" />
                    
                    {/* Loading Overlay */}
                    {modelLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-700 mx-auto mb-3"></div>
                          <p className="text-sm text-amber-800 font-medium">Loading 3D Model...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Error State */}
                    {modelError && !modelLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                        <div className="text-center px-4">
                          <span className="text-4xl mb-2 block">⚠️</span>
                          <p className="text-sm text-amber-800 font-medium">Failed to load 3D model</p>
                          <p className="text-xs text-amber-600 mt-1">Click to try fullscreen view</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Click Hint Overlay - Only show when model is loaded */}
                    {!modelLoading && !modelError && (
                      <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors flex items-center justify-center group">
                        <div className="absolute bottom-3 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm group-hover:bg-black/90 transition-all group-hover:scale-105">
                          🖱️ Click for fullscreen view
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-center">
                      <span className="text-6xl mb-3 block opacity-40">📦</span>
                      <p className="text-sm text-amber-700 font-medium">Didn't have 3D model yet</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* {user && <AIRecommendations foodName={food?.name ?? ''} userHistory={[]} userWishlist={userWishlist} />} */}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Similar Foods from {food?.origin?.island ?? ''}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => (
                <Card
                  key={rec._id}
                  onClick={() => router.push(`/food/${rec._id}`)}
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

      {/* 3D Modal */}
      {food && hasValid3DModel && (
        <View3DModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          modelUrl={food.model3D || ""}
          foodName={food.name || ""}
        />
      )}

      {/* No Model Notification */}
      {showNoModelNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold">3D Model Not Available</p>
              <p className="text-sm">This food doesn't have a 3D model yet.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
