import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-xl border border-line bg-background px-4 py-3">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden />
          <p className="text-sm leading-relaxed text-muted">{description}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-elevated hover:text-ink"
          >
            {cancelLabel}
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors ${
              danger ? "bg-primary hover:bg-deep" : "bg-elevated hover:bg-line"
            }`}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
