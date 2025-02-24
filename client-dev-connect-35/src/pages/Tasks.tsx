
import DashboardLayout from "@/components/DashboardLayout";
import { TasksManagement } from "@/components/tasks/TasksManagement";

const Tasks = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks Management</h2>
          <p className="text-muted-foreground">
            Create and manage tasks for developers
          </p>
        </div>
        
        <TasksManagement />
      </div>
    </DashboardLayout>
  );
};

export default Tasks;
