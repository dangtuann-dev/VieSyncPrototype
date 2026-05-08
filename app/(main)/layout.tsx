import { Sidebar } from "@/components/layout/Sidebar"
import { getSession } from "@/lib/session"
import { prisma } from "@/lib/db"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  
  let userName = ""
  try {
    if (session?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true }
      })
      userName = user?.name || ""
    }
  } catch { /* Ignore DB errors in layout */ }

  return (
    <div className="flex bg-[#F8FAFF] min-h-screen">
      <Sidebar
        isAdmin={session?.isAdmin}
        userName={userName}
        userEmail={session?.email}
      />
      {/* 
          Dùng CSS variable --sidebar-width để đồng bộ khoảng cách. 
          Giá trị mặc định là 256px (w-64).
      */}
      <main 
        className="flex-1 pt-24 lg:pt-0 relative min-w-0 transition-all duration-300"
        style={{ marginLeft: 'var(--sidebar-width, 256px)' }}
      >
        <div className="p-10 lg:p-14 xl:p-20">
          {children}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 1023px) {
          main { margin-left: 0 !important; }
        }
      `}} />
    </div>
  )
}
