
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  MessageSquare,
  FileText,
  Download
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import DocumentUpload from "@/components/documents/DocumentUpload";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  console.log("Rendering ClientDashboard for user:", user);
  console.log("User role:", user?.role);
  console.log("User ID:", user?.id);

  // Effect to fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('uploaded_by', user?.id)
          .order('uploaded_at', { ascending: false });

        if (error) throw error;
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDocuments();
    }
  }, [user, toast]);

  // Effect to load Razorpay script
  useEffect(() => {
    // Remove any existing Razorpay script
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.dataset.payment_button_id = "pl_PoWsG9CH6c5Hh4";
    scriptRef.current = script;
    
    const paymentForm = document.getElementById("razorpay-payment-form");
    if (paymentForm) {
      paymentForm.innerHTML = ''; // Clear any existing content
      paymentForm.appendChild(script);
    }

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, []);

  if (!user) {
    console.log("No user found in ClientDashboard");
    return <div>Loading...</div>;
  }

  if (user.role !== 'client') {
    console.log("User is not a client. Current role:", user.role);
    return <div>Access denied. This dashboard is only for clients.</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 unread</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Razorpay Payment Button */}
            <form id="razorpay-payment-form" className="w-full"></form>
            
            {/* Document Upload */}
            <DocumentUpload />
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Documents</CardTitle>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No documents uploaded yet
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.name}</TableCell>
                      <TableCell>{doc.file_type}</TableCell>
                      <TableCell>{formatDate(doc.uploaded_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.file_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDashboard;
