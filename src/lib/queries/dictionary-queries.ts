import { useQuery } from "@tanstack/react-query";

import {
  getDashboardDates,
  getMsuOptions,
  getOrganizationOptions,
  getPublicationDates,
} from "@/lib/api/dictionaries";

// Ключи запросов справочников.
export const dictionaryKeys = {
  all: ["dictionaries"] as const,

  dashboardDates: () => [...dictionaryKeys.all, "dashboard-dates"] as const,

  msuOptions: () => [...dictionaryKeys.all, "msu-options"] as const,

  organizationOptions: (msuId: number | null) =>
    [...dictionaryKeys.all, "organization-options", msuId] as const,

  publicationDates: () => [...dictionaryKeys.all, "publication-dates"] as const,
};

// Доступные даты основной статистики.
export function useDashboardDates() {
  return useQuery({
    queryKey: dictionaryKeys.dashboardDates(),
    queryFn: ({ signal }) => getDashboardDates(signal),
  });
}

// Список МСУ.
export function useMsuOptions() {
  return useQuery({
    queryKey: dictionaryKeys.msuOptions(),
    queryFn: ({ signal }) => getMsuOptions(signal),
  });
}

// Список образовательных организаций выбранного МСУ.
export function useOrganizationOptions(msuId: number | null) {
  return useQuery({
    queryKey: dictionaryKeys.organizationOptions(msuId),
    queryFn: ({ signal }) => {
      if (msuId === null) {
        throw new Error("Не выбран МСУ");
      }

      return getOrganizationOptions(msuId, signal);
    },
    enabled: msuId !== null,
  });
}

// Доступные даты статистики публикаций.
export function usePublicationDates() {
  return useQuery({
    queryKey: dictionaryKeys.publicationDates(),
    queryFn: ({ signal }) => getPublicationDates(signal),
  });
}
