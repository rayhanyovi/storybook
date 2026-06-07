import { useQuery } from '@tanstack/react-query';
import type { UserDTO } from '@storybook/shared';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth as useAuthCtx } from '@/providers/AuthProvider';

export function useMe() {
  const { token, setUser } = useAuthCtx();
  return useQuery<UserDTO>({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const user = await api.get<UserDTO>('/auth/me');
      setUser(user);
      return user;
    },
    enabled: !!token,
    staleTime: 60_000
  });
}
