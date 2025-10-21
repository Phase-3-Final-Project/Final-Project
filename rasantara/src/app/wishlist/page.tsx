"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RiArrowLeftDoubleFill } from "react-icons/ri";
import { PiBowlFoodFill } from "react-icons/pi";

type Food = {
  id?: string;
  name?: string;
  description?: string;
  photo?: string;
  model3D?: string;
  origin?: { province?: string; island?: string };
};

type WishlistItem = {
  wishlistId?: string;
  food?: Food;
};

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);

  const handleRemoveFromWishlist = async (wishlistId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlistId }),
      });
      
      if (res.ok) {
        // Remove item from local state
        setWishlistItems(prev => prev.filter(item => item.wishlistId !== wishlistId));
      } else {
        const error = await res.json();
        console.error('Failed to remove from wishlist:', error);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  useEffect(() => {
    (async () => {
      // Prefer server-side session check via cookie-backed endpoint
      try {
        const me = await fetch("/api/user/me");
        if (me.ok) {
          const body = await me.json();
          const userData = body.user;
          setUser(userData);

          // fetch enriched wishlist from API
          const res = await fetch(`/api/user`);
          if (res.ok) {
            const body2 = await res.json();
            type Enriched = {
              wishlistId?: string;
              food?: {
                id?: string;
                name?: string;
                photo?: string;
                description?: string;
                origin?: { province?: string; island?: string };
              };
            };
            const items = (body2.wishlist || [])
              .map((w: unknown): Enriched | undefined => {
                if (typeof w === "object" && w !== null && "food" in w)
                  return w as Enriched;
                return undefined;
              })
              .filter(
                (item: Enriched | undefined): item is Enriched =>
                  !!item && !!item.food
              );
            setWishlistItems(items);
          }
          return;
        }
      } catch (err) {
        // fallthrough to localStorage demo fallback below
        console.warn(
          "Server-side session check failed, falling back to client storage",
          err
        );
      }

      // Fallback: demo/local user stored in localStorage (for dev/demo without auth)
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/auth/login");
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);

      try {
        const res = await fetch(`/api/user`);
        if (res.ok) {
          const body = await res.json();
          type Enriched = {
            wishlistId?: string;
            food?: {
              id?: string;
              name?: string;
              photo?: string;
              description?: string;
              origin?: { province?: string; island?: string };
            };
          };
          const items = (body.wishlist || [])
            .map((w: unknown): Enriched | undefined => {
              if (typeof w === "object" && w !== null && "food" in w)
                return w as Enriched;
              return undefined;
            })
            .filter(
              (item: Enriched | undefined): item is Enriched =>
                !!item && !!item.food
            );
          setWishlistItems(items);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-amber-300 text-amber-900 hover:bg-[#E0A106] cursor-pointer rounded-2xl w-fit"
          >
            <RiArrowLeftDoubleFill className="inline-block mr-1" />{" "}
            <span>Back to Explorer</span>
          </Button>
          <h1 className="text-2xl font-bold text-amber-900 text-center md:absolute md:left-1/2 md:-translate-x-1/2">
            <PiBowlFoodFill className="inline-block mr-1" />
            Saved Bites {user?.id ? `- ${user.id}` : ""}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const food = item.food;
              if (!food) return null;

              return (
                <Card
                  key={item.wishlistId || `food-${food.id || food.name}`}
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-amber-200 pt-0 relative group"
                >
                  <div 
                    onClick={() => router.push(`/food/${food.id ?? ""}`)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
                      <Image
                        src={food.photo || "/placeholder.svg"}
                        alt={food.name ?? ""}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null; // Prevent infinite loop
                          target.src = "/indonesian-food.jpg";
                        }}
                      />
                      {/* Remove button overlay */}
                      <button
                        onClick={(e) => handleRemoveFromWishlist(item.wishlistId || '', e)}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-1 opacity-0 group-hover:opacity-100"
                        aria-label="Remove from wishlist"
                      >
                        💔 <span>Un-Save</span>
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-amber-900 mb-2">
                        {food.name}
                      </h3>
                      <p className="text-sm text-amber-700 line-clamp-2 mb-3">
                        {food.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-amber-600">
                        <span>📍 {food.origin?.province ?? ""}</span>
                        <span className="bg-amber-100 px-2 py-1 rounded-full">
                          {food.origin?.island ?? ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-amber-800 text-lg mb-4">
              Your wishlist is empty
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Explore Foods
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
