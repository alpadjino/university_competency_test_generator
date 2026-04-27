import type { ReactElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/global-context/auth-context/useAuth";
import StankinLogo from "@/assets/logo.svg";
import { cn } from "@/lib/utils";
import { BookOpen, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function NavLink({ to, icon, label }: { to: string, icon: ReactElement, label: string }) {
  const location = useLocation();
  const isActive = location.pathname.includes(to);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

export function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex justify-center sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">

        <Link to="/" className="mr-8 flex items-center space-x-3 transition-opacity hover:opacity-80 shrink-0">
          <img src={StankinLogo} alt="МГТУ СТАНКИН" className="h-10 w-auto" />
          <div className="flex flex-col border-l pl-3 ml-1 border-slate-200">
            <span className="text-sm font-bold leading-none text-slate-900 uppercase tracking-tight">
              Компетенции
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
              Портал Станкина
            </span>
          </div>
        </Link>

        <div className="mx-auto hidden md:flex items-center gap-1">
          <NavLink to="/tests" icon={<LayoutDashboard className="w-4 h-4" />} label="Тесты" />
          <NavLink to="/competencies" icon={<BookOpen className="w-4 h-4" />} label="Компетенции" />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end mr-1">
            <span className="text-sm font-semibold text-slate-900 leading-none">Самохин Д.Д.</span>
            <span className="text-[11px] text-muted-foreground mt-1 bg-slate-100 px-1.5 py-0.5 rounded">
              гр. ИДМ-24-08
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200 p-0 hover:ring-2 hover:ring-primary/10 transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatar.png" alt="User" />
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">ДС</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal lg:hidden">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-primary">Самохин Дмитрий</p>
                  <p className="text-xs text-muted-foreground tracking-tighter">ИДМ-24-08 • Студент</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="lg:hidden" />

              <DropdownMenuItem className="cursor-pointer py-2">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Профиль</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2">
                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Настройки</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 cursor-pointer py-2"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="font-medium">Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};
