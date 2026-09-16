import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RouteErrorPage() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Щось пішло не так";

  const description = isRouteErrorResponse(error)
    ? "Сторінка не завантажилась коректно. Спробуйте повернутися на головну або оновити сторінку."
    : "Сталася неочікувана помилка під час завантаження маршруту.";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-background to-slate-200 px-4 py-10 dark:from-slate-950 dark:via-background dark:to-slate-900">
      <div className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />

      <Card className="relative w-full max-w-xl border-0 shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </span>
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="shadow-lg">
            <Link to="/">
              <Home className="mr-2 size-4" />
              Повернутися на головну
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="shadow-lg">
            <RotateCcw className="mr-2 size-4" />
            Спробувати ще раз
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
