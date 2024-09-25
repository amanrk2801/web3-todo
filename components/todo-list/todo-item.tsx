'use client'

import React, { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Todo, Priority } from '@/types'
import { CheckCircle, XCircle, Edit2, Trash2, MoreVertical, Flag, Clock, DollarSign } from 'lucide-react'

interface TodoItemProps {
  todo: Todo
  index: number
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (todo: Todo) => void
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, index, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(todo.title)
  const [editedDescription, setEditedDescription] = useState(todo.description)

  const handleUpdate = () => {
    onUpdate({ ...todo, title: editedTitle, description: editedDescription })
    setIsEditing(false)
  }

  const priorityColors: Record<Priority, string> = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  }

  const timeLeft = todo.deadline - Date.now()
  const isOverdue = timeLeft < 0

  return (
    <Draggable draggableId={todo.id} index={index}>
      {(provided) => (
        <motion.li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm"
        >
          <div className="flex items-start space-x-4 flex-grow">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(todo.id)}
              className={`${todo.completed ? 'text-green-500' : 'text-gray-400'} hover:text-green-600`}
            >
              {todo.completed ? <CheckCircle /> : <XCircle />}
            </Button>
            {isEditing ? (
              <div className="flex flex-col space-y-2 flex-grow">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full"
                />
                <Input
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-end space-x-2">
                  <Button size="sm" onClick={handleUpdate}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <h3 className={`font-semibold ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {todo.title}
                </h3>
                <p className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                  {todo.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock className="h-4 w-4" />
                  <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {isOverdue ? 'Overdue' : `${Math.ceil(timeLeft / (1000 * 60 * 60))} hours left`}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">{todo.stakeAmount} ETH at stake</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${priorityColors[todo.priority]}`} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(todo.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate({ ...todo, priority: 'low' })}>
                  <Flag className="h-4 w-4 mr-2 text-green-500" /> Set Low Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate({ ...todo, priority: 'medium' })}>
                  <Flag className="h-4 w-4 mr-2 text-yellow-500" /> Set Medium Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdate({ ...todo, priority: 'high' })}>
                  <Flag className="h-4 w-4 mr-2 text-red-500" /> Set High Priority
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.li>
      )}
    </Draggable>
  )
}