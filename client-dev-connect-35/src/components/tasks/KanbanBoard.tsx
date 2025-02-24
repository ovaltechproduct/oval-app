
import { DragDropContext } from "@hello-pangea/dnd";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./column/KanbanColumn";
import { Task, Columns } from "./types";

interface KanbanBoardProps {
  tasks: Task[];
  onTasksUpdate: () => void;
}

export const KanbanBoard = ({ tasks, onTasksUpdate }: KanbanBoardProps) => {
  const columns: Columns = {
    todo: {
      title: "To Do",
      tasks: tasks.filter((task) => task.status === "todo"),
    },
    in_progress: {
      title: "In Progress",
      tasks: tasks.filter((task) => task.status === "in_progress"),
    },
    done: {
      title: "Done",
      tasks: tasks.filter((task) => task.status === "done"),
    },
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as Task['status'];

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", draggableId);

    if (error) {
      console.error("Error updating task status:", error);
      return;
    }

    onTasksUpdate();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
            title={column.title}
            tasks={column.tasks}
          />
        ))}
      </div>
    </DragDropContext>
  );
};
