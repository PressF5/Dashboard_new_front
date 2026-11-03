export type Option = {
  id: number;
  name: string;
  msuId?: number;
};

export type Metric = {
  key: string;
  label: string;
  order: number;
  categoryKey: string;
  categoryLabel: string;
  unit?: string | null;
  percentage: boolean;
  value: number | string | boolean | null;
  hasData: boolean;
};

export type DashboardStats = {
  date: string;
  scope: string;
  title?: string;
  metrics: Metric[];
  message?: string;
};

export type DashboardDatesResponse = {
  date: string;
}[];
