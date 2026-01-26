import { CheckCircle, Loader2 } from 'lucide-react';

export type AdminSaveState = 'idle' | 'saving' | 'success' | 'error';

interface AdminSaveButtonProps {
  saveState: AdminSaveState;
  onClick: () => void;
  disabled?: boolean;
  idleLabel?: string;
}

export function AdminSaveButton({
  saveState,
  onClick,
  disabled = false,
  idleLabel = 'Save',
}: AdminSaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || saveState === 'saving'}
      className="inline-flex items-center gap-2 rounded-full bg-deep-ocean px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-deep-ocean/90 disabled:opacity-60 transition-all shadow-sm"
    >
      {saveState === 'saving' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : saveState === 'success' ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-200" />
          Saved
        </>
      ) : (
        idleLabel
      )}
    </button>
  );
}
