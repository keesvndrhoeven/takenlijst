'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task, User } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface Props {
  initialTasks: Task[]
  user: User
}

export default function TaskBoard({ initialTasks, user }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [aiLoading, setAiLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const fetchAI = useCallback(async (currentTasks: Task[]) => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: currentTasks }),
      })
      const data = await res.json()
      setAiSummary(data.summary)
    } catch {
      setAiSummary('Kon geen samenvatting laden.')
    }
    setAiLoading(false)
  }, [])

  useEffect(() => {
    fetchAI(tasks)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function refreshTasks() {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    const updated = (data as Task[]) || []
    setTasks(updated)
    fetchAI(updated)
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    await supabase.from('tasks').insert({ title: newTitle.trim(), user_id: user.id, completed: false, urgent: false })
    setNewTitle('')
    refreshTasks()
  }

  async function toggleComplete(task: Task) {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    refreshTasks()
  }

  async function toggleUrgent(task: Task) {
    await supabase.from('tasks').update({ urgent: !task.urgent }).eq('id', task.id)
    refreshTasks()
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    refreshTasks()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const open = tasks.filter((t) => !t.completed)
  const done = tasks.filter((t) => t.completed)
  const urgentCount = open.filter((t) => t.urgent).length
  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-gray-900">Mijn taken</h1>
        <div className="flex items-center gap-2 bg-white border border-black/8 rounded-full px-3 py-1.5">
          <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-medium text-blue-600">
            {initials}
          </div>
          <span className="text-xs text-gray-500 max-w-[120px] truncate">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
            title="Uitloggen"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { n: open.length, label: 'open' },
          { n: urgentCount, label: 'urgent' },
          { n: done.length, label: 'klaar' },
        ].map(({ n, label }) => (
          <div key={label} className="bg-white border border-black/8 rounded-xl px-4 py-3">
            <div className="text-2xl font-medium font-mono text-gray-900">{n}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="bg-white border border-black/8 rounded-xl px-4 py-3.5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l1.5 4.5H18l-3.75 2.7 1.5 4.5L12 12l-3.75 2.7 1.5-4.5L6 7.5h4.5z"/>
            </svg>
            AI samenvatting
          </div>
          <button
            onClick={() => fetchAI(tasks)}
            className="text-gray-300 hover:text-gray-500 transition-colors"
            title="Ververs"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
        {aiLoading ? (
          <div className="flex gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
        )}
      </div>

      {/* Add task */}
      <form onSubmit={addTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nieuwe taak toevoegen..."
          className="flex-1 px-3.5 py-2.5 border border-black/10 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-all"
        >
          + Toevoegen
        </button>
      </form>

      {/* Open tasks */}
      {open.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Open taken ({open.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {open.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleComplete}
                onToggleUrgent={toggleUrgent}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Done tasks */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            Afgerond ({done.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {done.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleComplete}
                onToggleUrgent={toggleUrgent}
                onDelete={deleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-10 text-gray-300">
          <svg className="mx-auto mb-3 opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p className="text-sm">Geen taken. Voeg er een toe!</p>
        </div>
      )}
    </div>
  )
}

interface TaskItemProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onToggleUrgent: (task: Task) => void
  onDelete: (id: string) => void
}

function TaskItem({ task, onToggleComplete, onToggleUrgent, onDelete }: TaskItemProps) {
  return (
    <div className={`group bg-white border border-black/8 rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-opacity ${task.completed ? 'opacity-50' : ''}`}>
      <button
        onClick={() => onToggleComplete(task)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-green-600 border-green-600'
            : 'border-gray-200 hover:border-green-400'
        }`}
      >
        {task.completed && (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      <span className={`flex-1 text-sm text-gray-800 ${task.completed ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </span>

      {!task.completed && (
        <button
          onClick={() => onToggleUrgent(task)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all flex-shrink-0 ${
            task.urgent
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'text-gray-300 border-gray-100 hover:border-amber-200 hover:text-amber-500'
          }`}
        >
          {task.urgent ? '⚡ urgent' : 'urgent?'}
        </button>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  )
}
