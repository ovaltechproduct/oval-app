
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type MessageWithDetails = {
  id: string;
  content: string;
  sent_at: string | null;
  sender_id: string;
  project_id: string;
  sender_name: string | null;
  sender_role: string | null;
};

export const useMessages = (projectId: string) => {
  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !projectId) return;

      try {
        const { data: viewData, error: viewError } = await supabase
          .from('message_details')
          .select('*')
          .eq('project_id', projectId)
          .order('sent_at', { ascending: true });

        if (viewError) throw viewError;

        if (viewData) {
          setMessages(viewData as MessageWithDetails[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `project_id=eq.${projectId}`
        },
        async (payload) => {
          // Fetch the complete message details including sender info
          const { data: messageData, error: messageError } = await supabase
            .from('message_details')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (!messageError && messageData) {
            setMessages((prevMessages) => [...prevMessages, messageData as MessageWithDetails]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, user]);

  return { messages, loading, error };
};
