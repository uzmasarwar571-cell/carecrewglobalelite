/**
 * The sticky save bar every editor page shares.
 *
 * It only appears once there is something to save, which keeps the
 * page quiet while reading and unmissable while editing.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Check, Undo2 } from 'lucide-react';
import { Button } from './primitives';

export function SaveBar({
  dirty,
  saving,
  savedAt,
  onSave,
  onReset,
  onRestoreDefaults,
  restoreLabel = 'Restore defaults',
  message,
}) {
  const justSaved = savedAt && Date.now() - savedAt < 4000;

  return (
    <AnimatePresence>
      {(dirty || justSaved) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18 }}
          className="sticky bottom-4 z-30 mt-6"
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
            {dirty ? (
              <>
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                <p className="min-w-0 flex-1 text-[13px] text-slate-600 dark:text-slate-300">
                  {message || 'You have unsaved changes.'}
                </p>
                {onRestoreDefaults && (
                  <Button size="sm" variant="ghost" icon={RotateCcw} onClick={onRestoreDefaults}>
                    {restoreLabel}
                  </Button>
                )}
                {onReset && (
                  <Button size="sm" variant="ghost" icon={Undo2} onClick={onReset}>
                    Discard
                  </Button>
                )}
                <Button size="sm" variant="primary" loading={saving} onClick={onSave}>
                  Save changes
                </Button>
              </>
            ) : (
              <p className="flex items-center gap-2 text-[13px] font-medium text-green-700 dark:text-green-400">
                <Check className="h-4 w-4" aria-hidden="true" />
                Saved. The live site is updated.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SaveBar;
