
import { ColumnDef } from "@tanstack/react-table";
import { User } from "@/pages/UsersManagement";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const updateUserRole = async (newRole: string) => {
        try {
          const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', user.id);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Updated ${user.full_name}'s role to ${newRole}`,
          });
        } catch (error: any) {
          console.error('Error updating user role:', error);
          toast({
            title: "Error",
            description: "Failed to update user role. Please try again.",
            variant: "destructive",
          });
        }
      };

      const deleteUser = async () => {
        if (!confirm(`Are you sure you want to delete ${user.full_name}?`)) {
          return;
        }

        try {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

          if (error) throw error;

          toast({
            title: "Success",
            description: `Deleted user ${user.full_name}`,
          });
        } catch (error: any) {
          console.error('Error deleting user:', error);
          toast({
            title: "Error",
            description: "Failed to delete user. Please try again.",
            variant: "destructive",
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => updateUserRole("client")}>
              Make Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateUserRole("developer")}>
              Make Developer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateUserRole("affiliate")}>
              Make Affiliate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateUserRole("superadmin")}>
              Make Superadmin
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={deleteUser}
              className="text-red-600 focus:text-red-600"
            >
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
