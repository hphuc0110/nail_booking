# Giới Hạn Email Resend và Cách Xử Lý

## Vấn Đề Hiện Tại

Khi test email, bạn gặp lỗi:

```
You can only send testing emails to your own email address (cclemonchanh04@gmail.com).
To send emails to other recipients, please verify a domain at resend.com/domains
```

## Giải Thích

Resend có 2 chế độ:

### 1. Chế Độ Test (Hiện Tại)

- **Giới hạn:** Chỉ có thể gửi email đến địa chỉ email đã đăng ký tài khoản Resend
- **Email đã đăng ký:** `cclemonchanh04@gmail.com`
- **From address:** Phải dùng `onboarding@resend.dev` hoặc email từ domain đã verify

### 2. Chế Độ Production

- **Yêu cầu:** Phải verify domain trong Resend
- **Sau khi verify:** Có thể gửi email đến bất kỳ địa chỉ nào
- **From address:** Phải dùng email từ domain đã verify (ví dụ: `noreply@yourdomain.com`)

## Giải Pháp

### Option 1: Test với Email Đã Đăng Ký (Nhanh Nhất)

Để test ngay bây giờ, chỉ cần đảm bảo khách hàng đặt lịch sử dụng email `cclemonchanh04@gmail.com` để test.

**Lưu ý:** Trong production thực tế, bạn sẽ cần verify domain để gửi đến bất kỳ email nào.

### Option 2: Verify Domain trong Resend (Cho Production)

1. **Đăng nhập Resend Dashboard:** https://resend.com
2. **Vào mục Domains:** Click "Domains" trong sidebar
3. **Add Domain:** Click "Add Domain"
4. **Nhập domain:** Ví dụ: `yourdomain.com`
5. **Thêm DNS Records:** Resend sẽ cung cấp các DNS records cần thêm:
   - SPF record
   - DKIM records
   - DMARC record (optional)
6. **Verify:** Sau khi thêm DNS records, Resend sẽ tự động verify (thường mất vài phút)
7. **Cập nhật .env.local:**
   ```env
   RESEND_FROM_EMAIL=AMICI NAILS SALON <noreply@yourdomain.com>
   ```

### Option 3: Sử Dụng Resend Test Domain (Tạm Thời)

Hiện tại bạn đang dùng `onboarding@resend.dev` - đây là domain test của Resend, nhưng vẫn chỉ gửi được đến email đã đăng ký.

## Cách Hoạt Động Hiện Tại

Hệ thống đã được cấu hình đúng:

- ✅ API key đã được load
- ✅ Email function hoạt động
- ⚠️ Chỉ giới hạn gửi đến email đã đăng ký trong chế độ test

## Khi Khách Hàng Đặt Lịch

**Trong development/test:**

- Nếu khách hàng dùng email khác `cclemonchanh04@gmail.com` → Email sẽ không được gửi (nhưng booking vẫn được lưu)
- Log sẽ hiển thị lỗi từ Resend API

**Trong production (sau khi verify domain):**

- Có thể gửi đến bất kỳ email nào
- Email sẽ được gửi thành công

## Khuyến Nghị

1. **Cho development:** Test với email `cclemonchanh04@gmail.com`
2. **Cho production:** Verify domain trong Resend để có thể gửi đến mọi email
3. **Monitoring:** Kiểm tra Resend Dashboard → Emails để xem status của các email đã gửi

## Kiểm Tra Status Email

1. Đăng nhập Resend Dashboard
2. Vào mục **Emails**
3. Xem danh sách emails đã gửi
4. Click vào từng email để xem:
   - Status (sent, delivered, bounced, etc.)
   - Error message (nếu có)

## Tóm Tắt

- ✅ Email system đã hoạt động
- ✅ API key đã được cấu hình đúng
- ⚠️ Hiện tại chỉ gửi được đến `cclemonchanh04@gmail.com` (chế độ test)
- 📝 Để gửi đến mọi email: Verify domain trong Resend
