
import { Info } from 'lucide-react';

interface ProjectHeaderProps {
  projectName: string;
}

const ProjectHeader = ({ projectName }: ProjectHeaderProps) => {
  return (
    <div className="bg-muted p-4 flex items-center justify-between border-b">
      <div>
        <h3 className="font-semibold">{projectName}</h3>
        <p className="text-sm text-muted-foreground">Project Chat</p>
      </div>
      <Info className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};

export default ProjectHeader;
