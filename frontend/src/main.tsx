import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";

import "./index.css";

import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { router } from "@/app/router/router";
import { queryClient } from "@/shared/api/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)

useAuthStore.getState().hydrateFromStorage();
