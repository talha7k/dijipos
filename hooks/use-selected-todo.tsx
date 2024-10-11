import { Todo } from "@/types"
import { create } from "zustand"

interface useSelectedTodoProps {
  todo: Todo | null
  setTodo: (todo: Todo | null) => void
}

export const useSelectedTodo = create<useSelectedTodoProps>((set) => ({
  todo: null,
  setTodo: (todo: Todo | null) => set({ todo }),
}))
