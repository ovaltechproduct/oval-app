
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, DollarSign, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Helper function to format currency in INR
const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const AffiliateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch referrals data
  const { data: referralsData, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("referrals")
        .select(`
          id,
          status,
          commission_earned,
          commission_rate,
          created_at,
          client:profiles!referrals_client_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq("affiliate_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const totalReferrals = referralsData?.length || 0;
  const activeReferrals = referralsData?.filter(
    (ref) => ref.status === "active"
  ).length || 0;
  const totalCommission = referralsData?.reduce(
    (sum, ref) => sum + (ref.commission_earned || 0),
    0
  ) || 0;

  if (isLoadingReferrals) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {activeReferrals} active referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Commission Earned
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(totalCommission)}</div>
            <p className="text-xs text-muted-foreground">
              From all referrals
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => navigate("/add-client")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add New Client</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Add Client
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Referrals</h2>
        {referralsData && referralsData.length > 0 ? (
          referralsData.map((referral) => (
            <Accordion type="single" collapsible key={referral.id}>
              <AccordionItem value={`client-${referral.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {referral.client.full_name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-4">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span>{" "}
                      {referral.client.full_name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span>{" "}
                      {referral.client.email}
                    </p>
                    {referral.client.phone && (
                      <p className="text-sm">
                        <span className="font-medium">Phone:</span>{" "}
                        {referral.client.phone}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Referred On:</span>{" "}
                      {format(new Date(referral.created_at), "PP")}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={
                          referral.status === "active"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }
                      >
                        {referral.status.charAt(0).toUpperCase() +
                          referral.status.slice(1)}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Commission Earned:</span>{" "}
                      {formatINR(referral.commission_earned || 0)}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No referrals yet. Start adding clients to earn commission!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AffiliateDashboard;

