import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignatureCapture } from "./SignatureCapture";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
    title: string;
    code: string;
  };
}

interface ContractViewerProps {
  contract: Contract;
  currentUserId: string;
  canSign?: boolean;
}

export function ContractViewer({ contract, currentUserId, canSign = false }: ContractViewerProps) {
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const signContractMutation = useMutation({
    mutationFn: async (signature: string) => {
      return apiRequest(`/api/contracts/${contract.id}/sign`, "POST", {
        signatureData: signature,
      });
    },
    onSuccess: () => {
      toast({
        title: "Contract Signed",
        description: "Your signature has been recorded successfully.",
      });
      setShowSignatureDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    },
    onError: (error) => {
      toast({
        title: "Signing Failed",
        description: error.message || "Failed to sign contract.",
        variant: "destructive",
      });
    },
  });

  const handleSignature = (signature: string) => {
    setSignatureData(signature);
  };

  const handleSignContract = () => {
    if (!signatureData) {
      toast({
        title: "Signature Required",
        description: "Please provide your signature before submitting.",
        variant: "destructive",
      });
      return;
    }
    signContractMutation.mutate(signatureData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const userSignature = contract.signatures.find(sig => sig.signerId === currentUserId);
  const isUserSigned = userSignature?.status === "signed";
  const canUserSign = canSign && contract.status === "sent" && !isUserSigned;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{contract.title}</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Booking: {contract.booking.title} ({contract.booking.code})
            </p>
          </div>
          <Badge className={getStatusColor(contract.status)}>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </Badge>
        </div>
        
        {contract.dueDate && contract.status !== "signed" && (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Due: {new Date(contract.dueDate).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contract Content */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Contract Details</h4>
          <div className="whitespace-pre-wrap text-sm font-mono max-h-64 overflow-y-auto">
            {contract.content}
          </div>
        </div>

        {/* Signatures Section */}
        <div>
          <h4 className="font-semibold mb-3">Signatures</h4>
          <div className="space-y-2">
            {contract.signatures.map((signature) => (
              <div
                key={signature.id}
                className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {signature.signer.firstName} {signature.signer.lastName}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {signature.signer.email}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(signature.status)}>
                    {signature.status}
                  </Badge>
                  {signature.signedAt && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(signature.signedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {canUserSign && (
            <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
              <DialogTrigger asChild>
                <Button className="flex-1" data-testid="button-sign-contract">
                  Sign Contract
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Sign Contract</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    By signing this contract, you agree to all terms and conditions outlined above.
                  </p>
                  
                  <SignatureCapture
                    onSignature={handleSignature}
                    onClear={() => setSignatureData("")}
                    width={400}
                    height={150}
                  />
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowSignatureDialog(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSignContract}
                      disabled={!signatureData || signContractMutation.isPending}
                      className="flex-1"
                      data-testid="button-submit-signature"
                    >
                      {signContractMutation.isPending ? "Signing..." : "Submit Signature"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {isUserSigned && (
            <div className="flex-1 text-center py-2">
              <p className="text-green-600 dark:text-green-400 font-medium">
                ✓ You have signed this contract
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Signed on {new Date(userSignature.signedAt!).toLocaleString()}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => window.open(`/api/contracts/${contract.id}/pdf`, '_blank')}
            data-testid="button-download-pdf"
          >
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}