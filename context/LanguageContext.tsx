"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "vi" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Navigation
    "nav.home": "Trang chủ",
    "nav.my_courses": "Khóa học của tôi",
    "nav.live": "Lịch học Live",
    "nav.explore": "Khám phá",
    "nav.settings": "Cài đặt",
    "nav.admin": "Quản lý hệ thống",
    "nav.logout": "Đăng xuất",

    // Auth
    "auth.title": "Xóa bỏ khoảng cách, Đột phá kỹ năng",
    "auth.check1": "Lộ trình học cá nhân hóa bằng AI",
    "auth.check2": "Video bảo mật — không lo mất chất xám",
    "auth.check3": "Cộng đồng học viên tương tác thật",
    "auth.joined": "Đã có 100+ học viên tham gia",
    "auth.login_title": "Chào mừng trở lại",
    "auth.login_subtitle": "Đăng nhập để tiếp tục hành trình học tập",
    "auth.register_title": "Bắt đầu hành trình",
    "auth.register_subtitle": "Tạo tài khoản để mở khóa tiềm năng của bạn",
    "auth.email": "Địa chỉ Email",
    "auth.password": "Mật khẩu",
    "auth.login_btn": "Đăng nhập",
    "auth.register_btn": "Đăng ký",
    "auth.no_account": "Chưa có tài khoản?",
    "auth.have_account": "Đã có tài khoản?",
    "auth.google_login": "Tiếp tục với Google",

    // Dashboard
    "dashboard.welcome": "Chào buổi sáng",
    "dashboard.stats_users": "Tổng người dùng",
    "dashboard.stats_courses": "Khóa học hoạt động",
    "dashboard.stats_lessons": "Bài học đã xem",
    "dashboard.stats_minutes": "Phút học tập",
    "dashboard.stats_streak": "Ngày liên tiếp",
    "dashboard.recommended": "Được AI gợi ý cho bạn",
    "dashboard.continue": "Tiếp tục học",
    "dashboard.start": "Bắt đầu ngay",
    "dashboard.all_courses": "Tất cả khóa học",
    "dashboard.my_learning": "Lộ trình của tôi",
    "dashboard.no_courses": "Bạn chưa tham gia khóa học nào",
    "dashboard.view_all": "Xem tất cả",
    "dashboard.lessons_remaining": "bài học còn lại",

    // Fields
    "field.management": "Quản trị",
    "field.softskills": "Kỹ năng mềm",
    "field.it": "Lập trình",
    "field.marketing": "Marketing",

    // Common
    "common.minutes": "phút",
    "common.lessons": "bài",
    "common.completed_count": "đã xong",
    "common.home": "Trang chủ",
    "common.system_management": "Quản lý hệ thống",
    "common.loading": "Đang tải...",

    // Courses & Admin
    "admin.management": "Quản trị hệ thống",
    "admin.description": "Theo dõi và quản lý toàn bộ hoạt động của nền tảng",
    "admin.overview": "Tổng quan",
    "admin.users": "Người dùng",
    "admin.courses": "Khóa học",
    "admin.live_sessions_tab": "Live Session",
    "admin.active_courses": "Khóa học đang mở",
    "admin.active_today": "Đang học hôm nay",
    "admin.live_sessions": "Live đang diễn ra",
    "admin.new_users_chart": "Người dùng mới (7 ngày qua)",
    "admin.popular_fields": "Lĩnh vực phổ biến nhất",
    "admin.user_groups": "Nhóm người dùng",
    "admin.user_groups_desc": "Phân loại học viên theo vai trò nghề nghiệp",
    "admin.pain_points": "Vấn đề gặp phải",
    "admin.pain_points_desc": "Top 5 rào cản lớn nhất của học viên",
    "admin.loading_error": "Lỗi tải thống kê",
    "admin.upcoming": "Sắp tới",
    "admin.today": "hôm nay",

    // Admin Course Management
    "admin.courses.status_published": "Đang mở",
    "admin.courses.status_hidden": "Ẩn",
    "admin.courses.manage_lessons": "Quản lý bài học",
    "admin.courses.edit_zalo": "Sửa Zalo",
    "admin.courses.add_zalo": "Thêm Zalo",
    "admin.courses.no_zalo": "Chưa có link Zalo",
    "admin.courses.lesson_list": "Danh sách Video bài học",
    "admin.courses.edit_video": "Sửa Video",
    "admin.courses.edit_title": "Sửa Tiêu đề",
    "admin.courses.edit_summary": "Sửa Tóm tắt",
    "admin.courses.editing": "Đang sửa...",
    "admin.courses.save_summary": "Lưu tóm tắt",
    "admin.courses.save_title": "Lưu tiêu đề",
    "admin.courses.cancel": "Hủy",
    "admin.courses.zalo_title": "Cập nhật link nhóm Zalo",
    "admin.courses.save_link": "Lưu link",
    "admin.courses.summary_label": "Tóm tắt / Nội dung chính",
    "admin.courses.tip": "Mẹo: Sử dụng xuống dòng để ngăn cách các ý chính.",
    "admin.courses.students_count": "Học viên",

    // Course Page
    "course.back": "Quay lại",
    "course.progress": "TIẾN ĐỘ HỌC TẬP",
    "course.learning_status": "Đang học",
    "course.live_now": "TRỰC TIẾP",
    "course.live_msg": "Tham gia buổi học trực tuyến cùng giảng viên ngay!",
    "course.progress_label": "Tiến độ",
    "course.lock_msg": "Hoàn thành bài học trước để mở khóa",
    "course.zalo_group": "Nhóm Zalo hỗ trợ",
    "course.lesson": "Bài học",
    "course.summary": "TÓM TẮT NỘI DUNG",
    "course.mark_complete": "Hoàn thành bài học",
    "course.completed": "Đã hoàn thành",

    // AI Chatbot
    "ai.title": "Trợ lý học tập AI",
    "ai.status": "Trực tuyến",
    "ai.welcome": "Chào bạn! Tôi có thể giúp gì cho bài học hôm nay?",
    "ai.suggest_title": "CHỦ ĐỀ GỢI Ý:",
    "ai.suggest_1": "Làm sao để học hiệu quả hơn?",
    "ai.suggest_2": "Giải thích thêm về bài học này",
    "ai.suggest_3": "Tóm tắt các ý chính",
    "ai.suggest_4": "Đặt câu hỏi trắc nghiệm ôn tập",
    "ai.input_placeholder": "Nhập tin nhắn của bạn...",

    // User Types & Pain Points
    "usertype.STUDENT": "Sinh viên",
    "usertype.PROFESSIONAL": "Người đi làm",
    "usertype.CAREER_CHANGER": "Chuyển ngành",
    "usertype.INSTRUCTOR": "Giảng viên",
    "usertype.UNKNOWN": "Chưa xác định",
    "painpoint.TIME": "Thiếu thời gian",
    "painpoint.GUIDANCE": "Thiếu lộ trình",
    "painpoint.COST": "Chi phí cao",
    "painpoint.INTERACTION": "Thiếu tương tác",
    "painpoint.PRACTICE": "Ít thực hành",
    "painpoint.Thiếu kỹ năng thực tế để xin việc": "Thiếu kỹ năng thực tế để xin việc",
    "painpoint.Không biết bắt đầu từ đâu": "Không biết bắt đầu từ đâu",
    "painpoint.Chi phí các khóa học quá cao": "Chi phí các khóa học quá cao",
    "painpoint.Thiếu sự tương tác với giảng viên": "Thiếu sự tương tác với giảng viên",
    "painpoint.Khó khăn trong việc sắp xếp thời gian": "Khó khăn trong việc sắp xếp thời gian",

    // Days & Calendar
    "day.Mon": "T2",
    "day.Tue": "T3",
    "day.Wed": "T4",
    "day.Thu": "T5",
    "day.Fri": "T6",
    "day.Sat": "T7",
    "day.Sun": "CN",

    // Admin Users
    "admin.users.search_placeholder": "Tìm theo tên hoặc email...",
    "admin.users.export": "Xuất CSV",
    "admin.users.header_user": "NGƯỜI DÙNG",
    "admin.users.header_type": "LOẠI",
    "admin.users.header_field": "LĨNH VỰC",
    "admin.users.header_pain": "VẤN ĐỀ ĐANG GẶP",
    "admin.users.header_course": "KHÓA HỌC",
    "admin.users.header_progress": "TIẾN ĐỘ",
    "admin.users.header_joined": "THAM GIA",
    "admin.users.not_started": "Chưa bắt đầu",

    // Settings
    "settings.title": "Cài đặt hệ thống",
    "settings.language": "Ngôn ngữ hiển thị",
    "settings.profile": "Thông tin cá nhân",
    "settings.save": "Lưu thay đổi",

    // Explore
    "explore.title": "Khám phá khóa học",
    "explore.desc": "Tìm kiếm khóa học phù hợp với mục tiêu của bạn",
    "explore.all": "Tất cả",

    // My Courses
    "mycourses.title": "Khóa học của tôi",
    "mycourses.desc": "Theo dõi tiến độ học tập của bạn",
    "mycourses.learning": "Đang học",
    "mycourses.completed": "Đã hoàn thành",
    "mycourses.empty": "Bạn chưa bắt đầu khóa học nào",
    "mycourses.empty_desc": "Hãy khám phá các khóa học thú vị và bắt đầu hành trình nâng cao kỹ năng của bạn nhé.",

    // Live Session
    "live.title": "Lịch học Live Session",
    "live.desc": "Tham gia các buổi học trực tuyến cùng giảng viên để giải đáp thắc mắc và đào sâu kiến thức.",
    "live.not_started": "Chưa bắt đầu",
    "live.room": "Phòng học trực tuyến",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.my_courses": "My Courses",
    "nav.live": "Live Sessions",
    "nav.explore": "Explore",
    "nav.settings": "Settings",
    "nav.admin": "Admin Dashboard",
    "nav.logout": "Logout",

    // Auth
    "auth.title": "Closing the Gap, Breaking Skill Barriers",
    "auth.check1": "AI-Personalized Learning Paths",
    "auth.check2": "Secure Videos — Protect Your Knowledge",
    "auth.check3": "Real Interactive Student Community",
    "auth.joined": "100+ Students already joined",
    "auth.login_title": "Welcome Back",
    "auth.login_subtitle": "Login to continue your learning journey",
    "auth.register_title": "Start Your Journey",
    "auth.register_subtitle": "Create an account to unlock your potential",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.login_btn": "Login",
    "auth.register_btn": "Register",
    "auth.no_account": "Don't have an account?",
    "auth.have_account": "Already have an account?",
    "auth.google_login": "Continue with Google",

    // Dashboard
    "dashboard.welcome": "Good morning",
    "dashboard.stats_users": "Total Users",
    "dashboard.stats_courses": "Active Courses",
    "dashboard.stats_lessons": "Lessons Viewed",
    "dashboard.stats_minutes": "Learning Minutes",
    "dashboard.stats_streak": "Day Streak",
    "dashboard.recommended": "AI Recommended for you",
    "dashboard.continue": "Continue Learning",
    "dashboard.start": "Start Now",
    "dashboard.all_courses": "All Courses",
    "dashboard.my_learning": "My Learning Path",
    "dashboard.no_courses": "You haven't joined any courses yet",
    "dashboard.view_all": "View All",
    "dashboard.lessons_remaining": "lessons remaining",

    // Fields
    "field.management": "Management",
    "field.softskills": "Soft Skills",
    "field.it": "Programming",
    "field.marketing": "Marketing",

    // Common
    "common.minutes": "mins",
    "common.lessons": "lessons",
    "common.completed_count": "completed",
    "common.home": "Home",
    "common.system_management": "System Management",
    "common.loading": "Loading...",

    // Courses & Admin
    "admin.management": "System Management",
    "admin.description": "Monitor and manage all platform activities",
    "admin.overview": "Overview",
    "admin.users": "Users",
    "admin.courses": "Courses",
    "admin.live_sessions_tab": "Live Session",
    "admin.active_courses": "Active Courses",
    "admin.active_today": "Active Today",
    "admin.live_sessions": "Live Sessions",
    "admin.new_users_chart": "New Users (Last 7 Days)",
    "admin.popular_fields": "Most Popular Fields",
    "admin.user_groups": "User Groups",
    "admin.user_groups_desc": "Classifying students by professional role",
    "admin.pain_points": "Pain Points",
    "admin.pain_points_desc": "Top 5 biggest barriers for students",
    "admin.loading_error": "Error loading statistics",
    "admin.upcoming": "Upcoming",
    "admin.today": "today",

    // Admin Course Management
    "admin.courses.status_published": "Active",
    "admin.courses.status_hidden": "Hidden",
    "admin.courses.manage_lessons": "Manage Lessons",
    "admin.courses.edit_zalo": "Edit Zalo",
    "admin.courses.add_zalo": "Add Zalo",
    "admin.courses.no_zalo": "No Zalo link",
    "admin.courses.lesson_list": "Lesson Video List",
    "admin.courses.edit_video": "Edit Video",
    "admin.courses.edit_title": "Edit Title",
    "admin.courses.edit_summary": "Edit Summary",
    "admin.courses.editing": "Editing...",
    "admin.courses.save_summary": "Save Summary",
    "admin.courses.save_title": "Save Title",
    "admin.courses.cancel": "Cancel",
    "admin.courses.zalo_title": "Update Zalo Group Link",
    "admin.courses.save_link": "Save Link",
    "admin.courses.summary_label": "Summary / Key Content",
    "admin.courses.tip": "Tip: Use line breaks to separate key points.",
    "admin.courses.students_count": "Students",

    // Course Page
    "course.back": "Back to Dashboard",
    "course.progress": "Progress",
    "course.learning_status": "Learning",
    "course.live_now": "Live Now",
    "course.live_msg": "Join the live room to ask questions!",
    "course.progress_label": "Progress",
    "course.lock_msg": "Complete previous lesson to unlock",
    "course.zalo_group": "Zalo Community Group",
    "course.lesson": "Lesson",
    "course.summary": "Lesson Summary",
    "course.mark_complete": "Mark as Completed",
    "course.completed": "Lesson Completed",

    // AI Chatbot
    "ai.title": "VieSync Learning Assistant",
    "ai.status": "READY TO HELP",
    "ai.welcome": "Welcome! How can I help you with today's lesson?",
    "ai.suggest_title": "SUGGESTED TOPICS:",
    "ai.suggest_1": "How to learn more effectively?",
    "ai.suggest_2": "Explain more about this lesson",
    "ai.suggest_3": "Summarize key points",
    "ai.suggest_4": "Create a review quiz",
    "ai.input_placeholder": "Type your message...",

    // User Types & Pain Points
    "usertype.STUDENT": "Student",
    "usertype.PROFESSIONAL": "Professional",
    "usertype.CAREER_CHANGER": "Career Changer",
    "usertype.INSTRUCTOR": "Instructor",
    "usertype.UNKNOWN": "Unknown",
    "painpoint.TIME": "Lack of time",
    "painpoint.GUIDANCE": "No roadmap",
    "painpoint.COST": "High cost",
    "painpoint.INTERACTION": "No interaction",
    "painpoint.PRACTICE": "Few practice",
    "painpoint.Thiếu kỹ năng thực tế để xin việc": "Lack of practical skills for job seeking",
    "painpoint.Không biết bắt đầu từ đâu": "Don't know where to start",
    "painpoint.Chi phí các khóa học quá cao": "Course fees are too high",
    "painpoint.Thiếu sự tương tác với giảng viên": "Lack of interaction with instructors",
    "painpoint.Khó khăn trong việc sắp xếp thời gian": "Difficulty in time management",

    // Days & Calendar
    "day.Mon": "Mon",
    "day.Tue": "Tue",
    "day.Wed": "Wed",
    "day.Thu": "Thu",
    "day.Fri": "Fri",
    "day.Sat": "Sat",
    "day.Sun": "Sun",

    // Admin Users
    "admin.users.search_placeholder": "Search by name or email...",
    "admin.users.export": "Export CSV",
    "admin.users.header_user": "USER",
    "admin.users.header_type": "TYPE",
    "admin.users.header_field": "FIELD",
    "admin.users.header_pain": "PAIN POINT",
    "admin.users.header_course": "COURSE",
    "admin.users.header_progress": "PROGRESS",
    "admin.users.header_joined": "JOINED",
    "admin.users.not_started": "Not started",

    // Settings
    "settings.title": "System Settings",
    "settings.language": "Display Language",
    "settings.profile": "Personal Profile",
    "settings.save": "Save Changes",

    // Explore
    "explore.title": "Explore Courses",
    "explore.desc": "Find the course that fits your goals",
    "explore.all": "All",

    // My Courses
    "mycourses.title": "My Courses",
    "mycourses.desc": "Track your learning progress",
    "mycourses.learning": "Learning",
    "mycourses.completed": "Completed",
    "mycourses.empty": "You haven't started any courses yet",
    "mycourses.empty_desc": "Explore exciting courses and start your journey to level up your skills.",

    // Live Session
    "live.title": "Live Session Schedule",
    "live.desc": "Join online sessions with instructors to get answers and deepen your knowledge.",
    "live.not_started": "Not Started",
    "live.room": "Online Classroom",
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi")

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language
    if (saved) setLanguage(saved)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("lang", lang)
  }

  const t = (key: string) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
