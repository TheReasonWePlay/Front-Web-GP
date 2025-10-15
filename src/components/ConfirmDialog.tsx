/**
 * ============================================================================
 * CONFIRM DIALOG COMPONENT
 * ============================================================================
 * 
 * A reusable confirmation dialog for destructive actions (delete, remove, etc.)
 * 
 * Features:
 * - Clear warning message with item details
 * - Destructive styling (red/warning colors)
 * - Consistent UX across all delete operations
 * - Flexible API for different use cases
 * - Keyboard accessible (ESC to cancel, Enter to confirm)
 * 
 * Usage Example:
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete Agent"
 *   description="Are you sure you want to delete this agent?"
 *   itemName="John Smith (MAT-001)"
 *   confirmText="Yes, Delete"
 *   onConfirm={async () => {
 *     await deleteAgent(id);
 *   }}
 * />
 * ```
 * 
 * @module components/ConfirmDialog
 */

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

/**
 * Props for the ConfirmDialog component
 */
interface ConfirmDialogProps {
  /**
   * Controls whether the dialog is open
   */
  open: boolean;
  
  /**
   * Callback when the dialog open state changes
   * @param open - New open state
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Dialog title (e.g., "Delete Agent", "Remove Schedule")
   */
  title: string;
  
  /**
   * Main confirmation message
   * @default "Are you sure you want to delete this item? This action cannot be undone."
   */
  description?: string;
  
  /**
   * Name or identifier of the item being deleted
   * Displayed prominently to help user confirm they're deleting the right item
   * @example "John Smith (MAT-001)"
   * @example "Holiday: New Year's Day (2025-01-01)"
   */
  itemName?: string;
  
  /**
   * Text for the confirm/delete button
   * @default "Yes, Delete"
   */
  confirmText?: string;
  
  /**
   * Text for the cancel button
   * @default "Cancel"
   */
  cancelText?: string;
  
  /**
   * Callback when user confirms the action
   * Can be async for API calls
   */
  onConfirm: () => void | Promise<void>;
  
  /**
   * Optional callback when user cancels
   */
  onCancel?: () => void;
  
  /**
   * Whether the confirm action is currently loading
   * Shows a loading spinner on the confirm button
   */
  isLoading?: boolean;
}

/**
 * Confirmation Dialog Component
 * 
 * A standardized dialog for confirming destructive actions like deletions.
 * Uses destructive/warning styling to make the action's severity clear.
 * 
 * @param props - ConfirmDialog properties
 * @returns A confirmation dialog component
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  /**
   * Handle confirm action
   * Prevents default, calls onConfirm, and closes dialog
   */
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  /**
   * Handle cancel action
   * Calls optional onCancel callback and closes dialog
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          {/* Warning Icon and Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          </div>
          
          {/* Description */}
          <AlertDialogDescription className="text-left pt-2">
            {description}
          </AlertDialogDescription>
          
          {/* Item Name Display (if provided) */}
          {itemName && (
            <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {itemName}
              </p>
            </div>
          )}
          
          {/* Warning Message */}
          <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-900">
            <p className="text-sm text-red-800 dark:text-red-300">
              ⚠️ This action cannot be undone
            </p>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          {/* Cancel Button */}
          <AlertDialogCancel
            onClick={handleCancel}
            disabled={isLoading}
            className="mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
          
          {/* Confirm/Delete Button */}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook for managing confirm dialog state
 * 
 * Provides a simple API for showing confirmation dialogs
 * 
 * Usage:
 * ```tsx
 * const confirmDelete = useConfirmDialog();
 * 
 * const handleDelete = async (id: string, name: string) => {
 *   const confirmed = await confirmDelete({
 *     title: 'Delete Agent',
 *     itemName: name,
 *   });
 *   
 *   if (confirmed) {
 *     await deleteAgent(id);
 *   }
 * };
 * ```
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    resolve?: (value: boolean) => void;
  }>({ isOpen: false });

  /**
   * Show confirmation dialog and wait for user response
   * 
   * @param options - Dialog configuration options
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  const confirm = (options: Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'onConfirm'>) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({ isOpen: true, resolve });
    });
  };

  /**
   * Handle dialog close
   */
  const handleConfirm = () => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState({ isOpen: false });
  };

  const handleCancel = () => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState({ isOpen: false });
  };

  return {
    confirm,
    isOpen: dialogState.isOpen,
    handleConfirm,
    handleCancel,
  };
}
