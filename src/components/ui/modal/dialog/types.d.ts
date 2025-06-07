export interface ConfirmDialogProps {
  title: string;
  content?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  hideCancelButton?: boolean;
}
