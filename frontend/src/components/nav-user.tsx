"use client";

import * as React from "react";
import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";

import api from "@/services/api";

const formSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: "Username must be at least 2 characters." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .optional()
      .or(z.literal("")),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters." })
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

export function NavUser({
  user,
  onUpdateSuccess,
}: {
  user: {
    name: string;
  };
  onUpdateSuccess: (updatedUser: { username: string }) => void;
}) {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  React.useEffect(() => {
    if (user.name !== "Guest") {
      form.reset({
        username: user.name,
        password: "",
        confirmPassword: "",
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const dataToUpdate: { username: string; password?: string } = {
      username: values.username,
    };

    if (values.password) {
      dataToUpdate.password = values.password;
    }

    try {
      const response = await api.put("/user/update", dataToUpdate);

      setOpen(false);

      onUpdateSuccess(response.data.user);

      form.reset({
        username: response.data.user.username,
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to update user:", error);

      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 422) {
          const validationErrors = error.response.data.errors;
          if (validationErrors && validationErrors.username) {
            form.setError("username", {
              type: "manual",
              message: validationErrors.username[0],
            });
          }
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <Settings />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    <User />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <BadgeCheck />
                    <span>Account</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      <DialogHeader>
                        <DialogTitle>Update Account</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
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
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Leave blank to keep old password"
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
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
