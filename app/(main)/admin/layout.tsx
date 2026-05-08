import { verifySession } from "@/lib/session"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()
  
  if (!session?.isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="animate-fade-up">
      <AdminHeader />
      <div>{children}</div>
    </div>
  )
}
