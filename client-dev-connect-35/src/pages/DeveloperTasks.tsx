import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ListTodo } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useToast } from "@/components/ui/use-toast";

interface Task {
  project: {
    id: string;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    description: string;
    client: {
      full_name: string;
    };
  };
}

const DeveloperTasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['developer-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_assignments')
        .select(`
          project:projects (
            id,
            name,
            status,
            start_date,
            end_date,
            description,
            client:client_id (
              full_name
            )
          )
        `)
        .eq('developer_id', user?.id);

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      completed: "default",
      in_progress: "secondary",
      pending: "outline",
    };

    return (
      <Badge variant={variants[status.toLowerCase()] || "outline"}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getBoardTasks = (status: string) => {
    return tasks?.filter(task => task.project.status.toLowerCase() === status.toLowerCase()) || [];
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    const taskId = draggableId;
    const newStatus = destination.droppableId;

    if (source.droppableId === destination.droppableId) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      await refetch();
      toast({
        title: "Task Updated",
        description: "Task status has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop tasks to update their status
          </p>
        </div>
        <ListTodo className="h-8 w-8 text-muted-foreground" />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['pending', 'in_progress', 'completed'].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <Card className="bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{status.replace('_', ' ').toUpperCase()}</span>
                      <Badge variant="outline">{getBoardTasks(status).length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {getBoardTasks(status).map((task, index) => (
                        <Draggable
                          key={task.project.id}
                          draggableId={task.project.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 cursor-move hover:bg-accent transition-colors"
                            >
                              <h3 className="font-medium mb-2">{task.project.name}</h3>
                              <div className="text-sm text-muted-foreground mb-2">
                                {task.project.description}
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span>Client: {task.project.client.full_name}</span>
                                <span>Due: {new Date(task.project.end_date).toLocaleDateString()}</span>
                              </div>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </CardContent>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default DeveloperTasks;
