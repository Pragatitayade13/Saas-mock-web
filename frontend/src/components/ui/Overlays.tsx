import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

// --- Modal Component ---
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-[#12151C] border border-[#272C36] rounded-xl shadow-2xl z-10 flex flex-col my-auto transform transition-all duration-200 overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {title && (
          <div className="px-5 py-4 border-b border-[#272C36] flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">{title}</h3>
            <IconButton icon={<X className="w-4 h-4" />} ariaLabel="Close dialog" onClick={onClose} size="sm" />
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto max-h-[75vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-[#272C36] bg-[#0B0D12]/50 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Drawer Component ---
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} flex max-w-full z-10`}>
        <div className="w-screen max-w-md bg-[#12151C] border-l border-[#272C36] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="h-16 px-5 border-b border-[#272C36] flex items-center justify-between">
            {title ? <h3 className="text-sm font-bold text-[#F8FAFC]">{title}</h3> : <div />}
            <IconButton icon={<X className="w-5 h-5" />} ariaLabel="Close drawer" onClick={onClose} />
          </div>

          {/* Drawer Content */}
          <div className="flex-1 p-5 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
