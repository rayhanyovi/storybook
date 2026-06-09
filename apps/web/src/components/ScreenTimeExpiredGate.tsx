import { useLocation, useNavigate } from 'react-router-dom';
import { ParentGate } from '@/components/ParentGate';
import { useScreenTime } from '@/providers/ScreenTimeProvider';
import { useAuth } from '@/providers/AuthProvider';

export function ScreenTimeExpiredGate() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { token } = useAuth();
  const { isExpired, clearKidSession } = useScreenTime();

  if (!token || !isExpired || pathname.startsWith('/read/')) return null;

  return (
    <ParentGate
      title="Screen time is up"
      description="Enter the parent PIN to close kid mode."
      speech="Oyen is getting sleepy"
      mascotPose="sleeping"
      onSuccess={() => {
        clearKidSession();
        navigate('/parent', { replace: true });
      }}
    />
  );
}
