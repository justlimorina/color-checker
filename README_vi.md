# 🎨 Limorina Color Checker

> [English](README.md) | **Tiếng Việt**

[![Website](https://img.shields.io/badge/Website-Live_Demo-2E7D32?style=flat-square&logo=googlechrome&logoColor=white)](https://justlimorina.github.io/color-checker/)
[![License](https://img.shields.io/github/license/justlimorina/color-checker?style=flat-square&color=1976D2)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-5C6BC0?style=flat-square&logo=pwa&logoColor=white)](https://justlimorina.github.io/color-checker/)
[![Design](https://img.shields.io/badge/UI_System-Material_You_MD3-6750A4?style=flat-square)](https://m3.material.io/)
[![Ask DeepWiki](https://img.shields.io/badge/Ask-DeepWiki-0070F3?style=flat-square)](https://deepwiki.com/justlimorina/color-checker)
[![Stars](https://img.shields.io/github/stars/justlimorina/color-checker?style=flat-square&color=F57C00)](https://github.com/justlimorina/color-checker/stargazers)
[![Forks](https://img.shields.io/github/forks/justlimorina/color-checker?style=flat-square&color=7B1FA2)](https://github.com/justlimorina/color-checker/network/members)

Bộ công cụ phân tích màu sắc, tạo theme và quản lý bảng màu chuyên nghiệp được xây dựng theo chuẩn Material Design 3 cùng nguyên lý màu sắc động Material You của Google. Hỗ trợ cài đặt hoàn chỉnh dưới dạng Progressive Web App (PWA) để chạy ngoại tuyến (offline). Dễ dàng tạo bảng màu hài hòa, kiểm tra độ tương phản theo chuẩn WCAG & APCA, mô phỏng mù màu, trích xuất màu từ ảnh và xuất mã nguồn sẵn sàng cho sản phẩm trên 9 nền tảng — tất cả thực hiện trực tiếp trên trình duyệt web.

---

## 🌟 Tổng quan bộ công cụ

Limorina Color Checker được cấu trúc thành một bộ ứng dụng dạng mô-đun thống nhất gồm 6 công cụ chuyên sâu cùng 1 trang điều hướng trung tâm:

| Công cụ | Đường dẫn | Mô tả |
|---|---|---|
| **Hub / Trang chủ** | `/index.html` | Giới thiệu với hiệu ứng chuyển động Material You và phím tắt mở nhanh toàn bộ công cụ. |
| **Generator & Bảng màu** | `/generator/` | Không gian làm việc đa tab: Kiểm tra 1 màu, Quản lý dự án, Phối màu thông minh & Lịch sử màu. |
| **Trích xuất màu từ ảnh** | `/image-extractor/` | Trích xuất dải màu từ ảnh với chốt định vị (pins) tương tác trực tiếp trên canvas và thanh chế độ lọc màu. |
| **Trình tạo Theme MD3** | `/md3-theme-creator/` | Tạo toàn bộ hệ thống biến màu Material Design 3 HCT cùng Cổng xuất mã nguồn đa nền tảng (9 định dạng). |
| **Kiểm tra tương phản** | `/contrast-checker/` | Kiểm tra độ tương phản chữ/nền tự do với tỉ số WCAG 2.1 và điểm số cảm nhận APCA Lc. |
| **Ma trận tương phản** | `/matrix/` | Bảng ma trận so sánh chéo khả năng tiếp cận giữa toàn bộ các màu đã lưu trong dự án. |
| **Trình tạo CSS Gradient** | `/css-gradient-generator/` | Thiết kế dải màu Linear & Radial trực quan, điều chỉnh góc xoay và sao chép mã CSS tiện lợi. |

---

## ✨ Chi tiết tính năng theo từng công cụ

### 1. 🎨 Generator & Bảng màu (`/generator/`)
Không gian làm việc "4 trong 1" với điều hướng tab tiện lợi:

- **Tab 1: Kiểm tra & Trộn màu đơn (Single Color Checker)**
  - **Nhập & đồng bộ đa định dạng:** Chuyển đổi hai chiều theo thời gian thực giữa **HEX**, **RGB** (0–255), **HSL** (0–360, 0–100%), **OKLCH** (Lightness, Chroma, Hue), và **Oklab** (L\*, a\*, b\*).
  - **Công cụ hút màu màn hình (EyeDropper):** Tích hợp trực tiếp Browser EyeDropper API cho phép chấm chọn bất kỳ màu nào từ màn hình máy tính của bạn.
  - **Nhận diện tên màu tự động:** Tự động tìm tên màu gần nhất dựa trên tập dữ liệu tuyển chọn hơn 4.900 tên màu từ `color-name-list`.
  - **Hiển thị nhanh mã màu:** Thẻ sao chép nhanh cho RGB, HSL, OKLCH và **CMYK** (0–100%).
  - **Sắc độ, Sắc thái & Tông màu (Tints, Shades & Tones):** 9 bước chuyển màu pha với Trắng (Tints), Đen (Shades) và Xám trung tính (Tones).
  - **Quy luật phối màu (Color Harmonies):** Tính toán tức thì các phối màu: Bổ túc (Complementary), Tương đồng (Analogous), Tam giác (Triadic), Chữ nhật (Tetradic) và Đơn sắc (Monochromatic).
  - **Độ tương phản WCAG & APCA:** Kiểm tra khả năng hiển thị trên nền Trắng và Đen với huy hiệu đạt chuẩn WCAG 2.1 AA/AAA và điểm số APCA Beta (Lc).
  - **Gợi ý màu chữ tốt nhất:** Tự động đề xuất màu chữ tối ưu nhất cho khả năng đọc (Trắng hoặc Đen).
  - **Xem trước giao diện (UI Prototype Preview):** Mô phỏng nút bấm (Primary, Tonal, Outlined), Thẻ giao diện (Surface Card) và Đoạn văn bản mẫu. Có công tắc chuyển sang **Chế độ nâng cao (Advanced Mode)** để xem trước trên bố cục ứng dụng đầy đủ.
  - **Mô phỏng khiếm khuyết thị giác (Mù màu):** Ma trận mô phỏng chính xác 4 dạng khiếm khuyết thị giác màu sắc phổ biến:
    - Protanopia (Mù màu đỏ)
    - Deuteranopia (Mù màu xanh lá)
    - Tritanopia (Mù màu xanh lam)
    - Achromatopsia (Mù màu toàn phần / Đơn sắc)
  - **Thao tác nhanh:** Lưu vào bảng màu dự án, tạo liên kết chia sẻ (`?color=HEX`), và xuất dải màu thành file ảnh PNG.

- **Tab 2: Quản lý bảng màu dự án (Project Palettes Manager)**
  - **Quản lý đa dự án:** Tạo mới, đổi tên, xóa và chuyển đổi linh hoạt giữa nhiều dự án màu khác nhau được lưu bền vững trong `localStorage`.
  - **Quản lý ô màu (Swatches):** Thêm, xem thông tin, sao chép hoặc xóa từng ô màu trong dự án đang chọn.
  - **Xuất bảng màu GPL:** Xuất file bảng màu `.gpl` tương thích chuẩn với GIMP, Inkscape và Adobe Photoshop.
  - **Sao lưu & Phục hồi JSON:** Xuất toàn bộ dữ liệu dự án ra JSON hoặc nhập file JSON bảng màu có sẵn vào ứng dụng.
  - **Liên kết chia sẻ bảng màu:** Tạo liên kết chia sẻ chứa toàn bộ dải màu (`?palette=HEX1,HEX2...`).

- **Tab 3: Phối màu thông minh (Smart Palette Generator)**
  - Tự động tạo dải 5 màu hài hòa theo 6 nguyên lý phối màu: **Complementary** (Bổ túc), **Analogous** (Tương đồng), **Triadic** (Tam giác), **Tetradic** (Chữ nhật), **Monochromatic** (Đơn sắc), và **Freestyle** (Tự do/Ngẫu nhiên).
  - **Khóa màu độc lập (Color Locking):** Khóa/Mở khóa từng swatch riêng lẻ để giữ cố định các màu bạn ưng ý trong khi tạo ngẫu nhiên lại các màu còn lại.
  - Một chạm để lấy màu swatch làm màu chính cho toàn bộ ứng dụng hoặc lưu cả bộ 5 màu vào dự án.

- **Tab 4: Lịch sử màu (Color History)**
  - Tự động ghi lại danh sách các màu bạn vừa tạo hoặc khám phá, kèm nút dọn dẹp lịch sử tiện lợi.

---

### 2. 🖼️ Trích xuất màu từ ảnh (`/image-extractor/`)
- **Kéo thả & Tải ảnh lên:** Thả file ảnh trực tiếp vào khung tải hoặc duyệt file từ máy tính.
- **Chốt định vị tương tác trên Canvas:** Các chấm tròn đánh dấu vị trí lấy màu hiển thị trực quan ngay trên bề mặt ảnh. Người dùng có thể kéo thả chốt đến bất kỳ vị trí nào trên ảnh để lấy mẫu màu theo thời gian thực.
- **Thanh trượt chế độ trích xuất:** Chuyển đổi nhanh giữa các thuật toán lọc màu:
  - *Muted* (Trầm tính)
  - *Soft* (Dịu nhẹ)
  - *Pastel* (Màu phấn)
  - *Vibrant* (Rực rỡ)
  - *Balanced* (Cân bằng)
- **Tùy chỉnh số lượng màu:** Dễ dàng tăng (`+`) hoặc giảm (`-`) số lượng chốt lấy mẫu màu.
- **Xuất bảng màu trích xuất:** Xuất bảng màu vừa lấy từ ảnh thành file ảnh PNG dải màu chuyên nghiệp kèm mã HEX.

---

### 3. 🎨 Trình tạo Theme MD3 & Cổng xuất mã nguồn (`/md3-theme-creator/`)
- **Tạo hệ thống token MD3 đầy đủ:** Tự động tính toán trọn bộ mã màu Material Design 3 (Primary, Secondary, Tertiary, Surface, Surface Containers 1–5, Outline, Error, cùng toàn bộ các biến thể màu chữ on-colors tương ứng) bằng thuật toán HCT chuẩn từ thư viện `@material/material-color-utilities`.
- **Lưới trực quan hóa token:** Minh họa rõ ràng mối quan hệ giữa màu nền và màu chữ on-color tương ứng.
- **Cổng xuất mã nguồn (Export Hub) hỗ trợ 9 định dạng tiêu chuẩn ngành:**
  1. **CSS Variables (`theme.css`):** Các biến `:root` CSS dùng ngay cho web.
  2. **Tailwind CSS v4 (`theme.tailwind.css`):** Khối `@theme` sử dụng giá trị hệ màu OKLCH hiện đại.
  3. **Figma Tokens (`tokens.json`):** Định dạng chuẩn W3C Design Tokens Community Group (DTCG).
  4. **Flutter (`app_theme.dart`):** Cấu hình `ColorScheme.fromSeed` và `ThemeData` bằng mã nguồn Dart.
  5. **SCSS (`_colors.scss`):** Cấu trúc Sass map `$brand-color` và danh sách biến màu riêng rẽ.
  6. **Android (`colors.xml`):** Tài nguyên XML color truyền thống và mã nguồn Jetpack Compose Kotlin Color.
  7. **SwiftUI (`AppTheme.swift`):** Tiện ích mở rộng struct `Color` trong Swift với thuật toán quy đổi RGB chuẩn xác.
  8. **JSON (`palette.json`):** Đối tượng JSON chi tiết bao gồm mọi không gian màu và các bước sắc độ.
  9. **Python (`theme_colors.py`):** Đoạn mã tái tạo bảng màu bằng thư viện `materialyoucolor`.
- Xem trước mã nguồn trực tiếp kèm huy hiệu định dạng, số dòng code, một nút bấm Sao chép mã (Copy Code) và nút Tải về file (Download).

---

### 4. ♿ Kiểm tra tương phản tùy chỉnh (`/contrast-checker/`)
- **Kiểm tra tự do:** Tự do ghép bất kỳ màu chữ và màu nền nào để kiểm tra khả năng đọc.
- **Hút màu tích hợp:** Chấm chọn màu trực tiếp từ màn hình vào ô màu nền hoặc màu chữ qua EyeDropper.
- **Đảo màu nhanh:** Nhấp nút `sync_alt` để hoán đổi ngay màu nền và màu chữ cho nhau.
- **Đánh giá theo 2 tiêu chuẩn khả năng tiếp cận:**
  - **WCAG 2.1:** Tính toán tỉ lệ tương phản kèm huy hiệu Đạt/Không đạt chuẩn AA và AAA cho cỡ chữ thường và chữ lớn.
  - **W3C APCA Beta (Điểm Lc):** Đánh giá độ tương phản cảm nhận thị giác thực tế kèm huy hiệu Pass/Fail.

---

### 5. 📊 Ma trận tương phản (`/matrix/`)
- **So sánh chéo toàn bộ bảng màu:** Tự động tạo bảng ma trận N×N so sánh độ tương phản của tất cả các màu đã lưu trong dự án với nhau, cũng như với màu Trắng và Đen thuần.
- **2 chế độ xem linh hoạt:** Chuyển đổi nhanh giữa hiển thị tỉ số **WCAG 2.1** và điểm số **APCA (Lc)**.
- **Huy hiệu màu sắc trực quan:** Đánh dấu màu sắc rõ ràng giúp kiểm duyệt nhanh tính tiếp cận của toàn bộ hệ thống màu thiết kế.

---

### 6. 🌈 Trình tạo CSS Gradient (`/css-gradient-generator/`)
- **Kiểu Gradient:** Hỗ trợ tạo dải màu dạng **Linear** (đường thẳng) và **Radial** (tỏa tròn).
- **Thanh trượt góc xoay:** Điều chỉnh góc từ 0° đến 360° theo thời gian thực kèm số đo góc trực quan.
- **Bộ chọn 2 màu chuyển sắc:** Hỗ trợ nhập mã HEX, dùng bảng chọn màu gốc hoặc công cụ hút màu màn hình.
- **Xem trước & Xuất mã:** Xem trước dải màu tức thì và sao chép mã CSS (`background: linear-gradient(...)`) chỉ với 1 click.

---

### 📱 Kiến trúc giao diện & Trải nghiệm người dùng
- **Thanh điều hướng Desktop (Navigation Rail):** Bố cục thanh trượt bên cạnh tinh gọn, có icon rõ ràng, hiển thị trạng thái đang xem và chú thích nhanh (tooltip).
- **Thanh tiêu đề & Drawer trên Mobile:** Thanh Top App Bar kèm Navigation Drawer mở mượt mà với hiệu ứng làm nhòa nền phía sau (`backdrop-filter`).
- **Thanh điều hướng chân trang Mobile (Bottom Nav):** Thanh điều hướng dạng icon-only chuẩn Material Design 3, thao tác ngón cái cực kỳ tiện lợi trên điện thoại.
- **Hệ thống màu động toàn diện (Material You):** Toàn bộ giao diện (thanh điều hướng, thẻ, nút bấm, viền) tự động đổi màu theo màu chính đang chọn ở cả chế độ Sáng (Light) và Tối (Dark).
- **Hướng dẫn sử dụng tích hợp (User Guide Modal):** Bảng tra cứu tóm tắt các không gian màu (HEX, RGB, HSL, OKLCH, LAB), sắc độ (Tints, Shades, Tones) và các cấp độ chuẩn tiếp cận WCAG.
- **Hỗ trợ 4 ngôn ngữ:** Thay đổi ngôn ngữ ngay tức thì không cần tải lại trang:
  - 🇬🇧 English (Tiếng Anh)
  - 🇻🇳 Tiếng Việt
  - 🇯🇵 日本語 (Tiếng Nhật)
  - 🇨🇳 简体中文 (Tiếng Trung giản thể)
- **Progressive Web App (PWA):** Cài đặt trực tiếp lên màn hình chính máy tính hoặc điện thoại, hoạt động ngoại tuyến nhờ bộ nhớ đệm Service Worker (`sw.js`), đồng bộ màu với thanh trạng thái hệ điều hành.

---

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| **Cấu trúc** | HTML5 ngữ nghĩa & Kiến trúc Đa trang Mô-đun (Multi-Page Architecture) |
| **Kiểu dáng** | Vanilla CSS3 với hệ thống Design Tokens & Phân cấp Typography Material Design 3 |
| **Logic xử lý** | JavaScript thuần dạng Module (ES Modules, ES2020+) |
| **Hệ thống màu động** | Thư viện chính thức `@material/material-color-utilities` (Không gian màu HCT) |
| **Thành phần UI** | Thư viện Web Components chính thức `@material/web` của Google |
| **Bộ đo tương phản** | Thuật toán độ chói tương đối WCAG 2.1 và thuật toán cảm nhận W3C APCA Beta 0.1.9 |
| **Hút màu màn hình** | Native Browser EyeDropper API |
| **PWA & Ngoại tuyến** | Service Worker (`sw.js`) & Web App Manifest (`manifest.json`) |
| **Font & Biểu tượng** | Google Fonts (*Roboto*, *Roboto Slab*, *Roboto Mono*, *Material Symbols Rounded*) |

---

## 📂 Cấu trúc dự án

```
color-checker/
├── index.html                  # Trang chủ & hub liên kết các công cụ
├── CNAME                       # Cấu hình tên miền tùy chỉnh
├── LICENSE                     # Giấy phép mã nguồn mở MIT
├── manifest.json               # Web App Manifest phục vụ cài đặt PWA
├── sw.js                       # Service Worker phục vụ lưu cache ngoại tuyến
├── README.md                   # Tài liệu tiếng Anh
├── README_vi.md                # Tài liệu tiếng Việt (tệp này)
├── generator/                  # Không gian làm việc Generator & Bảng màu
│   ├── index.html              # Bố cục 4 tab (Kiểm tra màu, Dự án, Phối màu, Lịch sử)
│   └── script.js               # Logic trộn màu, phối màu, WCAG và UI preview
├── image-extractor/            # Công cụ trích xuất màu từ ảnh
│   ├── index.html              # Vùng kéo thả & không gian canvas
│   └── script.js               # Chốt định vị trên canvas & các chế độ trích xuất
├── md3-theme-creator/          # Trình tạo Theme Material Design 3
│   ├── index.html              # Lưới token & giao diện Cổng xuất mã nguồn
│   └── script.js               # Sinh token HCT & 9 mẫu mã nguồn xuất bản
├── contrast-checker/           # Kiểm tra tương phản tùy chỉnh
│   ├── index.html              # Khung nhập màu nền / màu chữ tự do
│   └── script.js               # Đánh giá tương phản WCAG 2.1 & APCA
├── matrix/                     # Ma trận so sánh tương phản
│   ├── index.html              # Bảng ma trận so sánh kèm nút chuyển chế độ
│   └── script.js               # Tính toán ma trận độ tương phản
├── css-gradient-generator/     # Trình tạo dải màu CSS Gradient
│   ├── index.html              # Giao diện thiết kế Linear/Radial gradient
│   └── script.js               # Điều khiển góc xoay & tạo mã CSS
└── assets/                     # Tài nguyên dùng chung
    ├── images/                 # Logo vector SVG
    │   ├── amelia_logo.svg     # Favicon & biểu trưng
    │   ├── logo-black.svg      # Logo điều hướng (nền sáng)
    │   └── logo-white.svg      # Logo điều hướng (nền tối)
    ├── styles.css              # Toàn bộ biến token MD3 & CSS responsive
    └── script/                 # Các mô-đun JavaScript dùng chung
        ├── config.js           # Từ điển đa ngôn ngữ (EN, VI, JA, ZH)
        ├── colornames.bestof.js# Tập dữ liệu 4.900+ tên màu tuyển chọn
        ├── projects.js         # Quản lý đa dự án, xuất nhập GPL/JSON, chia sẻ URL
        ├── utils.js            # Công thức toán màu (HEX, RGB, HSL, CMYK, OKLCH, OKLab, WCAG, APCA)
        └── shared/
            └── layout.js       # Vỏ giao diện thích ứng (Nav Rail, Drawer, Bottom Nav, Nền động)
```

---

## 🖥️ Hướng dẫn khởi chạy

### Chạy cục bộ (Local Development)

Do dự án sử dụng chuẩn ES Modules (`import`/`export`) và Web Components, bạn cần khởi chạy qua một máy chủ HTTP cục bộ:

```bash
# 1. Clone mã nguồn về máy
git clone https://github.com/justlimorina/color-checker.git
cd color-checker

# 2. Khởi động local server (chọn 1 trong các cách sau)
# Cách A: Dùng Python 3
python3 -m http.server 5500

# Cách B: Dùng Node.js (npx serve)
npx serve .

# Cách C: Dùng tiện ích Live Server trong VS Code
# Nhấp chuột phải vào index.html -> Chọn "Open with Live Server"

# 3. Mở trên trình duyệt
# Truy cập đường dẫn: http://localhost:5500
```

> [!NOTE]
> Mở trực tiếp `index.html` bằng giao thức đường dẫn tệp (`file:///`) có thể khiến chính sách bảo mật trình duyệt chặn nạp các mô-đun ES Module và Web Components. Hãy luôn chạy qua máy chủ HTTP (`http://` hoặc `https://`).

---

## 🔗 Tham số URL & Tích hợp chia sẻ

Bạn có thể tạo liên kết trực tiếp để chia sẻ trạng thái màu cụ thể qua tham số URL:

- **Một màu cụ thể:**  
  `https://justlimorina.github.io/color-checker/generator/?color=624E9A`
- **Chia sẻ cả bảng màu:**  
  `https://justlimorina.github.io/color-checker/generator/?palette=624E9A,EADDFF,381E72,49454F,CAC4D0`

---

## 📣 Ghi công bên thứ ba

- **[color-name-list](https://github.com/meodai/color-names):** Tập dữ liệu tên màu tuyển chọn `bestOf` bởi David Aerne ([@meodai](https://github.com/meodai)) theo [Giấy phép MIT](https://github.com/meodai/color-names/blob/master/LICENSE).
- **[@material/material-color-utilities](https://github.com/material-foundation/material-color-utilities):** Thuật toán màu HCT chính thức của Google Material Design 3 theo Giấy phép Apache-2.0.
- **[@material/web](https://github.com/material-components/material-web):** Bộ Web Components Material Design 3 của Google theo Giấy phép Apache-2.0.
- **[APCA (Advanced Perceptual Contrast Algorithm)](https://github.com/Myndex/apca-w3):** Thuật toán đánh giá độ tương phản theo cảm nhận thị giác W3C Silver/WCAG3 của Andrew Somers (Myndex Research).

---

## ⚖️ Giấy phép

Dự án được phát hành theo **[Giấy phép MIT (MIT License)](LICENSE)**.  
&copy; 2024 – Hiện tại **Limorina**. Bảo lưu mọi quyền.
