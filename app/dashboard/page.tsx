import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Task } from '@/lib/types'
import TaskBoard from '@/components/TaskBoard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#F7F6F3] px-4 pt-8 pb-16">
      <TaskBoard initialTasks={(tasks as Task[]) || []} user={{ id: user.id, email: user.email! }} />
    </main>
  )
}
