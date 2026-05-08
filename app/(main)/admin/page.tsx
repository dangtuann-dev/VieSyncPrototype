"use client"

import { useState, useEffect } from "react"
import { Users, BookOpen, Activity, Video, Loader2 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { toast } from "sonner"
import { useLanguage } from "@/context/LanguageContext"

const MOCK_FIELDS = [
  { key: "softskills", label: "Kỹ năng mềm", percentage: 68, count: 34, color: "bg-emerald-500" },
  { key: "it", label: "Lập trình", percentage: 52, count: 26, color: "bg-purple-500" },
  { key: "management", label: "Quản trị", percentage: 38, count: 19, color: "bg-blue-500" },
  { key: "marketing", label: "Marketing", percentage: 28, count: 14, color: "bg-orange-500" },
]

export default function AdminOverview() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setIsLoading(false)
      })
      .catch(() => {
        toast.error(t('admin.loading_error'))
        setIsLoading(false)
      })
  }, [t])

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>

  // Format chart data with localized day names
  const formattedChartData = (stats?.chartData || []).map((d: any) => ({
    ...d,
    name: t(`day.${new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}`)
  }))

  const formattedUserTypes = (stats?.userTypeDistribution || []).map((d: any) => ({
    ...d,
    name: t(`usertype.${d.name}`)
  }))

  const formattedPainPoints = (stats?.painPointsDistribution || []).map((d: any) => ({
    ...d,
    name: t(`painpoint.${d.name}`)
  }))

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Row 1: Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label={t('admin.total_users')} value={stats?.userCount || 0} icon={Users} color="blue" delta={`+12 ${t('admin.today')}`} />
        <StatCard label={t('admin.active_courses')} value={stats?.courseCount || 0} icon={BookOpen} color="cyan" delta={`4 ${t('admin.popular_fields')}`} />
        <StatCard label={t('admin.active_today')} value={stats?.activeToday || 0} icon={Activity} color="emerald" delta="+5%" />
        <StatCard label={t('admin.live_sessions')} value={stats?.liveSessionCount || 0} icon={Video} color="orange" delta={t('admin.upcoming')} />
      </div>

      {/* Row 2: Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-display font-bold text-slate-900 mb-6">{t('admin.new_users_chart')}</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5FD" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFF'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)'}}
                />
                <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fields Ranking */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-display font-bold text-slate-900 mb-6">{t('admin.popular_fields')}</h2>
          <div className="space-y-6">
            {MOCK_FIELDS.map((field, i) => (
              <div key={field.label}>
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400">0{i+1}</span>
                    <span className="text-sm font-semibold text-slate-700">{t(`field.${field.key}`)}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{field.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${field.color} rounded-full transition-all duration-1000`} 
                    style={{ width: `${field.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: User Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Type Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-display font-bold text-slate-900 mb-2">{t('admin.user_groups')}</h2>
          <p className="text-xs text-slate-500 mb-6">{t('admin.user_groups_desc')}</p>
          <div className="h-72 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedUserTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {formattedUserTypes.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)'}}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 ml-4 shrink-0">
               {formattedUserTypes.map((entry: any, index: number) => (
                 <div key={entry.name} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"][index % 4] }} />
                   <span className="text-xs font-medium text-slate-600">{entry.name}: {entry.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Pain Points Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-display font-bold text-slate-900 mb-2">{t('admin.pain_points')}</h2>
          <p className="text-xs text-slate-500 mb-6">{t('admin.pain_points_desc')}</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedPainPoints} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5FD" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} width={120} />
                <Tooltip 
                  cursor={{fill: '#F8FAFF'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.08)'}}
                />
                <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, delta }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    cyan: "bg-cyan-50 text-cyan-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">
          {delta}
        </span>
      </div>
      <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 font-medium mt-1">{label}</p>
    </div>
  )
}
