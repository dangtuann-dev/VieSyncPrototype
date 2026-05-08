# 🎓 BLENDEDU PLATFORM — PROMPT KẾ HOẠCH & HƯỚNG DẪN PHÁT TRIỂN ĐẦY ĐỦ

> **Dành cho AI Developer:** Đây là tài liệu đặc tả toàn diện để xây dựng prototype nền tảng học tập Blended Learning thương mại. Đọc kỹ toàn bộ tài liệu trước khi bắt đầu code.

---

## 📌 BỐI CẢNH DỰ ÁN

Xây dựng một **nền tảng học tập Blended Learning** kết hợp giữa video bài giảng số và học trực tuyến tương tác. Đây là prototype để **kiểm nghiệm với 100 người dùng thật**, mục tiêu xác thực thị trường trước khi đầu tư phát triển toàn diện.

**Slogan:** *"Xóa bỏ khoảng cách, Đột phá kỹ năng"*

---

## 🛠️ TECH STACK BẮT BUỘC

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Language:** TypeScript

### Backend & Database
- **Runtime:** Next.js API Routes (serverless — tương thích Vercel)
- **Database:** **Neon PostgreSQL** (serverless Postgres, free tier, tương thích Vercel hoàn toàn — không cần máy tính chạy liên tục)
- **ORM:** Prisma (schema migration + type-safe queries)
- **Auth:** **NextAuth.js v4** với Google OAuth Provider + Credentials Provider
- **Session:** JWT (lưu trong cookie, không cần Redis)

