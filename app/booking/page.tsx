"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/components/language-context"
import { t } from "@/lib/i18n"
import { serviceCategories } from "@/lib/data"
import { saveBooking, generateId } from "@/lib/booking-store"
import { getLockedDates } from "@/lib/locked-dates-store"
import { getLockedTimeSlots } from "@/lib/locked-time-slots-store"
import { getTodayGMT1, formatDateGMT1, formatCalendarDateGMT1, isTodayGMT1, isPastGMT1, isTimeSlotPassedGMT1, createDateTimeGMT1, isSundayGMT1 } from "@/lib/timezone"
import type { Service, Booking } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { ChevronDown, ChevronUp, Check, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { sendPushNotification } from "@/lib/push-notification-plugin"

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
]

export default function BookingPage() {
  const { lang } = useLanguage()
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [bookingComplete, setBookingComplete] = useState(false)

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)

  const getServiceName = (service: Service) => {
    if (lang === "vi") return service.nameVi
    if (lang === "de") return service.nameDe
    return service.name
  }

  const getCategoryName = (category: { name: string; nameVi: string; nameDe: string }) => {
    if (lang === "vi") return category.nameVi
    if (lang === "de") return category.nameDe
    return category.name
  }

  const toggleService = (service: Service) => {
    setSelectedServices((prev) =>
      prev.find((s) => s.id === service.id) ? prev.filter((s) => s.id !== service.id) : [...prev, service],
    )
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const [lockedDates, setLockedDates] = useState<string[]>([])
  const [lockedTimeSlots, setLockedTimeSlots] = useState<Set<string>>(new Set())

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      const booking: Booking = {
        id: generateId(),
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        services: selectedServices,
        date: selectedDate ? formatDateGMT1(selectedDate) : "",
        time: selectedTime,
        notes: customerInfo.notes,
        status: "pending",
        createdAt: new Date().toISOString(),
        totalPrice,
        totalDuration,
      }

      const result = await saveBooking(booking)
      if (result) {
        setBookingComplete(true)
        // Refresh locked time slots after successful booking
        if (selectedDate) {
          const dateStr = formatDateGMT1(selectedDate)
          const locked = await getLockedTimeSlots(dateStr)
          const lockedSet = new Set(locked.map(lt => `${lt.date}-${lt.time}`))
          setLockedTimeSlots(lockedSet)
        }
        await sendPushNotification(`🔔 Neue Buchung erhalten!\n${booking.customerName} - ${booking.date} um ${booking.time} Uhr\n€${booking.totalPrice.toFixed(2)}`)
      } else {
        setSubmitError("Failed to save booking. Please try again.")
      }
    } catch (error: any) {
      console.error("Booking submission error:", error)
      let errorMessage = error?.message || error?.toString() || "Failed to save booking. Please try again."

      // Handle specific error messages
      if (errorMessage.includes("Time slot is locked") || errorMessage.includes("currently locked")) {
        errorMessage = t("timeSlotLocked", lang) || "This time slot is currently locked. Please select another time."
      } else if (errorMessage.includes("Date is locked") || errorMessage.includes("not available for this date")) {
        errorMessage = t("dateLocked", lang) || "Booking is not available for this date."
      }

      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to check if a date is today in GMT+1
  const isToday = (date: Date): boolean => {
    return isTodayGMT1(date)
  }

  // Helper function to check if a time slot has passed today in GMT+1
  const isTimeSlotPassed = (time: string): boolean => {
    return isTimeSlotPassedGMT1(time, selectedDate)
  }

  // Load locked time slots when date changes
  useEffect(() => {
    const loadLockedTimeSlots = async () => {
      if (selectedDate) {
        const dateStr = formatDateGMT1(selectedDate)
        const locked = await getLockedTimeSlots(dateStr)
        const lockedSet = new Set(locked.map(lt => `${lt.date}-${lt.time}`))
        setLockedTimeSlots(lockedSet)
      } else {
        setLockedTimeSlots(new Set())
      }
    }
    loadLockedTimeSlots()
  }, [selectedDate])

  // Load locked dates on mount
  useEffect(() => {
    const loadLockedDates = async () => {
      const locked = await getLockedDates()
      setLockedDates(locked.map(ld => ld.date))
    }
    loadLockedDates()
  }, [])

  // Reset selected time when date changes
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    // Reset time if date changes
    if (date) {
      setSelectedTime("")
    }
  }

  const canProceedToStep2 = selectedServices.length > 0
  const canProceedToStep3 = selectedDate && selectedTime
  const canSubmit = customerInfo.name && customerInfo.phone && customerInfo.email

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t("bookingSuccess", lang)}</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{t("bookingSuccessMessage", lang)}</p>
          <Link href="/">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white text-sm sm:text-base">{t("home", lang)}</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-rose-600 mb-4 sm:mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t("back", lang)}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">{t("booking", lang)}</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-4 mb-4 sm:mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base ${step >= s ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
              >
                {s}
              </div>
              <span className={`hidden md:block text-xs sm:text-sm ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                {s === 1 ? t("selectServices", lang) : s === 2 ? t("selectDate", lang) : t("yourInfo", lang)}
              </span>
              {s < 3 && <div className={`w-3 sm:w-4 md:w-8 h-0.5 ${step > s ? "bg-rose-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Step 1: Select Services */}
            {step === 1 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("selectServices", lang)}</h2>
                </div>

                {serviceCategories.map((category) => (
                  <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-bold text-gray-900 uppercase text-xs sm:text-sm tracking-wide text-left pr-2">
                        {getCategoryName(category)}
                      </span>
                      {expandedCategory === category.id ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>

                    {expandedCategory === category.id && (
                      <div className="px-4 sm:px-6 pb-4 space-y-2">
                        {category.services.map((service) => {
                          const isSelected = selectedServices.some((s) => s.id === service.id)
                          return (
                            <label
                              key={service.id}
                              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-rose-50 border border-rose-200" : "bg-gray-50 hover:bg-gray-100"
                                }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                <Checkbox checked={isSelected} onCheckedChange={() => toggleService(service)} />
                                <div className="flex-1">
                                  <p className="font-medium text-sm sm:text-base text-gray-900">{getServiceName(service)}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">
                                    {service.duration} {t("minutes", lang)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-rose-600 text-sm sm:text-base self-end sm:self-auto">
                                {service.priceFrom && (
                                  <span className="text-xs sm:text-sm font-normal mr-1">{t("from", lang)}</span>
                                )}
                                €{service.price}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}

                <div className="p-4 sm:p-6 border-t border-gray-100">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedToStep2}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 text-sm sm:text-base"
                  >
                    {t("selectDate", lang)}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Select Date & Time - Calendar + Time slots in one block */}
            {step === 2 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("selectDate", lang)}</h2>
                </div>

                {/* Single block: calendar + time slots */}
                <div className="p-3 sm:p-4 md:p-5">
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 md:gap-6 items-start">
                    {/* Calendar */}
                    <div className="overflow-x-auto flex justify-center md:justify-start">
                      <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-full min-w-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => {
                            const todayStr = getTodayGMT1()
                            const dateStr = formatCalendarDateGMT1(date)
                            const isPast = dateStr < todayStr
                            const isLocked = lockedDates.includes(dateStr)
                            const isSunday = isSundayGMT1(dateStr)
                            return isPast || isLocked || isSunday
                          }}
                          className="rounded-md border mx-auto w-full"
                        />
                      </div>
                    </div>

                    {/* Time slots - same block, scroll if needed */}
                    <div className="min-w-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 md:min-h-[280px]">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">{t("selectTime", lang)}</h3>
                      {selectedDate ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-1.5 sm:gap-2 max-h-[260px] md:max-h-[240px] overflow-y-auto overflow-x-hidden pr-1">
                          {timeSlots.map((time) => {
                            const isPassed = isTimeSlotPassed(time)
                            const dateStr = selectedDate ? formatDateGMT1(selectedDate) : ""
                            const isLocked = dateStr ? lockedTimeSlots.has(`${dateStr}-${time}`) : false
                            const isDisabled = isPassed || isLocked

                            return (
                              <button
                                key={time}
                                onClick={() => !isDisabled && setSelectedTime(time)}
                                disabled={isDisabled}
                                title={isLocked ? t("timeSlotLocked", lang) || "This time slot is locked" : ""}
                                className={`py-1.5 sm:py-2 px-1.5 sm:px-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-colors ${isDisabled
                                  ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                  : selectedTime === time
                                    ? "bg-rose-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                              >
                                {time}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs sm:text-sm">{t("selectDateFirst", lang) || "Select a date first"}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-2 sm:gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 text-sm sm:text-base">
                    {t("back", lang)}
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedToStep3}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 text-sm sm:text-base"
                  >
                    {t("yourInfo", lang)}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Customer Info */}
            {step === 3 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("yourInfo", lang)}</h2>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base">{t("name", lang)} *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder={t("name", lang)}
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm sm:text-base">{t("phoneNumber", lang)} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder={t("phoneNumber", lang)}
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">{t("emailAddress", lang)} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder={t("emailAddress", lang)}
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm sm:text-base">{t("notes", lang)}</Label>
                    <Textarea
                      id="notes"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                      placeholder={t("notes", lang)}
                      className="mt-1 text-sm sm:text-base"
                      rows={3}
                    />
                  </div>

                  {submitError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-2 sm:gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 text-sm sm:text-base" disabled={isSubmitting}>
                    {t("back", lang)}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isSubmitting ? t("saving", lang) || "Saving..." : t("confirmBooking", lang)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="md:col-span-1 order-first md:order-last">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6 md:sticky md:top-20">
              <h3 className="font-bold text-sm sm:text-base md:text-lg text-gray-900 mb-2 sm:mb-3 md:mb-4">{t("booking", lang)}</h3>

              {selectedServices.length > 0 ? (
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-2 sm:mb-3 md:mb-4 max-h-40 sm:max-h-48 md:max-h-none overflow-y-auto">
                  {selectedServices.map((service) => (
                    <div key={service.id} className="flex justify-between text-[10px] sm:text-xs md:text-sm">
                      <span className="text-gray-600 flex-1 pr-2 break-words">{getServiceName(service)}</span>
                      <span className="font-medium flex-shrink-0">€{service.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4">{t("selectServices", lang)}</p>
              )}

              {selectedDate && (
                <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-600 mb-2">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {formatDateGMT1(selectedDate)} {selectedTime && `- ${selectedTime}`}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-100 pt-2 sm:pt-3 md:pt-4 mt-2 sm:mt-3 md:mt-4">
                <div className="flex justify-between mb-1.5 sm:mb-2 text-[10px] sm:text-xs md:text-sm">
                  <span className="text-gray-600">{t("totalDuration", lang)}</span>
                  <span className="font-medium">
                    {totalDuration} {t("minutes", lang)}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base md:text-lg">
                  <span className="font-bold text-gray-900">{t("totalPrice", lang)}</span>
                  <span className="font-bold text-rose-600">€{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
