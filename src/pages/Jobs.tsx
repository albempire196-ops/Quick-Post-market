import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Jobs = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      // Try jobs table first
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("id, business_name, description, wage, contact, created_at")
        .order("created_at", { ascending: false });

      if (!jobsError && jobs && jobs.length > 0) return jobs;

      // Fallback: use products_public where category = 'jobs' or 'services'
      const { data: products } = await supabase
        .from("products_public")
        .select("id, title, description, price, created_at")
        .in("category", ["jobs", "services"]) ;

      if (products) {
        return products.map((p: any) => ({
          id: p.id,
          business_name: p.title,
          description: p.description,
          wage: p.price,
          contact: null,
          created_at: p.created_at,
        }));
      }

      return [];
    },
  });

  useEffect(() => {
    if (error) console.error("Jobs query error:", error);
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Jobs — Businesses looking for workers</h1>

      {isLoading && <p>Loading...</p>}
      {!isLoading && data && data.length === 0 && <p>No job listings found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((job: any) => (
          <div key={job.id} className="border p-4 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-1">{job.business_name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{job.description}</p>
            <p className="text-sm font-medium">Wage: {job.wage ?? "—"}</p>
            {job.contact && <p className="text-xs text-muted-foreground mt-2">Contact: {job.contact}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