### AI & Machine Learning (KHÔNG dùng API trả phí — chạy local/import thẳng)
- **Chatbot AI:** [`@xenova/transformers`](https://github.com/xenova/transformers.js) — chạy model NLP trực tiếp trong trình duyệt (WebAssembly), **hoàn toàn miễn phí, không cần API key**
  - Model gợi ý: `Xenova/distilbert-base-uncased` hoặc `Xenova/flan-t5-small` cho chatbot hỏi-đáp Socratic
- **Recommendation Engine (ML thuật toán):** Tự implement bằng thuần JavaScript/TypeScript, không cần thư viện ngoài:
  - **TF-IDF + Cosine Similarity** để match user profile → lộ trình học phù hợp
  - **Collaborative Filtering đơn giản** (user-based): dựa trên lựa chọn của các user tương tự
  - **Content-Based Filtering:** dựa trên tags lĩnh vực + pain points người dùng nhập
- **Phân tích dữ liệu:** Thuần TypeScript (không cần thư viện ML nặng phía server)

### Video Security (Không cho tải/quay chụp)
- Nhúng YouTube IFrame API với các restrictions:
  - `rel=0`, `modestbranding=1`, `disablekb=1`
  - CSS overlay chặn chuột phải (`pointer-events`, `user-select: none`)
  - Watermark động hiển thị email/tên user lên video (SVG overlay)
  - `document.addEventListener('keydown', ...)` block PrintScreen, F12
  - CSS `@media print { display: none }` và `-webkit-user-select: none`
  - Content Security Policy headers trong `next.config.js`
- **Lưu ý:** Video source từ YouTube (public) nhưng UX được bọc lại với security layer

### Live Session
- Tích hợp **Jitsi Meet** (open-source, miễn phí, self-hosted hoặc dùng meet.jit.si)
  - Nhúng `JitsiMeetExternalAPI` trực tiếp vào trang
  - Admin tạo room → share link cho học viên trong khóa học đó
  - Không cần backend riêng, Jitsi xử lý toàn bộ WebRTC

### Deploy
- **Platform:** Vercel (free tier đủ dùng cho prototype)
- **Database:** Neon PostgreSQL (free tier: 0.5GB, đủ cho 100 users)
- **Environment Variables:** Quản lý qua Vercel Dashboard

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
blendedu/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (onboarding)/
│   │   └── onboarding/page.tsx        # Bảng chọn vai trò + lĩnh vực + pain points
│   ├── (main)/
│   │   ├── dashboard/page.tsx         # Trang chính người học
│   │   ├── course/[id]/page.tsx       # Trang khóa học chi tiết
│   │   └── profile/page.tsx
│   ├── admin/
│   │   ├── page.tsx                   # Admin dashboard
│   │   ├── users/page.tsx
│   │   ├── courses/page.tsx
│   │   └── live/page.tsx              # Quản lý live session
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── users/route.ts
│       ├── courses/route.ts
│       ├── progress/route.ts
│       ├── recommend/route.ts         # ML recommendation engine
│       └── admin/
│           ├── stats/route.ts
│           └── live/route.ts
├── components/
│   ├── auth/
│   ├── onboarding/
│   ├── course/
│   │   ├── VideoPlayer.tsx            # Secured video player
│   │   ├── ChatBot.tsx               # AI chatbot (Socratic method)
│   │   ├── LiveSession.tsx           # Jitsi integration
│   │   └── CommunityLink.tsx        # Link đến nhóm Zalo
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── db.ts                          # Prisma client
│   ├── auth.ts                        # NextAuth config
│   ├── ml/
│   │   ├── recommender.ts            # TF-IDF + Cosine Similarity
│   │   ├── collaborative.ts          # Collaborative filtering
│   │   └── tfidf.ts                  # TF-IDF implementation
│   └── data/
│       └── courses.ts                # Seed data: 4 lĩnh vực
├── prisma/
│   └── schema.prisma
├── public/
├── next.config.js
├── .env.example
└── package.json
```

---

## 🗃️ DATABASE SCHEMA (Prisma + Neon PostgreSQL)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  phone         String?
  password      String?                        // null nếu dùng Google OAuth
  image         String?
  role          UserRole  @default(LEARNER)
  isAdmin       Boolean   @default(false)
  onboarded     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile       UserProfile?
  progress      CourseProgress[]
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model UserProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  userType        UserType                        // STUDENT | INSTRUCTOR
  interests       String[]                        // mảng lĩnh vực quan tâm
  painPoints      String[]                        // vấn đề người dùng gặp phải
  currentLevel    String?                         // beginner | intermediate | advanced
  weeklyHours     Int?                            // số giờ học mỗi tuần
  goals           String[]                        // mục tiêu học tập
  recommendedPath String?                         // slug lộ trình được ML gợi ý

  user            User      @relation(fields: [userId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Course {
  id              String    @id @default(cuid())
  slug            String    @unique
  title           String
  description     String    @db.Text
  field           String                          // management | softskills | it | marketing
  level           String                          // beginner | intermediate | advanced
  tags            String[]
  zalorLink       String?                         // link nhóm Zalo cộng đồng
  isPublished     Boolean   @default(true)
  createdAt       DateTime  @default(now())

  lessons         Lesson[]
  progress        CourseProgress[]
  liveSessions    LiveSession[]
}

model Lesson {
  id              String    @id @default(cuid())
  courseId        String
  order           Int
  title           String
  description     String?
  youtubeVideoId  String                          // ID video YouTube (không phải full URL)
  duration        Int                             // phút
  transcript      String?   @db.Text             // tóm tắt nội dung bài
  quizJson        Json?                           // câu hỏi cuối bài dạng JSON

  course          Course    @relation(fields: [courseId], references: [id])
  createdAt       DateTime  @default(now())
}

model CourseProgress {
  id              String    @id @default(cuid())
  userId          String
  courseId        String
  completedLessons String[]                       // mảng lesson IDs đã hoàn thành
  currentLesson   Int       @default(0)
  percentComplete Float     @default(0)
  startedAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  user            User      @relation(fields: [userId], references: [id])
  course          Course    @relation(fields: [courseId], references: [id])
  @@unique([userId, courseId])
}

model LiveSession {
  id              String    @id @default(cuid())
  courseId        String
  title           String
  jitsiRoomId     String    @unique              // ID phòng Jitsi
  scheduledAt     DateTime
  isActive        Boolean   @default(false)
  createdByAdmin  Boolean   @default(true)
  createdAt       DateTime  @default(now())

  course          Course    @relation(fields: [courseId], references: [id])
}

enum UserRole {
  LEARNER
  INSTRUCTOR
  ADMIN
}

enum UserType {
  STUDENT
  INSTRUCTOR
}
```

---

## 🎯 4 LĨNH VỰC & KHÓA HỌC CHI TIẾT

### Seed Data — Tạo file `lib/data/courses.ts`

Mỗi lĩnh vực có **1 khóa học**, mỗi khóa có **2-3 bài học**, mỗi bài **10-15 phút**.

---

### 🏢 Lĩnh Vực 1: Quản Trị (Management)

**Khóa học:** "Nhập Môn Quản Trị Doanh Nghiệp Hiện Đại"
- **Slug:** `management-101`
- **Zalo link:** `[Admin điền sau]`
- **Bài 1 — "Quản Trị Là Gì & Tại Sao Quan Trọng?"** (12 phút)
  - YouTube search query: `"quản trị doanh nghiệp cơ bản" OR "management basics tiếng việt" site:youtube.com`
  - Dùng video: Tìm video YouTube tiếng Việt về quản trị cơ bản, nhiều view nhất trong 2 năm gần đây
  - Nội dung chatbot hỏi: *"Theo bạn, điều gì làm nên một nhà quản trị giỏi?"*, *"Bạn đã từng thấy ai quản lý nhóm hiệu quả chưa? Họ làm gì đặc biệt?"*
- **Bài 2 — "Kỹ Năng Ra Quyết Định Trong Quản Trị"** (13 phút)
  - Chatbot hỏi: *"Kể một tình huống bạn phải đưa ra quyết định khó. Bạn đã cân nhắc những yếu tố nào?"*
- **Bài 3 — "Xây Dựng & Quản Lý Đội Nhóm"** (11 phút)
  - Chatbot hỏi: *"Nếu bạn là trưởng nhóm, bạn sẽ làm gì khi có thành viên không hoàn thành công việc đúng hạn?"*

---

### 💼 Lĩnh Vực 2: Kỹ Năng Mềm (Soft Skills)

**Khóa học:** "Kỹ Năng Giao Tiếp & Thuyết Trình Chuyên Nghiệp"
- **Slug:** `softskills-communication`
- **Bài 1 — "Nghệ Thuật Lắng Nghe Chủ Động"** (10 phút)
  - Chatbot hỏi: *"Bạn có thể mô tả một cuộc trò chuyện mà bạn cảm thấy thực sự được lắng nghe không?"*
- **Bài 2 — "Cấu Trúc Bài Thuyết Trình Thuyết Phục"** (14 phút)
  - Chatbot hỏi: *"Bạn sợ nhất điều gì khi phải thuyết trình trước đám đông?"*
- **Bài 3 — "Xử Lý Xung Đột & Phản Hồi Chuyên Nghiệp"** (12 phút)
  - Chatbot hỏi: *"Hãy nghĩ đến một xung đột bạn đã gặp. Bạn đã giải quyết thế nào? Nếu làm lại, bạn sẽ thay đổi gì?"*

---

### 💻 Lĩnh Vực 3: Lập Trình / IT (Programming)

**Khóa học:** "Python Cơ Bản — Từ Số Không Đến Có Thể Code"
- **Slug:** `it-python-basics`
- **Bài 1 — "Tư Duy Lập Trình & Cài Đặt Môi Trường"** (12 phút)
  - Chatbot hỏi: *"Theo bạn, lập trình viên giải quyết vấn đề khác gì so với người bình thường?"*
- **Bài 2 — "Biến, Kiểu Dữ Liệu & Vòng Lặp Đầu Tiên"** (15 phút)
  - Chatbot hỏi: *"Bạn vừa học về vòng lặp. Hãy tưởng tượng một việc lặp đi lặp lại trong cuộc sống mà bạn muốn tự động hóa?"*
- **Bài 3 — "Hàm & Module — Sức Mạnh Tái Sử Dụng Code"** (13 phút)
  - Chatbot hỏi: *"Vì sao chúng ta không nên viết cùng một đoạn code hai lần? Điều này áp dụng vào cuộc sống thực tế ra sao?"*

---

### 📣 Lĩnh Vực 4: Marketing (Digital Marketing)

**Khóa học:** "Digital Marketing Từ A-Z Cho Người Mới"
- **Slug:** `marketing-digital-basics`
- **Bài 1 — "Hiểu Khách Hàng — Nền Tảng Của Mọi Chiến Lược"** (11 phút)
  - Chatbot hỏi: *"Nghĩ về một thương hiệu bạn yêu thích. Tại sao họ lại khiến bạn trung thành?"*
- **Bài 2 — "Content Marketing & Kể Chuyện Thương Hiệu"** (13 phút)
  - Chatbot hỏi: *"Nếu bạn là một thương hiệu, bạn muốn khách hàng nhớ đến bạn qua câu chuyện nào?"*
- **Bài 3 — "Đo Lường & Tối Ưu Chiến Dịch Marketing"** (12 phút)
  - Chatbot hỏi: *"Theo bạn, dữ liệu và cảm tính — yếu tố nào quan trọng hơn trong marketing? Vì sao?"*

---

## 🤖 ML RECOMMENDATION ENGINE (Thuần TypeScript — Không API)

### File: `lib/ml/recommender.ts`

Implement đầy đủ thuật toán sau, **không dùng thư viện ngoài**:

```typescript
// Thuật toán 1: TF-IDF để encode user profile
// Thuật toán 2: Cosine Similarity để match với các course
// Thuật toán 3: Simple Collaborative Filtering (nếu có đủ users)

interface UserVector {
  userId: string;
  interests: string[];      // e.g., ["management", "leadership"]
  painPoints: string[];     // e.g., ["team management", "decision making"]
  userType: string;         // "STUDENT" | "INSTRUCTOR"
  level: string;            // "beginner" | "intermediate"
}

interface CourseVector {
  courseId: string;
  field: string;
  tags: string[];
  level: string;
}

// 1. Build vocabulary từ tất cả user profiles + course tags
function buildVocabulary(users: UserVector[], courses: CourseVector[]): string[]

// 2. TF-IDF vector cho user
function userToTFIDF(user: UserVector, vocabulary: string[]): number[]

// 3. TF-IDF vector cho course
function courseToTFIDF(course: CourseVector, vocabulary: string[]): number[]

// 4. Cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number

// 5. Top-N recommendations
function recommendCourses(user: UserVector, courses: CourseVector[], topN: number): string[]

// 6. Collaborative Filtering — users với profile tương tự đã học gì?
function collaborativeRecommend(userId: string, allUsers: UserVector[], allProgress: any[]): string[]

// 7. Hybrid: kết hợp content-based + collaborative (weighted average)
function hybridRecommend(userId: string, ...): string[]
```

**Mapping rule cứng (fallback khi chưa đủ data ML):**
- Chọn "Quản trị / Kinh doanh" → `management-101`
- Chọn "Kỹ năng mềm / Giao tiếp" → `softskills-communication`
- Chọn "Lập trình / Công nghệ" → `it-python-basics`
- Chọn "Marketing / Truyền thông" → `marketing-digital-basics`

---

## 🤖 AI CHATBOT — SOCRATIC METHOD (Dùng @xenova/transformers)

### Nguyên tắc hoạt động:
- Chatbot **KHÔNG trả lời trực tiếp** mà **đặt câu hỏi dẫn dắt** để người học tự khám phá
- Dựa trên nội dung bài học (transcript/topic) → generate câu hỏi gợi mở
- Khi người dùng trả lời → chatbot phản hồi bằng câu hỏi sâu hơn hoặc xác nhận + hỏi thêm

### Implementation:
```typescript
// components/course/ChatBot.tsx
import { pipeline } from '@xenova/transformers';

// Dùng model text-generation nhỏ chạy trong browser
// Hoặc: dùng rule-based Q&A với câu hỏi được hardcode theo từng bài học
// (Ưu tiên approach 2 cho stability, approach 1 cho AI feel)

// Approach được chọn: HYBRID
// - Câu hỏi Socratic: hardcode theo lesson (đảm bảo chất lượng sư phạm)
// - Phản hồi user input: dùng @xenova/transformers sentiment + keyword extraction
//   để nhận biết user đang hiểu hay chưa → chọn câu hỏi follow-up phù hợp
```

**Cài đặt:**
```bash
npm install @xenova/transformers
```

**Lưu ý quan trọng:** Model sẽ download lần đầu (~50-100MB). Cache trong browser. Không tốn tiền API.

---

## 🎥 VIDEO PLAYER BẢO MẬT

### File: `components/course/VideoPlayer.tsx`

```typescript
// Yêu cầu implement đầy đủ:
// 1. YouTube IFrame API wrapper
// 2. CSS overlay ngăn chuột phải + kéo thả
// 3. Watermark động (email + tên user) hiển thị random position, opacity thấp
// 4. Block keyboard shortcuts nguy hiểm
// 5. Detect screen recording attempt (experimental: Page Visibility API)
// 6. Không cho embed ra ngoài domain (Next.js header: X-Frame-Options)

const VideoPlayer = ({ youtubeId, userEmail, userName }) => {
  // Watermark SVG overlay với user info
  // IFrame với params: ?enablejsapi=1&rel=0&modestbranding=1&disablekb=1
  // onContextMenu={(e) => e.preventDefault()}
  // CSS: userSelect: 'none', pointerEvents trên overlay
}
```

---

## 📹 LIVE SESSION (Jitsi Meet)

### File: `components/course/LiveSession.tsx`

```typescript
// Nhúng Jitsi Meet SDK
// Script src: https://meet.jit.si/external_api.js

// Admin flow:
// 1. Admin tạo live session trong course (nhập tiêu đề + thời gian)
// 2. System generate Jitsi room ID = `blendedu-{courseSlug}-{timestamp}`
// 3. Admin bấm "Bắt đầu Live" → mở Jitsi với moderator role
// 4. Học viên thấy nút "Tham gia Live Session" khi session đang active (isActive = true)

const LiveSession = ({ roomId, isHost, userName }) => {
  // Load JitsiMeetExternalAPI
  // Host: subject, startAudioOnly: false, prejoinPageEnabled: false
  // Learner: join với display name = tên người dùng
}
```

---

## 🔐 TRANG ĐĂNG NHẬP `/login`

### Mục đích: Điểm vào duy nhất cho cả user lẫn admin — không có trang login riêng.

### Layout toàn trang — Split screen 50/50:

**Nửa trái — Branding panel (nền gradient xanh):**
- Logo BlenEdU (icon + chữ, màu trắng) căn góc trên trái
- Tagline lớn chính giữa: `"Xóa bỏ khoảng cách,
Đột phá kỹ năng"` — font display, 2.2rem, trắng, bold
- 3 bullet points dưới tagline (icon check trắng):
  - ✓ Lộ trình học cá nhân hóa bằng AI
  - ✓ Video bảo mật — không lo mất chất xám
  - ✓ Cộng đồng học viên tương tác thật
- Góc dưới: avatar stack (3-4 avatar tròn chồng nhau) + text `"Đã có 100+ học viên tham gia"`
- Decorative: 2 circle blur trắng opacity 10% để tạo depth

**Nửa phải — Form panel (nền trắng):**
- Căn giữa dọc, max-width 400px, padding 48px
- Heading: `"Chào mừng trở lại"` — h2, font display, slate-900
- Subtext: `"Đăng nhập để tiếp tục lộ trình học của bạn"` — sm, slate-500
- Khoảng cách 32px rồi đến form

**Nút Google OAuth** (ưu tiên đặt trước, nổi bật):
```
[  G  Tiếp tục với Google  ]   ← border, hover bg xanh nhạt
```

**Divider:** `── hoặc đăng nhập bằng email ──`

**Form fields:**
- Label "Email" + input type email, placeholder `hoten@email.com`
- Label "Mật khẩu" + input type password + icon eye toggle show/hide
- Checkbox "Ghi nhớ đăng nhập" + Link "Quên mật khẩu?" cùng hàng
- Button primary `[Đăng nhập]` — full width, gradient xanh

**Dưới form:**
`Chưa có tài khoản?` [Đăng ký ngay] — link xanh

### Trạng thái & validation:
- Email sai format → border đỏ + message lỗi inline ngay dưới field
- Sai mật khẩu → toast error: "Email hoặc mật khẩu không đúng"
- Loading khi submit → button disabled + spinner bên trong
- Sau login thành công:
  - `onboarded = false` → redirect `/onboarding`
  - `onboarded = true` → redirect `/dashboard`
  - `isAdmin = true` → redirect `/dashboard` (có thêm nav admin trong sidebar)

### Mobile (< 768px):
- Ẩn nửa trái branding panel
- Hiện logo nhỏ + tagline 1 dòng trên cùng form
- Form full width, padding 24px

---

## 📝 TRANG ĐĂNG KÝ `/register`

### Layout: Giống trang login — split screen, nửa trái giữ nguyên branding.

### Nửa phải — Form đăng ký:
- Heading: `"Tạo tài khoản miễn phí"`
- Subtext: `"Bắt đầu hành trình học tập của bạn hôm nay"`

**Form fields (theo thứ tự từ trên xuống):**

1. **Họ và tên** — input text, placeholder `Nguyễn Văn A`
   - Validate: tối thiểu 2 từ, không chứa số
2. **Email** — input email, placeholder `email@example.com`
   - Validate: format hợp lệ + check realtime xem email đã tồn tại chưa (debounce 500ms gọi API)
   - Nếu đã tồn tại → inline message: "Email này đã có tài khoản. [Đăng nhập?]"
3. **Số điện thoại** — input tel, placeholder `0901 234 567`
   - Validate: 10 số, bắt đầu bằng 0
4. **Mật khẩu** — input password + eye toggle
   - Strength indicator bar ngay dưới (yếu/trung bình/mạnh — đỏ/vàng/xanh)
   - Hint: "Tối thiểu 8 ký tự"
5. **Xác nhận mật khẩu** — input password
   - Validate: khớp với field trên, show ✓ xanh khi đúng

**Checkbox bắt buộc tick:**
`[ ] Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật`

**Button:** `[Tạo tài khoản]` — full width, gradient xanh

**Dưới form:** `Đã có tài khoản?` [Đăng nhập]

### Sau khi submit thành công:
- Tạo user trong DB → auto login → redirect `/onboarding`
- Toast success: "Tài khoản đã được tạo! Hãy hoàn thành hồ sơ của bạn."

---

## 🎯 TRANG ONBOARDING `/onboarding`

### Mục đích: Thu thập thông tin → ML engine tính lộ trình → lưu vào DB.
### Chỉ hiển thị 1 lần duy nhất sau khi tạo tài khoản. Admin bỏ qua trang này.

### Layout toàn trang:
- Nền: `var(--surface)` — trắng pha xanh cực nhạt
- Logo nhỏ góc trên trái
- Content centered: max-width 560px, auto margin
- Step indicator 3 dots ở trên (xem design system section)

---

### BƯỚC 1 / 3 — "Bạn là ai?"

**Heading lớn:** `"Xin chào! Hãy cho chúng tôi biết về bạn 👋"`
**Subtext:** `"Chúng tôi sẽ tùy chỉnh lộ trình học phù hợp nhất với bạn"`

**4 option cards (single-select, chọn 1):**

| Icon | Label | Mô tả ngắn |
|------|-------|------------|
| 🎓 | Sinh viên / Học sinh | Đang học tại trường, chuẩn bị ra trường |
| 💼 | Người đi làm | Muốn nâng cao kỹ năng trong công việc hiện tại |
| 🔄 | Người chuyển ngành | Muốn thay đổi hướng nghề nghiệp |
| 👨‍🏫 | Giảng viên / Chuyên gia | Muốn chia sẻ kiến thức và xây dựng thương hiệu |

Design mỗi card: icon lớn + label bold + description nhỏ + radio circle góc phải.
Khi chọn: border xanh + nền xanh nhạt + ring glow + radio filled.

**Button:** `[Tiếp theo →]` — disabled cho đến khi chọn 1 option.

---

### BƯỚC 2 / 3 — "Bạn quan tâm lĩnh vực nào?"

**Heading:** `"Bạn muốn phát triển kỹ năng gì?"`
**Subtext:** `"Có thể chọn nhiều lĩnh vực"` — badge hint màu xanh nhạt

**4 option cards (multi-select, chọn nhiều):**

| Icon | Lĩnh vực | Mô tả | Màu accent |
|------|----------|-------|------------|
| 🏢 | Quản trị & Lãnh đạo | Ra quyết định, quản lý đội nhóm, tư duy chiến lược | xanh dương |
| 💬 | Kỹ năng mềm & Giao tiếp | Thuyết trình, đàm phán, xử lý xung đột | xanh lá |
| 💻 | Lập trình & Công nghệ | Python, web development, tư duy kỹ thuật | tím |
| 📣 | Marketing & Truyền thông | Content, quảng cáo số, xây dựng thương hiệu | cam |

Mỗi card có colored strip bên trái theo màu accent lĩnh vực.
Khi chọn nhiều: tất cả card được chọn đều highlight đồng thời.

**Counter:** "Đã chọn 2 lĩnh vực" — cập nhật realtime.
**Button:** `[Tiếp theo →]` — disabled nếu chưa chọn gì.
**Back button:** `← Quay lại` text link, góc trái.

---

### BƯỚC 3 / 3 — "Bạn đang gặp vấn đề gì?"

**Heading:** `"Điều gì đang cản trở bạn phát triển?"`
**Subtext:** `"Giúp chúng tôi hiểu để đề xuất đúng giải pháp"`

**6 option chips (multi-select, dạng chip tag nhỏ, không phải card lớn):**
- Thiếu kỹ năng thực tế để xin việc
- Học xong không áp dụng được vào thực tế
- Không có thời gian học tập trung
- Cảm thấy cô đơn, thiếu động lực khi học online
- Không biết bắt đầu từ đâu
- Nội dung quá lý thuyết, không cập nhật

Design chip: `px-4 py-2 rounded-full border` — khi chọn: `bg-blue-600 text-white border-blue-600`.

**Text input mở rộng thêm:**
```
Thêm vấn đề khác của bạn... (optional)
[_________________________________]
```

**Summary card** (xuất hiện sau khi chọn ít nhất 1 vấn đề):
```
┌─────────────────────────────────────────┐
│  🎯 Lộ trình gợi ý của bạn:            │
│  "Nhập Môn Quản Trị Doanh Nghiệp"      │
│  Dựa trên: Quản trị · Thiếu kỹ năng    │
└─────────────────────────────────────────┘
```
Card này preview kết quả ML trước khi user bấm hoàn thành — tạo cảm giác hệ thống đang "hiểu" mình.

**Button:** `[Bắt đầu học ngay 🚀]` — full width, lớn hơn, gradient đậm hơn.

**Sau khi submit:**
- Gọi `POST /api/onboarding` → lưu UserProfile + gọi ML → set `onboarded = true`
- Loading animation 1.5s với text: "Đang tạo lộ trình cá nhân cho bạn..."
- Redirect `/dashboard`

---

## 🏠 TRANG DASHBOARD NGƯỜI HỌC `/dashboard`

### Layout tổng thể:
- Sidebar cố định bên trái (width 256px) — xem design system
- Content area bên phải — scroll dọc
- Topbar không cần thiết nếu đã có sidebar

### Sidebar navigation items (theo thứ tự):
```
[Logo BlenEdU]

🏠  Trang chủ          ← /dashboard
📚  Khóa học của tôi  ← /my-courses
🔍  Khám phá          ← /explore
👤  Hồ sơ             ← /profile

── (divider chỉ hiện với admin) ──
⚙️  Quản lý hệ thống  ← /admin

── (separator) ──
[Avatar + Tên + Email]
[Đăng xuất icon]
```

### Content area — Các section từ trên xuống:

**Section 1 — Greeting bar:**
```
Chào buổi sáng, Tuấn 👋          [Thứ Ba, 20/5/2025]
"Mỗi ngày một bài học — thói quen tạo nên sự khác biệt."
```
Quote thay đổi mỗi ngày (hardcode mảng 7 quotes, lấy theo `dayOfWeek`).

**Section 2 — Hero: Khóa học được gợi ý (full width card xanh):**
- Tên khóa học lớn
- Mô tả ngắn 1-2 dòng
- Progress bar + phần trăm + "X bài còn lại"
- Nút `[Tiếp tục học →]` — màu trắng, text xanh
- Badge góc: `🤖 Được AI gợi ý cho bạn`
- Nếu chưa bắt đầu: nút `[Bắt đầu ngay]` thay vì "Tiếp tục"

**Section 3 — Stats nhỏ (3 số liệu ngang):**
```
[📖 2 bài đã học]  [⏱ 45 phút học]  [🔥 3 ngày liên tiếp]
```
3 card nhỏ, border xanh nhạt, số lớn màu xanh.

**Section 4 — Lịch Live Session sắp tới:**
- Chỉ hiện nếu có live session trong 7 ngày tới
- Card ngang: tên session, khóa học, ngày giờ, nút `[Đặt nhắc nhở]` + `[Tham gia khi đến giờ]`
- Badge `🔴 LIVE` nhấp nháy nếu đang diễn ra → nút đổi thành `[Vào học ngay]`
- Nếu không có live nào: ẩn section này đi

**Section 5 — Khám phá các khóa học khác (grid 3 cột):**
- Heading: "Khám phá thêm"
- Hiển thị 3 khóa còn lại (không phải khóa đang học)
- Mỗi card: màu strip theo lĩnh vực, tên, mô tả ngắn, số bài, thời lượng
- Hover: lift + shadow đậm hơn

**Section 6 — Cộng đồng học tập:**
- Heading: "Tham gia cộng đồng"
- 4 card nhỏ (1 cho mỗi lĩnh vực) — icon Zalo + tên nhóm + số thành viên (placeholder) + nút `[Tham gia Zalo]`
- Hiển thị tất cả 4 nhóm, không chỉ nhóm của khóa đang học

---

## 📚 TRANG KHÓA HỌC CỦA TÔI `/my-courses`

### Mục đích: Xem tất cả khóa đang học + lịch sử tiến độ.

### Layout: Sidebar (giống dashboard) + content area

### Content:

**Tabs:**
- `Đang học (2)` | `Chưa bắt đầu (2)` | `Đã hoàn thành (0)`

**Mỗi khóa hiển thị dạng row card ngang:**
```
[Field color strip] [Thumbnail placeholder] [Tên khóa — mô tả ngắn] [Progress 60%] [Tiếp tục →]
```
- Progress bar full width dưới tên
- Text: "Bài 2/3 · Học lần cuối: 2 ngày trước"
- Nút action: "Tiếp tục học" / "Bắt đầu" / "Xem lại"

**Empty state** khi tab trống:
- Illustration SVG đơn giản (sách + dấu hỏi)
- Text: "Bạn chưa có khóa học nào ở đây"
- Nút: `[Khám phá khóa học]` → link `/explore`

---

## 🔍 TRANG KHÁM PHÁ `/explore`

### Mục đích: Browse tất cả khóa học, filter theo lĩnh vực.

### Layout: Sidebar + content

### Content:

**Filter bar (horizontal, sticky top):**
```
[Tất cả] [Quản trị] [Kỹ năng mềm] [Lập trình] [Marketing]
```
Dạng chip filter — click để filter, active chip màu xanh solid.

**Grid 3 cột — tất cả 4 khóa học:**
Mỗi card giống course card ở dashboard.
Badge `✓ Đang học` nếu user đã enroll.
Badge `🤖 Gợi ý cho bạn` cho khóa được ML recommend.

**Không có search bar** — prototype nhỏ, chỉ có 4 khóa.

---

## 📖 TRANG CHI TIẾT KHÓA HỌC `/course/[slug]`

### Layout 3 cột cố định (không scroll ngang):

```
[240px sidebar trái] | [Flexible center] | [320px chatbot phải]
```

Toàn trang height = 100vh, overflow hidden ngoài. Mỗi panel scroll độc lập.

---

### PANEL TRÁI — Danh sách bài học

**Header panel:**
- Nút back `← Về Dashboard` nhỏ, link
- Tên khóa học (2 dòng nếu dài, font bold 14px)
- Progress bar nhỏ + phần trăm

**List bài học (scroll độc lập):**

Mỗi bài học là một row:
```
[Status icon] [Số thứ tự] [Tên bài] [Thời lượng]
```

Status icons:
- ✅ Xanh lá = đã hoàn thành
- ▶️ Xanh dương = đang học (active, có bg xanh nhạt)
- 🔒 Xám = chưa mở khóa (mờ 50%)

Lock logic:
- Bài 1 luôn mở
- Bài 2 mở sau khi hoàn thành Bài 1
- Bài 3 mở sau khi hoàn thành Bài 2

Click bài đang khóa → tooltip nhỏ: "Hoàn thành bài trước để mở khóa"

**Footer panel (cố định dưới cùng):**
```
[💬 Nhóm Zalo]       ← link mở tab mới
[🔴 Live Session]    ← chỉ hiện khi isActive = true, nhấp nháy
```

---

### PANEL GIỮA — Video + thông tin bài học

**Video player (aspect ratio 16:9, full width panel):**
- YouTube IFrame với full security layer
- Watermark tên + email user ở góc ngẫu nhiên, opacity 15%
- Overlay trong suốt block chuột phải
- Controls YouTube bình thường (play/pause/volume) nhưng không có nút download
- Sau khi xem hết video (onEnded event): auto show nút "Đánh dấu hoàn thành"

**Thông tin bài học (scroll, dưới video):**
- Badge: `Bài 1 · 12 phút`
- Heading h2: tên bài học
- Paragraph: mô tả bài học (2-4 câu)
- Divider
- **Tóm tắt nội dung chính** (bullet 3-5 điểm, từ field `transcript` trong DB)

**Action buttons:**
```
[✓ Đánh dấu hoàn thành]     [→ Bài tiếp theo]
```
- "Đánh dấu hoàn thành" → gọi `POST /api/progress` → unlock bài tiếp → toast "Hoàn thành! Bài tiếp theo đã mở khóa 🎉"
- Nếu đã hoàn thành: nút đổi thành `[✓ Đã hoàn thành]` — outline xanh, disabled
- "Bài tiếp theo" → chỉ active khi bài hiện tại đã complete

**Nếu là bài cuối cùng và vừa hoàn thành:**
- Show modal/overlay chúc mừng:
  ```
  🎉 Chúc mừng! Bạn đã hoàn thành khóa học!
  [Về Dashboard]  [Khám phá khóa học khác]
  ```

---

### PANEL PHẢI — AI Chatbot Socratic

**Header chatbot:**
- Icon bot tròn gradient xanh-cyan
- Tên: "Trợ lý học tập"
- Dot xanh lá "Đang hoạt động"
- Tooltip icon (?) giải thích: "Bot sẽ đặt câu hỏi để giúp bạn tự khám phá kiến thức"

**Chat area (scroll độc lập):**

Tin nhắn bot (trái):
- Avatar bot nhỏ + bubble xám nhạt, bo tròn
- Câu hỏi Socratic theo bài học (hardcode theo lesson)

Tin nhắn user (phải):
- Bubble gradient xanh

**Trạng thái bot:**
- Khi user mới vào bài → bot tự động gửi câu hỏi khởi đầu sau 1.5s (delay để tự nhiên)
- Khi user trả lời → bot typing indicator (3 dots) 1-2s → rồi reply câu hỏi follow-up
- Câu hỏi follow-up thứ 2 sâu hơn câu đầu
- Sau câu trả lời thứ 2: bot nói "Tuyệt vời! Bạn đang hiểu đúng hướng rồi. Hãy xem video để khám phá thêm nhé 📹"

**Input area (cố định dưới cùng):**
```
[Nhập câu trả lời của bạn...        ] [Send ↑]
```
- Enter để gửi
- Shift+Enter xuống dòng
- Disabled khi bot đang "typing"

**Gợi ý trả lời nhanh** (optional — hiện sau câu hỏi đầu tiên):
```
[Theo tôi...] [Tôi chưa rõ] [Cho tôi ví dụ]
```
3 chip click nhanh cho người ngại gõ.

---

## 👤 TRANG HỒ SƠ `/profile`

### Layout: Sidebar + content (centered, max-width 640px)

### Sections:

**Section 1 — Avatar & tên (header profile):**
```
[Avatar lớn 80px, có nút chỉnh sửa nhỏ overlay]
Nguyễn Văn A
kairenku@gmail.com  ·  0901234567
[Chỉnh sửa hồ sơ]
```

**Section 2 — Thông tin cá nhân (card trắng):**
Form edit inline:
- Họ và tên
- Email (readonly — không đổi được email OAuth)
- Số điện thoại
- Nút `[Lưu thay đổi]`

**Section 3 — Lộ trình học của tôi (card xanh nhạt):**
- Label: "Được AI gợi ý dựa trên hồ sơ của bạn"
- Tên khóa học được recommend
- Tags lĩnh vực quan tâm (chip list)
- Nút `[Cập nhật sở thích]` → mở modal onboarding lại (3 bước) để re-run ML

**Section 4 — Thống kê học tập:**
```
[📖 Tổng bài đã học: 4]  [⏱ Tổng giờ học: 1.5h]  [📅 Ngày tham gia: 20/5/2025]
```

**Section 5 — Đổi mật khẩu (chỉ hiện với account email, ẩn với Google OAuth):**
- Input mật khẩu hiện tại
- Input mật khẩu mới + strength bar
- Input xác nhận mật khẩu mới
- Nút `[Đổi mật khẩu]`

**Section 6 — Đăng xuất:**
- Nút `[Đăng xuất]` — outline đỏ nhạt, góc dưới cùng

---

## ⚙️ TRANG ADMIN — TỔNG QUAN `/admin`

### Layout: Sidebar người dùng (có mục "Quản lý hệ thống" active) + content

Admin thấy sidebar y hệt user — nhưng mục "Quản lý hệ thống" được highlight.
Content area của `/admin` có **sub-navigation tabs ngang** ở trên:

```
[📊 Tổng quan]  [👥 Người dùng]  [📚 Khóa học]  [📹 Live Session]
```

---

### TAB 1 — TỔNG QUAN

**Row 1 — 4 stat cards:**

| Icon | Label | Value | Delta |
|------|-------|-------|-------|
| 👥 | Tổng người dùng | số từ DB | +X hôm nay |
| 📚 | Khóa học đang mở | số từ DB | X lĩnh vực |
| 📈 | Lượt học hôm nay | số từ DB | +X% so hôm qua |
| 📹 | Live Session sắp tới | số từ DB | Gần nhất: [ngày] |

**Row 2 — Biểu đồ + bảng (2 cột):**

Cột trái: **Biểu đồ đăng ký theo ngày** (7 ngày gần nhất)
- Dùng thư viện `recharts` (đã có trong deps)
- Bar chart đơn giản, màu xanh, không có legend phức tạp
- X-axis: ngày (T2, T3...), Y-axis: số user mới

Cột phải: **Top 3 lĩnh vực được chọn nhiều nhất**
- Dạng ranked list với progress bar ngang
- Lấy từ aggregate của `UserProfile.interests`
```
1. Kỹ năng mềm    ████████░░ 68%  (34 users)
2. Lập trình      ██████░░░░ 52%  (26 users)
3. Quản trị       ████░░░░░░ 38%  (19 users)
4. Marketing      ███░░░░░░░ 28%  (14 users)
```

**Row 3 — Pain points phổ biến nhất:**
- Word cloud đơn giản hoặc ranked tag list
- Dùng để founder hiểu user đang gặp vấn đề gì nhiều nhất
```
[Thiếu kỹ năng thực tế ×38] [Không biết bắt đầu ×29] [Học không áp dụng được ×24] ...
```

**Row 4 — 5 user đăng ký gần nhất:**
- Mini table: avatar + tên + email + lĩnh vực + thời gian đăng ký
- Link "Xem tất cả →" → chuyển sang Tab Người dùng

---

### TAB 2 — NGƯỜI DÙNG

**Search + filter bar:**
```
[🔍 Tìm theo tên hoặc email...] [Lọc: Tất cả ▼] [Xuất CSV ↓]
```
Filter dropdown: Tất cả / Sinh viên / Người đi làm / Chuyển ngành / Chưa hoàn thành onboarding

**Bảng người dùng (full width, có sort):**

Columns:
| # | Người dùng | SĐT | Loại | Lĩnh vực quan tâm | Vấn đề chính | Khóa học | Tiến độ | Tham gia |
|---|------------|-----|------|-------------------|--------------|----------|---------|---------|

- **Người dùng**: avatar nhỏ + tên + email (2 dòng)
- **SĐT**: số điện thoại
- **Loại**: chip badge (Sinh viên / Đi làm / Chuyển ngành)
- **Lĩnh vực**: tags nhỏ, tối đa 2 tags, "+N" nếu nhiều hơn
- **Vấn đề chính**: text ngắn gọn lấy pain point đầu tiên
- **Khóa học**: tên khóa đang học
- **Tiến độ**: mini progress bar + %
- **Tham gia**: "3 ngày trước" (relative time)

**Pagination:** 20 rows/trang, nút Prev/Next + số trang.

**Click vào row** → mở slide-over panel bên phải (không redirect):
```
┌──────────────────────────────────────┐
│  [X]  Chi tiết người dùng            │
│                                      │
│  [Avatar lớn]                        │
│  Nguyễn Văn A                        │
│  email@gmail.com · 0901234567        │
│                                      │
│  Loại: Sinh viên                     │
│  Tham gia: 20/5/2025 14:32          │
│                                      │
│  Lĩnh vực quan tâm:                 │
│  [Quản trị] [Kỹ năng mềm]           │
│                                      │
│  Vấn đề gặp phải:                   │
│  · Thiếu kỹ năng thực tế            │
│  · Cảm thấy cô đơn khi học online   │
│                                      │
│  Tiến độ học:                        │
│  Nhập môn Quản trị — 2/3 bài (66%)  │
│  ████████░░                          │
│                                      │
│  [Đóng]                              │
└──────────────────────────────────────┘
```

**Export CSV:**
- Button "Xuất CSV" → download file `users_YYYYMMDD.csv`
- Columns: ID, Tên, Email, SĐT, Loại user, Lĩnh vực, Pain points, Khóa học, Tiến độ, Ngày tham gia

---

### TAB 3 — KHÓA HỌC

(Đã đặc tả chi tiết ở phần "Zalo Link" phía trên — giữ nguyên, chỉ bổ sung thêm)

**Ngoài Zalo link, mỗi card khóa học còn có:**

**Thống kê nhanh** hiển thị trên card:
```
👥 24 học viên đang học  ·  ✅ 8 đã hoàn thành  ·  📊 Tiến độ TB: 45%
```

**Expand card** (click vào tên khóa) để xem danh sách bài học:
```
  ├─ Bài 1: [Tiêu đề] · 12 phút · YouTube: [ID]
  ├─ Bài 2: [Tiêu đề] · 14 phút · YouTube: [ID]
  └─ Bài 3: [Tiêu đề] · 11 phút · YouTube: [ID]
```
(Readonly — prototype không cần edit bài học, chỉ xem)

---

### TAB 4 — LIVE SESSION

**Phần trên — Tạo live session mới:**

```
┌─────────────────────────────────────────────────────┐
│  Tạo buổi học trực tiếp mới                         │
│                                                     │
│  Khóa học:     [Chọn khóa học ▼]                   │
│  Tiêu đề:      [Tên buổi học, vd: Q&A Tuần 1]     │
│  Thời gian:    [Chọn ngày]  [Chọn giờ]             │
│                                                     │
│  [Tạo Live Session]                                 │
└─────────────────────────────────────────────────────┘
```

Sau khi tạo:
- Sinh Jitsi room ID: `blendedu-{slug}-{timestamp}`
- Lưu vào DB với `isActive = false`
- Show toast: "Đã tạo! Nhớ bật 'Bắt đầu' đúng giờ để học viên tham gia"

**Phần dưới — Danh sách tất cả live sessions:**

Mỗi session row:
```
[Tên khóa] | [Tiêu đề session] | [Ngày giờ] | [Trạng thái] | [Actions]
```

Trạng thái:
- `Sắp diễn ra` — badge xanh nhạt
- `Đang diễn ra` — badge đỏ nhấp nháy + "LIVE"
- `Đã kết thúc` — badge xám

Actions:
- **Nút `[▶ Bắt đầu]`** — chỉ hiện khi session sắp hoặc đến giờ:
  - Set `isActive = true` trong DB → học viên thấy nút "Tham gia Live" ngay lập tức
  - Mở tab mới với Jitsi room (admin là host/moderator)
- **Nút `[■ Kết thúc]`** — khi session đang diễn ra:
  - Set `isActive = false` → nút tham gia biến mất với học viên
  - Confirm dialog: "Bạn chắc chắn muốn kết thúc buổi học?"
- **Nút `[🗑 Xoá]`** — chỉ xoá được session chưa diễn ra
- **Link Jitsi** — icon copy link → copy room URL vào clipboard + toast "Đã copy link!"

**Jitsi room URL format:**
`https://meet.jit.si/blendedu-management-101-1716192000`

---

## 👤 TRẢI NGHIỆM ADMIN KHI ĐĂNG NHẬP — UX QUAN TRỌNG

Admin (`kairenku@gmail.com`) đăng nhập vào nền tảng sẽ thấy **đúng giao diện người dùng bình thường** (dashboard học tập, các khóa học, v.v.) — **không bị redirect thẳng vào trang quản lý**. Điểm khác biệt duy nhất là sidebar và thanh điều hướng có thêm **mục "Quản lý" đặc biệt** để chuyển sang admin panel.

### Nguyên tắc thiết kế:
- Admin cũng là người dùng thật → cần trải nghiệm sản phẩm như user thường để hiểu UX
- Không có trang login riêng cho admin — cùng 1 trang login, cùng 1 flow
- Sau khi login, middleware detect `isAdmin = true` → render thêm admin navigation item vào sidebar

---

### Sidebar — Khi admin đăng nhập

Sidebar của người dùng thường có các mục: Trang chủ, Khóa học, Hồ sơ.

**Khi user là admin, thêm vào dưới cùng sidebar (phía trên avatar) một divider + mục đặc biệt:**

```tsx
// components/layout/Sidebar.tsx

{session?.user?.isAdmin && (
  <>
    {/* Divider */}
    <div className="my-3 h-px bg-[#E2EAF4]" />

    {/* Admin nav item — thiết kế nổi bật hơn nav thường */}
    <Link
      href="/admin"
      className="
        flex items-center gap-3 px-4 py-3 rounded-xl mb-1
        font-semibold text-sm
        bg-gradient-to-r from-blue-600/10 to-cyan-500/10
        border border-blue-200/60
        text-blue-700 hover:text-blue-800
        hover:from-blue-600/15 hover:to-cyan-500/15
        hover:border-blue-300
        transition-all duration-200
        group
      "
    >
      <div className="w-5 h-5 relative">
        <LayoutDashboard size={18} className="text-blue-600" />
        {/* Dot badge nhỏ màu xanh góc trên phải icon */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
      </div>
      <span>Quản lý hệ thống</span>
      <ChevronRight size={14} className="ml-auto text-blue-400 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  </>
)}
```

**Visual style của mục "Quản lý hệ thống":**
- Nền: gradient xanh rất nhạt (`from-blue-600/10 to-cyan-500/10`)
- Viền: `border-blue-200/60` — phân biệt với nav item thường
- Có badge dot nhỏ trên icon để thu hút mắt nhìn
- Có chevron `>` bên phải → gợi ý đây là đường dẫn sang trang khác
- Khi đang ở trang `/admin/*`, mục này được highlight đậm hơn

---

### Header / Topbar (nếu có) — Admin badge

Nếu layout dùng topbar thay sidebar, thêm admin badge cạnh tên user:

```tsx
{session?.user?.isAdmin && (
  <span className="
    text-[10px] font-bold uppercase tracking-wider
    bg-blue-600 text-white
    px-2 py-0.5 rounded-md
    ml-2
  ">
    Admin
  </span>
)}
```

---

### Breadcrumb khi admin vào trang quản lý

Khi admin click "Quản lý hệ thống" và vào `/admin`, hiển thị breadcrumb trên cùng:

```tsx
<div className="flex items-center gap-2 text-sm mb-6">
  <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
    <Home size={14} /> Trang chủ
  </Link>
  <ChevronRight size={14} className="text-slate-400" />
  <span className="text-slate-800 font-semibold">Quản lý hệ thống</span>
</div>
```

---

### Middleware logic — detect admin

```typescript
// middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Chưa đăng nhập → về login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Chưa onboarding → về onboarding (trừ admin)
  if (token && !token.onboarded && !token.isAdmin && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Vào /admin mà không phải admin → về dashboard
  if (pathname.startsWith('/admin') && !token?.isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/course/:path*', '/admin/:path*', '/onboarding'],
}
```

---

### NextAuth session — expose isAdmin ra client

```typescript
// lib/auth.ts — NextAuth config
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.isAdmin = (user as any).isAdmin ?? false
      token.onboarded = (user as any).onboarded ?? false
    }
    return token
  },
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).isAdmin = token.isAdmin
      (session.user as any).onboarded = token.onboarded
    }
    return session
  },
},
```

```typescript
// types/next-auth.d.ts — extend Session type
import 'next-auth'
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin: boolean
      onboarded: boolean
    }
  }
}
```

---

## 🔧 ADMIN DASHBOARD (`/admin`)

### Tabs:
1. **Tổng quan** — Số user, user mới hôm nay, khóa học phổ biến nhất
2. **Người dùng** — Bảng danh sách user: tên, email, SĐT, vai trò, lĩnh vực quan tâm, pain points, tiến độ học, ngày tạo
3. **Khóa học** — Quản lý courses, toggle publish/unpublish, **cập nhật link Zalo nhóm** theo từng khóa
4. **Live Session** — Tạo phòng live cho khóa học cụ thể, bật/tắt isActive, xem link Jitsi

---

### Tab "Khóa học" — Chi tiết tính năng cập nhật Zalo Link

Đây là tính năng quan trọng: admin có thể **thay đổi link nhóm Zalo** cho từng khóa học bất cứ lúc nào mà không cần deploy lại code. Link mới sẽ ngay lập tức áp dụng cho tất cả người học trong khóa đó.

#### Giao diện Tab Khóa Học:

```tsx
// app/admin/courses/page.tsx

// Render mỗi khóa học dưới dạng card có thể expand
{courses.map(course => (
  <div key={course.id} className="
    bg-white border border-[#E2EAF4] rounded-2xl overflow-hidden
    shadow-sm hover:shadow-md transition-shadow duration-200 mb-4
  ">
    {/* Header card — luôn hiển thị */}
    <div className="flex items-center gap-4 p-6">

      {/* Field color strip dọc */}
      <div className={`w-1 self-stretch rounded-full ${fieldColor[course.field]}`} />

      {/* Course info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-slate-900 text-base">{course.title}</h3>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            course.isPublished
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {course.isPublished ? '● Đang mở' : '○ Ẩn'}
          </span>
        </div>
        <p className="text-sm text-slate-500">{course.field} · {course.lessons.length} bài học</p>

        {/* Zalo link preview */}
        <div className="flex items-center gap-2 mt-2">
          <MessageCircle size={13} className="text-blue-500 flex-shrink-0" />
          {course.zaloLink ? (
            <a
              href={course.zaloLink}
              target="_blank"
              className="text-xs text-blue-600 hover:underline truncate max-w-xs"
            >
              {course.zaloLink}
            </a>
          ) : (
            <span className="text-xs text-slate-400 italic">Chưa có link Zalo</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Toggle publish */}
        <button
          onClick={() => togglePublish(course.id, course.isPublished)}
          className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all duration-200 ${
            course.isPublished
              ? 'border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          {course.isPublished ? 'Ẩn khóa học' : 'Mở khóa học'}
        </button>

        {/* Nút chỉnh sửa Zalo link — mở inline editor */}
        <button
          onClick={() => setEditingZalo(course.id)}
          className="
            flex items-center gap-1.5 text-xs font-semibold
            px-3 py-2 rounded-lg
            bg-blue-50 hover:bg-blue-100
            text-blue-700 border border-blue-200 hover:border-blue-300
            transition-all duration-200
          "
        >
          <Link2 size={13} />
          {course.zaloLink ? 'Sửa Zalo' : 'Thêm Zalo'}
        </button>
      </div>
    </div>

    {/* === INLINE ZALO EDITOR — xuất hiện khi click "Sửa Zalo" === */}
    {editingZalo === course.id && (
      <div className="
        border-t border-[#E2EAF4]
        bg-[#F8FAFF]
        p-6
        animate-fade-up
      ">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <MessageCircle size={15} className="text-blue-500" />
          Cập nhật link nhóm Zalo — <span className="font-normal text-slate-500">{course.title}</span>
        </p>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="url"
              defaultValue={course.zaloLink || ''}
              onChange={e => setZaloInput(e.target.value)}
              placeholder="https://zalo.me/g/xxxxxxx"
              className="
                w-full bg-white border border-[#E2EAF4]
                focus:border-blue-400 focus:ring-4 focus:ring-blue-100
                rounded-xl px-4 py-3
                text-sm text-slate-800 placeholder:text-slate-400
                outline-none transition-all duration-200
                font-mono
              "
            />
            <p className="text-xs text-slate-400 mt-1.5 ml-1">
              Link dạng: https://zalo.me/g/xxxxxx hoặc https://zalo.me/0xxxxxxxxx
            </p>
          </div>

          {/* Nút lưu */}
          <button
            onClick={() => saveZaloLink(course.id)}
            disabled={isSaving}
            className="
              flex items-center gap-2 px-5 py-3 rounded-xl
              bg-gradient-to-r from-blue-600 to-blue-500
              hover:from-blue-700 hover:to-blue-600
              text-white text-sm font-semibold
              shadow-[0_4px_12px_rgba(59,130,246,0.35)]
              hover:shadow-[0_8px_24px_rgba(59,130,246,0.45)]
              hover:-translate-y-0.5
              disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
              transition-all duration-200
              whitespace-nowrap
            "
          >
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" /> Đang lưu...</>
            ) : (
              <><Save size={14} /> Lưu link</>
            )}
          </button>

          {/* Nút huỷ */}
          <button
            onClick={() => { setEditingZalo(null); setZaloInput('') }}
            className="px-4 py-3 rounded-xl border border-[#E2EAF4] text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            Huỷ
          </button>
        </div>

        {/* Preview link sau khi nhập */}
        {zaloInput && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <ExternalLink size={13} className="text-blue-500" />
            <span className="text-xs text-slate-600">Xem thử: </span>
            <a href={zaloInput} target="_blank" className="text-xs text-blue-600 hover:underline truncate">{zaloInput}</a>
          </div>
        )}
      </div>
    )}
  </div>
))}
```

#### State management trong component:

```tsx
const [editingZalo, setEditingZalo] = useState<string | null>(null)  // courseId đang edit
const [zaloInput, setZaloInput] = useState('')
const [isSaving, setIsSaving] = useState(false)

const saveZaloLink = async (courseId: string) => {
  if (!zaloInput.trim()) return
  setIsSaving(true)
  try {
    const res = await fetch(`/api/admin/courses/${courseId}/zalo`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zaloLink: zaloInput.trim() }),
    })
    if (res.ok) {
      // Cập nhật local state ngay lập tức (optimistic update)
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, zaloLink: zaloInput.trim() } : c
      ))
      setEditingZalo(null)
      setZaloInput('')
      toast.success('Đã cập nhật link Zalo!', {
        description: 'Học viên sẽ thấy link mới ngay lập tức'
      })
    }
  } catch {
    toast.error('Lưu thất bại', { description: 'Vui lòng thử lại' })
  } finally {
    setIsSaving(false)
  }
}
```

#### API Route — `PATCH /api/admin/courses/[courseId]/zalo`:

```typescript
// app/api/admin/courses/[courseId]/zalo/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  zaloLink: z.string().url('Link không hợp lệ').startsWith('https://', 'Phải bắt đầu bằng https://'),
})

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  // 1. Auth check — chỉ admin mới được gọi
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // 2. Validate input
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // 3. Update DB
  const updated = await prisma.course.update({
    where: { id: params.courseId },
    data: { zaloLink: parsed.data.zaloLink },
    select: { id: true, title: true, zaloLink: true },
  })

  return NextResponse.json({ success: true, course: updated })
}
```

#### Validation link Zalo hợp lệ (frontend):

```typescript
// lib/validators.ts
export function isValidZaloLink(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'zalo.me' || parsed.hostname === 'chat.zalo.me')
    )
  } catch {
    return false
  }
}

// Dùng trong input onChange để show realtime feedback:
const isValid = zaloInput === '' || isValidZaloLink(zaloInput)
// Nếu !isValid → viền input đỏ + tooltip "Chỉ nhận link từ zalo.me"
```

#### Toast sau khi lưu thành công:

```tsx
toast.success('✓ Link Zalo đã được cập nhật!', {
  description: `Học viên trong "${course.title}" sẽ thấy link mới ngay bây giờ`,
  duration: 4000,
})
```

### Admin access:

**Tài khoản admin cố định — seed vào database lúc khởi tạo:**
- **Email:** `kairenku@gmail.com`
- **Mật khẩu:** `kai1412666` (hash bằng bcrypt trước khi lưu)
- **isAdmin:** `true` — **onboarded:** `true` (bỏ qua onboarding)

**Seed trong `prisma/seed.ts`:**
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('kai1412666', 12)
  await prisma.user.upsert({
    where: { email: 'kairenku@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'kairenku@gmail.com',
      password: hashedPassword,
      isAdmin: true,
      onboarded: true,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin seeded: kairenku@gmail.com / kai1412666')
  // ... tiếp tục seed courses
}
main().catch(console.error).finally(() => prisma.$disconnect())
```

**Env variable:**
```env
ADMIN_EMAIL=kairenku@gmail.com
```

**Helper check admin trong `lib/auth.ts`:**
```typescript
export function isAdminUser(email: string | null | undefined): boolean {
  return email === 'kairenku@gmail.com'
}
```

---

## 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL + NEON POSTGRESQL

### Bước 1: Tạo Database trên Neon

1. Truy cập [neon.tech](https://neon.tech) → Đăng ký tài khoản miễn phí
2. Tạo project mới → Đặt tên (vd: `blendedu`)
3. Chọn region: **Singapore** (gần Việt Nam nhất)
4. Copy **Connection String** dạng: `postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
5. Neon cung cấp **Pooled connection** và **Direct connection** — dùng **Pooled** cho production (Vercel serverless)

### Bước 2: Tạo Google OAuth App

1. Vào [console.cloud.google.com](https://console.cloud.google.com)
2. Tạo project mới → APIs & Services → Credentials
3. Tạo OAuth 2.0 Client ID → Web application
4. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
5. Copy `Client ID` và `Client Secret`

### Bước 3: Deploy lên Vercel

```bash
# 1. Push code lên GitHub
git init && git add . && git commit -m "initial" && git push origin main

# 2. Vào vercel.com → Import GitHub repo
# 3. Framework Preset: Next.js (tự detect)
# 4. Thêm Environment Variables:
```

**Environment Variables cần set trên Vercel:**
```env
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=random-secret-string-ít-nhất-32-ký-tự
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
ADMIN_EMAIL=kairenku@gmail.com
```

### Bước 4: Chạy Migration Database

```bash
# Sau khi Vercel deploy thành công, chạy từ máy local (1 lần duy nhất):
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

**Hoặc** dùng Neon's SQL Editor để chạy migration SQL trực tiếp.

### Bước 5: Seed Admin Account

```bash
# Chạy seed để tạo tài khoản admin + dữ liệu khóa học mẫu:
DATABASE_URL="postgresql://..." npx ts-node prisma/seed.ts

# Hoặc dùng Neon SQL Editor (nếu không chạy seed được):
INSERT INTO "User" (id, name, email, password, "isAdmin", onboarded, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin',
  'kairenku@gmail.com',
  -- bcrypt hash của 'kai1412666':
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq5/9Oa',
  true,
  true,
  'ADMIN',
  NOW(),
  NOW()
);
```

> **Tài khoản admin đã fix cứng:**
> - Email: `kairenku@gmail.com`
> - Mật khẩu: `kai1412666`

### File `.env.example` (commit vào repo):
```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ADMIN_EMAIL=kairenku@gmail.com
```

### Prisma Schema cho Neon (quan trọng):
```javascript
// next.config.js — cần thiết cho Prisma trên Vercel
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
}
```

```typescript
// lib/db.ts — Singleton pattern tránh connection pool overflow
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 📦 PACKAGE.JSON — Dependencies Đầy Đủ

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "@prisma/client": "^5.14.0",
    "next-auth": "^4.24.7",
    "bcryptjs": "^2.4.3",
    "@xenova/transformers": "^2.17.2",
    "tailwindcss": "^3.4.3",
    "shadcn-ui": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-tabs": "latest",
    "lucide-react": "^0.379.0",
    "clsx": "^2.1.1",
    "zod": "^3.23.8",
    "react-hook-form": "^7.51.5",
    "@hookform/resolvers": "^3.4.2"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

---

## ✅ CHECKLIST TÍNH NĂNG CẦN IMPLEMENT

### Auth & Onboarding
- [ ] Đăng ký bằng email/password
- [ ] Đăng nhập Google OAuth
- [ ] Middleware bảo vệ routes
- [ ] Onboarding 3 bước (lưu vào UserProfile)
- [ ] Redirect logic sau login

### Dashboard
- [ ] Hiển thị lộ trình được ML gợi ý
- [ ] Danh sách tất cả khóa học
- [ ] Progress bar mỗi khóa
- [ ] Danh sách live session sắp tới

### Khóa học & Video
- [ ] Danh sách bài học có lock/unlock logic
- [ ] YouTube player có security overlay
- [ ] Watermark hiển thị email user
- [ ] Block chuột phải, F12, PrintScreen
- [ ] Mark lesson complete sau khi xem
- [ ] Progress tracking realtime

### AI Chatbot (Socratic)
- [ ] Hiện câu hỏi theo từng bài học
- [ ] User nhập câu trả lời
- [ ] Bot follow-up với câu hỏi sâu hơn
- [ ] @xenova/transformers chạy local (không API)

### Cộng đồng & Live
- [ ] Nút "Vào nhóm Zalo" với link từ DB
- [ ] Hiển thị live session đang active
- [ ] Join Jitsi room cho learner
- [ ] Admin tạo/bắt đầu live session

### Admin Dashboard
- [ ] Stats tổng quan (users, courses, enrollments)
- [ ] Bảng user với tất cả thông tin onboarding
- [ ] Quản lý khóa học (publish/unpublish)
- [ ] Inline editor cập nhật Zalo link từng khóa — không cần reload trang
- [ ] Validate URL: chỉ nhận link từ `zalo.me` hoặc `chat.zalo.me`
- [ ] Optimistic update UI sau khi lưu + toast thông báo
- [ ] API PATCH `/api/admin/courses/[courseId]/zalo` có auth guard isAdmin
- [ ] Tạo live session, bật/tắt isActive
- [ ] Export danh sách user (CSV)

### ML & Recommendation
- [ ] TF-IDF implementation thuần TS
- [ ] Cosine similarity
- [ ] Collaborative filtering (khi có >10 users)
- [ ] Hybrid recommendation
- [ ] Fallback rule-based mapping

### Deploy
- [ ] Neon DB setup + schema migration
- [ ] Vercel env variables
- [ ] Google OAuth callback URL
- [ ] Prisma generate trong build script
- [ ] Seed data cho 4 khóa học

---

## 🎨 UI/UX DESIGN SYSTEM — CHI TIẾT BẮT BUỘC

> ⚠️ **CRITICAL cho AI Developer:** Đây là yêu cầu thiết kế **KHÔNG THƯƠNG LƯỢNG**. KHÔNG được code ra giao diện generic, template thông thường hay "AI default UI". Mỗi màn hình phải đẹp như một sản phẩm EdTech startup thật sự — tham khảo Notion, Linear, Vercel Dashboard về cảm giác clean & modern.

---

### 🎨 1. DESIGN DIRECTION — "CLEAN PROFESSIONAL BLUE"

**Concept:** Trắng tinh — Xanh dương sắc nét — Không gian thoáng — Hiện đại, đáng tin, thân thiện với người trẻ Việt Nam 18-28 tuổi.

**Cảm giác muốn truyền đạt:** *"Đây là nền tảng nghiêm túc, chuyên nghiệp — nhưng không khô khan. Dùng nó tôi cảm thấy mình đang đầu tư vào bản thân."*

**KHÔNG được làm:**
- ❌ Giao diện tím/violet gradient kiểu AI generic
- ❌ Layout đối xứng nhàm chán, card đều nhau, khoảng cách đều nhau
- ❌ Font Inter/Roboto/Arial — quá phổ biến, thiếu cá tính
- ❌ Button bo tròn đầy (pill shape) cho mọi thứ
- ❌ Icon emoji thay cho icon thật
- ❌ Background trắng thuần không có depth
- ❌ Sidebar tối màu kiểu dashboard cũ

---

### 🖌️ 2. COLOR PALETTE — CSS VARIABLES BẮT BUỘC

```css
:root {
  /* === PRIMARY BLUES === */
  --blue-50:  #EFF6FF;   /* background tint nhẹ */
  --blue-100: #DBEAFE;   /* hover states nhẹ */
  --blue-200: #BFDBFE;   /* border accent */
  --blue-500: #3B82F6;   /* primary action, links */
  --blue-600: #2563EB;   /* button hover */
  --blue-700: #1D4ED8;   /* active states */
  --blue-900: #1E3A8A;   /* dark text on light */

  /* === NEUTRALS (Warm White — KHÔNG dùng pure #fff) === */
  --white:      #FFFFFF;
  --surface:    #F8FAFF;   /* page background — trắng pha xanh cực nhẹ */
  --surface-2:  #F1F5FD;   /* card background, sidebar */
  --border:     #E2EAF4;   /* đường viền card, divider */
  --border-2:   #CBD5E8;   /* border đậm hơn khi hover */

  /* === TEXT === */
  --text-primary:   #0F172A;   /* heading, body chính */
  --text-secondary: #475569;   /* subtext, label */
  --text-muted:     #94A3B8;   /* placeholder, caption */
  --text-on-blue:   #FFFFFF;   /* text trên nền xanh */

  /* === ACCENT & STATUS === */
  --accent-cyan:    #06B6D4;   /* highlight phụ, badge */
  --success:        #10B981;   /* hoàn thành, đúng */
  --warning:        #F59E0B;   /* đang học, in-progress */
  --error:          #EF4444;   /* lỗi, locked */

  /* === GRADIENT === */
  --gradient-hero:   linear-gradient(135deg, #1D4ED8 0%, #3B82F6 50%, #06B6D4 100%);
  --gradient-card:   linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%);
  --gradient-button: linear-gradient(135deg, #2563EB, #3B82F6);

  /* === SHADOW (Blue-tinted shadows — hiện đại hơn grey) === */
  --shadow-sm:  0 1px 3px rgba(37, 99, 235, 0.08), 0 1px 2px rgba(37, 99, 235, 0.04);
  --shadow-md:  0 4px 16px rgba(37, 99, 235, 0.12), 0 2px 6px rgba(37, 99, 235, 0.06);
  --shadow-lg:  0 10px 40px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(37, 99, 235, 0.08);
  --shadow-blue: 0 8px 24px rgba(59, 130, 246, 0.35);  /* cho CTA button */

  /* === BORDER RADIUS === */
  --radius-sm:  6px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  24px;
}
```

---

### 🔤 3. TYPOGRAPHY — FONT PAIRING

```css
/* Import trong globals.css */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

:root {
  /* Display/Heading font — mạnh mẽ, hiện đại */
  --font-display: 'Plus Jakarta Sans', sans-serif;

  /* Body font — dễ đọc, thân thiện */
  --font-body: 'DM Sans', sans-serif;
}

/* Scale */
h1 { font: 800 2.5rem/1.15 var(--font-display); letter-spacing: -0.03em; color: var(--text-primary); }
h2 { font: 700 1.875rem/1.2 var(--font-display); letter-spacing: -0.025em; }
h3 { font: 600 1.375rem/1.3 var(--font-display); }
h4 { font: 600 1.125rem/1.4 var(--font-display); }
p  { font: 400 1rem/1.65 var(--font-body); color: var(--text-secondary); }
```

**Tailwind config:**
```js
// tailwind.config.ts
fontFamily: {
  display: ['Plus Jakarta Sans', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
}
```

---

### ✨ 4. COMPONENT DESIGN — CHI TIẾT TỪNG PHẦN

#### 4.1 BUTTON SYSTEM

```tsx
/* Primary Button — CTA chính */
<button className="
  bg-gradient-to-r from-blue-600 to-blue-500
  hover:from-blue-700 hover:to-blue-600
  text-white font-semibold text-sm
  px-6 py-3 rounded-xl
  shadow-[0_8px_24px_rgba(59,130,246,0.35)]
  hover:shadow-[0_12px_32px_rgba(59,130,246,0.45)]
  hover:-translate-y-0.5
  active:translate-y-0 active:shadow-md
  transition-all duration-200 ease-out
  flex items-center gap-2
">
  Bắt đầu học ngay
  <ArrowRight size={16} />
</button>

/* Secondary Button — outlined */
<button className="
  border-2 border-blue-200 hover:border-blue-400
  text-blue-600 hover:text-blue-700
  bg-white hover:bg-blue-50
  font-medium text-sm
  px-6 py-3 rounded-xl
  transition-all duration-200
">

/* Ghost Button */
<button className="
  text-slate-600 hover:text-blue-600
  hover:bg-blue-50
  font-medium text-sm
  px-4 py-2.5 rounded-lg
  transition-all duration-150
">
```

#### 4.2 CARD COMPONENT

```tsx
/* Standard Card */
<div className="
  bg-white
  border border-[#E2EAF4]
  rounded-2xl
  p-6
  shadow-[0_4px_16px_rgba(37,99,235,0.08)]
  hover:shadow-[0_8px_32px_rgba(37,99,235,0.14)]
  hover:border-blue-200
  hover:-translate-y-1
  transition-all duration-250 ease-out
  cursor-pointer
">

/* Featured/Hero Card */
<div className="
  bg-gradient-to-br from-blue-600 to-blue-400
  rounded-2xl p-8
  text-white
  shadow-[0_16px_48px_rgba(37,99,235,0.30)]
  relative overflow-hidden
">
  {/* Decorative circles */}
  <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
  <div className="absolute -bottom-12 -left-4 w-32 h-32 bg-white/5 rounded-full" />
```

#### 4.3 INPUT & FORM

```tsx
<input className="
  w-full
  bg-white
  border border-[#E2EAF4]
  focus:border-blue-400 focus:ring-4 focus:ring-blue-100
  rounded-xl
  px-4 py-3
  text-slate-800 placeholder:text-slate-400
  text-sm font-medium
  outline-none
  transition-all duration-200
" />

/* Label */
<label className="text-sm font-semibold text-slate-700 mb-1.5 block">

/* Error state */
<input className="border-red-300 focus:border-red-400 focus:ring-red-100" />
<p className="text-xs text-red-500 mt-1">...</p>
```

#### 4.4 BADGE / TAG

```tsx
/* Field badge */
<span className="
  bg-blue-50 text-blue-700
  border border-blue-200
  text-xs font-semibold
  px-3 py-1 rounded-full
">Quản trị</span>

/* Status badge */
<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
  ✓ Đang mở
</span>
```

#### 4.5 PROGRESS BAR

```tsx
<div className="w-full bg-[#E2EAF4] rounded-full h-2 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700 ease-out"
    style={{ width: `${progress}%` }}
  />
</div>
<div className="flex justify-between mt-1">
  <span className="text-xs text-slate-500">Tiến độ</span>
  <span className="text-xs font-semibold text-blue-600">{progress}%</span>
</div>
```

---

### 🖼️ 5. THIẾT KẾ TỪNG TRANG — CHI TIẾT

#### 5.1 TRANG LOGIN / REGISTER

**Layout:** Split-screen — trái là visual/branding, phải là form

```
┌─────────────────────────┬─────────────────────────┐
│  LEFT PANEL (xanh)      │  RIGHT PANEL (trắng)    │
│                         │                         │
│  bg: gradient-hero      │  bg: white              │
│                         │                         │
│  Logo (trắng)           │  "Chào mừng trở lại"    │
│                         │  h1: 2rem, bold         │
│  Big quote:             │                         │
│  "Xóa bỏ khoảng cách,  │  [Google OAuth btn]     │
│   Đột phá kỹ năng"     │                         │
│  (trắng, 1.8rem bold)  │  ── hoặc ──             │
│                         │                         │
│  3 bullet points:       │  [Email input]          │
│  ✓ Lộ trình cá nhân    │  [Password input]       │
│  ✓ AI hỗ trợ học tập   │  [Đăng nhập button]     │
│  ✓ Cộng đồng thực hành │                         │
│                         │  Chưa có tài khoản?     │
│  Decorative circles     │  [Đăng ký]              │
│  (white/10 opacity)     │                         │
└─────────────────────────┴─────────────────────────┘
```

**Google OAuth button:**
```tsx
<button className="
  w-full flex items-center justify-center gap-3
  border-2 border-[#E2EAF4] hover:border-blue-300
  bg-white hover:bg-blue-50/50
  rounded-xl py-3.5 px-4
  font-semibold text-slate-700 hover:text-blue-700
  transition-all duration-200
  shadow-sm hover:shadow-md
">
  <GoogleIcon /> {/* SVG Google logo màu gốc */}
  Tiếp tục với Google
</button>
```

**"Hoặc" divider:**
```tsx
<div className="flex items-center gap-3 my-6">
  <div className="flex-1 h-px bg-[#E2EAF4]" />
  <span className="text-xs font-medium text-slate-400">hoặc đăng nhập bằng email</span>
  <div className="flex-1 h-px bg-[#E2EAF4]" />
</div>
```

---

#### 5.2 TRANG ONBOARDING (3 bước)

**Layout:** Centered, max-width 560px, nền `var(--surface)`

**Progress indicator trên cùng:**
```tsx
/* Step indicator — 3 dots nối bằng line */
<div className="flex items-center gap-2 mb-10">
  {[1,2,3].map(step => (
    <React.Fragment key={step}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        transition-all duration-300
        ${currentStep >= step
          ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]'
          : 'bg-white border-2 border-[#E2EAF4] text-slate-400'}
      `}>{step}</div>
      {step < 3 && (
        <div className={`flex-1 h-0.5 rounded transition-all duration-500 ${currentStep > step ? 'bg-blue-500' : 'bg-[#E2EAF4]'}`} />
      )}
    </React.Fragment>
  ))}
