import { Button } from "./ui/button"
import { Modal } from "./ui/modal"

interface AlertModalProps {
  disabled: boolean
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const AlertModal: React.FC<AlertModalProps> = ({
  disabled,
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      title="Are You Sure to delete"
      description="This action can not be undone!"
      isOpen={open}
      onClose={onClose}
    >
      <div className="flex items-center justify-end gap-x-2">
        <Button onClick={onClose} disabled={disabled} variant="outline">
          Cancel
        </Button>

        <Button onClick={onConfirm} disabled={disabled} variant="destructive">
          Delete
        </Button>
      </div>
    </Modal>
  )
}

export { AlertModal }
