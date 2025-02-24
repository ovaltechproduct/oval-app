
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ClientOnboardingForm from "@/components/onboarding/ClientOnboardingForm";

const AddClient = () => {
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
          <CardDescription>
            Fill in the client details to create their account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddClient;
