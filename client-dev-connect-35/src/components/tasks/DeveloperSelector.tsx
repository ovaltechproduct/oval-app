
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Developer {
  id: string;
  full_name: string;
}

interface DeveloperSelectorProps {
  onDeveloperSelect: (developerId: string | null) => void;
}

export const DeveloperSelector = ({ onDeveloperSelect }: DeveloperSelectorProps) => {
  const [developers, setDevelopers] = useState<Developer[]>([]);

  useEffect(() => {
    const fetchDevelopers = async () => {
      const { data: developersData, error } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("role", "developer");

      if (error) {
        console.error("Error fetching developers:", error);
        return;
      }

      setDevelopers(developersData);
    };

    fetchDevelopers();
  }, []);

  return (
    <div className="w-[200px]">
      <Select
        onValueChange={(value) => onDeveloperSelect(value === "all" ? null : value)}
        defaultValue="all"
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a developer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Developers</SelectItem>
          {developers.map((developer) => (
            <SelectItem key={developer.id} value={developer.id}>
              {developer.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
