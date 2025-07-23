import { Editor, SearchFilters, SearchResult } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

interface ApifySearchResult {
  editors: Editor[];
  searchQuery: string;
  sourceUrls: string[];
  totalFound: number;
}

/**
 * Comprehensive search service combining Firebase database and Apify web scraping
 * Replaces Algolia with a more flexible, web-enabled search system
 */
export class SearchService {
  private apifyToken: string;
  
  constructor() {
    this.apifyToken = process.env.APIFY_API_TOKEN || '';
  }

  /**
   * Main search function that combines local database and web search
   */
  async searchEditors(filters: SearchFilters): Promise<SearchResult> {
    console.log('🔍 Starting hybrid search:', filters);
    
    try {
      // Step 1: Search local Firebase database first
      const localResults = await this.searchLocalDatabase(filters);
      console.log(`📊 Local database found: ${localResults.editors.length} editors`);

      // Step 2: If we have good local results or no query, return them
      if (localResults.editors.length >= 3 || !filters.query?.trim()) {
        return localResults;
      }

      // Step 3: Search the web for additional editors
      console.log('🌐 Searching web for additional editors...');
      const webResults = await this.searchWebForEditors(filters.query, filters);
      
      // Step 4: Store web results in database for future searches
      if (webResults.editors.length > 0) {
        await this.storeWebResultsInDatabase(webResults.editors, filters.query);
      }

      // Step 5: Combine and return results
      const combinedResults = this.combineResults(localResults, webResults);
      console.log(`✅ Combined search found: ${combinedResults.editors.length} total editors`);
      
      return combinedResults;

    } catch (error) {
      console.error('❌ Search failed:', error);
      
      // Fallback to local database only
      return await this.searchLocalDatabase(filters);
    }
  }

