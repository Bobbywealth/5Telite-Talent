import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContractViewer } from "@/components/contracts/ContractViewer";
import { SignatureCapture } from "@/components/contracts/SignatureCapture";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Clock, CheckCircle, AlertCircle, PenTool } from "lucide-react";
import TalentNavbar from "@/components/layout/talent-navbar";
import Footer from "@/components/layout/footer";

interface Contract {
  id: string;
  title: string;
  status: "draft" | "sent" | "signed" | "expired";
  dueDate?: string;
  createdAt: string;
  booking: {
    title: string;
    code: string;
    startDate: string;
    location: string;
  };
  signatures: Array<{
    id: string;
    status: "pending" | "signed";
    signerId: string;
    signedAt?: string;
  }>;
}

export default function TalentContractsPage() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["/api/contracts"],
    queryFn: async () => {
      const response = await fetch("/api/contracts", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch contracts");
      return response.json();
    },
  });

  // Filter contracts for current talent
  const talentContracts = contracts.filter((contract: Contract) => 
    contract.signatures.some((sig: any) => sig.signerId === user?.id)
  );

  const signContractMutation = useMutation({
    mutationFn: async ({ contractId, signature }: { contractId: string; signature: string }) => {
      return apiRequest("POST", `/api/contracts/${contractId}/sign`, {
        signatureData: signature,
      });
    },
    onSuccess: () => {
      toast({
        title: "Contract Signed",
        description: "Your signature has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setShowSignature(false);
      setSelectedContract(null);
    },
    onError: (error: any) => {
      console.error("Contract signing error:", error);
      toast({
        title: "Signature Failed",
        description: error?.message || "Failed to sign contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="h-4 w-4" />;
      case "sent":
        return <Clock className="h-4 w-4" />;
      case "expired":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getMySignature = (contract: Contract) => {
    return contract.signatures.find(sig => sig.signerId === user?.id);
  };

  const isContractSigned = (contract: Contract) => {
    const mySignature = getMySignature(contract);
    return mySignature?.status === "signed";
  };

  const isDueSoon = (contract: Contract) => {
    if (!contract.dueDate) return false;
    const dueDate = new Date(contract.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const isOverdue = (contract: Contract) => {
    if (!contract.dueDate) return false;
    const dueDate = new Date(contract.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  const handleSignContract = (signature: string) => {
    if (selectedContract) {
      signContractMutation.mutate({
        contractId: selectedContract.id,
        signature,
      });
    }
  };

  if (isLoading) {
    return (
      <>
        <TalentNavbar />
        <div className="min-h-screen bg-slate-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TalentNavbar />
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Contracts</h1>
            <p className="text-slate-600">View and sign your contracts</p>
          </div>

        {talentContracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Contracts Yet</h3>
              <p className="text-slate-500 text-center">
                Contracts will appear here once they are sent to you for signing.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {talentContracts.map((contract: Contract) => {
              const signed = isContractSigned(contract);
              const dueSoon = isDueSoon(contract);
              const overdue = isOverdue(contract);
              
              return (
                <Card key={contract.id} className={`hover:shadow-lg transition-shadow ${
                  overdue ? 'border-red-200' : dueSoon ? 'border-yellow-200' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {contract.title}
                      </CardTitle>
                      <Badge className={`ml-2 flex items-center gap-1 ${getStatusColor(signed ? 'signed' : contract.status)}`}>
                        {getStatusIcon(signed ? 'signed' : contract.status)}
                        {signed ? 'Signed' : contract.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{contract.booking.title}</p>
                        <p className="text-sm text-slate-500">{contract.booking.code}</p>
                      </div>
                      
                      <div className="text-sm text-slate-600">
                        <p>📍 {contract.booking.location}</p>
                        <p>📅 {new Date(contract.booking.startDate).toLocaleDateString()}</p>
                      </div>

                      {contract.dueDate && !signed && (
                        <div className={`text-sm ${
                          overdue ? 'text-red-600' : dueSoon ? 'text-yellow-600' : 'text-slate-600'
                        }`}>
                          {overdue ? '⚠️ Overdue' : dueSoon ? '⏰ Due soon' : '📝 Due'}: {new Date(contract.dueDate).toLocaleDateString()}
                        </div>
                      )}

                      {signed && (
                        <div className="text-sm text-green-600">
                          ✅ Signed on {new Date(getMySignature(contract)?.signedAt || '').toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedContract(contract)}
                          className="flex-1"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        
                        {!signed && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract);
                              setShowSignature(true);
                            }}
                            className="flex-1"
                            disabled={signContractMutation.isPending}
                          >
                            <PenTool className="h-4 w-4 mr-2" />
                            Sign
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Contract Viewer Dialog */}
        <Dialog open={!!selectedContract && !showSignature} onOpenChange={() => setSelectedContract(null)}>
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

        {/* Signature Dialog */}
        <Dialog open={showSignature} onOpenChange={() => setShowSignature(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sign Contract</DialogTitle>
              <DialogDescription>
                Please provide your digital signature to complete this contract.
              </DialogDescription>
            </DialogHeader>
            {selectedContract && (
              <SignatureCapture
                contractTitle={selectedContract.title}
                onSign={handleSignContract}
                onCancel={() => setShowSignature(false)}
                isLoading={signContractMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
        </div>
      </div>
      <Footer />
    </>
  );
}
