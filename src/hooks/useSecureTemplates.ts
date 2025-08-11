
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateService } from '@/services/templateService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSecureTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['secure-templates', user?.id],
    queryFn: () => templateService.getUserCustomTemplates(),
    enabled: !!user,
    retry: false,
  });

  const createTemplateMutation = useMutation({
    mutationFn: (templateData: Parameters<typeof templateService.createCustomTemplate>[0]) =>
      templateService.createCustomTemplate({ ...templateData, userId: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-templates'] });
      toast({
        title: "Template Created",
        description: "Your custom template has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ templateId, templateData }: { 
      templateId: string; 
      templateData: Parameters<typeof templateService.updateCustomTemplate>[1] 
    }) =>
      templateService.updateCustomTemplate(templateId, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-templates'] });
      toast({
        title: "Template Updated",
        description: "Your template has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: templateService.deleteCustomTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-templates'] });
      toast({
        title: "Template Deleted",
        description: "Template has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
};
