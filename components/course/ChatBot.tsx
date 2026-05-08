"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Send, MessageCircle, ArrowRight } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface Message {
  id: string
  role: 'bot' | 'user'
  content: string
  isZalo?: boolean
}

const COURSE_FAQ: any = {
  "Kỹ Năng Giao Tiếp & Thuyết Trình Chuyên Nghiệp": [
    { q_vi: "Làm sao để vượt qua nỗi sợ thuyết trình?", a_vi: "Hãy chuẩn bị kỹ nội dung, luyện tập trước gương hoặc quay video lại, và tập trung vào giá trị bạn mang lại cho khán giả.", q_en: "How to overcome public speaking fear?", a_en: "Prepare thoroughly, practice in front of a mirror, and focus on the value you provide to the audience." },
    { q_vi: "Làm thế nào để lắng nghe chủ động hơn?", a_vi: "Duy trì giao tiếp bằng mắt, gật đầu nhẹ để thể hiện sự đồng tình, không ngắt lời và thỉnh thoảng tóm tắt lại ý người nói.", q_en: "How to listen more actively?", a_en: "Maintain eye contact, nod to show agreement, avoid interruptions, and summarize the speaker's points." }
  ],
  "Quản Trị Doanh Nghiệp Hiện Đại": [
    { q_vi: "KPI và OKR khác nhau như thế nào?", a_vi: "KPI tập trung vào đo lường hiệu suất công việc hiện tại, trong khi OKR tập trung vào các mục tiêu tham vọng và kết quả then chốt mang tính định hướng.", q_en: "Difference between KPI and OKR?", a_en: "KPI focuses on measuring current performance, while OKR focuses on ambitious goals and key results." },
    { q_vi: "Làm sao để quản lý đội nhóm hiệu quả?", a_vi: "Hãy xây dựng sự tin tưởng, giao tiếp minh bạch, phân công công việc dựa trên thế mạnh của từng thành viên và luôn đưa ra phản hồi kịp thời.", q_en: "How to manage teams effectively?", a_en: "Build trust, communicate transparently, delegate based on strengths, and provide timely feedback." }
  ],
  "Phát Triển Tư Duy Phản Biện": [
    { q_vi: "Làm sao để nhận diện các lỗi ngụy biện?", a_vi: "Hãy luôn đặt câu hỏi về tính logic của lập luận, kiểm tra nguồn gốc bằng chứng và tránh bị chi phối bởi cảm xúc nhất thời.", q_en: "How to identify fallacies?", a_en: "Always question the logic of arguments, check the source of evidence, and avoid being swayed by temporary emotions." },
    { q_vi: "Quy trình suy luận logic cơ bản là gì?", a_vi: "Bắt đầu từ việc thu thập dữ liệu khách quan, phân tích các góc nhìn khác nhau, và đưa ra kết luận dựa trên bằng chứng xác thực.", q_en: "Basic logical reasoning process?", a_en: "Start by gathering objective data, analyzing different perspectives, and drawing conclusions based on verified evidence." }
  ],
  "Python Cho Người Mới Bắt Đầu": [
    { q_vi: "Tại sao nên học Python thay vì ngôn ngữ khác?", a_vi: "Python có cú pháp đơn giản, gần gũi với tiếng Anh, thư viện hỗ trợ cực kỳ phong phú và ứng dụng rộng rãi từ Web đến AI.", q_en: "Why learn Python first?", a_en: "Python has simple syntax, is very readable, has vast library support, and applies to everything from Web to AI." },
    { q_vi: "Biến và Kiểu dữ liệu trong Python là gì?", a_vi: "Biến là nơi lưu trữ giá trị, còn kiểu dữ liệu định nghĩa loại giá trị đó (như số nguyên int, số thực float, chuỗi string hay danh sách list).", q_en: "What are variables and data types?", a_en: "Variables store values, and data types define the nature of those values (like int, float, string, or list)." }
  ],
  "DEFAULT": [
    { q_vi: "Làm sao để học hiệu quả hơn?", a_vi: "Hãy đặt mục tiêu rõ ràng, chia nhỏ bài học và thực hành ngay sau khi xem video.", q_en: "How to learn more effectively?", a_en: "Set clear goals, break lessons into small parts, and practice immediately after watching the videos." }
  ]
}

