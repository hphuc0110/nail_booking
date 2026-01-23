"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/language-context"
import { t } from "@/lib/i18n"
import { getBookings, updateBooking, deleteBooking, getTimeSlotCounts } from "@/lib/booking-store"
import { getLockedDates, addLockedDate, removeLockedDate, type LockedDate } from "@/lib/locked-dates-store"
import { getLockedTimeSlots, addLockedTimeSlot, removeLockedTimeSlot, type LockedTimeSlot } from "@/lib/locked-time-slots-store"
import { getTodayGMT1, formatDateGMT1, isTodayGMT1, isPastGMT1, parseDateGMT1 } from "@/lib/timezone"
import type { Booking } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, Edit, Trash2, Phone, Mail, Calendar as CalendarIcon, Clock, User, ArrowLeft, LogOut, X, Lock, Unlock, Bell, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { sendPushNotification } from "@/lib/push-notification-plugin"
// Push notification plugin is initialized globally in app/layout.tsx

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled"

export default function AdminPage() {
  // Force German language in admin
  const lang: "de" = "de"
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editStatus, setEditStatus] = useState<Booking["status"]>("pending")
  const [lockedDates, setLockedDates] = useState<LockedDate[]>([])
  const [isLockedDatesDialogOpen, setIsLockedDatesDialogOpen] = useState(false)
  const [isAddLockedDateDialogOpen, setIsAddLockedDateDialogOpen] = useState(false)
  const [dateToLock, setDateToLock] = useState<Date | undefined>(undefined)
  const [lockReason, setLockReason] = useState("")
  const [timeSlotCounts, setTimeSlotCounts] = useState<Record<string, Record<string, number>>>({})
  const [lockedTimeSlots, setLockedTimeSlots] = useState<LockedTimeSlot[]>([])
  const [selectedTimeSlotToLock, setSelectedTimeSlotToLock] = useState<{ date: string; time: string } | null>(null)
  const [lastBookingCount, setLastBookingCount] = useState<number>(0)
  const [newBookings, setNewBookings] = useState<Booking[]>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false)
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  useEffect(() => {
    loadBookings()
    loadLockedDates()
    loadLockedTimeSlots()

    // Kiểm tra và yêu cầu quyền thông báo
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
      if (Notification.permission === "default") {
        // Tự động yêu cầu quyền sau 2 giây
        setTimeout(() => {
          Notification.requestPermission().then((permission) => {
            setNotificationPermission(permission)
          })
        }, 2000)
      }
    }
  }, [])

  // Polling để kiểm tra booking mới mỗi 10 giây
  useEffect(() => {
    // Chỉ bắt đầu polling sau khi đã load bookings lần đầu
    if (lastBookingCount === 0) return

    const checkNewBookings = async () => {
      try {
        const data = await getBookings()
        const currentCount = data.length

        // Kiểm tra nếu có booking mới
        if (currentCount > lastBookingCount) {
          // Lấy các booking mới nhất
          const sortedBookings = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          const newBookingsList = sortedBookings.slice(0, currentCount - lastBookingCount)

          // Thêm vào danh sách thông báo
          setNewBookings(prev => [...newBookingsList, ...prev])
          setUnreadNotifications(prev => prev + newBookingsList.length)

          // Hiển thị browser push notification
          if ("Notification" in window && Notification.permission === "granted") {
            newBookingsList.forEach((booking) => {
              new Notification("🔔 Neue Buchung erhalten!", {
                body: `${booking.customerName} - ${booking.date} um ${booking.time} Uhr\n€${booking.totalPrice.toFixed(2)}`,
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                tag: booking.id,
                requireInteraction: false,
              })
            })
          }

          // Hiển thị toast notification
          toast({
            title: "🔔 Neue Buchung erhalten!",
            description: `${newBookingsList.length} neue Buchung${newBookingsList.length > 1 ? 'en' : ''} wurde${newBookingsList.length > 1 ? 'n' : ''} hinzugefügt.`,
          })

          // Tự động reload bookings
          await loadBookings()
          setLastBookingCount(currentCount)
        }
      } catch (error) {
        console.error("Error checking new bookings:", error)
      }
    }

    // Kiểm tra mỗi 10 giây
    const interval = setInterval(checkNewBookings, 10000)

    return () => clearInterval(interval)
  }, [lastBookingCount, toast])

  useEffect(() => {
    // Load time slot counts for all dates with bookings
    const loadTimeSlotCounts = async () => {
      const dates = [...new Set(bookings.map(b => b.date))]
      const counts: Record<string, Record<string, number>> = {}

      for (const date of dates) {
        const dateCounts = await getTimeSlotCounts(date)
        counts[date] = dateCounts
      }

      setTimeSlotCounts(counts)
    }

    if (bookings.length > 0) {
      loadTimeSlotCounts()
    }
  }, [bookings])

  const loadBookings = async () => {
    const data = await getBookings()
    const sortedBookings = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setBookings(sortedBookings)

    // Cập nhật lastBookingCount khi load lần đầu
    if (lastBookingCount === 0) {
      setLastBookingCount(data.length)
    }
  }

  const loadLockedDates = async () => {
    const data = await getLockedDates()
    setLockedDates(data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
  }

  const loadLockedTimeSlots = async () => {
    const data = await getLockedTimeSlots()
    setLockedTimeSlots(data)
  }

  const handleLockTimeSlot = async (date: string, time: string) => {
    const result = await addLockedTimeSlot(date, time, "")
    if (result) {
      await loadLockedTimeSlots()
      await loadBookings() // Reload to refresh counts
    }
  }

  const handleUnlockTimeSlot = async (date: string, time: string) => {
    const result = await removeLockedTimeSlot(date, time)
    if (result) {
      await loadLockedTimeSlots()
      await loadBookings() // Reload to refresh counts
    }
  }

  const isTimeSlotLocked = (date: string, time: string): boolean => {
    return lockedTimeSlots.some(lt => lt.date === date && lt.time === time)
  }

  const getTimeSlotBookingCount = (date: string, time: string): number => {
    return timeSlotCounts[date]?.[time] || 0
  }

  const getServiceName = (service: { name: string; nameVi: string; nameDe: string }) => {
    return service.nameDe
  }

  const handleAddLockedDate = async () => {
    if (!dateToLock) return

    const dateStr = format(dateToLock, "yyyy-MM-dd")
    const result = await addLockedDate(dateStr, lockReason)
    if (result) {
      await loadLockedDates()
      setIsAddLockedDateDialogOpen(false)
      setDateToLock(undefined)
      setLockReason("")
    }
  }

  const handleRemoveLockedDate = async (date: string) => {
    const result = await removeLockedDate(date)
    if (result) {
      await loadLockedDates()
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone.includes(searchQuery) ||
      booking.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    // Filter by date if selected
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
      if (booking.date !== selectedDateStr) {
        return false
      }
    }

    return matchesSearch && matchesStatus
  })

  // Group bookings by date
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const date = booking.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(booking)
    return acc
  }, {} as Record<string, Booking[]>)

  // Sort dates
  const sortedDates = Object.keys(bookingsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const formatDateDisplay = (dateStr: string) => {
    // Parse date string as GMT+1 date
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))

    const todayStr = getTodayGMT1()
    const today = parseDateGMT1(todayStr)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = formatDateGMT1(tomorrow)

    if (dateStr === todayStr) {
      return `${t("today", lang)} - ${format(date, "dd.MM.yyyy")}`
    } else if (dateStr === tomorrowStr) {
      return `${t("tomorrow", lang) || "Morgen"} - ${format(date, "dd.MM.yyyy")}`
    }
    return format(date, "dd.MM.yyyy")
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsViewDialogOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditStatus(booking.status)
    setIsEditDialogOpen(true)
  }

  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDeleteDialogOpen(true)
  }

  const confirmUpdateStatus = async () => {
    if (selectedBooking) {
      await updateBooking(selectedBooking.id, { status: editStatus })
      await loadBookings()
      setIsEditDialogOpen(false)
    }
  }

  const confirmDelete = async () => {
    if (selectedBooking) {
      try {
        const success = await deleteBooking(selectedBooking.id)
        if (success) {
          await loadBookings()
          setIsDeleteDialogOpen(false)
        } else {
          alert(t("deleteBookingFailed", lang) || 'Fehler beim Löschen der Buchung. Bitte versuchen Sie es erneut.')
        }
      } catch (error: any) {
        console.error('Error in confirmDelete:', error)
        alert(t("deleteBookingFailed", lang) || `Fehler beim Löschen der Buchung: ${error?.message || 'Unbekannter Fehler'}`)
      }
    }
  }

  const getStatusBadge = (status: Booking["status"]) => {
    const statusConfig = {
      pending: { label: t("pending", lang), className: "bg-yellow-100 text-yellow-800" },
      confirmed: { label: t("confirmed", lang), className: "bg-blue-100 text-blue-800" },
      completed: { label: t("completed", lang), className: "bg-green-100 text-green-800" },
      cancelled: { label: t("cancelled", lang), className: "bg-red-100 text-red-800" },
    }
    const config = statusConfig[status]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }

  const handleSendTestNotification = async () => {
    await sendPushNotification("Test notification")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/" className="text-gray-600 hover:text-rose-600 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <h1 onClick={handleSendTestNotification} className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{t("adminPanel", lang)}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Notification Bell */}
              <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-h-[80vh] overflow-y-auto">
                  <div className="p-2 sm:p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm sm:text-base">Benachrichtigungen</h3>
                      {unreadNotifications > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 sm:h-7 text-xs"
                          onClick={() => {
                            setUnreadNotifications(0)
                            setNewBookings([])
                          }}
                        >
                          Alle markieren
                        </Button>
                      )}
                    </div>
                  </div>
                  {newBookings.length === 0 ? (
                    <div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
                      Keine neuen Benachrichtigungen
                    </div>
                  ) : (
                    <div className="divide-y">
                      {newBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer active:bg-gray-100 transition-colors"
                          onClick={() => {
                            handleViewDetails(booking)
                            setIsNotificationOpen(false)
                          }}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                Neue Buchung: {booking.customerName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {booking.date} um {booking.time} Uhr
                              </p>
                              <p className="text-xs text-gray-500">
                                €{booking.totalPrice.toFixed(2)} • {booking.services.length} Service{booking.services.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Action Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (!selectedDate) {
                      const today = parseDateGMT1(getTodayGMT1())
                      setSelectedDate(today)
                    }
                    setTimeout(() => {
                      const element = document.querySelector('[data-time-slot-section]')
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }, 100)
                  }}
                  variant="outline"
                  className="text-gray-700 hover:text-rose-600 hover:border-rose-600 text-xs"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {t("manageTimeSlots", lang) || "Zeitslots"}
                </Button>
                <Button
                  onClick={() => setIsLockedDatesDialogOpen(true)}
                  variant="outline"
                  className="text-gray-700 hover:text-rose-600 hover:border-rose-600 text-xs"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {t("manageLockedDates", lang)}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-gray-700 hover:text-rose-600 hover:border-rose-600 text-xs"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("logout", lang)}
                </Button>
              </div>
              {/* Mobile Menu Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => {
                      if (!selectedDate) {
                        const today = parseDateGMT1(getTodayGMT1())
                        setSelectedDate(today)
                      }
                      setTimeout(() => {
                        const element = document.querySelector('[data-time-slot-section]')
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      }, 100)
                    }}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {t("manageTimeSlots", lang) || "Zeitslots"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsLockedDatesDialogOpen(true)}>
                    <Lock className="w-4 h-4 mr-2" />
                    {t("manageLockedDates", lang)}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout", lang)}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-8">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-2 sm:p-4 rounded-lg sm:rounded-xl text-left transition-all ${statusFilter === status ? "bg-rose-500 text-white shadow-lg" : "bg-white text-gray-900 hover:shadow-md"
                }`}
            >
              <p className="text-lg sm:text-2xl font-bold">{statusCounts[status]}</p>
              <p className={`text-xs sm:text-sm ${statusFilter === status ? "text-rose-100" : "text-gray-500"}`}>
                {status === "all"
                  ? t("allBookings", lang)
                  : t(status as keyof typeof import("@/lib/i18n").translations.en, lang)}
              </p>
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Input
                  placeholder={t("search", lang)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm sm:text-base"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base">
                  <SelectValue placeholder={t("filter", lang)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allBookings", lang)}</SelectItem>
                  <SelectItem value="pending">{t("pending", lang)}</SelectItem>
                  <SelectItem value="confirmed">{t("confirmed", lang)}</SelectItem>
                  <SelectItem value="completed">{t("completed", lang)}</SelectItem>
                  <SelectItem value="cancelled">{t("cancelled", lang)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">{t("filterByDate", lang)}:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`flex-1 sm:flex-none sm:w-[200px] md:w-[280px] justify-start text-left font-normal text-xs sm:text-sm ${!selectedDate && "text-muted-foreground"
                        }`}
                    >
                      <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {selectedDate ? format(selectedDate, "dd.MM.yyyy") : t("allDates", lang)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedDate(undefined)}
                    className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
              {selectedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = parseDateGMT1(getTodayGMT1())
                    setSelectedDate(today)
                  }}
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  {t("today", lang)}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Time Slot Management Section */}
        {selectedDate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6" data-time-slot-section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {t("timeSlotManagement", lang) || "Zeitslot-Verwaltung"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateGMT1(selectedDate)} - {t("viewBookingCounts", lang) || "Buchungsanzahl anzeigen"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"].map((time) => {
                const dateStr = formatDateGMT1(selectedDate)
                const bookingCount = getTimeSlotBookingCount(dateStr, time)
                const isLocked = isTimeSlotLocked(dateStr, time)

                return (
                  <div
                    key={time}
                    className={`p-3 rounded-lg border-2 transition-all min-w-0 ${isLocked
                      ? "bg-red-50 border-red-300"
                      : bookingCount > 0
                        ? "bg-amber-50 border-amber-300"
                        : "bg-gray-50 border-gray-200"
                      }`}
                  >
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 truncate">{time}</p>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <span className={`text-xl sm:text-2xl font-bold ${isLocked
                          ? "text-red-600"
                          : bookingCount > 0
                            ? "text-amber-600"
                            : "text-gray-400"
                          }`}>
                          {bookingCount}
                        </span>
                        {isLocked && (
                          <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="w-full">
                        {isLocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-[10px] sm:text-xs h-7 sm:h-8 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 px-1 sm:px-2"
                            onClick={() => handleUnlockTimeSlot(dateStr, time)}
                          >
                            <Unlock className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{t("unlock", lang) || "Entsperren"}</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className={`w-full text-[10px] sm:text-xs h-7 sm:h-8 px-1 sm:px-2 ${bookingCount > 0
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-gray-500 hover:bg-gray-600 text-white"
                              }`}
                            onClick={() => handleLockTimeSlot(dateStr, time)}
                          >
                            <Lock className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{t("lock", lang) || "Sperren"}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm border-t pt-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-50 border-2 border-gray-200 rounded flex-shrink-0"></div>
                <span className="text-gray-600 whitespace-nowrap">{t("available", lang) || "Verfügbar"}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-50 border-2 border-amber-300 rounded flex-shrink-0"></div>
                <span className="text-gray-600 whitespace-nowrap">{t("hasBookings", lang) || "Hat Buchungen"}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-50 border-2 border-red-300 rounded flex-shrink-0"></div>
                <span className="text-gray-600 whitespace-nowrap">{t("locked", lang) || "Gesperrt"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bookings by Date */}
        <div className="space-y-4 sm:space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
              <p className="text-gray-500 text-sm sm:text-base">{t("noBookings", lang)}</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">
                    {formatDateDisplay(date)}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {bookingsByDate[date].length} {t("allBookings", lang).toLowerCase()}
                  </p>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t("customer", lang)}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t("service", lang)}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t("dateTime", lang)}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t("totalPrice", lang)}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">{t("status", lang)}</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">{t("actions", lang)}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookingsByDate[date]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{booking.customerName}</p>
                                <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-gray-900">
                                {booking.services
                                  .map((s) => getServiceName(s))
                                  .slice(0, 2)
                                  .join(", ")}
                                {booking.services.length > 2 && ` +${booking.services.length - 2}`}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <CalendarIcon className="w-4 h-4" />
                                {booking.date}
                              </div>
                              <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{booking.time}</span>
                                {getTimeSlotBookingCount(booking.date, booking.time) > 0 && (
                                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                                    {getTimeSlotBookingCount(booking.date, booking.time)} {t("bookings", lang)}
                                  </Badge>
                                )}
                                {isTimeSlotLocked(booking.date, booking.time) && (
                                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                                    <Lock className="w-3 h-3 mr-1" />
                                    {t("locked", lang) || "Gesperrt"}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="font-bold text-rose-600">€{booking.totalPrice}</span>
                            </td>
                            <td className="px-4 py-4">{getStatusBadge(booking.status)}</td>
                            <td className="px-4 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    {t("viewDetails", lang)}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    {t("updateStatus", lang)}
                                  </DropdownMenuItem>
                                  {isTimeSlotLocked(booking.date, booking.time) ? (
                                    <DropdownMenuItem onClick={() => handleUnlockTimeSlot(booking.date, booking.time)}>
                                      <Unlock className="w-4 h-4 mr-2" />
                                      {t("unlockTimeSlot", lang) || "Zeitslot entsperren"}
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleLockTimeSlot(booking.date, booking.time)}>
                                      <Lock className="w-4 h-4 mr-2" />
                                      {t("lockTimeSlot", lang) || "Zeitslot sperren"}
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem asChild>
                                    <a href={`tel:${booking.customerPhone}`}>
                                      <Phone className="w-4 h-4 mr-2" />
                                      {t("contactCustomer", lang)}
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a href={`mailto:${booking.customerEmail}`}>
                                      <Mail className="w-4 h-4 mr-2" />
                                      {t("email", lang)}
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteBooking(booking)} className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t("deleteBooking", lang)}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {bookingsByDate[date]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((booking) => (
                      <div key={booking.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm mb-1">{booking.customerName}</p>
                            <p className="text-xs text-gray-500 mb-2">{booking.customerPhone}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                              <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                              <span>{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{booking.time}</span>
                              {getTimeSlotBookingCount(booking.date, booking.time) > 0 && (
                                <Badge variant="outline" className="ml-1 bg-amber-50 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">
                                  {getTimeSlotBookingCount(booking.date, booking.time)}
                                </Badge>
                              )}
                              {isTimeSlotLocked(booking.date, booking.time) && (
                                <Badge variant="outline" className="ml-1 bg-red-50 text-red-700 border-red-200 text-[10px] px-1.5 py-0">
                                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {booking.services
                                .map((s) => getServiceName(s))
                                .slice(0, 2)
                                .join(", ")}
                              {booking.services.length > 2 && ` +${booking.services.length - 2}`}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-rose-600 text-sm">€{booking.totalPrice}</span>
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                                <Eye className="w-4 h-4 mr-2" />
                                {t("viewDetails", lang)}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t("updateStatus", lang)}
                              </DropdownMenuItem>
                              {isTimeSlotLocked(booking.date, booking.time) ? (
                                <DropdownMenuItem onClick={() => handleUnlockTimeSlot(booking.date, booking.time)}>
                                  <Unlock className="w-4 h-4 mr-2" />
                                  {t("unlockTimeSlot", lang) || "Entsperren"}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleLockTimeSlot(booking.date, booking.time)}>
                                  <Lock className="w-4 h-4 mr-2" />
                                  {t("lockTimeSlot", lang) || "Sperren"}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <a href={`tel:${booking.customerPhone}`} className="flex items-center">
                                  <Phone className="w-4 h-4 mr-2" />
                                  {t("contactCustomer", lang)}
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`mailto:${booking.customerEmail}`} className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {t("email", lang)}
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteBooking(booking)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t("deleteBooking", lang)}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("bookingDetails", lang)}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{selectedBooking.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.customerEmail}</p>
                  <p className="text-sm text-gray-500">{selectedBooking.customerPhone}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium mb-2">{t("services", lang)}</p>
                {selectedBooking.services.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm py-1">
                    <span>{getServiceName(service)}</span>
                    <span>€{service.price}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>{t("totalPrice", lang)}</span>
                  <span className="text-rose-600">€{selectedBooking.totalPrice}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{selectedBooking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{selectedBooking.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600">{t("status", lang)}:</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {selectedBooking.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">{t("notes", lang)}</p>
                  <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href={`tel:${selectedBooking?.customerPhone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  {t("phone", lang)}
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <a href={`mailto:${selectedBooking?.customerEmail}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  {t("email", lang)}
                </a>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("updateStatus", lang)}</DialogTitle>
            <DialogDescription>
              {selectedBooking?.customerName} - {selectedBooking?.date} {selectedBooking?.time}
            </DialogDescription>
          </DialogHeader>
          <Select value={editStatus} onValueChange={(value) => setEditStatus(value as Booking["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t("pending", lang)}</SelectItem>
              <SelectItem value="confirmed">{t("confirmed", lang)}</SelectItem>
              <SelectItem value="completed">{t("completed", lang)}</SelectItem>
              <SelectItem value="cancelled">{t("cancelled", lang)}</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel", lang)}
            </Button>
            <Button onClick={confirmUpdateStatus} className="bg-rose-500 hover:bg-rose-600 text-white">
              {t("save", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteBooking", lang)}</DialogTitle>
            <DialogDescription>{t("confirmDelete", lang)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("cancel", lang)}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("deleteBooking", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Locked Dates Management Dialog */}
      <Dialog open={isLockedDatesDialogOpen} onOpenChange={setIsLockedDatesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("manageLockedDates", lang)}</DialogTitle>
            <DialogDescription>
              {t("lockedDates", lang)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsAddLockedDateDialogOpen(true)} className="bg-rose-500 hover:bg-rose-600 text-white">
                <Lock className="w-4 h-4 mr-2" />
                {t("addLockedDate", lang)}
              </Button>
            </div>
            {lockedDates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t("noLockedDates", lang)}
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {lockedDates.map((lockedDate) => (
                  <div key={lockedDate.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {(() => {
                          const [year, month, day] = lockedDate.date.split('-').map(Number)
                          const date = new Date(Date.UTC(year, month - 1, day))
                          return format(date, "dd.MM.yyyy")
                        })()}
                      </p>
                      {lockedDate.reason && (
                        <p className="text-sm text-gray-500">{lockedDate.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLockedDate(lockedDate.date)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Unlock className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLockedDatesDialogOpen(false)}>
              {t("cancel", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Locked Date Dialog */}
      <Dialog open={isAddLockedDateDialogOpen} onOpenChange={setIsAddLockedDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addLockedDate", lang)}</DialogTitle>
            <DialogDescription>
              {t("selectDateToLock", lang)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("selectDate", lang)}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!dateToLock && "text-muted-foreground"
                      }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateToLock ? format(dateToLock, "dd.MM.yyyy") : t("selectDate", lang)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateToLock}
                    onSelect={setDateToLock}
                    disabled={(date) => {
                      // Disable past dates in GMT+1
                      return isPastGMT1(date)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>{t("reason", lang)} ({t("cancel", lang)})</Label>
              <Textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder={t("reason", lang)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddLockedDateDialogOpen(false)
              setDateToLock(undefined)
              setLockReason("")
            }}>
              {t("cancel", lang)}
            </Button>
            <Button onClick={handleAddLockedDate} className="bg-rose-500 hover:bg-rose-600 text-white" disabled={!dateToLock}>
              {t("lockDate", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
