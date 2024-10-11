import { useTodos } from "@/hooks/use-todos"
import { TodoItem } from "./todo-item"

export const TodoList = () => {
  const todos = useTodos((state) => state.todos)

  return (
    <div className="flex flex-col gap-4 mt-10 pt-10">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
