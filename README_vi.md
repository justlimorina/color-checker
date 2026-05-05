# 🎨 Limorina Color Checker

> [English](README.md) | **Tiếng Việt**

Công cụ phân tích màu sắc và thiết kế chuyên nghiệp, được xây dựng theo chuẩn Material Design 3. Phân tích màu, kiểm tra độ tương phản, mô phỏng mù màu và xuất bảng màu — tất cả ngay trên trình duyệt, không cần cài đặt.

---

## ✨ Tính năng

### 🖌️ Nhập & Trộn màu
- **Nhập mã HEX** kèm bộ chọn màu trực quan
- **Nhập RGB** (0–255) đồng bộ theo thời gian thực
- **Nhập HSL** (H: 0–360, S/L: 0–100%) đồng bộ theo thời gian thực
- Tất cả định dạng tự động cập nhật lẫn nhau

### 🏷️ Nhận diện tên màu
- Tự động xác định tên màu gần nhất (ví dụ: *"Butterfly Bush"*, *"Deep Indigo"*)
- Sử dụng thư viện **ntc.js** với hơn 2.500 tên màu được đặt sẵn

### 🌈 Tints, Shades & Tones (Sắc độ & Sắc thái)
- 9 bước chuyển màu pha với **Trắng** (Tints), **Đen** (Shades) và **Xám** (Tones)
- Hàng màu có thể cuộn ngang với thanh trượt; nhấp vào ô màu bất kỳ để chọn

### 🎼 Nguyên tắc phối màu
- **Bổ túc, Tương đồng, Tam giác, Chữ nhật, Đơn sắc**
- Nhấp vào ô màu bất kỳ để chuyển sang màu đó ngay lập tức

### ♿ Độ tương phản WCAG
- Tỉ lệ tương phản trên nền **Trắng** và **Đen**
- Huy hiệu đạt/không đạt cho tiêu chuẩn **AA Large, AA Normal và AAA**
- Gợi ý tự động **màu chữ tốt nhất** (Trắng hoặc Đen)

### 👁️ Trình mô phỏng mù màu
- Mô phỏng 4 dạng khiếm khuyết thị giác màu sắc:
  - Mù đỏ (Protanopia)
  - Mù xanh lá (Deuteranopia)
  - Mù xanh lam (Tritanopia)
  - Mù toàn sắc (Achromatopsia)

### 🖥️ Xem trước giao diện UI
- Xem màu sắc trên các thành phần UI thực tế:
  - Nút đặc & Nút viền
  - Thẻ giao diện (Surface Card)
  - Văn bản tiêu đề và mô tả

### 💾 Bảng màu đã lưu
- Lưu tối đa **10 màu** vào bảng màu cục bộ
- Nhấp vào ô màu đã lưu để tải lại; xóa từng màu riêng lẻ
- Bảng màu và màu đang chọn được lưu qua các phiên trình duyệt bằng `localStorage`

### 🖼️ Xuất ảnh bảng màu
- Tạo và tải xuống ảnh **PNG** bao gồm màu chủ đạo cùng tối đa 5 màu đã lưu, kèm mã HEX và tên màu

### 📤 Cổng xuất dữ liệu
- Xuất dữ liệu màu dưới dạng:
  - **CSS custom properties** (biến `:root`)
  - **Tailwind v4** — khối `@theme` dùng giá trị OKLCH
  - **JSON** — đối tượng đầy đủ tất cả các định dạng màu

### 🌐 Hỗ trợ đa ngôn ngữ
- Menu chọn ngôn ngữ thả nổi với 4 ngôn ngữ:
  - 🇬🇧 English
  - 🇻🇳 Tiếng Việt
  - 🇯🇵 日本語
  - 🇨🇳 简体中文
- Tùy chọn ngôn ngữ được lưu tự động

### 🌙 Chế độ tối
- Chuyển đổi giao diện tối hoàn chỉnh theo chuẩn Material Design 3

---

## 🖥️ Hướng dẫn khởi động

Không cần bước build. Chỉ cần mở `index.html` trên bất kỳ trình duyệt hiện đại nào.

```bash
git clone https://github.com/justlimorina/color-checker.git
cd color-checker
# Mở index.html trên trình duyệt
```

Hoặc chạy máy chủ cục bộ:
```bash
python3 -m http.server 5500
# Truy cập http://localhost:5500
```

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Cấu trúc | HTML5 |
| Logic | Vanilla JavaScript (ES2020+) |
| Giao diện | Vanilla CSS với MD3 design tokens |
| Hệ thống thiết kế | Material Design 3 |
| Font chữ | Google Fonts (Outfit, Roboto) |
| Biểu tượng | Material Symbols Outlined |

---

## 📂 Cấu trúc dự án

```
color-checker/
├── index.html        # Khung ứng dụng & bố cục
├── app.js            # Toàn bộ logic: state, render, i18n, sự kiện
├── styles.css        # Hệ thống thiết kế MD3 & style thành phần
├── ntc.js            # Thư viện bên thứ ba: Name That Color
├── LICENSE           # CC BY 4.0
├── README.md         # README tiếng Anh
└── README_vi.md      # Tệp này (tiếng Việt)
```

---

## ⚖️ Giấy phép
 
Dự án này được phát hành theo **Creative Commons Attribution 4.0 International (CC BY 4.0)**.  
Xem file [LICENSE](LICENSE) để biết toàn văn.

---

## 📣 Ghi công thành phần bên thứ ba

### ntc.js — Name That Color
- **Tác giả:** Chirag Mehta — [http://chir.ag/projects/ntc](http://chir.ag/projects/ntc)
- **Giấy phép:** [Creative Commons Attribution 2.5](https://creativecommons.org/licenses/by/2.5/)
- **Mục đích sử dụng:** Dùng để xác định tên đọc được bằng ngôn ngữ tự nhiên cho bất kỳ giá trị màu RGB nào. Header bản quyền gốc được giữ nguyên trong file `ntc.js` theo đúng yêu cầu của giấy phép.

> Theo giấy phép Creative Commons Attribution 2.5, bắt buộc phải ghi công tác giả gốc. Thông báo này đáp ứng yêu cầu đó.

---

## 🙏 Lời cảm ơn

- [Material Design 3](https://m3.material.io/) — Hướng dẫn hệ thống thiết kế
- [Google Fonts](https://fonts.google.com/) — Font Outfit & Roboto
- [Material Symbols](https://fonts.google.com/icons) — Bộ biểu tượng
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) — Tiêu chuẩn tương phản khả năng tiếp cận
- [OKLCH color space](https://oklch.com/) — Không gian màu đồng đều về mặt cảm nhận, dùng cho xuất Tailwind v4
