/**
 * TMDb (The Movie Database) API Integration
 * For fetching TV show metadata and crew information including editors
 */

interface TMDbShow {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  last_air_date?: string;
  number_of_episodes: number;
  number_of_seasons: number;
  genres: { id: number; name: string }[];
  networks: { id: number; name: string }[];
  production_companies: { id: number; name: string }[];
  status: string;
  external_ids?: {
    imdb_id?: string;
  };
}

interface TMDbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
  episode_count?: number;
}

interface TMDbCredits {
  id: number;
  crew: TMDbCrewMember[];
}

interface TMDbSearchResult {
  page: number;
  results: TMDbShow[];
  total_pages: number;
  total_results: number;
}

class TMDbService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TMDb API key not found. Set TMDB_API_KEY environment variable.');
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error('TMDb API key not configured');
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search for TV shows by name
   */
  async searchTVShows(query: string, page = 1): Promise<TMDbSearchResult> {
    return this.makeRequest<TMDbSearchResult>('/search/tv', {
      query,
      page: page.toString(),
      include_adult: 'false'
    });
  }

  /**
   * Get detailed information about a TV show
   */
  async getTVShow(tvId: number): Promise<TMDbShow> {
    return this.makeRequest<TMDbShow>(`/tv/${tvId}`, {
      append_to_response: 'external_ids'
    });
  }

  /**
   * Get credits (cast and crew) for a TV show
   */
  async getTVCredits(tvId: number): Promise<TMDbCredits> {
    return this.makeRequest<TMDbCredits>(`/tv/${tvId}/credits`);
  }

  /**
   * Get credits for a specific season
   */
  async getSeasonCredits(tvId: number, seasonNumber: number): Promise<TMDbCredits> {
    return this.makeRequest<TMDbCredits>(`/tv/${tvId}/season/${seasonNumber}/credits`);
  }

  /**
   * Extract editors from crew data
   */
  extractEditors(credits: TMDbCredits): TMDbCrewMember[] {
    const editorJobs = [
      'Editor',
      'Supervising Editor', 
      'Additional Editor',
      'Assistant Editor',
      'Associate Editor',
      'Online Editor',
      'Offline Editor'
    ];

    return credits.crew.filter(member => 
      editorJobs.includes(member.job) || 
      member.department === 'Editing'
    );
  }

  /**
   * Get popular TV shows to find editors
   */
  async getPopularTVShows(page = 1): Promise<TMDbSearchResult> {
    return this.makeRequest<TMDbSearchResult>('/tv/popular', {
      page: page.toString()
    });
  }

  /**
   * Get top-rated TV shows
   */
  async getTopRatedTVShows(page = 1): Promise<TMDbSearchResult> {
    return this.makeRequest<TMDbSearchResult>('/tv/top_rated', {
      page: page.toString()
    });
  }

  /**
   * Search for editors across multiple shows
   */
  async findEditorsInShows(showIds: number[]): Promise<{
    showId: number;
    showName: string;
    editors: TMDbCrewMember[];
  }[]> {
    const results = [];

    for (const showId of showIds) {
      try {
        const [show, credits] = await Promise.all([
          this.getTVShow(showId),
          this.getTVCredits(showId)
        ]);

        const editors = this.extractEditors(credits);
        
        if (editors.length > 0) {
          results.push({
            showId,
            showName: show.name,
            editors
          });
        }

        // Rate limiting - respect TMDb's rate limits
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Error fetching data for show ${showId}:`, error);
      }
    }

    return results;
  }

  /**
   * Convert TMDb show data to our internal format
   */
  mapShowToCredit(show: TMDbShow, editor: TMDbCrewMember) {
    return {
      show: {
        title: show.name,
        type: this.determineShowType(show),
        network: show.networks[0]?.name || 'Unknown',
        genre: show.genres.map(g => g.name),
        imdbId: show.external_ids?.imdb_id
      },
      role: {
        position: this.mapJobToPosition(editor.job),
        episodeCount: editor.episode_count || show.number_of_episodes,
        seasonCount: show.number_of_seasons
      },
      timeline: {
        startYear: new Date(show.first_air_date).getFullYear(),
        endYear: show.last_air_date ? new Date(show.last_air_date).getFullYear() : undefined,
        current: show.status === 'Returning Series' || show.status === 'In Production'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        dataSource: 'tmdb',
        verified: true
      }
    };
  }

  private determineShowType(show: TMDbShow): 'series' | 'miniseries' | 'special' | 'documentary' {
    if (show.number_of_seasons === 1 && show.number_of_episodes <= 10) {
      return 'miniseries';
    }
    if (show.genres.some(g => g.name.toLowerCase().includes('documentary'))) {
      return 'documentary';
    }
    return 'series';
  }

  private mapJobToPosition(job: string): 'supervising-editor' | 'editor' | 'assistant-editor' | 'associate-editor' {
    const jobLower = job.toLowerCase();
    
    if (jobLower.includes('supervising')) return 'supervising-editor';
    if (jobLower.includes('assistant')) return 'assistant-editor';
    if (jobLower.includes('associate')) return 'associate-editor';
    return 'editor';
  }
}

// Export singleton instance
export const tmdbService = new TMDbService();

// Export types for use in other files
export type {
  TMDbShow,
  TMDbCrewMember,
  TMDbCredits,
  TMDbSearchResult
}; 