import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { getFeatureSetupErrorMessage } from "@/lib/supabaseFeatureErrors";
import { buildOutlookComposeUrl, buildReportEmailBody } from "@/lib/admin";

interface ReportProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productTitle: string;
  sellerId?: string | null;
  sellerName?: string | null;
}

export const ReportProductDialog = ({
  open,
  onOpenChange,
  productId,
  productTitle,
  sellerId,
  sellerName,
}: ReportProductDialogProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Sign in to report products.");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("product_reports").insert({
        product_id: productId,
        reporter_id: user.id,
        reason,
        details: details.trim() || null,
      });

      if (error) throw error;

      const reporterName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Marketplace user";

      const emailBody = buildReportEmailBody({
        productTitle,
        productId,
        sellerName: sellerName || "Marketplace seller",
        sellerId,
        reporterName,
        reporterEmail: user.email || "No email",
        reason,
        details: details.trim() || null,
      });

      const outlookUrl = buildOutlookComposeUrl({
        subject: `New report: ${productTitle}`,
        body: emailBody,
      });

      const openedWindow = window.open(outlookUrl, "_blank", "noopener,noreferrer");
      if (!openedWindow) {
        window.location.href = `mailto:albempire196@gmail.com?subject=${encodeURIComponent(`New report: ${productTitle}`)}&body=${encodeURIComponent(emailBody)}`;
      }

      toast.success("Report u ruajt dhe u hap Outlook për email.");

      setDetails("");
      setReason("spam");
      onOpenChange(false);
    } catch (error) {
      console.error("Reporting product failed:", error);
      toast.error(getFeatureSetupErrorMessage(error, "Report"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Report product</DialogTitle>
          <DialogDescription>
            Send this listing to the admin review queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="duplicate">Duplicate listing</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={4}
              placeholder="Add context for the admin review..."
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Submit report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};