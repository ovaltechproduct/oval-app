
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KanbanBoard } from "./KanbanBoard";
import { TasksHeader } from "./header/TasksHeader";

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assigned_to: string;
  assigned_to_user?: {
    full_name: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Developer {
  id: string;
  full_name: string;
}

export const TasksManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null);

  const fetchTasks = async () => {
    let query = supabase
      .from("tasks")
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_fkey (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (selectedDeveloper) {
      query = query.eq("assigned_to", selectedDeveloper);
    }

    const { data: tasksData, error: tasksError } = await query;

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return;
    }

    setTasks(tasksData as Task[]);
  };

  const fetchDevelopers = async () => {
    const { data: developersData, error: developersError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "developer");

    if (developersError) {
      console.error("Error fetching developers:", developersError);
      return;
    }

    setDevelopers(developersData);
  };

  useEffect(() => {
    fetchTasks();
    fetchDevelopers();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDeveloper]);

  return (
    <div className="space-y-6">
      <TasksHeader
        developers={developers}
        onDeveloperSelect={setSelectedDeveloper}
        onTaskCreated={fetchTasks}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <KanbanBoard tasks={tasks} onTasksUpdate={fetchTasks} />
    </div>
  );
};
