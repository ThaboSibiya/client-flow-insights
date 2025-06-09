
import { create } from 'zustand';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

interface TicketState {
  tickets: Record<string, CustomerTicket[]>; // customerId -> tickets
  isLoading: boolean;
  error: string | null;
  optimisticUpdates: Record<string, Partial<CustomerTicket>>;
  
  // Actions
  setTicketsForCustomer: (customerId: string, tickets: CustomerTicket[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Optimistic updates
  optimisticAddTicket: (customerId: string, ticket: CustomerTicket) => void;
  optimisticUpdateTicket: (ticketId: string, updates: Partial<CustomerTicket>) => void;
  
  // Revert optimistic updates
  revertOptimisticTicketUpdate: (ticketId: string) => void;
  clearOptimisticUpdates: () => void;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: {},
  isLoading: false,
  error: null,
  optimisticUpdates: {},

  setTicketsForCustomer: (customerId, tickets) => 
    set(state => ({ 
      tickets: { ...state.tickets, [customerId]: tickets } 
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  optimisticAddTicket: (customerId, ticket) => {
    const { tickets, optimisticUpdates } = get();
    const customerTickets = tickets[customerId] || [];
    
    set({
      tickets: {
        ...tickets,
        [customerId]: [ticket, ...customerTickets]
      },
      optimisticUpdates: {
        ...optimisticUpdates,
        [ticket.id]: { __added: true } as any
      }
    });
  },

  optimisticUpdateTicket: (ticketId, updates) => {
    const { tickets, optimisticUpdates } = get();
    
    // Find and update the ticket across all customers
    const updatedTickets = { ...tickets };
    for (const customerId in updatedTickets) {
      updatedTickets[customerId] = updatedTickets[customerId].map(ticket =>
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      );
    }
    
    set({
      tickets: updatedTickets,
      optimisticUpdates: {
        ...optimisticUpdates,
        [ticketId]: { ...optimisticUpdates[ticketId], ...updates }
      }
    });
  },

  revertOptimisticTicketUpdate: (ticketId) => {
    const { optimisticUpdates } = get();
    const update = optimisticUpdates[ticketId];
    
    if (update) {
      const newOptimisticUpdates = { ...optimisticUpdates };
      delete newOptimisticUpdates[ticketId];
      
      set({ optimisticUpdates: newOptimisticUpdates });
      
      toast({
        title: "Ticket action reverted",
        description: "The ticket action has been undone due to an error",
        variant: "destructive",
      });
    }
  },

  clearOptimisticUpdates: () => set({ optimisticUpdates: {} }),
}));
