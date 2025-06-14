
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useConversationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const archiveConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'archived' })
        .eq('id', conversationId)
        .eq('company_owner_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Success",
        description: "Conversation archived successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive conversation",
        variant: "destructive",
      });
    },
  });

  const assignConversation = useMutation({
    mutationFn: async ({ conversationId, employeeId }: { conversationId: string; employeeId: string }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ employee_id: employeeId })
        .eq('id', conversationId)
        .eq('company_owner_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Success",
        description: "Conversation assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign conversation",
        variant: "destructive",
      });
    },
  });

  const updateConversationStatus = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: string; status: 'active' | 'closed' | 'archived' }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ status })
        .eq('id', conversationId)
        .eq('company_owner_id', user?.id);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Success",
        description: `Conversation status updated to ${status}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update conversation status",
        variant: "destructive",
      });
    },
  });

  return {
    archiveConversation: archiveConversation.mutate,
    assignConversation: assignConversation.mutate,
    updateConversationStatus: updateConversationStatus.mutate,
    isArchiving: archiveConversation.isPending,
    isAssigning: assignConversation.isPending,
    isUpdatingStatus: updateConversationStatus.isPending,
  };
};
