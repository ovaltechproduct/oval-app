import { useAuth } from "@/contexts/AuthContext";
import ClientDashboard from "@/components/dashboards/ClientDashboard";
import DeveloperDashboard from "@/components/dashboards/DeveloperDashboard";
import AffiliateDashboard from "@/components/dashboards/AffiliateDashboard";
import SuperAdminDashboard from "@/components/dashboards/SuperAdminDashboard";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  console.log("Current user data:", user);

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" />;
  }

  const renderDashboard = () => {
    console.log("Rendering dashboard for role:", user.role);
    
    switch (user.role) {
      case "client":
        return <ClientDashboard />;
      case "developer":
        return <DeveloperDashboard />;
      case "affiliate":
        return <AffiliateDashboard />;
      case "superadmin":
        return <SuperAdminDashboard />;
      default:
        console.log("Invalid role, redirecting to login");
        return <Navigate to="/login" />;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
