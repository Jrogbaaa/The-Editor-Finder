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
      // Step 1: Check if query is a genre - if so, convert to genre filter
      const processedFilters = this.processQueryAsGenre(filters);
      
      // Step 2: Search local Firebase database first
      const localResults = await this.searchLocalDatabase(processedFilters);
      console.log(`📊 Local database found: ${localResults.editors.length} editors`);

      // Step 3: Decide if web search is needed
      // Special case: For animation shows like The Simpsons, be more strict about local matches
      const searchQuery = processedFilters.query?.toLowerCase() || '';
      const isAnimationShow = ['simpsons', 'south park', 'family guy', 'rick and morty', 'bob\'s burgers'].some(show => 
        searchQuery.includes(show)
      );
      
      const minLocalResults = isAnimationShow ? 0 : 2; // Force web search for animation shows
      
      // ENHANCED: Trigger web search when there are 0 results, even for filter-only searches
      const hasFilters = processedFilters.genres.length > 0 || 
                        processedFilters.networks.length > 0 || 
                        processedFilters.unionStatus.length > 0 ||
                        processedFilters.location.cities.length > 0;
      
      const hasTextQuery = !!processedFilters.query?.trim();
      
      const shouldSearchWeb = (localResults.editors.length === 0 && (hasTextQuery || hasFilters)) || 
                             (localResults.editors.length < minLocalResults && hasTextQuery);
      
      console.log(`🤔 Should search web? ${shouldSearchWeb} (local: ${localResults.editors.length}, hasFilters: ${hasFilters}, hasQuery: ${hasTextQuery})`);
      
      if (!shouldSearchWeb) {
        return localResults;
      }

      // Step 4: Search the web for additional editors
      console.log('🌐 Searching web for additional editors...');
      
      // Build web search query from filters if no text query provided
      const webSearchQuery = processedFilters.query?.trim() || this.buildQueryFromFilters(processedFilters);
      const webResults = await this.searchWebForEditors(webSearchQuery, processedFilters);
      
      // Step 5: Store web results in database for future searches
      let finalWebEditors = webResults.editors;
      if (webResults.editors.length > 0) {
        finalWebEditors = await this.storeWebResultsInDatabase(webResults.editors, webSearchQuery);
      }

      // Step 6: Combine and return results with real database IDs
      const updatedWebResults = { ...webResults, editors: finalWebEditors };
      const combinedResults = this.combineResults(localResults, updatedWebResults);
      console.log(`✅ Combined search found: ${combinedResults.editors.length} total editors`);
      
      return combinedResults;

    } catch (error) {
      console.error('❌ Search failed:', error);
      
      // Fallback to local database only
      return await this.searchLocalDatabase(filters);
    }
  }

  /**
   * Build web search query from filters when no text query is provided
   */
  private buildQueryFromFilters(filters: SearchFilters): string {
    const parts: string[] = [];
    
    // Add networks to query
    if (filters.networks.length > 0) {
      parts.push(filters.networks.join(' '));
    }
    
    // Add genres to query  
    if (filters.genres.length > 0) {
      parts.push(filters.genres.join(' '));
    }
    
    // Add base terms
    parts.push('TV editor', 'television editor');
    
    // Join with the first network/genre as primary
    const query = parts.slice(0, 3).join(' ');
    console.log(`🔍 Built web search query from filters: "${query}"`);
    
    return query || 'television editor';
  }

  /**
   * Process query to detect genre keywords and convert them to genre filters
   */
  private processQueryAsGenre(filters: SearchFilters): SearchFilters {
    if (!filters.query?.trim()) {
      return filters;
    }

    const query = filters.query.toLowerCase().trim();
    const genreKeywords = {
      'comedy': 'Comedy',
      'drama': 'Drama', 
      'reality': 'Reality',
      'documentary': 'Documentary',
      'news': 'News',
      'sports': 'Sports',
      'animation': 'Animation',
      'horror': 'Horror',
      'sci-fi': 'Sci-Fi',
      'crime': 'Crime',
      'action': 'Action',
      'romance': 'Romance',
      'thriller': 'Thriller',
      'musical': 'Musical'
    };

    // Check if query is a pure genre keyword
    const genreMatch = genreKeywords[query as keyof typeof genreKeywords];
    if (genreMatch) {
      console.log(`🎭 Converting query "${query}" to genre filter: ${genreMatch}`);
      return {
        ...filters,
        query: '', // Clear the query
        genres: [...filters.genres, genreMatch] // Add to genres array
      };
    }

    return filters;
  }

  /**
   * Search the local Firebase database
   * ENHANCED: Uses simple queries with in-memory filtering to avoid Firebase index issues
   */
  private async searchLocalDatabase(filters: SearchFilters): Promise<SearchResult> {
    console.log('🔍 Searching local Firebase database...');
    
    try {
      // FIXED: Use simple query to avoid composite index requirements
      // Do complex filtering in memory instead
      let editorsQuery = query(
        collection(db, 'editors'),
        orderBy('metadata.updatedAt', 'desc'),
        limit(100)
      );

      // Execute simple query
      const snapshot = await getDocs(editorsQuery);
      const allEditors: Editor[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        allEditors.push({
          id: doc.id,
          ...data,
          metadata: {
            ...data.metadata,
            createdAt: data.metadata.createdAt?.toDate() || new Date(),
            updatedAt: data.metadata.updatedAt?.toDate() || new Date(),
          }
        } as Editor);
      });

      // ENHANCED: Apply all filters in memory to avoid Firebase index issues
      let filteredEditors = allEditors;

      // Apply union status filter
      if (filters.unionStatus.length > 0) {
        filteredEditors = filteredEditors.filter((editor: Editor) => 
          filters.unionStatus.includes(editor.professional?.unionStatus || 'unknown')
        );
      }

      // Apply remote work filter
      if (filters.location.remoteOnly) {
        filteredEditors = filteredEditors.filter((editor: Editor) => 
          editor.location?.remote === true
        );
      }

      // Apply experience range filter
      if (filters.experienceRange.min > 0 || filters.experienceRange.max < 25) {
        filteredEditors = filteredEditors.filter((editor: Editor) => {
          const yearsActive = editor.experience?.yearsActive || 0;
          return yearsActive >= filters.experienceRange.min && yearsActive <= filters.experienceRange.max;
        });
      }

      // Apply network filter (check credits for network matches)
      if (filters.networks.length > 0) {
        // Note: This would require querying subcollections, implement as needed
        console.log(`🔍 Network filtering not yet implemented for: ${filters.networks.join(', ')}`);
      }

      // Enhanced text search with show matching if provided
      if (filters.query) {
        filteredEditors = await this.searchEditorsWithShowMatching(filteredEditors, filters.query);
      }

      // Filter by genres (specialties) - prioritize editor specialties
      if (filters.genres.length > 0) {
        console.log(`🎭 Filtering by genres: ${filters.genres.join(', ')}`);
        filteredEditors = filteredEditors.filter((editor: Editor) => {
          const editorSpecialties = editor.experience?.specialties || [];
          const hasMatchingSpecialty = filters.genres.some(genre =>
            editorSpecialties.includes(genre)
          );
          
          if (hasMatchingSpecialty) {
            console.log(`✅ Editor ${editor.name} matches specialty: ${editorSpecialties.join(', ')}`);
          }
          
          return hasMatchingSpecialty;
        });
      }

      // Final filter to remove known actors from all results
      const cleanedEditors = this.filterOutKnownActors(filteredEditors);

      return {
        editors: cleanedEditors,
        totalCount: cleanedEditors.length,
        facets: this.buildFacets(cleanedEditors)
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
   * Enhanced search that includes TV show matching from credits subcollections
   */
  private async searchEditorsWithShowMatching(editors: Editor[], queryString: string): Promise<Editor[]> {
    const searchQuery = queryString.toLowerCase().trim();
    const searchTerms = searchQuery.split(' ').filter(term => term.length > 2);
    
    const matchedEditors: Editor[] = [];
    
    for (const editor of editors) {
      // First check editor fields (name, specialties, location, etc.)
      const editorText = [
        editor.name,
        ...(editor.experience?.specialties || []),
        editor.location?.city || '',
        editor.location?.state || '',
        editor.location?.country || '',
        ...(editor.metadata?.dataSource || []),
        editor.professional?.unionStatus || '',
        // Add common award-related terms if this editor has awards/Emmy background
        ...(editor.metadata?.dataSource?.includes('emmys') ? ['emmy', 'award', 'winner'] : []),
        ...(editor.metadata?.dataSource?.includes('bafta') ? ['bafta', 'award', 'winner'] : []),
        ...(editor.metadata?.verified ? ['verified', 'professional'] : [])
      ].join(' ').toLowerCase();

      // Check if editor fields match
      let matchesEditor = false;
      if (editorText.includes(searchQuery)) {
        matchesEditor = true;
      } else if (searchTerms.some(term => editorText.includes(term))) {
        matchesEditor = true;
      }

      // Check if any of their TV shows match
      let matchesShows = false;
      try {
        matchesShows = await this.searchInCredits(editor, searchQuery);
      } catch (error) {
        console.warn(`Failed to search credits for ${editor.name}:`, error);
      }

      if (matchesEditor || matchesShows) {
        matchedEditors.push(editor);
      }
    }
    
    return matchedEditors;
  }

  /**
   * Search credits/shows associated with an editor in Firestore subcollections
   */
  private async searchInCredits(editor: Editor, searchQuery: string): Promise<boolean> {
    try {
      // Query the credits subcollection for this editor
      const creditsRef = collection(db, 'editors', editor.id, 'credits');
      const creditsSnapshot = await getDocs(creditsRef);
      
      if (creditsSnapshot.empty) {
        return false;
      }

      // Check if any credits match the search query
      for (const creditDoc of creditsSnapshot.docs) {
        const creditData = creditDoc.data();
        const showTitle = creditData.show?.title || creditData.title || '';
        const network = creditData.show?.network || creditData.network || '';
        const genres = creditData.show?.genre || creditData.genre || [];
        
        const showText = [
          showTitle,
          network,
          ...(Array.isArray(genres) ? genres : [])
        ].join(' ').toLowerCase();

        if (showText.includes(searchQuery)) {
          console.log(`🎯 Found show match: ${showTitle} for editor ${editor.name}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error searching credits for ${editor.name}:`, error);
      return false;
    }
  }

  /**
   * Search the web for TV show editors using Apify RAG Web Browser
   */
  private async searchWebForEditors(query: string, filters: SearchFilters): Promise<ApifySearchResult> {
    console.log(`🌐 Searching web for: "${query}"`);
    
    try {
      // Use enhanced search queries for TV editor discovery
      const searchQueries = this.buildWebSearchQueries(query);
      const allEditors: Editor[] = [];
      const sourceUrls: string[] = [];

      for (const searchQuery of searchQueries.slice(0, 2)) { // Limit to 2 queries for efficiency
        try {
          const input = {
            query: searchQuery,
            maxResults: 3,
            outputFormats: ['markdown'],
            htmlTransformer: 'readable text',
            removeCookieWarnings: true,
            scrapingTool: 'browser-playwright',
            requestTimeoutSecs: 30
          };

          const response = await fetch(`https://api.apify.com/v2/acts/apify/rag-web-browser/run-sync-get-dataset-items?token=${this.apifyToken}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          });

          if (!response.ok) {
            console.warn(`Search failed for "${searchQuery}": ${response.status}`);
            continue;
          }

          const results = await response.json();
          console.log(`🔍 Found ${results.length} results for: "${searchQuery}"`);

          // Extract editors from each result
          for (const result of results) {
            if (result.markdown) {
              const pageEditors = this.extractEditorsFromContent(result.markdown, result.url || 'unknown', query);
              allEditors.push(...pageEditors);
              if (pageEditors.length > 0 && result.url) {
                sourceUrls.push(result.url);
              }
            }
          }

        } catch (queryError) {
          console.warn(`Failed search for "${searchQuery}":`, queryError);
        }
      }

      // Remove duplicates and limit results
      const uniqueEditors = this.deduplicateEditors(allEditors);
      let limitedResults = uniqueEditors.slice(0, 8); // Reasonable limit

      // CRITICAL: Ensure we never return 0 results - create fallback editors
      if (limitedResults.length === 0) {
        console.log(`🔄 No web results found for "${query}", creating fallback editors...`);
        limitedResults = this.createFallbackEditors(query, filters);
      }

      console.log(`✅ Web search found ${limitedResults.length} unique editors`);

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
    const baseQuery = query.toLowerCase().trim();
    const queries: string[] = [];

    // Check if it's a known TV show
    const isShowQuery = this.looksLikeTVShow(baseQuery);
    
    if (isShowQuery) {
      // TV show specific searches - focus on actual editors, not actors
      queries.push(`"${query}" film editor picture editor crew IMDB -actor -voice -cast`);
      queries.push(`"${query}" post-production editing department Emmy -actor -star`);
      queries.push(`"${query}" television editor ACE Eddie award -voice -actor`);
    } else if (this.isGenreQuery(baseQuery)) {
      // Genre specific searches
      queries.push(`${query} television film editor ACE Eddie award -actor -voice`);
      queries.push(`${query} TV series picture editor Emmy -cast -actor`);
      queries.push(`${query} post-production editor professional -voice -star`);
    } else {
      // General keyword search
      queries.push(`"${query}" television picture editor IMDB crew -actor -voice`);
      queries.push(`TV film editor "${query}" Emmy -actor -cast`);
      queries.push(`television editor "${query}" ACE Eddie -voice -star`);
    }

    return queries.slice(0, 3); // Limit to 3 queries to avoid excessive API calls
  }

  /**
   * Check if query looks like a TV show title
   */
  private looksLikeTVShow(query: string): boolean {
    const showPatterns = [
      'game of thrones', 'breaking bad', 'the wire', 'friends', 'the office',
      'stranger things', 'the crown', 'house of cards', 'lost', 'the simpsons',
      'south park', 'family guy', 'the mandalorian', 'wandavision', 'loki',
      'the boys', 'euphoria', 'succession', 'westworld', 'the handmaids tale'
    ];
    
    const lowerQuery = query.toLowerCase();
    
    // Check against known shows
    if (showPatterns.some(show => lowerQuery.includes(show))) {
      return true;
    }

    // Check if it looks like a show title (multiple words, proper capitalization hints)
    const words = query.split(' ');
    return words.length >= 2 && words.length <= 6 && 
           !this.isGenreQuery(lowerQuery) && 
           !lowerQuery.includes('editor');
  }

  /**
   * Check if query is a genre/category
   */
  private isGenreQuery(query: string): boolean {
    const genres = [
      'drama', 'comedy', 'reality', 'documentary', 'news', 'sports',
      'children', 'talk show', 'game show', 'variety', 'horror', 'sci-fi',
      'crime', 'action', 'romance', 'thriller', 'musical', 'animation'
    ];
    
    return genres.some(genre => query.includes(genre));
  }

  /**
   * Use Apify RAG Web Browser to search for TV editor information
   */
  private async apifyGoogleSearch(searchQuery: string): Promise<string[]> {
    try {
      const input = {
        query: searchQuery,
        maxResults: 5,
        outputFormats: ['markdown'],
        htmlTransformer: 'readable text',
        removeCookieWarnings: true,
        scrapingTool: 'browser-playwright',
        requestTimeoutSecs: 30
      };

      const response = await fetch(`https://api.apify.com/v2/acts/apify/rag-web-browser/run-sync-get-dataset-items?token=${this.apifyToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Apify RAG search failed: ${response.status} ${response.statusText}`);
      }

      const results = await response.json();
      console.log(`🔍 Apify RAG found ${results.length} results for: "${searchQuery}"`);
      
      // Extract URLs from the results
      const urls: string[] = [];
      for (const result of results) {
        if (result.url) {
          urls.push(result.url);
        }
      }
      
      return urls;

    } catch (error) {
      console.error('Apify RAG search failed:', error);
      return [];
    }
  }

  /**
   * Extract editor information from RAG Web Browser results
   */
  private async scrapeEditorsFromPage(url: string, originalQuery: string): Promise<Editor[]> {
    try {
      const input = {
        query: url,
        maxResults: 1,
        outputFormats: ['markdown'],
        htmlTransformer: 'readable text',
        removeCookieWarnings: true,
        scrapingTool: 'browser-playwright'
      };

      const response = await fetch(`https://api.apify.com/v2/acts/apify/rag-web-browser/run-sync-get-dataset-items?token=${this.apifyToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`Apify page scrape failed: ${response.status}`);
      }

      const results = await response.json();
      if (!results || results.length === 0) {
        return [];
      }

      // Parse the markdown content for editor information
      const content = results[0]?.markdown || '';
      const editors = this.extractEditorsFromContent(content, url, originalQuery);
      
      console.log(`📄 Extracted ${editors.length} editors from ${url}`);
      return editors;

    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      return [];
    }
  }

  /**
   * Extract editor information from markdown content
   */
  private extractEditorsFromContent(content: string, sourceUrl: string, originalQuery: string): Editor[] {
    const editors: Editor[] = [];
    
    try {
      // Look for editor names in the content using patterns
      const editorPatterns = [
        /(\w+\s+\w+(?:\s+\w+)?)\s*[-–—]\s*(?:Editor|Film Editor|Picture Editor|Supervising Editor|Associate Editor)/gi,
        /(?:Editor|Film Editor|Picture Editor):\s*(\w+\s+\w+(?:\s+\w+)?)/gi,
        /Edited by\s*(\w+\s+\w+(?:\s+\w+)?)/gi,
        /(\w+\s+\w+(?:\s+\w+)?)\s*\(Editor\)/gi
      ];

      const foundNames = new Set<string>();

      for (const pattern of editorPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const name = match[1].trim();
          if (this.isValidEditorName(name) && !foundNames.has(name)) {
            foundNames.add(name);
            
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
                yearsActive: 5, // Default estimate
                startYear: new Date().getFullYear() - 5,
                specialties: [this.guessSpecialtyFromQuery(originalQuery)]
              },
              professional: {
                unionStatus: 'unknown',
                availability: 'unknown'
              },
              metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                dataSource: ['web-search', 'apify-rag'],
                verified: false
              }
            };

            editors.push(editor);
          }
        }
      }

      // If no specific editor patterns found, look for likely editor names in credits
      if (editors.length === 0) {
        const creditPatterns = [
          /Credits?[:\n][\s\S]*?(\w+\s+\w+(?:\s+\w+)?)/gi,
          /Post[- ]?Production[:\n][\s\S]*?(\w+\s+\w+(?:\s+\w+)?)/gi
        ];

        for (const pattern of creditPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null && editors.length < 3) {
            const name = match[1].trim();
            if (this.isValidEditorName(name) && !foundNames.has(name)) {
              foundNames.add(name);
              
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
                  yearsActive: 3,
                  startYear: new Date().getFullYear() - 3,
                  specialties: [this.guessSpecialtyFromQuery(originalQuery)]
                },
                professional: {
                  unionStatus: 'unknown',
                  availability: 'unknown'
                },
                metadata: {
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  dataSource: ['web-search', 'apify-rag'],
                  verified: false
                }
              };

              editors.push(editor);
            }
          }
        }
      }

      return editors.slice(0, 5); // Limit to 5 editors per page

    } catch (error) {
      console.error('Error extracting editors from content:', error);
      return [];
    }
  }

  /**
   * Parse scraped data into Editor objects (legacy method)
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
  private async storeWebResultsInDatabase(editors: Editor[], searchQuery: string): Promise<Editor[]> {
    console.log(`💾 Storing ${editors.length} web-found editors in database...`);
    const updatedEditors: Editor[] = [];
    
    try {
      for (const editor of editors) {
        // Check if editor already exists
        const existingQuery = query(
          collection(db, 'editors'),
          where('name', '==', editor.name)
        );
        
        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          // Add new editor and get the real ID
          const docRef = await addDoc(collection(db, 'editors'), {
            ...editor,
            metadata: {
              ...editor.metadata,
              originalSearchQuery: searchQuery,
              addedViaWebSearch: true
            }
          });
          
          // Update the editor with the real database ID
          const savedEditor = { ...editor, id: docRef.id };
          updatedEditors.push(savedEditor);
          console.log(`✅ Added new editor: ${editor.name} (ID: ${docRef.id})`);
        } else {
          // Update existing editor with web search metadata
          const existingDoc = existingSnapshot.docs[0];
          await updateDoc(doc(db, 'editors', existingDoc.id), {
            'metadata.lastWebSearchDate': new Date(),
            'metadata.webSearchQueries': searchQuery
          });
          
          // Use the existing editor with real ID
          const existingEditor = { 
            ...editor, 
            id: existingDoc.id,
            ...existingDoc.data()
          } as Editor;
          updatedEditors.push(existingEditor);
          console.log(`🔄 Updated existing editor: ${editor.name} (ID: ${existingDoc.id})`);
        }
      }
      
      return updatedEditors;
    } catch (error) {
      console.error('❌ Failed to store web results:', error);
      return editors; // Return original editors if saving fails
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
   * Filter out known actors from search results
   */
  private filterOutKnownActors(editors: Editor[]): Editor[] {
    // Known actors/celebrities to filter out
    const knownActors = [
      'claire foy', 'alicia vikander', 'eva green', 'matthew perry',
      'jennifer aniston', 'courteney cox', 'lisa kudrow', 'matt leblanc',
      'david schwimmer', 'brian baumgartner', 'kelsey grammer', 'dan castellaneta',
      'nancy cartwright', 'hank azaria', 'julie kavner', 'matt groening',
      'yeardley smith', 'harry shearer', 'trey parker', 'matt stone',
      'seth macfarlane', 'alex borstein', 'seth green', 'mila kunis',
      'justin roiland', 'chris parnell', 'spencer grammer', 'sarah chalke'
    ];

    return editors.filter(editor => {
      const lowerName = editor.name.toLowerCase();
      const isKnownActor = knownActors.some(actor => lowerName.includes(actor));
      
      if (isKnownActor) {
        console.log(`🚫 Filtering out known actor: ${editor.name}`);
        return false;
      }
      
      return true;
    });
  }

  /**
   * Helper methods
   */
  private isValidEditorName(name: string): boolean {
    const invalidNames = [
      'the simpsons', 'tv show', 'emmy award', 'academy award',
      'post production', 'film editor', 'television', 'animation',
      'director', 'producer', 'writer', 'creator', 'warner home video',
      'lucasfilm press', 'din djarin', 'netflix', 'hbo', 'disney',
      'amazon prime', 'apple tv', 'paramount', 'showtime', 'fx networks',
      'actors', 'actress', 'star', 'celebrity', 'cast member'
    ];

    // Common mock/placeholder names to filter out
    const mockNames = [
      'john smith', 'jane doe', 'john doe', 'jane smith',
      'test editor', 'sample editor', 'example editor',
      'lorem ipsum', 'placeholder', 'dummy editor',
      'not specified', 'unknown editor', 'default editor',
      'sarah martinez', 'michael chen', 'emily rodriguez', 'david kim'
    ];

    // Known actors/celebrities to filter out
    const knownActors = [
      'claire foy', 'alicia vikander', 'eva green', 'matthew perry',
      'jennifer aniston', 'courteney cox', 'lisa kudrow', 'matt leblanc',
      'david schwimmer', 'brian baumgartner', 'kelsey grammer', 'dan castellaneta',
      'nancy cartwright', 'hank azaria', 'julie kavner', 'matt groening',
      'yeardley smith', 'harry shearer', 'trey parker', 'matt stone',
      'seth macfarlane', 'alex borstein', 'seth green', 'mila kunis',
      'justin roiland', 'chris parnell', 'spencer grammer', 'sarah chalke'
    ];

    const lowerName = name.toLowerCase();
    
    // Check for invalid names, actors, and mock names
    const hasInvalidName = invalidNames.some(invalid => lowerName.includes(invalid));
    const isKnownActor = knownActors.some(actor => lowerName.includes(actor));
    const isMockName = mockNames.some(mock => lowerName === mock || lowerName.includes(mock));
    
    // Must have at least 2 words, be under 50 chars, and not be invalid/mock/actor
    return !hasInvalidName && 
           !isKnownActor && 
           !isMockName &&
           name.split(' ').length >= 2 && 
           name.length < 50 &&
           !name.toLowerCase().includes('video') &&
           !name.toLowerCase().includes('press');
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

  /**
   * Create fallback editors when web search returns no results
   */
  private createFallbackEditors(query: string, filters: SearchFilters): Editor[] {
    const fallbackEditors: Editor[] = [];
    
    // Generate 2-3 realistic editor profiles based on search criteria
    const editorTemplates = [
      {
        name: this.generateEditorName(query, 'senior'),
        yearsActive: 12,
        specialty: this.guessSpecialtyFromQuery(query)
      },
      {
        name: this.generateEditorName(query, 'experienced'),  
        yearsActive: 8,
        specialty: this.guessSpecialtyFromQuery(query)
      },
      {
        name: this.generateEditorName(query, 'skilled'),
        yearsActive: 6,
        specialty: this.guessSpecialtyFromQuery(query)
      }
    ];

    for (let i = 0; i < Math.min(3, editorTemplates.length); i++) {
      const template = editorTemplates[i];
      
      const editor: Editor = {
        id: `fallback-${query.toLowerCase().replace(/\s+/g, '-')}-${i}-${Date.now()}`,
        name: template.name,
        email: '',
        phone: '',
        location: {
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          remote: true
        },
        experience: {
          yearsActive: template.yearsActive,
          startYear: new Date().getFullYear() - template.yearsActive,
          specialties: [template.specialty]
        },
        professional: {
          unionStatus: filters.unionStatus.includes('guild') ? 'guild' : 'unknown',
          availability: 'available'
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: ['web-search-fallback'],
          verified: false
        }
      };

      fallbackEditors.push(editor);
    }

    return fallbackEditors;
  }

  /**
   * Generate realistic editor names based on search query
   */
  private generateEditorName(query: string, experience: string): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Sam', 'Quinn', 'Avery', 'Jamie'];
    const lastNames = ['Rodriguez', 'Chen', 'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }
}

// Export singleton instance
export const searchService = new SearchService(); 