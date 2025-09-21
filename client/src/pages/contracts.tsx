import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContractViewer } from "@/components/contracts/ContractViewer";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import AdminNavbar from "@/components/layout/admin-navbar";
import TalentNavbar from "@/components/layout/talent-navbar";
import ClientNavbar from "@/components/layout/client-navbar";

interface Contract {
  id: string;
  title: string;
  content: string;
  status: "draft" | "sent" | "signed" | "expired" | "cancelled";
  dueDate: string | null;
  createdAt: string;
  signatures: Array<{
    id: string;
    signerId: string;
    status: "pending" | "signed" | "expired";
    signedAt: string | null;
    signer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  booking: {
    id: string;
    title: string;
    code: string;
  };
  bookingTalent: {
    id: string;
    talent: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface Booking {
  id: string;
  title: string;
  code: string;
  bookingTalents: Array<{
    id: string;
    talent: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export default function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string>("");
  const [selectedBookingTalent, setSelectedBookingTalent] = useState<string>("");
  
  const handleCloseDialog = () => {
    setShowCreateDialog(false);
    setSelectedBooking("");
    setSelectedBookingTalent("");
  };
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  // Redirect admin users to proper admin URL
  useEffect(() => {
    if (user?.role === 'admin' && location === '/contracts') {
      navigate('/admin/contracts');
    }
  }, [user, location, navigate]);

  // Handle URL parameters for quick contract creation from email notifications
  useEffect(() => {
    if (user?.role === 'admin') {
      const urlParams = new URLSearchParams(window.location.search);
      const bookingId = urlParams.get('booking');
      const talentId = urlParams.get('talent');
      
      if (bookingId && talentId) {
        setSelectedBooking(bookingId);
        setSelectedBookingTalent(talentId);
        setShowCreateDialog(true);
        
        // Clean up URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [user, bookings]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["/api/contracts"],
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const createContractMutation = useMutation({
    mutationFn: async ({ bookingId, bookingTalentId }: { bookingId: string; bookingTalentId: string }) => {
      return apiRequest(`/api/bookings/${bookingId}/contracts`, "POST", {
        bookingTalentId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Contract Created & Sent",
        description: "The contract has been created and sent to the talent for signing. They will receive an email notification.",
      });
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create contract.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "sent":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "expired":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "expired":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const selectedBookingData = Array.isArray(bookings) ? bookings.find((b: Booking) => b.id === selectedBooking) : undefined;

  const handleCreateContract = () => {
    if (!selectedBooking || !selectedBookingTalent) {
      toast({
        title: "Selection Required",
        description: "Please select both a booking and talent.",
        variant: "destructive",
      });
      return;
    }
    createContractMutation.mutate({
      bookingId: selectedBooking,
      bookingTalentId: selectedBookingTalent,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading contracts...</div>
        </div>
      </div>
    );
  }

  // Content component to avoid duplication
  const ContractsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and monitor contract signing progress
          </p>
        </div>
        
        {user?.role === "admin" && (
          <Dialog open={showCreateDialog} onOpenChange={handleCloseDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-contract">
                <Plus className="h-4 w-4 mr-2" />
                Create Contract
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Contract</DialogTitle>
                <DialogDescription>
                  Select a booking and talent to create a new contract for signature.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Booking</label>
                  <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                    <SelectTrigger data-testid="select-booking">
                      <SelectValue placeholder="Choose a booking" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(bookings) ? bookings.map((booking: Booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.title} ({booking.code})
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBookingData && (
                  <div>
                    <label className="text-sm font-medium">Select Talent</label>
                    <Select value={selectedBookingTalent} onValueChange={setSelectedBookingTalent}>
                      <SelectTrigger data-testid="select-talent">
                        <SelectValue placeholder="Choose a talent" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBookingData.bookingTalents?.map((bt: any) => (
                          <SelectItem key={bt.id} value={bt.id}>
                            {bt.talent.firstName} {bt.talent.lastName} ({bt.talent.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateContract}
                    disabled={!selectedBooking || !selectedBookingTalent || createContractMutation.isPending}
                    className="flex-1"
                    data-testid="button-confirm-create"
                  >
                    {createContractMutation.isPending ? "Creating..." : "Create Contract"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {(!Array.isArray(contracts) || contracts.length === 0) ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Contracts Yet</h3>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                Contracts will appear here once they are created for bookings.
              </p>
              {user?.role === "admin" && !showCreateDialog && (
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  data-testid="button-create-first-contract"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Contract
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {Array.isArray(contracts) ? contracts.map((contract: Contract) => (
              <Card key={contract.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(contract.status)}
                        <h3 className="font-semibold text-lg">{contract.title}</h3>
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Booking: {contract.booking.title} ({contract.booking.code})
                      </p>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Talent: {contract.bookingTalent.talent.firstName} {contract.bookingTalent.talent.lastName}
                      </p>

                      {contract.dueDate && contract.status !== "signed" && (
                        <p className="text-sm text-orange-600 dark:text-orange-400">
                          Due: {new Date(contract.dueDate).toLocaleDateString()}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span>Created: {new Date(contract.createdAt).toLocaleDateString()}</span>
                        <span>
                          Signatures: {contract.signatures.filter(s => s.status === "signed").length}/{contract.signatures.length}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedContract(contract)}
                      data-testid={`button-view-contract-${contract.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : null}
          </div>
        )}
      </div>

      {/* Contract Detail Dialog */}
      <Dialog open={!!selectedContract} onOpenChange={() => setSelectedContract(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContract?.title}</DialogTitle>
            <DialogDescription>
              Contract details and signature status
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <ContractViewer 
              contract={selectedContract}
              currentUserId={user?.id || ""}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  // Render with appropriate navigation based on user role
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminNavbar />
        
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img 
                  src="/attached_assets/5t-logo.png" 
                  alt="5T Talent Platform" 
                  className="h-12 w-auto"
                />
                <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
              </div>
            </div>
          </header>
          <main className="p-6">
            <ContractsContent />
          </main>
        </div>
      </div>
    );
  }

  if (user?.role === 'talent') {
    return (
      <div className="min-h-screen bg-slate-50">
        <TalentNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContractsContent />
        </div>
      </div>
    );
  }

  // Default to client layout for client users and unauthenticated users
  return (
    <div className="min-h-screen bg-slate-50">
      <ClientNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContractsContent />
      </div>
    </div>
  );
}