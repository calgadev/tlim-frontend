import client from './client';
import type { ScrapeScope, ScrapeStatusResponse, ServerScrapeResult } from '@/types';

/** Starts a background TibiaWiki scrape (202). 409 if one is already running. */
export async function startScrape(scope: ScrapeScope): Promise<ScrapeStatusResponse> {
  const { data } = await client.post<ScrapeStatusResponse>('/api/admin/scrape', null, { params: { scope } });
  return data;
}

export async function getScrapeStatus(): Promise<ScrapeStatusResponse> {
  const { data } = await client.get<ScrapeStatusResponse>('/api/admin/scrape/status');
  return data;
}

/** Synchronises the official world list right away. 502 if the source is unavailable. */
export async function scrapeServers(): Promise<ServerScrapeResult> {
  const { data } = await client.post<ServerScrapeResult>('/api/admin/scrape/servers');
  return data;
}