</div>
```

**Selection cards (thay checkbox thường):**
```tsx
/* Mỗi option là một card clickable */
<div
  onClick={() => toggle(option)}
  className={`
    flex items-center gap-4 p-4
    border-2 rounded-xl cursor-pointer
    transition-all duration-200
    ${selected.includes(option)
      ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]'
      : 'border-[#E2EAF4] bg-white hover:border-blue-200 hover:bg-blue-50/40'}
  `}
>
  <div className={`
    w-10 h-10 rounded-xl flex items-center justify-center text-xl
    ${selected.includes(option) ? 'bg-blue-100' : 'bg-slate-50'}
  `}>{option.icon}</div>
  <div>
    <p className="font-semibold text-slate-800 text-sm">{option.label}</p>
    <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
  </div>
  <div className={`
    ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center
    ${selected.includes(option) ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}
  `}>
    {selected.includes(option) && <Check size={12} className="text-white" strokeWidth={3} />}
  </div>
</div>
```

---

#### 5.3 MAIN DASHBOARD (Người học)

**Layout:** Sidebar trái cố định + Content area phải

**Sidebar:**
```tsx
<aside className="
  w-64 h-screen fixed left-0 top-0
  bg-white border-r border-[#E2EAF4]
  flex flex-col
  p-6
">
  {/* Logo */}
  <div className="flex items-center gap-2.5 mb-10">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
      <GraduationCap size={18} className="text-white" />
    </div>
    <span className="font-display font-800 text-lg text-slate-800">BlenEdU</span>
  </div>

  {/* Nav items */}
  {navItems.map(item => (
    <Link key={item.href} href={item.href} className={`
      flex items-center gap-3 px-4 py-3 rounded-xl mb-1
      font-medium text-sm transition-all duration-150
      ${isActive(item.href)
        ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}
    `}>
      <item.Icon size={18} />
      {item.label}
    </Link>
  ))}

  {/* User avatar ở dưới cùng */}
  <div className="mt-auto flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFF] border border-[#E2EAF4]">
    <img src={user.image} className="w-9 h-9 rounded-full object-cover" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
      <p className="text-xs text-slate-500 truncate">{user.email}</p>
    </div>
  </div>
</aside>
```

**Content area — Greeting + Hero card:**
```tsx
<main className="ml-64 min-h-screen bg-[#F8FAFF] p-8">

  {/* Greeting */}
  <div className="mb-8">
    <p className="text-sm text-slate-500 font-medium">Thứ Ba, 20 tháng 5</p>
    <h1 className="text-2xl font-display font-bold text-slate-900 mt-1">
      Chào buổi sáng, {user.name} 👋
    </h1>
  </div>

  {/* Recommended course — hero card */}
  <div className="
    relative overflow-hidden
    bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500
    rounded-3xl p-8 mb-8
    text-white
    shadow-[0_16px_48px_rgba(37,99,235,0.30)]
  ">
    {/* Decorative blobs */}
    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
    <div className="absolute bottom-0 left-24 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

    <div className="relative z-10 flex items-end justify-between">
      <div>
        <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Lộ trình của bạn</span>
        <h2 className="text-2xl font-display font-bold mt-2 mb-3 max-w-sm leading-tight">
          {recommendedCourse.title}
        </h2>

        {/* Progress */}
        <div className="w-72 bg-white/20 rounded-full h-2 mb-2">
          <div className="h-2 bg-white rounded-full" style={{width: `${progress}%`}} />
        </div>
        <p className="text-blue-100 text-sm">{progress}% hoàn thành · {remainingLessons} bài còn lại</p>

        <button className="
          mt-6 bg-white text-blue-700 font-semibold text-sm
          px-6 py-3 rounded-xl
          hover:bg-blue-50
          flex items-center gap-2
          transition-colors duration-200
          shadow-lg
        ">
          Tiếp tục học <ArrowRight size={16} />
        </button>
      </div>
    </div>
  </div>

  {/* Các khóa học khác — grid 3 cột */}
  <h2 className="text-lg font-display font-bold text-slate-900 mb-4">Khám phá thêm</h2>
  <div className="grid grid-cols-3 gap-5">
    {otherCourses.map(course => (
      <CourseCard key={course.id} course={course} />
    ))}
  </div>
</main>
```

**Course Card (explore):**
```tsx
<div className="
  bg-white border border-[#E2EAF4]
  rounded-2xl overflow-hidden
  hover:shadow-[0_8px_32px_rgba(37,99,235,0.14)]
  hover:border-blue-200
  hover:-translate-y-1
  transition-all duration-250 cursor-pointer
  group
">
  {/* Colored top strip theo lĩnh vực */}
  <div className={`h-2 w-full ${fieldColor[course.field]}`} />

  <div className="p-5">
    {/* Field badge */}
    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
      {course.fieldLabel}
    </span>

    <h3 className="font-display font-bold text-slate-900 text-base mt-3 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
      {course.title}
    </h3>

    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{course.description}</p>

    {/* Meta */}
    <div className="flex items-center gap-3 text-xs text-slate-500 border-t border-[#F1F5FD] pt-3">
      <span className="flex items-center gap-1"><Clock size={12} /> {course.totalDuration} phút</span>
      <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessonCount} bài</span>
    </div>
  </div>
</div>
```

---

#### 5.4 TRANG KHÓA HỌC (`/course/[slug]`)

**Layout:** 3 cột — danh sách bài trái (240px) + video giữa (flex) + chatbot phải (320px)

```tsx
<div className="flex h-screen bg-[#F8FAFF] overflow-hidden">

  {/* === LEFT: Lesson list === */}
  <aside className="w-60 border-r border-[#E2EAF4] bg-white flex flex-col">
    {/* Course header */}
    <div className="p-5 border-b border-[#E2EAF4]">
      <Link href="/dashboard" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-3">
        <ChevronLeft size={12} /> Về Dashboard
      </Link>
      <h2 className="font-display font-bold text-slate-900 text-sm leading-snug">{course.title}</h2>

      {/* Overall progress */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Tiến độ</span>
          <span className="font-semibold text-blue-600">{progress}%</span>
        </div>
        <div className="h-1.5 bg-[#E2EAF4] rounded-full">
          <div className="h-1.5 bg-blue-500 rounded-full transition-all duration-700" style={{width:`${progress}%`}} />
        </div>
      </div>
    </div>

    {/* Lesson list */}
    <div className="flex-1 overflow-y-auto p-3">
      {lessons.map((lesson, i) => (
        <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`
          w-full flex items-start gap-3 p-3 rounded-xl mb-1 text-left
          transition-all duration-150
          ${activeLesson.id === lesson.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-[#F8FAFF]'}
          ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}>
          {/* Status icon */}
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            lesson.isCompleted ? 'bg-emerald-500' :
            activeLesson.id === lesson.id ? 'bg-blue-600' :
            lesson.isLocked ? 'bg-slate-200' : 'bg-[#E2EAF4]'
          }`}>
            {lesson.isCompleted ? <Check size={12} className="text-white" strokeWidth={3} />
            : lesson.isLocked ? <Lock size={10} className="text-slate-400" />
            : <span className="text-[10px] font-bold text-slate-500">{i+1}</span>}
          </div>

          <div>
            <p className={`text-xs font-semibold ${activeLesson.id === lesson.id ? 'text-blue-700' : 'text-slate-700'}`}>
              {lesson.title}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{lesson.duration} phút</p>
          </div>
        </button>
      ))}
    </div>

    {/* Community + Live links */}
    <div className="p-4 border-t border-[#E2EAF4] space-y-2">
      <a href={course.zaloLink} target="_blank" className="
        flex items-center gap-2.5 px-4 py-3 rounded-xl
        bg-blue-50 hover:bg-blue-100
        text-blue-700 text-xs font-semibold
        border border-blue-200 hover:border-blue-300
        transition-all duration-200
      ">
        <MessageCircle size={14} /> Nhóm cộng đồng Zalo
      </a>
      {liveSession?.isActive && (
        <button className="
          w-full flex items-center gap-2.5 px-4 py-3 rounded-xl
          bg-red-500 hover:bg-red-600
          text-white text-xs font-semibold
          shadow-[0_4px_12px_rgba(239,68,68,0.3)]
          animate-pulse
        ">
          <div className="w-2 h-2 bg-white rounded-full" />
          Live đang diễn ra — Vào học
        </button>
      )}
    </div>
  </aside>

  {/* === CENTER: Video + lesson info === */}
  <main className="flex-1 overflow-y-auto">
    {/* Video */}
    <div className="relative bg-black" style={{aspectRatio: '16/9'}}>
      <SecuredVideoPlayer youtubeId={activeLesson.youtubeVideoId} userEmail={user.email} userName={user.name} />
    </div>

    {/* Lesson info */}
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">Bài {lessonIndex + 1}</span>
      </div>
      <h1 className="text-2xl font-display font-bold text-slate-900 mb-3">{activeLesson.title}</h1>
      <p className="text-slate-600 leading-relaxed">{activeLesson.description}</p>

      <button
        onClick={markComplete}
        className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-[0_8px_24px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.45)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
      >
        <Check size={16} /> Đánh dấu hoàn thành
      </button>
    </div>
  </main>

  {/* === RIGHT: AI Chatbot === */}
  <aside className="w-80 border-l border-[#E2EAF4] bg-white flex flex-col">
    {/* Header */}
    <div className="p-5 border-b border-[#E2EAF4]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-slate-900 text-sm">Trợ lý học tập</p>
          <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
            Đang hoạt động
          </p>
        </div>
      </div>
    </div>

    {/* Chat messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(msg => (
        <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
          {msg.role === 'bot' && (
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-blue-600" />
            </div>
          )}
          <div className={`
            max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${msg.role === 'bot'
              ? 'bg-[#F8FAFF] border border-[#E2EAF4] text-slate-700 rounded-tl-sm'
              : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-tr-sm shadow-[0_4px_12px_rgba(59,130,246,0.25)]'}
          `}>
            {msg.content}
          </div>
        </div>
      ))}
    </div>

    {/* Input */}
    <div className="p-4 border-t border-[#E2EAF4]">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#F8FAFF] border border-[#E2EAF4] focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          placeholder="Nhập câu trả lời..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  </aside>
</div>
```

---

#### 5.5 ADMIN DASHBOARD

**Concept:** Trắng + xanh — Clean data, không rối mắt

**Stats cards (row 4 cột):**
```tsx
const statsData = [
  { label: 'Tổng người dùng', value: userCount, icon: Users, color: 'blue', delta: '+12 hôm nay' },
  { label: 'Khóa học đang mở', value: courseCount, icon: BookOpen, color: 'cyan', delta: '4 lĩnh vực' },
  { label: 'Đang học hôm nay', value: activeToday, icon: Activity, color: 'emerald', delta: '+5%' },
  { label: 'Live sắp diễn ra', value: upcomingLive, icon: Video, color: 'orange', delta: 'Sắp tới' },
]

// Render:
<div className="grid grid-cols-4 gap-5 mb-8">
  {statsData.map(stat => (
    <div key={stat.label} className="bg-white border border-[#E2EAF4] rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
          <stat.icon size={20} className={`text-${stat.color}-600`} />
        </div>
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          {stat.delta}
        </span>
      </div>
      <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
      <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
    </div>
  ))}
</div>
```

**User table:**
```tsx
<div className="bg-white border border-[#E2EAF4] rounded-2xl overflow-hidden">
  <div className="p-6 border-b border-[#E2EAF4] flex items-center justify-between">
    <h2 className="font-display font-bold text-slate-900">Danh sách người dùng</h2>
    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
      <Download size={14} /> Xuất CSV
    </button>
  </div>
  <table className="w-full">
    <thead className="bg-[#F8FAFF]">
      <tr>
        {['Người dùng', 'Loại', 'Lĩnh vực quan tâm', 'Vấn đề gặp phải', 'Tiến độ', 'Tham gia'].map(col => (
          <th key={col} className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {col}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-[#F1F5FD]">
      {users.map(user => (
        <tr key={user.id} className="hover:bg-[#F8FAFF] transition-colors">
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <img src={user.image || '/avatar-placeholder.png'} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
          </td>
          {/* ... other cells */}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### ✨ 6. ANIMATIONS & MICRO-INTERACTIONS

```css
/* globals.css — Thêm vào */

/* Fade up khi component mount */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fadeUp 0.4s ease-out forwards;
}

/* Stagger cho grid cards */
.card-1 { animation-delay: 0ms; }
.card-2 { animation-delay: 80ms; }
.card-3 { animation-delay: 160ms; }

/* Shimmer skeleton */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #F1F5FD 25%, #E2EAF4 50%, #F1F5FD 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

/* Page transition */
.page-enter { animation: fadeUp 0.35s ease-out; }
```

---

### 📐 7. SPACING & LAYOUT RULES

```
Page padding:   p-8 (32px) trên desktop, p-4 (16px) trên mobile
Content max-w:  max-w-7xl cho dashboard, max-w-xl cho forms
Grid gaps:      gap-5 (20px) cho cards, gap-3 (12px) cho list items
Section gaps:   mb-8 (32px) giữa các section lớn
Card padding:   p-6 (24px) standard, p-5 (20px) compact
```

---

### 📱 8. RESPONSIVE BREAKPOINTS

```tsx
/* Mobile first — sm: 640px / md: 768px / lg: 1024px / xl: 1280px */

/* Dashboard sidebar: ẩn trên mobile, hiện overlay khi bấm menu */
<aside className="hidden lg:flex w-64 ...">

/* Course page: stack dọc trên mobile, 3 cột trên desktop */
<div className="flex flex-col lg:flex-row">

/* Course grid: 1 cột mobile, 2 cột tablet, 3 cột desktop */
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

/* Onboarding: full width mobile, centered 560px desktop */
<div className="w-full max-w-[560px] mx-auto px-4 lg:px-0">
```

---

### 🔔 9. TOAST NOTIFICATIONS

```tsx
/* Dùng react-hot-toast hoặc sonner */
import { Toaster, toast } from 'sonner'

// Success
toast.success('Đã hoàn thành bài học!', {
  description: 'Tiếp tục học bài tiếp theo nào',
  duration: 3000,
})

// Error
toast.error('Có lỗi xảy ra', { description: 'Vui lòng thử lại' })

// Custom style trong layout:
<Toaster
  position="bottom-right"
  toastOptions={{
    style: {
      background: 'white',
      border: '1px solid #E2EAF4',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(37,99,235,0.12)',
      fontFamily: 'DM Sans, sans-serif',
    }
  }}
/>
```

**Thêm dependency:**
```bash
npm install sonner
```

---

### 🧩 10. ICON SYSTEM

Dùng **Lucide React** (đã có trong deps) — KHÔNG dùng emoji làm icon chức năng:

```tsx
import {
  GraduationCap, BookOpen, Play, Check, Lock, ChevronRight,
  ChevronLeft, Users, Activity, Video, MessageCircle, Bot,
  Send, Download, Settings, LogOut, ArrowRight, Clock,
  BarChart2, Zap, Shield, Star
} from 'lucide-react'
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **KHÔNG dùng OpenAI API, Anthropic API hay bất kỳ paid AI API nào** — chatbot chạy hoàn toàn local với @xenova/transformers
2. **Video YouTube không được tải về** — chỉ stream qua IFrame với security layer
3. **Database Neon chạy 24/7 trên cloud** — máy tính người dùng không cần online liên tục
4. **Admin panel chỉ accessible qua email được set trong ADMIN_EMAIL** env var
5. **Jitsi Meet** dùng public server `meet.jit.si` — miễn phí, không cần setup server riêng
6. **Prisma + Neon:** Dùng connection pooling (DATABASE_URL có `?pgbouncer=true&connect_timeout=15` nếu cần)
7. **@xenova/transformers** lần đầu load sẽ chậm (~5-10 giây) do download model — thêm loading UI thân thiện

---

## 📊 MỤC TIÊU KIỂM NGHIỆM (100 Users)

Prototype này nhằm thu thập:
- Tỷ lệ hoàn thành onboarding
- Tỷ lệ xem video > 50% (engagement)
- Số câu hỏi chatbot được phản hồi
- Lĩnh vực được chọn nhiều nhất
- Pain points phổ biến nhất
- Tỷ lệ click vào Zalo community
- Tham dự live session

→ Admin dashboard cần **hiển thị các metrics này** để founder ra quyết định chiến lược.

---

*Tài liệu này được soạn bởi Đặng Thanh Tuấn — Founder BlenedEdu Platform*
*Liên hệ: dangtuann.dev@gmail.com | 0908779590*
