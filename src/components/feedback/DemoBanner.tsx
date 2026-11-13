import { Info, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { ConfirmDialog, useToast } from '@/components/ui';
import { resetDemoData } from '@/lib/demoDb';
import { DEMO_MODE } from '@/services/apiClient';

export function DemoBanner() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!DEMO_MODE) return null;

  async function handleReset() {
    resetDemoData();
    await logout();
    setOpen(false);
    navigate('/login');
    toast({
      title: 'Demonstration data reset',
      description: 'Seed records have been restored and your session has ended.',
      variant: 'info',
    });
  }

  return (
    <>
      <div className="app-demo-banner border-b border-warning-100 text-warning">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-2xs sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="font-semibold">Demonstration environment.</span>
            <span className="hidden text-warning/90 sm:inline">
              Data is simulated, stored in this browser and does not represent real YouthRise records.
            </span>
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Reset demo data
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => void handleReset()}
        title="Reset demonstration data?"
        description="All simulated enrolments, submissions, messages and settings you have changed in this browser will be restored to their seed values. You will be signed out."
        confirmLabel="Reset and sign out"
        tone="danger"
      />
    </>
  );
}
