import { TriangleAlert } from "lucide-react";
import Modal from "./ui/Modal";

// Confirmation dialog for destructive actions (bottom sheet on phones).
export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      icon={TriangleAlert}
      tone="danger"
      size="sm"
      title={title}
      description={message}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-4 rounded-xl text-sm font-semibold text-ink-2 hover:text-ink hover:bg-white/[0.06] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-autofocus
            onClick={onConfirm}
            className="h-11 px-5 rounded-xl font-display text-sm font-bold tracking-wide text-white bg-red-500/90 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-colors"
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}
