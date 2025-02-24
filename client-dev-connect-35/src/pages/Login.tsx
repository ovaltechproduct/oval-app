
import { useAuth } from "@/contexts/AuthContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user, isLoading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[Login] Page rendered with auth state:", { user, isLoading });
    
    if (user) {
      console.log("[Login] User authenticated, preparing to navigate to dashboard");
      const timeoutId = setTimeout(() => {
        console.log("[Login] Navigating to dashboard for role:", user.role);
        navigate(`/dashboard/${user.role}`, { replace: true });
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        console.log("[Login] Cleanup - cleared navigation timeout");
      };
    }
  }, [user, navigate]);

  if (isLoading) {
    console.log("[Login] Showing loading state");
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <Card className="w-full max-w-md bg-card">
          <div className="p-8 text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-sm text-muted-foreground">
              Loading your profile...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (user) {
    console.log("[Login] User authenticated, waiting for navigation");
    return null;
  }

  console.log("[Login] Rendering login/signup form");
  return (
    <div className={`min-h-screen flex items-center justify-center bg-background transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="w-full max-w-md bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Welcome to OVAL CONSULTANCY SERVICES</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
