
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClientOnboardingForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    referralCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const signupResult = await signup(formData.email, formData.password, formData.fullName, "client");
      
      if (formData.referralCode) {
        const { error: referralError } = await supabase.rpc(
          'handle_referral',
          { 
            referral_code: formData.referralCode.toUpperCase(),
            client_id: signupResult.user.id
          }
        );

        if (referralError) {
          console.error("Error processing referral:", referralError);
          toast({
            title: "Warning",
            description: "Account created successfully, but there was an issue processing the referral code.",
            variant: "default",
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Client account created successfully. They will receive an email to verify their account.",
      });
      
      navigate("/dashboard/superadmin");
    } catch (error) {
      console.error("Client onboarding error:", error);
      toast({
        title: "Error",
        description: "Failed to create client account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name
        </label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          required
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter client's full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter client's email address"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter client's password"
          minLength={8}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number (Optional)
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter client's phone number"
        />
      </div>

      <div>
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Referral Code (Optional)
        </label>
        <Input
          id="referralCode"
          name="referralCode"
          type="text"
          value={formData.referralCode}
          onChange={handleChange}
          placeholder="Enter referral code if you have one"
          className="uppercase"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Client Account"}
      </Button>
    </form>
  );
};

export default ClientOnboardingForm;
