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
  name: z.string().trim().min(1, "Ім’я є обов’язковим"),
});

const deleteAccountSchema = z.object({
  confirmName: z.string().trim().min(1, "Введіть своє ім’я для підтвердження"),
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
      toast.success("Ім’я оновлено");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  async function onDeleteSubmit(values: DeleteAccountValues) {
    const currentName = user?.name?.trim() ?? "";
    if (values.confirmName.trim() !== currentName) {
      deleteForm.setError("confirmName", {
        type: "validate",
        message: "Введене ім’я не збігається з поточним",
      });
      return;
    }

    try {
      await deleteMeMutation.mutateAsync();
      logout();
      toast.success("Користувача видалено");
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
        <h1 className="page-title">Налаштування</h1>
        <p className="page-subtitle">Керуйте своїм профілем та параметрами зовнішнього вигляду</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Профіль</CardTitle>
          <CardDescription>Ваші поточні дані облікового запису</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-3">
            <Label htmlFor="profile-email">Електронна пошта</Label>
            <Input id="profile-email" value={user?.email ?? ""} disabled readOnly />
          </div>

          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="profile-name">Ім’я</Label>
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
                {updateMeMutation.isPending ? "Зберігаємо..." : "Зберегти ім’я"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Тема</CardTitle>
          <CardDescription>Виберіть, як має виглядати застосунок для вас</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Label htmlFor="theme-mode">Колірна тема</Label>
          <Select value={selectedTheme} onValueChange={(value) => setTheme(value)}>
            <SelectTrigger id="theme-mode" className="w-full sm:w-56">
              <SelectValue placeholder="Виберіть тему" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Системна</SelectItem>
              <SelectItem value="light">Світла</SelectItem>
              <SelectItem value="dark">Темна</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Небезпечна зона</CardTitle>
          <CardDescription>
            Видалення облікового запису є незворотнім. Введіть своє поточне ім’я для підтвердження.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={deleteForm.handleSubmit(onDeleteSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="confirm-delete-name">Введіть своє ім’я для підтвердження</Label>
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
                {deleteMeMutation.isPending ? "Видалення..." : "Видалити обліковий запис"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