export function ChatBot({ 
  lessonTopic = "Kỹ Năng Giao Tiếp & Thuyết Trình Chuyên Nghiệp",
  zaloLink = "#" 
}: { 
  lessonTopic?: string,
  zaloLink?: string 
}) {
  const { t, language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const rawFaqs = COURSE_FAQ[lessonTopic] || COURSE_FAQ["DEFAULT"]
  const faqs = [
    ...rawFaqs.map((f: any) => ({
      q: language === 'vi' ? f.q_vi : f.q_en,
      a: language === 'vi' ? f.a_vi : f.a_en
    })),
    { 
      q: t('ai.suggest_4'), 
      a: language === 'vi' 
        ? "Bạn có thể tham gia vào nhóm cộng đồng Zalo dành riêng cho học viên của khóa học này để cùng trao đổi, thảo luận và hỗ trợ nhau học tập nhé!"
        : "You can join the Zalo community group exclusively for students of this course to exchange, discuss, and support each other's learning!",
      isZalo: true
    }
  ]

  useEffect(() => {
    setMessages([
      { id: '1', role: 'bot', content: t('ai.welcome') }
    ])
  }, [lessonTopic, language])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleFAQClick = (faq: { q: string, a: string, isZalo?: boolean }) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: faq.q }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        content: faq.a,
        isZalo: faq.isZalo 
      }])
      setIsTyping(false)
    }, 800)
  }

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const reply = language === 'vi'
        ? "Cảm ơn bạn đã đặt câu hỏi! Câu hỏi của bạn đang được chuyển đến giảng viên chuyên môn. Chúng tôi sẽ phản hồi lại cho bạn trong thời gian sớm nhất qua hệ thống thông báo hoặc email cá nhân."
        : "Thank you for your question! Your inquiry is being forwarded to our expert instructors. We will respond to you as soon as possible via our notification system or personal email."
      setIsTyping(false)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'bot', content: reply }])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-[#E2EAF4] bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-black text-slate-900 text-sm tracking-tight">{t('ai.title')}</p>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('ai.status')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3.5 animate-fade-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'bot' && (
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
                <Bot size={18} className="text-blue-600" />
              </div>
            )}
            <div className={`
              max-w-[85%] px-5 py-4 text-sm leading-relaxed font-medium shadow-sm
              ${msg.role === 'bot'
                ? 'bg-[#F8FAFF] border border-[#E2EAF4] text-slate-700 rounded-[1.5rem] rounded-tl-sm'
                : 'bg-blue-600 text-white rounded-[1.5rem] rounded-tr-sm shadow-xl shadow-blue-100'}
            `}>
              {msg.content}
              {msg.isZalo && (
                <a
                  href={zaloLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2.5 w-full py-3 bg-[#0068FF] hover:bg-[#0055D4] text-white rounded-xl font-black text-xs transition-all shadow-xl shadow-blue-200"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                  {t('course.zalo_group')}
                </a>
              )}
            </div>
          </div>
        ))}
        
        {/* Quick Actions (FAQ) */}
        {!isTyping && messages[messages.length - 1]?.role === 'bot' && (
           <div className="space-y-2.5 pl-12 animate-fade-up pb-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                {t('ai.suggest_title')}
             </p>
             {faqs.map((faq: any, idx: number) => (
               <button
                 key={idx}
                 onClick={() => handleFAQClick(faq)}
                 className="block w-full text-left p-4 rounded-2xl border border-slate-100 bg-white hover:bg-blue-50 hover:border-blue-200 text-xs font-bold text-slate-600 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
               >
                 <span className="flex-1 pr-4 leading-snug">{faq.q}</span>
                 <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all"></i>
               </button>
             ))}
           </div>
         )}

        {isTyping && (
          <div className="flex gap-3.5 animate-fade-up">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
              <Bot size={18} className="text-blue-600" />
            </div>
            <div className="bg-[#F8FAFF] border border-[#E2EAF4] px-5 py-4 rounded-[1.5rem] rounded-tl-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-[#E2EAF4] bg-slate-50/50">
        <div className="flex gap-2.5">
          <input
            className="flex-1 bg-white border border-slate-200 focus:border-blue-500 focus:ring-8 focus:ring-blue-100 rounded-2xl px-5 py-4 text-sm outline-none transition-all text-slate-800 placeholder:text-slate-400 font-bold shadow-inner"
            placeholder={t('ai.input_placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className="w-[56px] h-[56px] bg-blue-600 hover:bg-blue-700 rounded-2xl flex items-center justify-center text-white transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
