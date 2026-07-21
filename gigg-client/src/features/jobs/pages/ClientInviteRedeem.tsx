import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';

export default function ClientInviteRedeem() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();
  const { redeemClientInvite } = useAuthStore();
  const { addToast } = useUIStore();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !inviteToken) return;
    attempted.current = true;

    redeemClientInvite(inviteToken)
      .then((jobId) => navigate(`/client/jobs/${jobId}`, { replace: true }))
      .catch(() => {
        addToast('This invite link is invalid or has expired', 'error');
        navigate('/welcome', { replace: true });
      });
  }, [inviteToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
      <p className="font-bold text-slate-500">Opening your invite...</p>
    </div>
  );
}
