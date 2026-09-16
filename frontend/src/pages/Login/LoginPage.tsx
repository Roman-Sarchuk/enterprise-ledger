import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useLoginMutation } from "@/features/auth/hooks";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useAuthStore } from "@/store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const loginMutation = useLoginMutation();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  if (token) return <Navigate to="/accounts" replace />;

  const from =
    (location.state as { from?: Location } | null)?.from?.pathname ??
    "/accounts";

  async function onSubmit(values: LoginValues) {
    try {
      const data = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      loginSuccess({ user: data.user, token: data.token }, values.rememberMe);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
                aria-invalid={!!form.formState.errors.password}
              />
              {form.formState.errors.password?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="flex justify-between">
              <Controller
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <div className="flex items-center gap-2.5  px-3 py-2">
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      onBlur={field.onBlur}
                    />
                    <Label htmlFor="rememberMe">Remember me</Label>
                  </div>
                )}
              />
              <Link
                to="/password-recovery"
                className="text-foreground underline underline-offset-4 flex items-center justify-end" 
              >
                <span>Forgot your password?</span>
              </Link>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to home
                </Link>
              </Button>
              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Signing in…" : "Sign in"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              No account?{" "}
              <Link
                to="/register"
                className="text-foreground underline underline-offset-4"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
