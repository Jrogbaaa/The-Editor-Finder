// Editor Profile Types
export interface Editor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location: {
    city: string;
    state: string;
    country: string;
    remote: boolean;
  };
  experience: {
    yearsActive: number;
    startYear: number;
    specialties: string[];
  };
  professional: {
    unionStatus: 'guild' | 'non-union' | 'unknown';
    imdbId?: string;
    availability: 'available' | 'busy' | 'unknown';
    representation?: {
      agent?: string;
      agentContact?: string;
      manager?: string;
      managerContact?: string;
    };
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    dataSource: string[];
    verified: boolean;
  };
}

// TV Show Credit Types
export interface Credit {
  id: string;
  editorId: string;
  show: {
    title: string;
    type: 'series' | 'miniseries' | 'special' | 'documentary';
    network: string;
    genre: string[];
    imdbId?: string;
  };
  role: {
    position: 'supervising-editor' | 'editor' | 'assistant-editor' | 'associate-editor';
    episodeCount?: number;
    seasonCount?: number;
  };
  timeline: {
    startYear: number;
    endYear?: number;
    current: boolean;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    dataSource: string;
    verified: boolean;
  };
}

// Awards Types
export interface Award {
  id: string;
  editorId: string;
  award: {
    name: string;
    category: string;
    year: number;
    status: 'won' | 'nominated';
  };
  show?: {
    title: string;
    network: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    dataSource: string;
    verified: boolean;
  };
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  genres: string[];
  experienceRange: {
    min: number;
    max: number;
  };
  networks: string[];
  location: {
    cities: string[];
    states: string[];
    remoteOnly: boolean;
  };
  unionStatus: ('guild' | 'non-union')[];
  awardWinners: boolean;
  showTypes: ('series' | 'miniseries' | 'special' | 'documentary')[];
}

export interface SearchResult {
  editors: Editor[];
  totalCount: number;
  facets: {
    genres: { [key: string]: number };
    networks: { [key: string]: number };
    locations: { [key: string]: number };
    experience: { [key: string]: number };
  };
}

// UI Component Types
export interface EditorCardProps {
  editor: Editor;
  credits: Credit[];
  awards: Award[];
  onSelect?: (editor: Editor) => void;
  showDetails?: boolean;
}

export interface SearchResultsProps {
  results: SearchResult;
  loading: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onExport?: () => void;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// Data Source Types
export interface DataSource {
  name: string;
  type: 'api' | 'scraping' | 'manual';
  lastSync: Date;
  status: 'active' | 'inactive' | 'error';
  recordCount: number;
} 