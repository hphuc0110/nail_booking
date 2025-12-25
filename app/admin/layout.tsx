"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import type React from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === "/admin/login") {
      setIsChecking(false)
      return
    }

    // Check authentication for admin pages
    if (!isAuthenticated()) {
      router.push("/admin/login")
    } else {
      setIsChecking(false)
    }
  }, [router, pathname])

  // Show loading state while checking authentication
  if (isChecking && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
