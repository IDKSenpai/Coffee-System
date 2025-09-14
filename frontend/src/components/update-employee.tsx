import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/services/api";
import { toast } from "sonner";

const items = [
  { id: "admin", label: "Admin" },
  { id: "sale", label: "Sale" },
  { id: "purchase", label: "Purchase" },
  { id: "stock", label: "Stock" },
  { id: "owner", label: "Owner" },
] as const;

const FormSchema = z
  .object({
    username: z.string().min(3, "Username is required").optional(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional(),
    roles: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: "You have to select at least one role.",
    }),
  })
  .refine(
    (data) => {
      if (data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

export function UpdateEmployee({ employee, onClose, onEmployeeUpdated }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: employee.username,
      password: "",
      confirmPassword: "",
      roles: employee.roles,
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      username: data.username,
      roles: data.roles,
    };

    if (data.password) {
      payload.password = data.password;
    }

    try {
      await api.put(`/employee/${employee.id}`, payload);

      toast.success("Employee updated successfully!");
      onClose();
      onEmployeeUpdated();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An unknown error occurred.";
      toast.error("Failed to update employee.", { description: errorMessage });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password{" "}
                    <span className="text-red-500">
                      (leave blank to keep current)
                    </span>{" "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="New password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base">Roles:</FormLabel>
                  {items.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="roles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter((v) => v !== item.id)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
