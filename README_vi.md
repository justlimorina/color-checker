# 🎨 Limorina Color Checker

> [English](README.md) | **Tiếng Việt**

Công cụ phân tích màu sắc và thiết kế chuyên nghiệp, được xây dựng theo chuẩn Material Design 3 và nguyên lý thiết kế màu động Material You. Phân tích màu, kiểm tra độ tương phản, mô phỏng mù màu và xuất bảng màu — tất cả ngay trên trình duyệt, không cần cài đặt.

---

## ✨ Tính năng

### 🖌️ Nhập & Trộn màu
- **Nhập mã HEX** kèm bộ chọn màu trực quan.
- **Nhập RGB** (0–255) và **HSL** (H: 0–360, S/L: 0–100%) đồng bộ theo thời gian thực.
- **Không gian màu hiện đại:** Hỗ trợ nhập và đồng bộ hóa trực tiếp theo thời gian thực cho hệ màu **OKLCH** và **LAB**.
- Tất cả định dạng tự động cập nhật lẫn nhau.

### 🎭 Nền Động Thông Minh (Material You)
- **Tự động pha màu ở Chế độ sáng:** Toàn bộ bề mặt nền giao diện (`surface`, `surface-container-low/high/highest`) và nút bấm (`secondary-container`) tự động được pha thêm 2% - 15% sắc độ của màu đang chọn, tạo sự đồng bộ mượt mà.
- **Chế độ tối Huyền ảo:** Các bề mặt và container tối cũng được hắt ánh nhẹ tông màu chính, mang đến cảm giác đồng nhất, chuyên nghiệp.
- **Logo Ngôi sao 8 cánh sinh động:** File SVG logo ngôi sao 8 cánh bo góc Material Design trong header tự động đổi màu theo tông màu đang chọn và xoay 45° khi hover chuột.

### 🏷️ Nhận diện tên màu
- Tự động xác định tên màu gần nhất (ví dụ: *"Butterfly Bush"*, *"Deep Indigo"*) bằng thư viện **ntc.js** chứa dữ liệu của hơn 2.500 tên màu được đặt sẵn.

### 🌈 Sắc độ & Sắc thái (Tints, Shades, Tones)
- 9 bước chuyển màu pha với **Trắng** (Tints), **Đen** (Shades) và **Xám** (Tones).
- **Thiết kế Thích ứng:** Tự động hiển thị dưới dạng thanh trượt cuộn ngang trên máy tính và chuyển thành lưới Grid 5 cột 2 hàng cực kỳ ngay ngắn trên điện thoại di động để tránh cuộn ngang.

### 🎼 Nguyên tắc phối màu
- **Bổ túc, Tương đồng, Tam giác, Chữ nhật, Đơn sắc**.
- Nhấp vào ô màu bất kỳ để chuyển sang màu đó ngay lập tức.

### ♿ WCAG & Tương phản Tự do (Freestyle Contrast)
- Tỉ lệ tương phản WCAG trên nền **Trắng** và **Đen**.
- **Trang Tương phản tự do:** Một không gian độc lập cho phép người dùng tự do nhập màu nền và màu chữ tùy ý để kiểm tra tỉ lệ tương phản với đầy đủ huy hiệu đạt/không đạt WCAG.
- Gợi ý tự động **màu chữ tốt nhất** (Trắng hoặc Đen).

### 👁️ Trình mô phỏng mù màu
- Mô phỏng 4 dạng khiếm khuyết thị giác màu sắc:
  - Mù đỏ (Protanopia)
  - Mù xanh lá (Deuteranopia)
  - Mù xanh lam (Tritanopia)
  - Mù toàn sắc (Achromatopsia)

### 🖥️ Xem trước giao diện UI & Chế độ nâng cao
- Xem màu sắc trên các thành phần UI thực tế (Nút đặc & Nút viền, Thẻ giao diện, Font chữ Outfit/Roboto).
- **Chế độ Nâng cao:** Bật tắt để mô phỏng hiển thị bảng màu trên một cấu trúc giao diện ứng dụng hoàn chỉnh.

