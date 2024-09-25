'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import * as ethers from 'ethers'
import { toast } from 'react-toastify'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TodoItem } from './todo-item'
import { AddTodoForm } from './add-todo-form'
import { ThemeToggle } from '../theme-toggle'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Todo, Priority, Timeframe } from '@/types'

// Mock smart contract ABI (replace with your actual ABI)
const ABI = [
  "function addTodo(string memory _title, string memory _description, uint8 _priority, uint256 _timeframe, uint256 _stakeAmount) public payable",
  "function getTodos() public view returns (string[] memory, string[] memory, uint8[] memory, uint256[] memory, uint256[] memory, bool[] memory)",
  "function toggleTodo(uint _index) public",
  "function deleteTodo(uint _index) public",
  "function updateTodo(uint _index, string memory _title, string memory _description, uint8 _priority) public",
  "function claimReward(uint _index) public"
]

const CONTRACT_ADDRESS = "0x123..."; // Replace with your actual contract address

export default function TodoApp() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [wallet, setWallet] = useState<string | null>(null)
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (todos.length > 0 && todos.every(todo => todo.completed)) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      })
    }
  }, [todos])

  useEffect(() => {
    const interval = setInterval(() => {
      checkDeadlines()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [todos])

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setWallet(address)
        toast.success('Wallet connected successfully')
        fetchTodos()
      } catch (error) {
        toast.error('Failed to connect wallet')
      }
    } else {
      toast.error('Please install MetaMask')
    }
  }

  const fetchTodos = async () => {
    setIsLoading(true)
    if (wallet) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        const [titles, descriptions, priorities, timeframes, stakeAmounts, completedStates] = await contract.getTodos()
        const fetchedTodos = titles.map((title: string, index: number) => ({
          id: index.toString(),
          title,
          description: descriptions[index],
          timestamp: Date.now(),
          completed: completedStates[index],
          priority: ['low', 'medium', 'high'][priorities[index]] as Priority,
          timeframe: ['1 hour', '1 day', '1 week', '1 month'][timeframes[index]] as Timeframe,
          stakeAmount: parseFloat(ethers.utils.formatEther(stakeAmounts[index])),
          deadline: Date.now() + (timeframes[index] * 3600000) // Convert hours to milliseconds
        }))
        setTodos(fetchedTodos)
      } catch (error) {
        toast.error('Failed to fetch todos from the blockchain')
      }
    } else {
      // Mock data for demonstration when wallet is not connected
      setTodos([
        { id: '1', title: 'Implement smart contract', description: 'Create a Solidity smart contract for the Todo app', timestamp: Date.now(), completed: false, priority: 'high', timeframe: '1 day', stakeAmount: 0.1, deadline: Date.now() + 86400000 },
        { id: '2', title: 'Design NFT collection', description: 'Create unique NFT designs for the project', timestamp: Date.now(), completed: false, priority: 'medium', timeframe: '1 week', stakeAmount: 0.5, deadline: Date.now() + 604800000 },
      ])
    }
    setIsLoading(false)
  }

  const addTodo = async (newTodo: Omit<Todo, 'id' | 'timestamp' | 'completed' | 'deadline'>) => {
    setIsLoading(true)
    if (wallet) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        const timeframeIndex = ['1 hour', '1 day', '1 week', '1 month'].indexOf(newTodo.timeframe)
        const tx = await contract.addTodo(
          newTodo.title,
          newTodo.description,
          ['low', 'medium', 'high'].indexOf(newTodo.priority),
          timeframeIndex,
          ethers.utils.parseEther(newTodo.stakeAmount.toString()),
          { value: ethers.utils.parseEther(newTodo.stakeAmount.toString()) }
        )
        await tx.wait()
        fetchTodos()
        toast.success('Todo added to the blockchain')
      } catch (error) {
        toast.error('Failed to add todo to the blockchain')
      }
    } else {
      const todoToAdd: Todo = {
        ...newTodo,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        completed: false,
        deadline: Date.now() + (getTimeframeInHours(newTodo.timeframe) * 3600000)
      }
      setTodos([...todos, todoToAdd])
      toast.success('Todo added successfully (Demo mode)')
    }
    setIsLoading(false)
  }

  const updateTodo = async (updatedTodo: Todo) => {
    setIsLoading(true)
    if (wallet) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        const tx = await contract.updateTodo(
          parseInt(updatedTodo.id),
          updatedTodo.title,
          updatedTodo.description,
          ['low', 'medium', 'high'].indexOf(updatedTodo.priority)
        )
        await tx.wait()
        fetchTodos()
        toast.success('Todo updated on the blockchain')
      } catch (error) {
        toast.error('Failed to update todo on the blockchain')
      }
    } else {
      setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t))
      toast.success('Todo updated successfully (Demo mode)')
    }
    setIsLoading(false)
  }

  const toggleTodo = async (id: string) => {
    setIsLoading(true)
    if (wallet) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        const tx = await contract.toggleTodo(parseInt(id))
        await tx.wait()
        fetchTodos()
        toast.success('Todo status updated on the blockchain')
      } catch (error) {
        toast.error('Failed to update todo status on the blockchain')
      }
    } else {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
      toast.success('Todo status updated successfully (Demo mode)')
    }
    setIsLoading(false)
  }

  const deleteTodo = async (id: string) => {
    setIsLoading(true)
    if (wallet) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        const tx = await contract.deleteTodo(parseInt(id))
        await tx.wait()
        fetchTodos()
        toast.success('Todo deleted from the blockchain')
      } catch (error) {
        toast.error('Failed to delete todo from the blockchain')
      }
    } else {
      setTodos(todos.filter(t => t.id !== id))
      toast.success('Todo deleted successfully (Demo mode)')
    }
    setIsLoading(false)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(todos)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTodos(items)
    toast.info('Todo reordered successfully')
  }

  const checkDeadlines = () => {
    const now = Date.now()
    todos.forEach(todo => {
      if (!todo.completed && todo.deadline < now) {
        // In a real application, you would call a smart contract function here
        // to transfer the staked amount to the contract
        toast.error(`You missed the deadline for "${todo.title}" and lost ${todo.stakeAmount} ETH!`)
      }
    })
  }

  const getTimeframeInHours = (timeframe: Timeframe): number => {
    switch (timeframe) {
      case '1 hour': return 1
      case '1 day': return 24
      case '1 week': return 168
      case '1 month': return 720
      default: return 24
    }
  }

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    todo.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isMounted) {
    return null
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="flex md:flex-row sm:flex-col  items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Web3 Todo App</CardTitle>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {wallet ? (
                <p className="text-sm bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-full">
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </p>
              ) : (
                <Button onClick={connectWallet} 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                  Connect Wallet
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search todos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="todos">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {filteredTodos.map((todo, index) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        index={index}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                        onUpdate={updateTodo}
                      />
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
          <CardFooter>
            <AddTodoForm onAddTodo={addTodo} />
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}