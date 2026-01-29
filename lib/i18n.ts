export type Language = "en" | "vi" | "de"

export const translations = {
  en: {
    // Header & Navigation
    home: "Home",
    services: "Services",
    booking: "Booking",
    gallery: "Gallery",
    contact: "Contact",
    admin: "Admin",

    // Hero Section
    heroTitle: "AMICI NAILS SALON",
    heroSubtitle:
      "We are proud to offer you high-quality manicure and pedicure, acrylic and gel nails, nail design and much more.",
    ourServices: "OUR SERVICES",
    bookNow: "Book Appointment",

    // Services
    manicure: "Manicure",
    pedicure: "Pedicure",
    acrylNails: "Acryl Nails",
    gelNails: "Gel Nails",
    nailDesign: "Nail Design",
    shellac: "Shellac",

    // Business Hours
    businessHours: "Business Hours",
    closed: "Closed",
    openingTime: "Opening time",

    // Contact
    contactUs: "Contact Us",
    address: "Address",
    phone: "Phone",
    email: "Email",

    // Booking Form
    selectServices: "Select Services",
    selectDate: "Select Date",
    selectDateFirst: "Select a date first",
    selectTime: "Select Time",
    yourInfo: "Your Information",
    name: "Name",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    notes: "Notes (Optional)",
    totalPrice: "Total Price",
    totalDuration: "Total Duration",
    minutes: "minutes",
    confirmBooking: "Confirm Booking",
    bookingSuccess: "Booking Successful!",
    bookingSuccessMessage: "We will contact you shortly to confirm your appointment.",
    from: "from",

    // Admin
    adminPanel: "Admin Panel",
    bookingList: "Booking List",
    allBookings: "All Bookings",
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    viewDetails: "View Details",
    editBooking: "Edit Booking",
    deleteBooking: "Delete Booking",
    updateStatus: "Update Status",
    contactCustomer: "Contact Customer",
    bookingDetails: "Booking Details",
    customer: "Customer",
    service: "Service",
    dateTime: "Date & Time",
    status: "Status",
    actions: "Actions",
    noBookings: "No bookings found",
    confirmDelete: "Are you sure you want to delete this booking?",
    cancel: "Cancel",
    save: "Save",
    back: "Back",
    search: "Search",
    filter: "Filter",
    filterByDate: "Filter by Date",
    allDates: "All Dates",
    today: "Today",
    bookingsByDate: "Bookings by Date",
    noBookingsForDate: "No bookings for this date",

    // Login
    login: "Login",
    logout: "Logout",
    username: "Username",
    password: "Password",
    loginButton: "Login",
    loginTitle: "Admin Login",
    loginSubtitle: "Please enter your credentials to access the admin panel",
    invalidCredentials: "Invalid username or password",
    loginSuccess: "Login successful",
    pleaseLogin: "Please login to continue",

    // Language
    language: "Language",
    english: "English",
    vietnamese: "Vietnamese",
    german: "German",
    
    // Booking validation
    timeSlotBooked: "This time slot is already booked",
    timeSlotAlreadyBooked: "This time slot has already been booked. Please select another time.",
    dateLocked: "Booking is not available for this date.",
    saving: "Saving...",
  },
  vi: {
    // Header & Navigation
    home: "Trang Chủ",
    services: "Dịch Vụ",
    booking: "Đặt Lịch",
    gallery: "Thư Viện",
    contact: "Liên Hệ",
    admin: "Quản Trị",

    // Hero Section
    heroTitle: "AMICI NAILS SALON",
    heroSubtitle:
      "Chúng tôi tự hào mang đến cho bạn dịch vụ làm móng tay và móng chân chất lượng cao, móng acrylic và gel, thiết kế móng và nhiều hơn nữa.",
    ourServices: "DỊCH VỤ CỦA CHÚNG TÔI",
    bookNow: "Đặt Lịch Hẹn",

    // Services
    manicure: "Làm Móng Tay",
    pedicure: "Làm Móng Chân",
    acrylNails: "Móng Acrylic",
    gelNails: "Móng Gel",
    nailDesign: "Thiết Kế Móng",
    shellac: "Shellac",

    // Business Hours
    businessHours: "Giờ Làm Việc",
    closed: "Đóng cửa",
    openingTime: "Giờ mở cửa",

    // Contact
    contactUs: "Liên Hệ Với Chúng Tôi",
    address: "Địa Chỉ",
    phone: "Điện Thoại",
    email: "Email",

    // Booking Form
    selectServices: "Chọn Dịch Vụ",
    selectDate: "Chọn Ngày",
    selectDateFirst: "Chọn ngày trước",
    selectTime: "Chọn Giờ",
    yourInfo: "Thông Tin Của Bạn",
    name: "Họ Tên",
    phoneNumber: "Số Điện Thoại",
    emailAddress: "Địa Chỉ Email",
    notes: "Ghi Chú (Tùy Chọn)",
    totalPrice: "Tổng Tiền",
    totalDuration: "Tổng Thời Gian",
    minutes: "phút",
    confirmBooking: "Xác Nhận Đặt Lịch",
    bookingSuccess: "Đặt Lịch Thành Công!",
    bookingSuccessMessage: "Chúng tôi sẽ liên hệ với bạn sớm để xác nhận lịch hẹn.",
    from: "từ",

    // Admin
    adminPanel: "Bảng Quản Trị",
    bookingList: "Danh Sách Đặt Lịch",
    allBookings: "Tất Cả",
    pending: "Chờ Xử Lý",
    confirmed: "Đã Xác Nhận",
    completed: "Hoàn Thành",
    cancelled: "Đã Hủy",
    viewDetails: "Xem Chi Tiết",
    editBooking: "Sửa Đặt Lịch",
    deleteBooking: "Xóa Đặt Lịch",
    updateStatus: "Cập Nhật Trạng Thái",
    contactCustomer: "Liên Hệ Khách Hàng",
    bookingDetails: "Chi Tiết Đặt Lịch",
    customer: "Khách Hàng",
    service: "Dịch Vụ",
    dateTime: "Ngày & Giờ",
    status: "Trạng Thái",
    actions: "Thao Tác",
    noBookings: "Không có đặt lịch nào",
    confirmDelete: "Bạn có chắc chắn muốn xóa đặt lịch này?",
    cancel: "Hủy",
    save: "Lưu",
    back: "Quay Lại",
    search: "Tìm Kiếm",
    filter: "Lọc",
    filterByDate: "Lọc Theo Ngày",
    allDates: "Tất Cả Ngày",
    today: "Hôm Nay",
    bookingsByDate: "Đặt Lịch Theo Ngày",
    noBookingsForDate: "Không có đặt lịch cho ngày này",

    // Login
    login: "Đăng Nhập",
    logout: "Đăng Xuất",
    username: "Tên Đăng Nhập",
    password: "Mật Khẩu",
    loginButton: "Đăng Nhập",
    loginTitle: "Đăng Nhập Quản Trị",
    loginSubtitle: "Vui lòng nhập thông tin đăng nhập để truy cập bảng quản trị",
    invalidCredentials: "Tên đăng nhập hoặc mật khẩu không đúng",
    loginSuccess: "Đăng nhập thành công",
    pleaseLogin: "Vui lòng đăng nhập để tiếp tục",

    // Language
    language: "Ngôn Ngữ",
    english: "Tiếng Anh",
    vietnamese: "Tiếng Việt",
    german: "Tiếng Đức",
    
    // Booking validation
    timeSlotBooked: "Khung giờ này đã được đặt",
    timeSlotAlreadyBooked: "Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.",
    dateLocked: "Không thể đặt lịch cho ngày này.",
    saving: "Đang lưu...",
  },
  de: {
    // Header & Navigation
    home: "Startseite",
    services: "Leistungen",
    booking: "Termin buchen",
    gallery: "Galerie",
    contact: "Kontakt",
    admin: "Admin",

    // Hero Section
    heroTitle: "AMICI NAILS SALON",
    heroSubtitle:
      "Wir sind stolz darauf, Ihnen hochwertige Maniküre und Pediküre, Acryl- und Gelnägel, Nageldesign und vieles mehr anzubieten.",
    ourServices: "UNSERE LEISTUNGEN",
    bookNow: "Termin buchen",

    // Services
    manicure: "Maniküre",
    pedicure: "Pediküre",
    acrylNails: "Acryl Nägel",
    gelNails: "Gel Nägel",
    nailDesign: "Nageldesign",
    shellac: "Shellac",

    // Business Hours
    businessHours: "Geschäftszeiten",
    closed: "Geschlossen",
    openingTime: "Öffnungszeit",

    // Contact
    contactUs: "Kontaktieren Sie uns",
    address: "Adresse",
    phone: "Telefon",
    email: "E-Mail",

    // Booking Form
    selectServices: "Leistungen auswählen",
    selectDate: "Datum auswählen",
    selectDateFirst: "Bitte zuerst ein Datum wählen",
    selectTime: "Zeit auswählen",
    yourInfo: "Ihre Informationen",
    name: "Name",
    phoneNumber: "Telefonnummer",
    emailAddress: "E-Mail-Adresse",
    notes: "Notizen (Optional)",
    totalPrice: "Gesamtpreis",
    totalDuration: "Gesamtdauer",
    minutes: "Minuten",
    confirmBooking: "Termin bestätigen",
    bookingSuccess: "Buchung erfolgreich!",
    bookingSuccessMessage: "Wir werden Sie in Kürze kontaktieren, um Ihren Termin zu bestätigen.",
    from: "ab",

    // Admin
    adminPanel: "Admin-Panel",
    bookingList: "Buchungsliste",
    allBookings: "Alle Buchungen",
    pending: "Ausstehend",
    confirmed: "Bestätigt",
    completed: "Abgeschlossen",
    cancelled: "Storniert",
    viewDetails: "Details anzeigen",
    editBooking: "Buchung bearbeiten",
    deleteBooking: "Buchung löschen",
    updateStatus: "Status aktualisieren",
    contactCustomer: "Kunde kontaktieren",
    bookingDetails: "Buchungsdetails",
    customer: "Kunde",
    service: "Leistung",
    dateTime: "Datum & Zeit",
    status: "Status",
    actions: "Aktionen",
    noBookings: "Keine Buchungen gefunden",
    confirmDelete: "Sind Sie sicher, dass Sie diese Buchung löschen möchten?",
    cancel: "Abbrechen",
    save: "Speichern",
    back: "Zurück",
    search: "Suchen",
    filter: "Filter",
    filterByDate: "Nach Datum filtern",
    allDates: "Alle Daten",
    today: "Heute",
    bookingsByDate: "Buchungen nach Datum",
    noBookingsForDate: "Keine Buchungen für dieses Datum",
    tomorrow: "Morgen",

    // Login
    login: "Anmelden",
    logout: "Abmelden",
    username: "Benutzername",
    password: "Passwort",
    loginButton: "Anmelden",
    loginTitle: "Admin-Anmeldung",
    loginSubtitle: "Bitte geben Sie Ihre Anmeldedaten ein, um auf das Admin-Panel zuzugreifen",
    invalidCredentials: "Ungültiger Benutzername oder Passwort",
    loginSuccess: "Anmeldung erfolgreich",
    pleaseLogin: "Bitte melden Sie sich an, um fortzufahren",

    // Language
    language: "Sprache",
    english: "Englisch",
    vietnamese: "Vietnamesisch",
    german: "Deutsch",
    
    // Booking validation
    timeSlotBooked: "Dieser Zeitraum ist bereits gebucht",
    timeSlotLocked: "Dieser Zeitraum ist gesperrt",
    timeSlotAlreadyBooked: "Dieser Zeitraum ist bereits gebucht. Bitte wählen Sie eine andere Zeit.",
    dateLocked: "Buchungen sind für dieses Datum nicht verfügbar.",
    saving: "Speichern...",
    bookings: "Buchungen",
    
    // Locked dates management
    manageLockedDates: "Gesperrte Termine verwalten",
    lockDate: "Datum sperren",
    unlockDate: "Datum entsperren",
    lockedDates: "Gesperrte Termine",
    reason: "Grund",
    addLockedDate: "Datum sperren",
    removeLockedDate: "Sperre aufheben",
    dateLockedSuccess: "Datum erfolgreich gesperrt",
    dateUnlockedSuccess: "Sperre erfolgreich aufgehoben",
    selectDateToLock: "Wählen Sie ein Datum zum Sperren",
    noLockedDates: "Keine gesperrten Termine",
    deleteBookingFailed: "Fehler beim Löschen der Buchung. Bitte versuchen Sie es erneut.",
    locked: "Gesperrt",
    lockTimeSlot: "Zeitslot sperren",
    unlockTimeSlot: "Zeitslot entsperren",
    timeSlotManagement: "Zeitslot-Verwaltung",
    viewBookingCounts: "Buchungsanzahl anzeigen",
    unlock: "Entsperren",
    lock: "Sperren",
    available: "Verfügbar",
    hasBookings: "Hat Buchungen",
    manageTimeSlots: "Zeitslots verwalten",
    timeSlots: "Zeitslots",
    lockDates: "Tage",
  },
}

export function t(key: keyof (typeof translations)["en"], lang: Language): string {
  return translations[lang][key] || key
}
