export type Priority = 'low' | 'medium' | 'high'
export type Timeframe = '1 hour' | '1 day' | '1 week' | '1 month'

export interface Todo {
  id: string
  title: string
  description: string
  timestamp: number
  completed: boolean
  priority: Priority
  timeframe: Timeframe
  stakeAmount: number
  deadline: number
}