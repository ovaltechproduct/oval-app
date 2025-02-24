import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Receipt, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SuperAdminPayments = () => {
  const { toast } = useToast();

  const { data: paymentStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      console.log("Fetching payment stats...");
      const { data: payments, error } = await supabase
        .from("payments")
        .select("amount, status");

      if (error) {
        console.error("Error fetching payment stats:", error);
        throw error;
      }

      console.log("Received payments data:", payments);

      const totalRevenue = payments
        .filter(p => p.status === "completed")
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      const pendingAmount = payments
        .filter(p => p.status === "pending")
        .reduce((sum, payment) => sum + Number(payment.amount), 0);

      const completedPayments = payments.filter(p => p.status === "completed").length;
      const pendingPayments = payments.filter(p => p.status === "pending").length;

      return {
        totalRevenue,
        pendingAmount,
        completedPayments,
        pendingPayments,
      };
    },
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error("Payment stats error:", error);
        toast({
          title: "Error",
          description: "Failed to load payment statistics. Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  const { data: payments, isLoading: paymentsLoading, error: paymentsError } = useQuery({
    queryKey: ["payments-list"],
    queryFn: async () => {
      console.log("Fetching payments list...");
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          projects ( name )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments list:", error);
        throw error;
      }

      console.log("Received payments list:", data);
      return data;
    },
    retry: 1,
    meta: {
      onError: (error: Error) => {
        console.error("Payments list error:", error);
        toast({
          title: "Error",
          description: "Failed to load payments list. Please try again.",
          variant: "destructive",
        });
      },
    },
  });

  if (statsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-pulse text-muted-foreground">Loading payment data...</div>
      </div>
    );
  }

  if (statsError || paymentsError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Payments Overview</h2>
        </div>
        <div className="text-red-500">
          Error loading payment data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Payments Overview</h2>
          <p className="text-sm text-muted-foreground">
            Monitor and manage all payment transactions
          </p>
        </div>
        <DollarSign className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paymentStats?.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {paymentStats?.completedPayments} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{paymentStats?.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {paymentStats?.pendingPayments} pending payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{format(new Date(payment.created_at), "PPP")}</TableCell>
                    <TableCell>{payment.projects?.name || "N/A"}</TableCell>
                    <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.payment_method || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminPayments;
