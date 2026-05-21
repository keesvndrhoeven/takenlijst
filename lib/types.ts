export interface Task {
  id: string
  user_id: string
  title: string
  completed: boolean
  urgent: boolean
  created_at: string
}

export interface User {
  id: string
  email: string
}
