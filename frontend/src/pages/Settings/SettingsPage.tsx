import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/shared/api/axios";
import { getApiErrorMessage } from "@/shared/api/errors";
import type { AuthUser } from "@/store/authStore";
import { useAuthStore } from "@/store/authStore";

const updateNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

const deleteAccountSchema = z.object({
  confirmName: z.string().trim().min(1, "Enter your name to confirm"),
});

type UpdateNameValues = z.infer<typeof updateNameSchema>;
type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
type ThemeMode = "light" | "dark" | "system";

type UpdateMeResponse = {
  user: AuthUser;
};

async function updateMeApi(payload: UpdateNameValues): Promise<UpdateMeResponse> {
  const { data } = await api.patch<UpdateMeResponse>("/users/me", payload);
  return data;
}

async function deleteMeApi(): Promise<void> {
  await api.delete("/users/me");
}

export function SettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();

  const form = useForm<UpdateNameValues>({
    resolver: zodResolver(updateNameSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const deleteForm = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmName: "" },
  });

  useEffect(() => {
    form.reset({ name: user?.name ?? "" });
  }, [form, user?.name]);

  const updateMeMutation = useMutation({
    mutationFn: updateMeApi,
  });

  const deleteMeMutation = useMutation({
    mutationFn: deleteMeApi,
  });

  async function onSubmit(values: UpdateNameValues) {
    try {
      const data = await updateMeMutation.mutateAsync(values);
      updateUser(data.user);
      form.reset({ name: data.user.name });
      toast.success("Name updated");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  async function onDeleteSubmit(values: DeleteAccountValues) {
    const currentName = user?.name?.trim() ?? "";
    if (values.confirmName.trim() !== currentName) {
      deleteForm.setError("confirmName", {
        type: "validate",
        message: "Entered name does not match your current name",
      });
      return;
    }

    try {
      await deleteMeMutation.mutateAsync();
      logout();
      toast.success("User deleted");
      navigate("/login", { replace: true });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  const selectedTheme: ThemeMode =
    theme === "light" || theme === "dark" || theme === "system" ? theme : "system";
  const confirmName = useWatch({ control: deleteForm.control, name: "confirmName" }) ?? "";
  const canDelete = confirmName.trim() === (user?.name?.trim() ?? "");

  return (
    <div className="page mx-auto w-full max-w-3xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and appearance preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your current account details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-3">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={user?.email ?? ""} disabled readOnly />
          </div>

          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                autoComplete="name"
                {...form.register("name")}
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name?.message ? (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMeMutation.isPending || !form.formState.isDirty}>
                {updateMeMutation.isPending ? "Saving..." : "Save name"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose how the app looks for you</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Label htmlFor="theme-mode">Color mode</Label>
          <Select value={selectedTheme} onValueChange={(value) => setTheme(value)}>
            <SelectTrigger id="theme-mode" className="w-full sm:w-56">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Deleting your account is permanent. Type your current name to confirm this action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="confirm-delete-name">Type your name to confirm</Label>
              <Input
                id="confirm-delete-name"
                autoComplete="off"
                placeholder={user?.name ?? "Your current name"}
                {...deleteForm.register("confirmName")}
                aria-invalid={!!deleteForm.formState.errors.confirmName}
              />
              {deleteForm.formState.errors.confirmName?.message ? (
                <p className="text-xs text-destructive">{deleteForm.formState.errors.confirmName.message}</p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="destructive" disabled={deleteMeMutation.isPending || !canDelete}>
                {deleteMeMutation.isPending ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

