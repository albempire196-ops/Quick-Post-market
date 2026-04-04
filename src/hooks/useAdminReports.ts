import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isAdminEmail } from "@/lib/admin";
import { ReportStatus } from "@/lib/marketplace";
import { deleteProductWithMedia } from "@/lib/productDeletion";
import { toast } from "sonner";

export const useAdminReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = isAdminEmail(user?.email);

  const query = useQuery({
    queryKey: ["admin-reports", user?.id],
    queryFn: async () => {
      if (!user || !isAdmin) return [];

      const { data: reports, error: reportsError } = await supabase
        .from("product_reports")
        .select("id, product_id, reporter_id, reason, details, status, reviewed_by, reviewed_at, created_at")
        .order("created_at", { ascending: false });

      if (reportsError) throw reportsError;

      const productIds = [...new Set((reports || []).map((report) => report.product_id))];
      const reporterIds = [...new Set((reports || []).map((report) => report.reporter_id))];

      const [{ data: products }, { data: reporters }] = await Promise.all([
        productIds.length
          ? supabase
              .from("products_public")
              .select("id, title, status, user_id, image_url, media_urls")
              .in("id", productIds)
          : Promise.resolve({ data: [] as any[] }),
        reporterIds.length
          ? supabase
              .from("profiles_public")
              .select("id, full_name")
              .in("id", reporterIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const productMap = new Map((products || []).map((product) => [product.id, product]));
      const reporterMap = new Map((reporters || []).map((profile) => [profile.id, profile]));

      return (reports || []).map((report) => ({
        ...report,
        product: productMap.get(report.product_id) || null,
        reporter: reporterMap.get(report.reporter_id) || null,
      }));
    },
    enabled: !!user && isAdmin,
  });

  const updateReportStatus = async (reportId: string, status: ReportStatus) => {
    if (!user || !isAdmin) return;

    try {
      const { error } = await supabase
        .from("product_reports")
        .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq("id", reportId);

      if (error) throw error;

      toast.success("Report updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports", user.id] });
    } catch (error) {
      console.error("Updating report failed:", error);
      toast.error("Could not update report.");
    }
  };

  const deleteReportedProduct = async (product: { id: string; image_url?: string | null; media_urls?: string[] | null }) => {
    if (!user || !isAdmin) return;

    try {
      await deleteProductWithMedia(product);

      toast.success("Reported product deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports", user.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    } catch (error) {
      console.error("Deleting reported product failed:", error);
      toast.error("Could not delete reported product.");
    }
  };

  return {
    ...query,
    isAdmin,
    updateReportStatus,
    deleteReportedProduct,
  };
};