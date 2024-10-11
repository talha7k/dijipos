import { create } from "zustand"

interface useTodoModalProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useTodoModal = create<useTodoModalProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
