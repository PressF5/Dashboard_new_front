import { apiFetch } from "@/lib/api/client";

import type { DashboardDatesResponse, Option } from "@/types/dashboard";

import type { PublicationDatesResponse } from "@/types/publication";

/**
 * Получение доступных дат основной статистики.
 */
export function getDashboardDates(signal?: AbortSignal) {
  return apiFetch<DashboardDatesResponse>("/api/dashboard/dates", { signal });
}

/**
 * Получение списка МСУ.
 */
export function getMsuOptions(signal?: AbortSignal) {
  return apiFetch<Option[]>("/api/dashboard/msu", { signal });
}

/**
 * Получение образовательных организаций выбранного МСУ.
 */
export function getOrganizationOptions(msuId: number, signal?: AbortSignal) {
  const params = new URLSearchParams({
    msuId: String(msuId),
  });

  return apiFetch<Option[]>(
    `/api/dashboard/organizations?${params.toString()}`,
    { signal },
  );
}

/**
 * Получение доступных дат статистики публикаций.
 */
export function getPublicationDates(signal?: AbortSignal) {
  return apiFetch<PublicationDatesResponse>("/api/publications/dates", {
    signal,
  });
}
