'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, type UserDto } from '@/api/client';

export function useAuth() {
  const qc = useQueryClient();
  const router = useRouter();

  const meQ = useQuery<UserDto | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await api.getMe();
      } catch {
        return null;
      }
    },
  });

  const signup = useMutation({
    mutationFn: api.signup,
    onSuccess: ({ user }) => {
      qc.setQueryData(['me'], user);
      router.push('/account-setup');
    },
  });

  const login = useMutation({
    mutationFn: api.login,
    onSuccess: ({ user }) => {
      qc.setQueryData(['me'], user);
      router.push(user.accountSetupCompleted ? '/dashboard' : '/account-setup');
    },
  });

  const updateProfile = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (user) => {
      qc.setQueryData(['me'], user);
      router.push('/dashboard');
    },
  });

  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      qc.setQueryData(['me'], null);
      router.push('/');
      toast.success('Signed out');
    },
  });

  return {
    user: meQ.data ?? null,
    isLoading: meQ.isLoading,
    isAuthenticated: !!meQ.data,
    isSetupComplete: !!meQ.data?.accountSetupCompleted,
    signup, login, updateProfile, logout,
  };
}
