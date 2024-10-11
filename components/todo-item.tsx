"use client"
import { Todo } from "@/types"
import { Button } from "./ui/button"
import { Check, Pencil, Trash } from "lucide-react"
import { useState } from "react"
import { useTodos } from "@/hooks/use-todos"
import { AlertModal } from "./alert-modal"
import { useSelectedTodo } from "@/hooks/use-selected-todo"
import { useTodoModal } from "@/hooks/use-todo-modal"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface TodoItemProps {
  todo: Todo
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const todos = useTodos((state) => state.todos)
  const setTodos = useTodos((state) => state.setTodos)
  const [done, setDone] = useState(false)

  const setTodo = useSelectedTodo((state) => state.setTodo)
  const todoModal = useTodoModal()

  const onDeleteTodo = async (todoId: number) => {
    try {
      setLoading(true)
      setTodos(todos.filter((todo) => todo.id !== todoId))
      toast.success("Todo Deleted")
    } catch (error) {
      toast.error("Something Went Wrong")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleChange = (newTodo: Todo) => {
    setDone((prev) => !prev)
    if (todo.done) {
      toast.success("Todo undone")
    } else {
      toast.success("Todo done")
    }
    setTodos(
      todos.map((todo) =>
        todo.id === newTodo.id ? { ...todo, done: !todo.done } : todo
      )
    )
  }
  return (
    <>
      <AlertModal
        open={open}
        onClose={() => setOpen(false)}
        disabled={loading}
        onConfirm={() => onDeleteTodo(todo.id)}
      />
      <div
        className={cn(
          "flex  gap-2 bg-white p-4 rounded-md border",
          todo.done && "bg-teal-50"
        )}
      >
        <Button
          onClick={() => handleChange(todo)}
          size="icon"
          variant="outline"
          className={cn(
            todo.done &&
              "bg-teal-500 text-white hover:bg-teal-600 hover:text-white"
          )}
        >
          <Check className="w-4 h-4" />
        </Button>
        <div>
          <h4
            className={cn(
              "text-xl font-semibold tracking-tight",
              todo.done && "line-through"
            )}
          >
            {todo.title}
          </h4>
          <p className=" font-semibold tracking-tight">{todo.description}</p>
        </div>
        <div className="flex flex-col gap-2 ml-auto">
          <Button
            onClick={() => setOpen(true)}
            variant="destructive"
            size="icon"
          >
            <Trash className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              setTodo(todo)
              todoModal.onOpen()
            }}
            variant="outline"
            size="icon"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
