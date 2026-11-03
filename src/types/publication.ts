export type PublicationRow = {
  date: string;
  msuId: number;
  name: string;
  sourceCode?: string | null;
  socialPublications: number | null;
  websitePublications: number | null;
  parentChatPublications: number | null;
  thematicVideos: number | null;
  publicationReach: number | null;
  organizationsPercent: number | null;
};

export type PublicationDatesResponse = {
  date: string;
}[];

export type PublicationStatisticsResponse = {
  date: string;
  metrics: PublicationRow[];
  message?: string;
};
