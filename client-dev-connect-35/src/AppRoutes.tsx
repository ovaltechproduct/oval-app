import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SuperAdminPayments from "@/pages/SuperAdminPayments";
import Messages from "@/pages/Messages";
import AddClient from "@/pages/AddClient";
import ClientPayments from "@/pages/ClientPayments";
import DeveloperTasks from "@/pages/DeveloperTasks";
import Profile from "@/pages/Profile";
import Tasks from "@/pages/Tasks";
import UsersManagement from "@/pages/UsersManagement";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import DashboardLayout from "@/components/DashboardLayout";

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("[AppRoutes] Current state:", { user, isLoading, pathname: location.pathname });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="text-sm text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Authentication Routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Protected Routes
  return (
    <DarkModeProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        
        {/* All authenticated routes wrapped in DashboardLayout */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route 
            path="/messages" 
            element={<Messages />}
          />

          <Route 
            path="/add-client" 
            element={
              user.role === "superadmin" ? (
                <AddClient />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route 
            path="/payments" 
            element={
              user.role === "superadmin" ? (
                <SuperAdminPayments />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route 
            path="/client-payments" 
            element={
              user.role === "client" ? (
                <ClientPayments />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route 
            path="/developer-tasks" 
            element={
              user.role === "developer" ? (
                <DeveloperTasks />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profile" element={<Profile />} />

          <Route 
            path="/users" 
            element={
              user.role === "superadmin" ? (
                <UsersManagement />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
        </Route>

        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DarkModeProvider>
  );
};

export default AppRoutes;
