import { useQuery } from "@tanstack/react-query";

import {
  getDashboardStatistics,
  type DashboardStatisticsParams,
} from "@/lib/api/dashboard";

// Ключи запросов основной статистики.
export const dashboardKeys = {
  all: ["dashboard"] as const,

  statistics: (params: DashboardStatisticsParams) =>
    [
      ...dashboardKeys.all,
      "statistics",
      params.date,
      params.msuId ?? null,
      params.organizationId ?? null,
    ] as const,
};

// Получение основной статистики.
export function useDashboardStatistics(
  params: DashboardStatisticsParams | null,
) {
  return useQuery({
    queryKey: params
      ? dashboardKeys.statistics(params)
      : [...dashboardKeys.all, "statistics", "disabled"],

    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Не заданы параметры статистики");
      }

      return getDashboardStatistics(params, signal);
    },

    enabled: params !== null && params.date.length > 0,
  });
}
