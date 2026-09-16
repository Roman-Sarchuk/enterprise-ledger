import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schemas";
import { useForgotPasswordMutation } from "@/features/auth/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useAuthStore } from "@/store/authStore";

export function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  if (token) return <Navigate to="/accounts" replace />;

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      const data = await forgotPasswordMutation.mutateAsync({ email: values.email });
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
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Mail className="size-5" />
          </div>
          <CardTitle>Відновлення пароля</CardTitle>
          <CardDescription>
            Введіть електронну пошту, пов’язану з вашим обліковим записом, і ми надішлемо посилання для скидання.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="email">Електронна пошта</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
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
              <Button type="submit" disabled={forgotPasswordMutation.isPending}>
                {forgotPasswordMutation.isPending ? "Надсилаємо…" : "Надіслати посилання"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
