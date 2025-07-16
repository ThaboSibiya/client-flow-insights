
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MakeCallPayload {
  phoneNumber: string;
  customerId?: string;
}

const makeCallFn = async ({ phoneNumber, customerId }: MakeCallPayload) => {
  const { data, error } = await supabase.functions.invoke('make-call', {
    body: { phoneNumber, customerId },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useVoiceCall = () => {
  const { toast } = useToast();
  const { mutate, isPending: isCalling } = useMutation<any, Error, MakeCallPayload>({
    mutationFn: makeCallFn,
    onSuccess: (data) => {
      toast({
        title: 'Call Initiated',
        description: data.message || 'The call is being connected.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Call Failed',
        description: error.message || 'Could not initiate the call.',
        variant: 'destructive',
      });
    },
  });

  return { makeCall: mutate, isCalling };
};
