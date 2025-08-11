
import { useQuery } from '@tanstack/react-query';
import { templateService } from '@/services/templateService';
import { useAuth } from '@/context/AuthContext';

export const useCustomTemplates = () => {
  const { user } = useAuth();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['custom-templates', user?.id],
    queryFn: () => templateService.getUserCustomTemplates(),
    enabled: !!user,
    retry: false,
  });

  return {
    templates: templates || [],
    loading: isLoading,
    error,
  };
};
