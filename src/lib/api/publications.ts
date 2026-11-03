import { apiFetch } from "@/lib/api/client";

import type { PublicationStatisticsResponse } from "@/types/publication";

export type PublicationStatisticsParams = {
  date: string;
  msuId?: number | null;
};

/**
 * Получение статистики публикаций.
 *
 * Если msuId не указан, возвращается статистика
 * по всем МСУ.
 */
export function getPublicationStatistics(
  params: PublicationStatisticsParams,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams({
    date: params.date,
  });

  if (params.msuId != null) {
    searchParams.set("msuId", String(params.msuId));
  }

  return apiFetch<PublicationStatisticsResponse>(
    `/api/publications/statistics?${searchParams.toString()}`,
    { signal },
  );
}
