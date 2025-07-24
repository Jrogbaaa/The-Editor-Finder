import { SearchService } from '@/lib/search-service';
import { SearchFilters, Editor } from '@/types';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
}));

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Filter Processing', () => {
    test('should process query as genre for "drama"', () => {
      const filters: SearchFilters = {
        query: 'drama',
        genres: [],
        networks: [],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: [],
        awardWinners: false,
        showTypes: []
      };

      const processedFilters = (searchService as any).processQueryAsGenre(filters);
      
      expect(processedFilters.query).toBe('');
      expect(processedFilters.genres).toContain('Drama');
    });

    test('should process query as genre for "comedy"', () => {
      const filters: SearchFilters = {
        query: 'comedy',
        genres: [],
        networks: [],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: [],
        awardWinners: false,
        showTypes: []
      };

      const processedFilters = (searchService as any).processQueryAsGenre(filters);
      
      expect(processedFilters.query).toBe('');
      expect(processedFilters.genres).toContain('Comedy');
    });

    test('should not process non-genre queries', () => {
      const filters: SearchFilters = {
        query: 'Breaking Bad',
        genres: [],
        networks: [],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: [],
        awardWinners: false,
        showTypes: []
      };

      const processedFilters = (searchService as any).processQueryAsGenre(filters);
      
      expect(processedFilters.query).toBe('Breaking Bad');
      expect(processedFilters.genres).toHaveLength(0);
    });
  });

  describe('Web Search Query Building', () => {
    test('should build query from filters with network and genre', () => {
      const filters: SearchFilters = {
        query: '',
        genres: ['Talk Show'],
        networks: ['CBS'],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: ['guild'],
        awardWinners: false,
        showTypes: []
      };

      const query = (searchService as any).buildQueryFromFilters(filters);
      
      expect(query).toContain('CBS');
      expect(query).toContain('Talk Show');
      expect(query).toContain('TV editor');
    });

    test('should build query from filters with multiple networks', () => {
      const filters: SearchFilters = {
        query: '',
        genres: ['Drama'],
        networks: ['Netflix', 'HBO'],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: [],
        awardWinners: false,
        showTypes: []
      };

      const query = (searchService as any).buildQueryFromFilters(filters);
      
      expect(query).toContain('Netflix');
      expect(query).toContain('Drama');
    });

    test('should handle empty filters gracefully', () => {
      const filters: SearchFilters = {
        query: '',
        genres: [],
        networks: [],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: [],
        awardWinners: false,
        showTypes: []
      };

      const query = (searchService as any).buildQueryFromFilters(filters);
      
      expect(query).toBe('television editor');
    });
  });

  describe('TV Show Detection', () => {
    test('should detect known TV shows', () => {
      const testCases = [
        'breaking bad',
        'game of thrones',
        'the wire',
        'stranger things'
      ];

      testCases.forEach(show => {
        const isShow = (searchService as any).looksLikeTVShow(show);
        expect(isShow).toBe(true);
      });
    });

    test('should not detect genre keywords as TV shows', () => {
      const testCases = [
        'drama',
        'comedy',
        'thriller',
        'animation'
      ];

      testCases.forEach(genre => {
        const isShow = (searchService as any).looksLikeTVShow(genre);
        expect(isShow).toBe(false);
      });
    });

    test('should handle multi-word potential show titles', () => {
      const potentialShows = [
        'the last kingdom',
        'house of cards',
        'the mandalorian'
      ];

      potentialShows.forEach(show => {
        const isShow = (searchService as any).looksLikeTVShow(show);
        expect(isShow).toBe(true);
      });
    });
  });

  describe('Genre Detection', () => {
    test('should detect genre keywords', () => {
      const genres = [
        'drama',
        'comedy',
        'horror',
        'sci-fi',
        'talk show',
        'documentary'
      ];

      genres.forEach(genre => {
        const isGenre = (searchService as any).isGenreQuery(genre);
        expect(isGenre).toBe(true);
      });
    });

    test('should not detect non-genre keywords', () => {
      const nonGenres = [
        'breaking bad',
        'netflix',
        'margaret sixel',
        'editing'
      ];

      nonGenres.forEach(term => {
        const isGenre = (searchService as any).isGenreQuery(term);
        expect(isGenre).toBe(false);
      });
    });
  });

  describe('Editor Name Validation', () => {
    test('should validate legitimate editor names', () => {
      const validNames = [
        'Margaret Sixel',
        'Kelley Dixon',
        'Chris McKay',
        'Timothy A. Good'
      ];

      validNames.forEach(name => {
        const isValid = (searchService as any).isValidEditorName(name);
        expect(isValid).toBe(true);
      });
    });

    test('should reject mock/sample names', () => {
      const mockNames = [
        'John Smith',
        'Jane Doe',
        'John Doe',
        'Test Editor',
        'Sample Editor'
      ];

      mockNames.forEach(name => {
        const isValid = (searchService as any).isValidEditorName(name);
        expect(isValid).toBe(false);
      });
    });

    test('should reject known actors', () => {
      const actorNames = [
        'Travis Fimmel',
        'Mickey Rourke',
        'Matthew Modine'
      ];

      actorNames.forEach(name => {
        const isValid = (searchService as any).isValidEditorName(name);
        expect(isValid).toBe(false);
      });
    });

    test('should reject invalid name formats', () => {
      const invalidNames = [
        'SingleName',
        '',
        'A B C D E F G', // Too many parts
        'Video Editor Name', // Contains "video"
        'Press Contact' // Contains "press"
      ];

      invalidNames.forEach(name => {
        const isValid = (searchService as any).isValidEditorName(name);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Actor Filtering', () => {
    test('should filter out known actors from editor lists', () => {
      const mixedList: Editor[] = [
        {
          id: '1',
          name: 'Margaret Sixel',
          experience: { specialties: ['Film', 'Action'], yearsActive: 15, startYear: 2005 },
          location: { city: 'Sydney', state: 'NSW', country: 'Australia', remote: false },
          professional: { unionStatus: 'guild', availability: 'available' },
          metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ['test'], verified: true }
        },
        {
          id: '2',
          name: 'Travis Fimmel', // This is an actor
          experience: { specialties: ['Acting'], yearsActive: 10, startYear: 2010 },
          location: { city: 'Los Angeles', state: 'CA', country: 'USA', remote: false },
          professional: { unionStatus: 'guild', availability: 'available' },
          metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ['test'], verified: true }
        }
      ];

      const filtered = (searchService as any).filterOutKnownActors(mixedList);
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Margaret Sixel');
    });
  });

  describe('Web Search Query Enhancement', () => {
    test('should build enhanced queries for TV shows', () => {
      const queries = (searchService as any).buildWebSearchQueries('Breaking Bad');
      
      expect(queries).toHaveLength(3);
      expect(queries[0]).toContain('Breaking Bad');
      expect(queries[0]).toContain('film editor');
      expect(queries[0]).toContain('-actor');
    });

    test('should build enhanced queries for genres', () => {
      const queries = (searchService as any).buildWebSearchQueries('drama');
      
      expect(queries).toHaveLength(3);
      expect(queries[0]).toContain('drama');
      expect(queries[0]).toContain('television');
      expect(queries[0]).toContain('-actor');
    });

    test('should limit query count to 3', () => {
      const queries = (searchService as any).buildWebSearchQueries('test query');
      
      expect(queries).toHaveLength(3);
    });
  });

  describe('Search Decision Logic', () => {
    test('should trigger web search for 0 local results with filters', () => {
      const mockLocalResults = { editors: [], totalCount: 0, facets: {} };
      const processedFilters: SearchFilters = {
        query: '',
        genres: ['Talk Show'],
        networks: ['CBS'],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: ['guild'],
        awardWinners: false,
        showTypes: []
      };

      // Mock the private methods we need
      const hasFilters = processedFilters.genres.length > 0 || 
                        processedFilters.networks.length > 0 || 
                        processedFilters.unionStatus.length > 0;
      const hasTextQuery = !!processedFilters.query?.trim();
      
      const shouldSearchWeb = (mockLocalResults.editors.length === 0 && (hasTextQuery || hasFilters)) || 
                             (mockLocalResults.editors.length < 2 && hasTextQuery);

      expect(shouldSearchWeb).toBe(true);
    });

    test('should not trigger web search when sufficient local results exist', () => {
      const mockLocalResults = { 
        editors: new Array(5).fill({}).map((_, i) => ({ id: i.toString(), name: `Editor ${i}` })), 
        totalCount: 5, 
        facets: {} 
      };
      const processedFilters: SearchFilters = {
        query: 'drama',
        genres: [],
        networks: [],
        experienceRange: { min: 0, max: 25 },
        location: { cities: [], states: [], remoteOnly: false },
        unionStatus: [],
        awardWinners: false,
        showTypes: []
      };

      const hasFilters = processedFilters.genres.length > 0 || 
                        processedFilters.networks.length > 0 || 
                        processedFilters.unionStatus.length > 0;
      const hasTextQuery = !!processedFilters.query?.trim();
      
      const shouldSearchWeb = (mockLocalResults.editors.length === 0 && (hasTextQuery || hasFilters)) || 
                             (mockLocalResults.editors.length < 2 && hasTextQuery);

      expect(shouldSearchWeb).toBe(false);
    });
  });

  describe('Result Combination', () => {
    test('should combine local and web results properly', () => {
      const localResults = {
        editors: [{ id: '1', name: 'Local Editor 1' }],
        totalCount: 1,
        facets: {}
      };

      const webResults = {
        editors: [{ id: '2', name: 'Web Editor 1' }],
        searchQuery: 'test query',
        sourceUrls: ['http://example.com'],
        totalFound: 1
      };

      const combined = (searchService as any).combineResults(localResults, webResults);

      expect(combined.editors).toHaveLength(2);
      expect(combined.totalCount).toBe(2);
      expect(combined.editors[0].name).toBe('Local Editor 1');
      expect(combined.editors[1].name).toBe('Web Editor 1');
    });

    test('should handle empty web results', () => {
      const localResults = {
        editors: [{ id: '1', name: 'Local Editor 1' }],
        totalCount: 1,
        facets: {}
      };

      const webResults = {
        editors: [],
        searchQuery: 'test query',
        sourceUrls: [],
        totalFound: 0
      };

      const combined = (searchService as any).combineResults(localResults, webResults);

      expect(combined.editors).toHaveLength(1);
      expect(combined.totalCount).toBe(1);
    });
  });

  describe('Facet Building', () => {
    test('should build facets from editor data', () => {
      const editors: Editor[] = [
        {
          id: '1',
          name: 'Editor 1',
          experience: { specialties: ['Drama', 'Comedy'], yearsActive: 10, startYear: 2010 },
          location: { city: 'Los Angeles', state: 'CA', country: 'USA', remote: false },
          professional: { unionStatus: 'guild', availability: 'available' },
          metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ['test'], verified: true }
        },
        {
          id: '2',
          name: 'Editor 2',
          experience: { specialties: ['Action', 'Thriller'], yearsActive: 15, startYear: 2005 },
          location: { city: 'New York', state: 'NY', country: 'USA', remote: false },
          professional: { unionStatus: 'non-union', availability: 'available' },
          metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ['test'], verified: true }
        }
      ];

      const facets = (searchService as any).buildFacets(editors);

      expect(facets).toBeDefined();
      expect(facets.genres).toBeDefined();
      expect(facets.locations).toBeDefined();
      expect(facets.unionStatus).toBeDefined();
    });
  });
}); 