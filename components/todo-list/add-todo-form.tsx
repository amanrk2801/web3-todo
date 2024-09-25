'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Priority, Timeframe } from '@/types'

interface AddTodoFormProps {
  onAddTodo: (todo: { title: string; description: string; priority: Priority; timeframe: Timeframe; stakeAmount: number }) => void
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [timeframe, setTimeframe] = useState<Timeframe>('1 day')
  const [stakeAmount, setStakeAmount] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && stakeAmount > 0) {
      onAddTodo({ title, description, priority, timeframe, stakeAmount })
      setTitle('')
      setDescription('')
      setPriority('medium')
      setTimeframe('1 day')
      setStakeAmount(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <Input
        type="text"
        placeholder="Todo title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full"
      />
      <Input
        type="text"
        placeholder="Todo description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full"
      />
      <div className="flex flex-wrap gap-4">
        <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeframe} onValueChange={(value: Timeframe) => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1 hour">1 hour</SelectItem>
            <SelectItem value="1 day">1 day</SelectItem>
            <SelectItem value="1 week">1 week</SelectItem>
            <SelectItem value="1 month">1 month</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Stake amount (ETH)"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
          className="w-[180px]"
          step="0.01"
          min="0"
        />
      </div>
      <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
      >Add Todo</Button>
    </form>
  )
}