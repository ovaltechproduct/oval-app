
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assigned_to: string;
  assigned_to_user?: {
    full_name: string;
  };
}

export interface Column {
  title: string;
  tasks: Task[];
}

export interface Columns {
  [key: string]: Column;
}
