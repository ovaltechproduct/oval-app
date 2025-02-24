import { StrictMode } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthRedirector } from "@/components/auth/AuthRedirector";
import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <AuthProvider>
            <Router>
              <AuthRedirector />
              <AppRoutes />
              <Toaster />
            </Router>
          </AuthProvider>
        </DarkModeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
