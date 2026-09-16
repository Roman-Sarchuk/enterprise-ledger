import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/features/auth/hooks";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useAuthStore } from "@/store/authStore";

export function PasswordResetPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const authToken = useAuthStore((s) => s.token);
  const resetPasswordMutation = useResetPasswordMutation();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (authToken) return <Navigate to="/accounts" replace />;
  if (!token) return <Navigate to="/password-recovery" replace />;
  const resetToken = token;

  async function onSubmit(values: ResetPasswordValues) {
    try {
      const data = await resetPasswordMutation.mutateAsync({
        token: resetToken,
        password: values.password,
      });
      toast.success(data.message);
      navigate("/login", { replace: true });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <CardHeader className="space-y-3">
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-5" />
          </div>
          <CardTitle>Створіть новий пароль</CardTitle>
          <CardDescription>
            Виберіть новий пароль для свого облікового запису. Посилання для скидання дійсне лише короткий час.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="password">Новий пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter a new password"
                {...form.register("password")}
                aria-invalid={!!form.formState.errors.password}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Підтвердження пароля</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat the new password"
                {...form.register("confirmPassword")}
                aria-invalid={!!form.formState.errors.confirmPassword}
              />
              {form.formState.errors.confirmPassword?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/login">
                  <ArrowLeft className="mr-2 size-4" />
                  Назад до входу
                </Link>
              </Button>
              <Button type="submit" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? "Оновлюємо…" : "Оновити пароль"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
