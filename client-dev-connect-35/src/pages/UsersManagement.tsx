import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/users/DataTable";
import { useToast } from "@/hooks/use-toast";
import { columns } from "@/components/users/columns";
import { Users } from "lucide-react";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
};

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Users Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all user accounts
          </p>
        </div>
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="border rounded-lg">
        <DataTable columns={columns} data={users} />
      </div>
    </div>
  );
};

export default UsersManagement;
