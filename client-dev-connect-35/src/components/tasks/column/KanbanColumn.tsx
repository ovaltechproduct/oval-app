
import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "../card/TaskCard";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assigned_to: string;
  assigned_to_user?: {
    full_name: string;
  };
}

interface KanbanColumnProps {
  columnId: string;
  title: string;
  tasks: Task[];
}

export const KanbanColumn = ({ columnId, title, tasks }: KanbanColumnProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <Droppable droppableId={columnId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[500px] bg-secondary/30 rounded-lg p-4 space-y-4"
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
