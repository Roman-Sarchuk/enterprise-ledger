import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { AppLayout } from "@/app/layouts/AppLayout";
import { RequireAuth } from "@/app/router/RequireAuth";
import { RouteErrorPage } from "@/app/router/RouteErrorPage";

import Home from "@/pages/Home/Home";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "@/pages/Register/RegisterPage";
import { PasswordRecoveryPage } from "@/pages/PasswordRecovery/PasswordRecoveryPage";
import { PasswordResetPage } from "@/pages/PasswordReset/PasswordResetPage";
import { AccountsPage } from "@/pages/Accounts/AccountsPage";
import { CategoriesPage } from "@/pages/Categories/CategoriesPage";
import { TransactionsPage } from "@/pages/Transactions/TransactionsPage";
import { AnalyticsPage } from "@/pages/Analytics/AnalyticsPage";
import { SettingsPage } from "@/pages/Settings/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/password-recovery", element: <PasswordRecoveryPage /> },
      { path: "/reset-password/:token", element: <PasswordResetPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/accounts", element: <AccountsPage /> },
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/transactions", element: <TransactionsPage /> },
      { path: "/analytics", element: <AnalyticsPage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
]);

