'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


export function ClientOnlyDragDropContext({ children, ...props }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <DragDropContext {...props}>{children}</DragDropContext>
}

export function ClientOnlyDroppable({ children, ...props }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <Droppable {...props}>{children}</Droppable>
}