### 💾 Bảng màu đã lưu & Lịch sử màu
- **Bảng màu đã lưu:** Lưu tối đa **10 màu** bền vững qua các phiên làm việc nhờ `localStorage`.
- **Trang Lịch sử màu:** Tự động theo dõi, lưu trữ và hiển thị các màu sắc bạn vừa tạo trong một lưới lịch sử riêng biệt.

### 🖼️ Xuất ảnh Palette Tối giản
- Xuất bảng màu ra ảnh **PNG** dạng dải màu nằm ngang tinh tế, in rõ mã HEX dưới mỗi ô màu, tự động co giãn kích thước tùy thuộc vào số lượng màu trong palette.

### 📤 Cổng xuất dữ liệu
- Xuất dữ liệu màu dưới dạng:
  - **CSS custom properties** (biến `:root`)
  - **Tailwind v4** — khối `@theme` dùng giá trị OKLCH
  - **JSON** — đối tượng đầy đủ tất cả các định dạng màu

### 🌐 Hỗ trợ đa ngôn ngữ
- Menu chọn ngôn ngữ thả nổi hỗ trợ:
  - 🇬🇧 English | 🇻🇳 Tiếng Việt | 🇯🇵 日本語 | 🇨🇳 简体中文

### 📱 Tối ưu hóa 100% cho Di động (Boxed Layout)
- Không có bất kỳ thanh cuộn ngang nào ở màn hình di động (`overflow-x: hidden`). Bố cục co giãn dọc hoàn hảo.
- **Logo chuyển đổi:** Tiêu đề chữ tự động ẩn đi trên điện thoại, nhường chỗ cho logo Ngôi sao 8 cánh MD3 nổi bật.
- **Sidebar Backdrop:** Thiết kế Sidebar dạng Modal Drawer trên di động kèm lớp phủ mờ blur làm nhòa cực đẹp.

---

## 🖥️ Hướng dẫn khởi động

Chỉ cần mở `index.html` trên bất kỳ trình duyệt hiện đại nào.

```bash
git clone https://github.com/justlimorina/color-checker.git
cd color-checker
# Mở index.html trên trình duyệt
```

Hoặc chạy máy chủ cục bộ để cho phép ESM:
```bash
python3 -m http.server 5500
# Truy cập http://localhost:5500
```

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Cấu trúc | HTML5 |
| Logic | Vanilla JavaScript dạng Module (ES2020+) |
| Giao diện | Vanilla CSS với biến MD3 design tokens |
| Hệ thống thiết kế | Material Design 3 (Material You Dynamic Theme) |
| Logo | File vector SVG nội tuyến |

---

## 📂 Cấu trúc dự án

Dự án được tổ chức theo cấu trúc Module cực kỳ khoa học và sạch sẽ:

```
color-checker/
├── index.html            # Khung ứng dụng & các trang SPA
├── LICENSE               # CC BY 4.0
├── README.md             # README tiếng Anh
├── README_vi.md          # Tệp này (tiếng Việt)
└── assets/               # Thư mục tài nguyên
    ├── logo.svg          # Logo SVG ngôi sao 8 cánh
    ├── styles.css        # Hệ thống biến CSS & layout
    └── script/           # Thư mục script module
        ├── app.js        # Khởi tạo ứng dụng & điều phối state
        ├── config.js     # Cấu hình dùng chung (dịch thuật ngôn ngữ)
        ├── events.js     # Bản đồ lắng nghe sự kiện DOM
        ├── features.js   # Logic kiểm tra tương phản & preview nâng cao
        ├── navigation.js # Bộ định tuyến SPA và Sidebar
        ├── ntc.js        # Thư viện bên thứ ba: Name That Color
        ├── sidebar.js    # Logic đóng mở Sidebar
        ├── state.js      # Lưu trữ state toàn cục & cache DOM
        ├── ui.js         # Render giao diện, xuất ảnh & Nền động
        └── utils.js      # Công thức chuyển đổi màu & accessibility
```

---

## ⚖️ Giấy phép
 
Dự án này được phát hành theo **Creative Commons Attribution 4.0 International (CC BY 4.0)**.  
Xem file [LICENSE](LICENSE) để biết toàn văn.
