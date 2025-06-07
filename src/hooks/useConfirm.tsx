import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';

import { ConfirmDialog } from '@/components/ui/modal/dialog/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  hideCancelButton?: boolean;
}

/**
 * 공통 확인 팝업을 표시하고 결과를 Promise로 반환하는 훅
 */
export const useConfirm = () => {
  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>(resolve => {
      const dialogRoot = document.createElement('div');
      document.body.appendChild(dialogRoot);
      const root = createRoot(dialogRoot);

      const handleConfirm = () => {
        root.unmount();
        document.body.removeChild(dialogRoot);
        resolve(true);
      };

      const handleCancel = () => {
        root.unmount();
        document.body.removeChild(dialogRoot);
        resolve(false);
      };

      root.render(
        <ConfirmDialog
          title={options.title}
          content={options.content}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          hideCancelButton={options.hideCancelButton}
        />
      );
    });
  }, []);

  return { confirm };
};
