import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboardSummary() {
  return useQuery({
    queryKey: [api.dashboard.summary.path],
    queryFn: async () => {
      try {
        const res = await fetch(api.dashboard.summary.path);
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("useDashboardSummary error:", err);
        throw err;
      }
    },
  });
}
