import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Cpu,
  LogOut,
  Bell,
  Menu,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/enforcer/dashboard' },
];

const LawEnforcerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BadgeCheck className="h-6 w-6 text-white" />
          </div>
          {isSidebarOpen && (
            <div>
              <span className="font-bold text-xl tracking-tight">LETI</span>
              <span className="text-xs text-muted-foreground block -mt-1">Enforcer</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    !isSidebarOpen && "justify-center px-0"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:flex hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {isSidebarOpen ? null : 'LETI Enforcer Portal'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 border-blue-200 dark:border-blue-800">
              Law Enforcer
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border border-blue-200 dark:border-blue-800">
                    <AvatarImage src="/avatar.png" alt="Enforcer" />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600">LE</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Law Enforcer</p>
                    <p className="text-xs leading-none text-muted-foreground">officer@leti.my</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LawEnforcerLayout;
