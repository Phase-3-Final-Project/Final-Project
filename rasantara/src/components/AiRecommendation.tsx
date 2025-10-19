"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/Card"
import { Button } from "@/components/Button"

interface HistoryItem { name?: string; id?: number | string }

interface AIRecommendationsProps {
  foodName: string
  userHistory: HistoryItem[]
  userWishlist: HistoryItem[]
}

export default function AIRecommendations({ foodName, userHistory, userWishlist }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<{ name: string; reason: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Refresh handler used by button
  const handleRefresh = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName,
          userHistory,
          userWishlist,
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch recommendations")
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      setError("Could not generate AI recommendations")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [foodName, userHistory, userWishlist])

  useEffect(() => {
    if (userHistory.length > 0 || userWishlist.length > 0) {
      (async () => {
        await handleRefresh()
      })()
    }
  }, [handleRefresh, userHistory.length, userWishlist.length])

  if (!userHistory.length && !userWishlist.length) {
    return null
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-amber-900 flex items-center gap-2">
          <span>✨</span> AI-Powered Recommendations
        </h3>
        <Button
          onClick={handleRefresh}
          disabled={loading}
          variant="outline"
          className="border-amber-300 text-amber-900 hover:bg-amber-50 text-sm bg-transparent"
        >
          {loading ? "Generating..." : "Refresh"}
        </Button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-amber-700 text-sm">Analyzing your preferences...</p>
      ) : recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="bg-white p-3 rounded border border-amber-100">
              <p className="font-medium text-amber-900">{rec.name}</p>
              <p className="text-sm text-amber-700 mt-1">{rec.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-amber-700 text-sm">No recommendations available yet</p>
      )}
    </Card>
  )
}
