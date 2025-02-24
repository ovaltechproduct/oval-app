
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Developer {
  id: string;
  full_name: string;
}

interface TaskFormValues {
  title: string;
  description: string;
  assigned_to: string;
}

interface CreateTaskFormProps {
  developers: Developer[];
  onSuccess: () => void;
  onClose: () => void;
}

export const CreateTaskForm = ({ developers, onSuccess, onClose }: CreateTaskFormProps) => {
  const { toast } = useToast();
  const form = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      assigned_to: "",
    },
  });
  
  const onSubmit = async (data: TaskFormValues) => {
    const { error } = await supabase.from("tasks").insert({
      ...data,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Task created successfully.",
    });

    form.reset();
    onSuccess();
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assigned_to"
          rules={{ required: "Please assign this task to a developer" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a developer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {developers.map((developer) => (
                    <SelectItem
                      key={developer.id}
                      value={developer.id}
                    >
                      {developer.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Task
        </Button>
      </form>
    </Form>
  );
};
