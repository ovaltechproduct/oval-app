import React, { useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MessageList from '@/components/messages/MessageList';
import MessageInput from '@/components/messages/MessageInput';

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const { messages, loading, error } = useMessages(currentProjectId || '');
  const [noProject, setNoProject] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);

  React.useEffect(() => {
    const fetchCurrentProject = async () => {
      if (!user) {
        setProjectLoading(false);
        return;
      }

      try {
        console.log('Fetching project for user:', user.id);

        const { data, error } = await supabase
          .from('projects')
          .select('id, name')
          .eq('client_id', user.id)
          .maybeSingle();

        console.log('Project query result:', { data, error });

        if (error) throw error;
        
        if (!data) {
          console.log('No project found for user');
          setNoProject(true);
          setCurrentProjectId(null);
        } else {
          setNoProject(false);
          setCurrentProjectId(data.id);
          setProjectName(data.name);
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        toast({
          title: 'Error',
          description: 'Could not fetch current project',
          variant: 'destructive'
        });
      } finally {
        setProjectLoading(false);
      }
    };

    fetchCurrentProject();
  }, [user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentProjectId || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          project_id: currentProjectId,
          sender_id: user.id
        });

      if (error) throw error;

      setNewMessage('');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse text-muted-foreground">Loading project information...</div>
      </div>
    );
  }

  if (noProject) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
        </div>
        <Alert>
          <AlertDescription>
            You don't have any active projects. Messages will be available once you're assigned to a project.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
        {projectName && (
          <span className="text-sm text-muted-foreground">
            Project: {projectName}
          </span>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="h-[calc(100vh-300px)] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} loading={loading} error={error} />
          </div>
          <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
