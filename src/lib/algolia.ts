import { algoliasearch } from 'algoliasearch';
import { SearchFilters, SearchResult, Editor } from '@/types';

// Algolia client configuration
const client = algoliasearch('V0KR3LXR6K', '9a28b30f46a25c06117cd4479a1b2514');

// Index names
export const EDITORS_INDEX = 'editors_index';
export const SHOWS_INDEX = 'shows_index';

/**
 * Search editors using Algolia with advanced filters and faceting
 */
export async function searchEditors(filters: SearchFilters): Promise<SearchResult> {
  try {
    console.log('🔍 Searching with Algolia v5:', filters);

    const searchParams = {
      hitsPerPage: 20,
      attributesToRetrieve: ['*'],
      attributesToHighlight: ['name', 'experience.specialties'],
      facets: [
        'experience.specialties',
        'professional.unionStatus',
        'location.state',
        'location.remote',
        'metadata.verified'
      ],
      filters: '',
      numericFilters: [] as string[]
    };

    // Build query string
    const query = filters.query || '';

    // Build filters
    const filterParts: string[] = [];

    if (filters.unionStatus.length > 0) {
      const unionFilters = filters.unionStatus.map(status => `professional.unionStatus:"${status}"`).join(' OR ');
      filterParts.push(`(${unionFilters})`);
    }

    if (filters.awardWinners) {
      filterParts.push('metadata.verified:true');
    }

    if (filters.location.remoteOnly) {
      filterParts.push('location.remote:true');
    }

    if (filterParts.length > 0) {
      searchParams.filters = filterParts.join(' AND ');
    }

    // Add numeric filters for experience
    if (filters.experienceRange.min > 0 || filters.experienceRange.max < 25) {
      searchParams.numericFilters = [
        `experience.yearsActive >= ${filters.experienceRange.min}`,
        `experience.yearsActive <= ${filters.experienceRange.max}`
      ];
    }

    // Add genre filters (specialties)
    if (filters.genres.length > 0) {
      const genreFilters = filters.genres.map(genre => `experience.specialties:"${genre}"`).join(' OR ');
      filterParts.push(`(${genreFilters})`);
      searchParams.filters = filterParts.join(' AND ');
    }

    // Execute search using new v5 API
    const searchResponse = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query,
        hitsPerPage: searchParams.hitsPerPage,
        attributesToRetrieve: searchParams.attributesToRetrieve,
        attributesToHighlight: searchParams.attributesToHighlight,
        facets: searchParams.facets,
        filters: searchParams.filters,
        numericFilters: searchParams.numericFilters
      }]
    });

    const firstResult = searchResponse.results[0] as any;
    const hits = firstResult?.hits || [];
    const facets = firstResult?.facets || {};

    // Transform Algolia response to our SearchResult format
    const result: SearchResult = {
      editors: hits.map((hit: any) => ({
        id: hit.objectID,
        ...hit,
        // Ensure dates are properly formatted
        metadata: {
          ...hit.metadata,
          createdAt: hit.metadata?.createdAt ? new Date(hit.metadata.createdAt) : new Date(),
          updatedAt: hit.metadata?.updatedAt ? new Date(hit.metadata.updatedAt) : new Date()
        }
      })) as Editor[],
      totalCount: (searchResponse.results[0] as any)?.nbHits || 0,
      facets: {
        genres: facets['experience.specialties'] || {},
        networks: {}, // TODO: Implement from credits
        locations: facets['location.state'] || {},
        experience: transformExperienceFacets(facets['experience.yearsActive'] || {})
      }
    };

    console.log(`✅ Algolia search completed: ${result.editors.length} results`);
    return result;

  } catch (error) {
    console.error('❌ Algolia search failed:', error);
    
    // Fallback to empty results
    return {
      editors: [],
      totalCount: 0,
      facets: {
        genres: {},
        networks: {},
        locations: {},
        experience: {}
      }
    };
  }
}

/**
 * Transform numeric experience facets to ranges
 */
function transformExperienceFacets(experienceFacets: { [key: string]: number }): { [key: string]: number } {
  const ranges: { [key: string]: number } = {
    '0-5 years': 0,
    '5-10 years': 0,
    '10+ years': 0
  };

  Object.entries(experienceFacets).forEach(([years, count]) => {
    const yearsNum = parseInt(years);
    if (yearsNum < 5) {
      ranges['0-5 years'] += count;
    } else if (yearsNum < 10) {
      ranges['5-10 years'] += count;
    } else {
      ranges['10+ years'] += count;
    }
  });

  return ranges;
}

/**
 * Check if Algolia is properly configured
 */
export function isAlgoliaConfigured(): boolean {
  return true; // We have hardcoded credentials for now
}

/**
 * Test Algolia connection
 */
export async function testAlgoliaConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // Test with a simple search
    await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 1
      }]
    });
    return { connected: true };
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown Algolia error' 
    };
  }
}

/**
 * Sync editor to Algolia index
 */
export async function syncEditorToAlgolia(editor: Editor): Promise<boolean> {
  try {
    // Prepare editor for Algolia
    const algoliaEditor = {
      objectID: editor.id,
      ...editor,
      // Convert dates to ISO strings for Algolia
      metadata: {
        ...editor.metadata,
        createdAt: editor.metadata.createdAt.toISOString(),
        updatedAt: editor.metadata.updatedAt.toISOString()
      }
    };

    await client.saveObjects({
      indexName: EDITORS_INDEX,
      objects: [algoliaEditor]
    });

    console.log(`✅ Synced editor ${editor.name} to Algolia`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to sync editor to Algolia:`, error);
    return false;
  }
}

/**
 * Initialize Algolia with sample data (for testing)
 */
export async function initializeAlgoliaWithSampleData(): Promise<boolean> {
  try {
    console.log('🔧 Initializing Algolia with sample TV editor data...');

    const sampleEditors = [
      {
        objectID: 'editor-1',
        name: 'Maria Gonzales',
        experience: {
          yearsActive: 12,
          specialties: ['Drama', 'Limited Series']
        },
        professional: {
          unionStatus: 'guild',
          availability: 'available'
        },
        location: {
          city: 'Los Angeles',
          state: 'CA',
          remote: true
        },
        metadata: {
          verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      {
        objectID: 'editor-2', 
        name: 'Aika Miyake',
        experience: {
          yearsActive: 8,
          specialties: ['Drama', 'Action']
        },
        professional: {
          unionStatus: 'guild',
          availability: 'busy'
        },
        location: {
          city: 'Vancouver',
          state: 'BC',
          remote: false
        },
        metadata: {
          verified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    ];

    await client.saveObjects({
      indexName: EDITORS_INDEX,
      objects: sampleEditors
    });

    console.log('✅ Sample data indexed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Algolia:', error);
    return false;
  }
} 