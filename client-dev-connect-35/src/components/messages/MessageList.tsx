
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string | null;
  sender_role: string | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-muted-foreground">Break the ice by sending the first message</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${
                message.sender_id === currentUserId 
                  ? 'justify-end' 
                  : 'justify-start'
              }`}
            >
              <div className="flex flex-col max-w-[70%]">
                {message.sender_id !== currentUserId && (
                  <div className="ml-3 mb-1">
                    <span className="text-sm font-medium">{message.sender_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{message.sender_role}</span>
                  </div>
                )}
                <div 
                  className={`p-3 rounded-lg backdrop-blur-sm ${
                    message.sender_id === currentUserId 
                      ? 'bg-primary/90 text-primary-foreground ml-auto' 
                      : 'bg-gray-100/80 backdrop-blur-sm border border-white/20'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

export default MessageList;
