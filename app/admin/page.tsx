"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/language-context"
import { t } from "@/lib/i18n"
import { getBookings, updateBooking, deleteBooking } from "@/lib/booking-store"
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
import { Search, MoreVertical, Eye, Edit, Trash2, Phone, Mail, Calendar as CalendarIcon, Clock, User, ArrowLeft, LogOut, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled"

export default function AdminPage() {
  const { lang } = useLanguage()
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

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = () => {
    const data = getBookings()
    setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
  }

  const getServiceName = (service: { name: string; nameVi: string; nameDe: string }) => {
    if (lang === "vi") return service.nameVi
    if (lang === "de") return service.nameDe
    return service.name
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
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dateOnly = format(date, "yyyy-MM-dd")
    const todayOnly = format(today, "yyyy-MM-dd")
    const tomorrowOnly = format(tomorrow, "yyyy-MM-dd")
    
    if (dateOnly === todayOnly) {
      return `${t("today", lang)} - ${format(date, "EEEE, MMMM d, yyyy")}`
    } else if (dateOnly === tomorrowOnly) {
      return `Tomorrow - ${format(date, "EEEE, MMMM d, yyyy")}`
    }
    return format(date, "EEEE, MMMM d, yyyy")
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

  const confirmUpdateStatus = () => {
    if (selectedBooking) {
      updateBooking(selectedBooking.id, { status: editStatus })
      loadBookings()
      setIsEditDialogOpen(false)
    }
  }

  const confirmDelete = () => {
    if (selectedBooking) {
      deleteBooking(selectedBooking.id)
      loadBookings()
      setIsDeleteDialogOpen(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-rose-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t("adminPanel", lang)}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-xl font-serif font-bold text-rose-600">AMICI NAILS SALON</span>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-gray-700 hover:text-rose-600 hover:border-rose-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t("logout", lang)}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`p-4 rounded-xl text-left transition-all ${
                statusFilter === status ? "bg-rose-500 text-white shadow-lg" : "bg-white text-gray-900 hover:shadow-md"
              }`}
            >
              <p className="text-2xl font-bold">{statusCounts[status]}</p>
              <p className={`text-sm ${statusFilter === status ? "text-rose-100" : "text-gray-500"}`}>
                {status === "all"
                  ? t("allBookings", lang)
                  : t(status as keyof typeof import("@/lib/i18n").translations.en, lang)}
              </p>
            </button>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={t("search", lang)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-full md:w-48">
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
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">{t("filterByDate", lang)}:</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full md:w-[280px] justify-start text-left font-normal ${
                        !selectedDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : t("allDates", lang)}
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
                    className="h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="text-sm"
                >
                  {t("today", lang)}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bookings by Date */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">{t("noBookings", lang)}</p>
            </div>
          ) : (
            sortedDates.map((date) => (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900">
                    {formatDateDisplay(date)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {bookingsByDate[date].length} {t("allBookings", lang).toLowerCase()}
                  </p>
                </div>
                <div className="overflow-x-auto">
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
                                {booking.time}
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
    </div>
  )
}
