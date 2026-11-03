import { useQuery } from "@tanstack/react-query";

import {
  getPublicationStatistics,
  type PublicationStatisticsParams,
} from "@/lib/api/publications";

// Ключи запросов статистики публикаций.
export const publicationKeys = {
  all: ["publications"] as const,

  statistics: (params: PublicationStatisticsParams) =>
    [
      ...publicationKeys.all,
      "statistics",
      params.date,
      params.msuId ?? null,
    ] as const,
};

// Получение статистики публикаций.
export function usePublicationStatistics(
  params: PublicationStatisticsParams | null,
) {
  return useQuery({
    queryKey: params
      ? publicationKeys.statistics(params)
      : [...publicationKeys.all, "statistics", "disabled"],

    queryFn: ({ signal }) => {
      if (!params) {
        throw new Error("Не заданы параметры статистики публикаций");
      }

      return getPublicationStatistics(params, signal);
    },

    enabled: params !== null && params.date.length > 0,
  });
}