  /**
   * Search the local Firebase database
   */
  private async searchLocalDatabase(filters: SearchFilters): Promise<SearchResult> {
    console.log('🔍 Searching local Firebase database...');
    
    try {
      let editorsQuery = query(collection(db, 'editors'));

      // Apply filters
      if (filters.unionStatus.length > 0) {
        editorsQuery = query(editorsQuery, where('professional.unionStatus', 'in', filters.unionStatus));
      }

      if (filters.location.remoteOnly) {
        editorsQuery = query(editorsQuery, where('location.remote', '==', true));
      }

      if (filters.experienceRange.min > 0 || filters.experienceRange.max < 25) {
        editorsQuery = query(
          editorsQuery,
          where('experience.yearsActive', '>=', filters.experienceRange.min),
          where('experience.yearsActive', '<=', filters.experienceRange.max)
        );
      }

      // Add ordering and pagination
      editorsQuery = query(editorsQuery, orderBy('metadata.updatedAt', 'desc'), limit(20));

      // Execute query
      const snapshot = await getDocs(editorsQuery);
      const editors: Editor[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        editors.push({
          id: doc.id,
          ...data,
          metadata: {
            ...data.metadata,
            createdAt: data.metadata.createdAt?.toDate() || new Date(),
            updatedAt: data.metadata.updatedAt?.toDate() || new Date(),
          }
        } as Editor);
      });

      // Filter by text search if provided
      let filteredEditors = editors;
      if (filters.query) {
        const searchQuery = filters.query.toLowerCase();
        filteredEditors = editors.filter(editor =>
          editor.name.toLowerCase().includes(searchQuery) ||
          (editor.experience?.specialties || []).some(specialty =>
            specialty.toLowerCase().includes(searchQuery)
          ) ||
          // Search in any associated show titles (if available)
          this.searchInCredits(editor, searchQuery)
        );
      }

      // Filter by genres (specialties)
      if (filters.genres.length > 0) {
        filteredEditors = filteredEditors.filter(editor =>
          filters.genres.some(genre =>
            (editor.experience?.specialties || []).includes(genre)
          )
        );
      }

      return {
        editors: filteredEditors,
        totalCount: filteredEditors.length,
        facets: this.buildFacets(filteredEditors)
      };

    } catch (error) {
      console.error('❌ Local database search failed:', error);
      return {
        editors: [],
        totalCount: 0,
        facets: { genres: {}, networks: {}, locations: {}, experience: {} }
      };
    }
  }

  /**
   * Search credits/shows associated with an editor
   */
  private searchInCredits(editor: Editor, searchQuery: string): boolean {
    // This could be expanded to search actual credits collections
    // For now, just a placeholder that returns false
    return false;
  }

  /**
   * Search the web for TV show editors using Apify
   */
  private async searchWebForEditors(query: string, filters: SearchFilters): Promise<ApifySearchResult> {
    console.log(`🌐 Searching web for: "${query}"`);
    
    try {
      // Build enhanced search queries for TV editor discovery
      const searchQueries = this.buildWebSearchQueries(query);
      const allEditors: Editor[] = [];
      const sourceUrls: string[] = [];

      for (const searchQuery of searchQueries) {
        try {
          // Use Apify's Google search to find relevant pages
          const searchResults = await this.apifyGoogleSearch(searchQuery);
          
          // Scrape each result page for editor information
          for (const url of searchResults.slice(0, 5)) { // Limit to top 5 results per query
            try {
              const pageEditors = await this.scrapeEditorsFromPage(url, query);
              allEditors.push(...pageEditors);
              if (pageEditors.length > 0) {
                sourceUrls.push(url);
              }
            } catch (pageError) {
              console.warn(`Failed to scrape ${url}:`, pageError);
            }
          }
        } catch (queryError) {
          console.warn(`Failed search for "${searchQuery}":`, queryError);
        }
      }

      // Remove duplicates and limit results
      const uniqueEditors = this.deduplicateEditors(allEditors);
      const limitedResults = uniqueEditors.slice(0, 10);

      return {
        editors: limitedResults,
        searchQuery: query,
        sourceUrls: [...new Set(sourceUrls)],
        totalFound: limitedResults.length
      };

    } catch (error) {
      console.error('❌ Web search failed:', error);
      return {
        editors: [],
        searchQuery: query,
        sourceUrls: [],
        totalFound: 0
      };
    }
  }

  /**
   * Build enhanced search queries for finding TV editors
   */
  private buildWebSearchQueries(query: string): string[] {
    const baseQuery = query.toLowerCase();
    const queries: string[] = [];

    // Direct show search
    if (baseQuery.includes('simpsons')) {
      queries.push('The Simpsons TV show editors credits IMDB');
      queries.push('The Simpsons animation editors Emmy awards');
      queries.push('The Simpsons post-production team');
    } else if (baseQuery.includes('friends')) {
      queries.push('Friends TV show editors credits IMDB');
      queries.push('Friends sitcom editors film crew');
    } else if (baseQuery.includes('comedy')) {
      queries.push('comedy TV show editors Emmy winners');
      queries.push('television comedy editors Guild members');
      queries.push('sitcom editors Hollywood professionals');
    } else if (baseQuery.includes('drama')) {
      queries.push('drama TV series editors Emmy awards');
      queries.push('television drama editors credits');
    } else {
      // Generic TV show search
      queries.push(`"${query}" TV show editors credits`);
      queries.push(`"${query}" television editors IMDB`);
      queries.push(`"${query}" post-production editors`);
    }

    // Add general editor search
    queries.push(`television editors "${query}" credits`);
    queries.push(`TV editors "${query}" Emmy Guild`);

    return queries.slice(0, 3); // Limit to 3 queries to avoid excessive API calls
  }

  /**
   * Use Apify to search Google for relevant pages
   */
  private async apifyGoogleSearch(searchQuery: string): Promise<string[]> {
    try {
      const input = {
        endpoint: 'search',
        google_domain: 'www.google.com',
        query: searchQuery,
        page: 1
      };

      const response = await fetch(`https://api.apify.com/v2/acts/dCWf2xghxeZgpcrsQ/run-sync-get-dataset-items?token=${this.apifyToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Apify search failed: ${response.status}`);
      }

      const data = await response.json();
      return data[0]?.search || [];

    } catch (error) {
      console.error('Apify Google search failed:', error);
      return [];
    }
  }

  /**
   * Scrape a specific page for editor information using Apify
   */
  private async scrapeEditorsFromPage(url: string, originalQuery: string): Promise<Editor[]> {
    try {
      const input = {
        endpoint: 'scrape',
        url: url,
        fields: {
          editors: [
            {
              name: "< Full name of the TV editor >",
              role: "< Their role like 'Editor', 'Supervising Editor', etc. >",
              show: "< Name of the TV show they worked on >",
              network: "< TV network or streaming service >",
              years: "< Years they worked on the show >",
              awards: "< Any Emmy or other awards mentioned >"
            }
          ],
          credits: [
            {
              editor_name: "< Editor's full name >",
              position: "< Job title like 'Film Editor', 'Post-Production Editor' >",
              project: "< TV show or movie title >",
              year: "< Year of the project >"
            }
          ]
        }
      };

      const response = await fetch(`https://api.apify.com/v2/acts/dCWf2xghxeZgpcrsQ/run-sync-get-dataset-items?token=${this.apifyToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Apify scrape failed: ${response.status}`);
      }

      const data = await response.json();
      const scrapedData = data[0]?.scrape || {};

      // Parse the scraped data into Editor objects
      const editors = this.parseScrapedDataToEditors(scrapedData, url, originalQuery);
      
      console.log(`📄 Scraped ${editors.length} editors from ${url}`);
      return editors;

    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      return [];
    }
  }

  /**
   * Parse scraped data into Editor objects
   */
  private parseScrapedDataToEditors(scrapedData: any, sourceUrl: string, originalQuery: string): Editor[] {
    const editors: Editor[] = [];
    
    try {
      // Parse from editors array
      if (scrapedData.editors && Array.isArray(scrapedData.editors)) {
        for (const editorData of scrapedData.editors) {
          if (editorData.name && editorData.name.trim()) {
            const editor = this.createEditorFromScrapedData(editorData, sourceUrl, originalQuery);
            if (editor) editors.push(editor);
          }
        }
      }

      // Parse from credits array  
      if (scrapedData.credits && Array.isArray(scrapedData.credits)) {
        for (const creditData of scrapedData.credits) {
          if (creditData.editor_name && creditData.editor_name.trim()) {
            const editor = this.createEditorFromCreditData(creditData, sourceUrl, originalQuery);
            if (editor) editors.push(editor);
          }
        }
      }

    } catch (error) {
      console.error('Failed to parse scraped data:', error);
    }

    return editors;
  }

  /**
   * Create an Editor object from scraped editor data
   */
  private createEditorFromScrapedData(editorData: any, sourceUrl: string, originalQuery: string): Editor | null {
    try {
      const name = editorData.name?.trim();
      if (!name || !this.isValidEditorName(name)) {
        return null;
      }

      const editor: Editor = {
        id: `web-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name,
        email: '',
        phone: '',
        location: {
          city: 'Unknown',
          state: 'Unknown', 
          country: 'USA',
          remote: true
        },
        experience: {
          yearsActive: this.estimateYearsActive(editorData.years),
          startYear: this.estimateStartYear(editorData.years),
          specialties: [this.guessSpecialtyFromQuery(originalQuery)]
        },
        professional: {
          unionStatus: 'unknown',
          availability: 'unknown'
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: ['web-search', 'apify'],
          verified: false
        }
      };

      return editor;

    } catch (error) {
      console.error('Failed to create editor from scraped data:', error);
      return null;
    }
  }

  /**
   * Create an Editor object from scraped credit data
   */
  private createEditorFromCreditData(creditData: any, sourceUrl: string, originalQuery: string): Editor | null {
    try {
      const name = creditData.editor_name?.trim();
      if (!name || !this.isValidEditorName(name)) {
        return null;
      }

      const editor: Editor = {
        id: `web-credit-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name,
        email: '',
        phone: '',
        location: {
          city: 'Unknown',
          state: 'Unknown',
          country: 'USA', 
          remote: true
        },
        experience: {
          yearsActive: this.estimateYearsActive(creditData.year),
          startYear: this.estimateStartYear(creditData.year),
          specialties: [this.guessSpecialtyFromQuery(originalQuery)]
        },
        professional: {
          unionStatus: 'unknown',
          availability: 'unknown'
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: ['web-search', 'apify'],
          verified: false
        }
      };

      return editor;

    } catch (error) {
      console.error('Failed to create editor from credit data:', error);
      return null;
    }
  }

  /**
   * Store web search results in Firebase database for future searches
   */
  private async storeWebResultsInDatabase(editors: Editor[], searchQuery: string): Promise<void> {
    console.log(`💾 Storing ${editors.length} web-found editors in database...`);
    
    try {
      for (const editor of editors) {
        // Check if editor already exists
        const existingQuery = query(
          collection(db, 'editors'),
          where('name', '==', editor.name)
        );
        
        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          // Add new editor
          await addDoc(collection(db, 'editors'), {
            ...editor,
            metadata: {
              ...editor.metadata,
              originalSearchQuery: searchQuery,
              addedViaWebSearch: true
            }
          });
          console.log(`✅ Added new editor: ${editor.name}`);
        } else {
          // Update existing editor with web search metadata
          const existingDoc = existingSnapshot.docs[0];
          await updateDoc(doc(db, 'editors', existingDoc.id), {
            'metadata.lastWebSearchDate': new Date(),
            'metadata.webSearchQueries': searchQuery
          });
          console.log(`🔄 Updated existing editor: ${editor.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to store web results:', error);
    }
  }

  /**
   * Combine local and web search results
   */
  private combineResults(localResults: SearchResult, webResults: ApifySearchResult): SearchResult {
    const allEditors = [...localResults.editors, ...webResults.editors];
    const uniqueEditors = this.deduplicateEditors(allEditors);
    
    return {
      editors: uniqueEditors,
      totalCount: uniqueEditors.length,
      facets: this.buildFacets(uniqueEditors)
    };
  }

  /**
   * Remove duplicate editors based on name similarity
   */
  private deduplicateEditors(editors: Editor[]): Editor[] {
    const unique: Editor[] = [];
    const seenNames = new Set<string>();

    for (const editor of editors) {
      const normalizedName = editor.name.toLowerCase().trim();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        unique.push(editor);
      }
    }

    return unique;
  }

  /**
   * Build facets for filtering
   */
  private buildFacets(editors: Editor[]): SearchResult['facets'] {
    const facets = {
      genres: {} as { [key: string]: number },
      networks: {} as { [key: string]: number },
      locations: {} as { [key: string]: number },
      experience: {} as { [key: string]: number }
    };

    editors.forEach(editor => {
      // Genre facets (from specialties)
      (editor.experience?.specialties || []).forEach(specialty => {
        facets.genres[specialty] = (facets.genres[specialty] || 0) + 1;
      });

      // Location facets
      if (editor.location) {
        const locationKey = `${editor.location.city}, ${editor.location.state}`;
        facets.locations[locationKey] = (facets.locations[locationKey] || 0) + 1;
      }

      // Experience facets
      const yearsActive = editor.experience?.yearsActive || 0;
      const expRange = yearsActive < 5 ? '0-5 years' :
                     yearsActive < 10 ? '5-10 years' : '10+ years';
      facets.experience[expRange] = (facets.experience[expRange] || 0) + 1;
    });

    return facets;
  }

  /**
   * Helper methods
   */
  private isValidEditorName(name: string): boolean {
    const invalidNames = [
      'the simpsons', 'tv show', 'emmy award', 'academy award',
      'post production', 'film editor', 'television', 'animation',
      'director', 'producer', 'writer', 'creator'
    ];

    return !invalidNames.some(invalid => 
      name.toLowerCase().includes(invalid)
    ) && name.split(' ').length >= 2 && name.length < 50;
  }

  private guessSpecialtyFromQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('comedy') || lowerQuery.includes('simpsons') || lowerQuery.includes('friends')) return 'Comedy';
    if (lowerQuery.includes('drama')) return 'Drama';
    if (lowerQuery.includes('documentary')) return 'Documentary';
    if (lowerQuery.includes('reality')) return 'Reality TV';
    if (lowerQuery.includes('animation')) return 'Animation';
    if (lowerQuery.includes('news')) return 'News';
    
    return 'Drama'; // Default
  }

  private estimateYearsActive(years: string | number): number {
    if (typeof years === 'number') return Math.min(years, 25);
    if (typeof years === 'string') {
      const match = years.match(/\d+/);
      return match ? Math.min(parseInt(match[0]), 25) : 10;
    }
    return 10; // Default estimate
  }

  private estimateStartYear(years: string | number): number {
    const currentYear = new Date().getFullYear();
    const activeYears = this.estimateYearsActive(years);
    return currentYear - activeYears;
  }
}

// Export singleton instance
export const searchService = new SearchService(); 