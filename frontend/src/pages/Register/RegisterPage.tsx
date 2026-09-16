import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/features/auth/hooks";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";
import { getApiErrorMessage } from "@/shared/api/errors";
import { useAuthStore } from "@/store/authStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const registerMutation = useRegisterMutation();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", rememberMe: false },
  });

  if (token) return <Navigate to="/accounts" replace />;

  async function onSubmit(values: RegisterValues) {
    try {
      const data = await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      loginSuccess({ user: data.user, token: data.token }, values.rememberMe);
      toast.success("Account created");
      navigate("/accounts", { replace: true });
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Start tracking your finances</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" {...form.register("name")} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
            </div>

            <Controller
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/35 px-3 py-2">
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

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 size-4" />
                  Back to home
                </Link>
              </Button>
              <Button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "Creating…" : "Create account"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}