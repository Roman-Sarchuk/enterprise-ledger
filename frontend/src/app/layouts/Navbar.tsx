import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Wallet, LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const navItems = [
  { to: "/accounts", label: "Accounts" },
  { to: "/categories", label: "Categories" },
  { to: "/transactions", label: "Transactions" },
  { to: "/analytics", label: "Analytics" },
] as const;

export function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const userLabel = useMemo(() => user?.name || "User", [user?.name]);

  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
      isActive
        ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-12px_var(--color-ring)]"
        : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-background/72 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link to="/accounts" className="flex items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_10px_24px_-16px_var(--color-ring)]">
            <Wallet className="size-5" />
          </span>
          <span className="hidden text-sm font-semibold tracking-wide sm:inline">Home-ledger</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border/80 bg-card/70 p-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClassName} end>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden rounded-full md:inline-flex">
                {userLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => {
                  navigate("/settings");
                }}
              >
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="surface p-0">
              <DialogHeader className="px-4 pt-4">
                <DialogTitle>Menu</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-1 px-2 pb-4">
                {navItems.map((item) => (
                  <Button
                    key={item.to}
                    variant="ghost"
                    className="justify-start rounded-xl"
                    onClick={() => {
                      setMobileOpen(false);
                      navigate(item.to);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                <div className="my-2 h-px bg-border" />

                <Button
                  variant="ghost"
                  className="justify-start rounded-xl"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/settings");
                  }}
                >
                  <Settings className="mr-2 size-4" />
                  Settings
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start rounded-xl text-destructive hover:text-destructive"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

