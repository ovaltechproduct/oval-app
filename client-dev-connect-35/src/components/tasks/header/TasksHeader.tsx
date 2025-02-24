
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeveloperSelector } from "../DeveloperSelector";
import { CreateTaskForm } from "../create/CreateTaskForm";

interface Developer {
  id: string;
  full_name: string;
}

interface TasksHeaderProps {
  developers: Developer[];
  onDeveloperSelect: (developerId: string | null) => void;
  onTaskCreated: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const TasksHeader = ({
  developers,
  onDeveloperSelect,
  onTaskCreated,
  isOpen,
  setIsOpen,
}: TasksHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <DeveloperSelector onDeveloperSelect={onDeveloperSelect} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Create Task</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <CreateTaskForm
            developers={developers}
            onSuccess={onTaskCreated}
            onClose={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
