export interface Image {
  medium?: string;
  original?: string;
}

export interface Rating {
  average: number | null;
}

export interface Show {
  id: number;
  name: string;
  genres: string[];
  summary?: string | null;
  rating?: Rating;
  image?: Image | null;
  language?: string | null;
  status?: string | null;
  premiered?: string | null;
  officialSite?: string | null;
}

export interface SearchResultItem {
  score: number;
  show: Show;
}

export interface Episode {
  id: number | null;
  name: string;
  season: number | null;
  number: number | null;
  airdate?: string | null;
  airtime?: string | null;
  runtime?: number | null;
  summary?: string | null;
  image?: Image | null;
}

export interface Person {
  id: number;
  name: string | null;
  image?: Image | null;
}

export interface Character {
  id: number;
  name: string;
  image?: Image | null;
}

export interface CastMember {
  person: Person;
  character: Character;
  self?: boolean;
  voice?: boolean;
}