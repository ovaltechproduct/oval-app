import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Outlet } from "react-router-dom";
import { LogOut, User, Settings, Home, FileText, MessageSquare, CreditCard, Users, Briefcase, Mail, Sun, Moon } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Switch } from "@/components/ui/switch";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getNavItems = () => {
    const commonItems = [{
      icon: Home,
      label: "Dashboard",
      path: "/dashboard"
    }, {
      icon: MessageSquare,
      label: "Messages",
      path: "/messages"
    }];

    switch (user?.role) {
      case "client":
        return [...commonItems, {
          icon: CreditCard,
          label: "Payments",
          path: "/client-payments"
        }];
      case "developer":
        return [...commonItems, {
          icon: Briefcase,
          label: "Tasks",
          path: "/developer-tasks"
        }];
      case "superadmin":
        return [...commonItems, {
          icon: Users,
          label: "Users",
          path: "/users"
        }, {
          icon: Briefcase,
          label: "Tasks",
          path: "/tasks"
        }, {
          icon: CreditCard,
          label: "Payments",
          path: "/payments"
        }];
      case "affiliate":
        return [...commonItems, {
          icon: Users,
          label: "Referrals",
          path: "/referrals"
        }, {
          icon: CreditCard,
          label: "Earnings",
          path: "/earnings"
        }];
      default:
        return commonItems;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-border/10 p-4">
            <h2 className="text-lg font-semibold">OVAL Consultancy Services</h2>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {getNavItems().map(item => (
                <SidebarMenuItem 
                  key={item.path}
                  onClick={() => navigate(item.path)}
                >
                  <SidebarMenuButton>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">Dark Mode</span>
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                aria-label="Toggle dark mode"
              />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
