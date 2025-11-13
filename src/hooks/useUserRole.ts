import { useAuth } from './use-auth';

export const useUserRole = () => {
  const { user, loading } = useAuth();

  const isAdmin = user?.roles?.some((r: any) => r === 'admin') ?? false;

  return {
    isAdmin,
    isLoading: loading,
    roles: user?.roles ?? []
  };
};
