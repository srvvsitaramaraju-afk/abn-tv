import { http } from './http';
import type { Show, SearchResultItem, Episode, CastMember } from '@/types/show';

// Fetch by page from index
export async function fetchShowsPage(page:number = 0): Promise<Show[]> {
  const { data } = await http.get<Show[]>('/shows', { params: { page } });
  return data;
}

// Search by show name
export async function searchShows(q: string): Promise<SearchResultItem[]> {
  const { data } = await http.get<SearchResultItem[]>('/search/shows', { params: { q } });
  return data;
}

// Show Info in detail
export async function getShow(id: number): Promise<Show> {
  const { data } = await http.get<Show>(`/shows/${id}`);
  return data;
}

// episodes info
export async function getShowEpisodes(showId: number): Promise<Episode[]> {
  const { data } = await http.get<Episode[]>(`/shows/${showId}/episodes`);
  return data;
}
// cast info
export async function getShowCast(showId: number): Promise<CastMember[]> {
  const { data } = await http.get<CastMember[]>(`/shows/${showId}/cast`);
  return data;
}