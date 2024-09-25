import TodoApp from '@/components/todo-list/todo-list'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <TodoApp />
    </main>
  )
}