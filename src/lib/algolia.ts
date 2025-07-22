import algoliasearch from 'algoliasearch/lite';
import { SearchFilters, SearchResult, Editor, ApiResponse } from '@/types';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
const searchKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
const writeKey = process.env.ALGOLIA_WRITE_KEY || '';

// Initialize Algolia client
export const searchClient = algoliasearch(appId, searchKey);

// Index names
export const EDITORS_INDEX = 'editors';
export const SHOWS_INDEX = 'shows';

// Get search index
export const editorsIndex = searchClient.initIndex(EDITORS_INDEX);
export const showsIndex = searchClient.initIndex(SHOWS_INDEX);

/**
 * Search editors using Algolia with advanced filters and faceting
 */
export async function searchEditors(filters: SearchFilters): Promise<SearchResult> {
  try {
    console.log('🔍 Searching with Algolia:', filters);

    // Build Algolia search parameters
    const searchParams: any = {
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
      filters: [],
      numericFilters: []
    };

    // Add text query
    const query = filters.query || '';

    // Add filters
    const filterParts: string[] = [];

    if (filters.unionStatus.length > 0) {
      const unionFilters = filters.unionStatus.map(status => `professional.unionStatus:'${status}'`).join(' OR ');
      filterParts.push(`(${unionFilters})`);
    }

    if (filters.awardWinners) {
      filterParts.push(`metadata.verified:true`);
    }

    if (filters.location.remoteOnly) {
      filterParts.push(`location.remote:true`);
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

    // Add facet filters for genres (will be applied to specialties)
    if (filters.genres.length > 0) {
      const genreFilters = filters.genres.map(genre => `experience.specialties:'${genre}'`).join(' OR ');
      filterParts.push(`(${genreFilters})`);
      searchParams.filters = filterParts.join(' AND ');
    }

    // Execute search
    const searchResponse = await editorsIndex.search(query, searchParams);

    // Transform Algolia response to our SearchResult format
    const result: SearchResult = {
      editors: searchResponse.hits.map((hit: any) => ({
        id: hit.objectID,
        ...hit,
        // Ensure dates are properly formatted
        metadata: {
          ...hit.metadata,
          createdAt: hit.metadata?.createdAt ? new Date(hit.metadata.createdAt) : new Date(),
          updatedAt: hit.metadata?.updatedAt ? new Date(hit.metadata.updatedAt) : new Date()
        }
      })) as Editor[],
      totalCount: searchResponse.nbHits,
      facets: {
        genres: searchResponse.facets?.['experience.specialties'] || {},
        networks: {}, // TODO: Implement from credits
        locations: searchResponse.facets?.['location.state'] || {},
        experience: transformExperienceFacets(searchResponse.facets?.['experience.yearsActive'] || {})
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
  return !!(appId && searchKey);
}

/**
 * Test Algolia connection
 */
export async function testAlgoliaConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    if (!isAlgoliaConfigured()) {
      return { connected: false, error: 'Algolia credentials not configured' };
    }

    // Test with a simple search
    await editorsIndex.search('', { hitsPerPage: 1 });
    return { connected: true };
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown Algolia error' 
    };
  }
}

/**
 * Sync editor to Algolia index (for when we add/update editors)
 */
export async function syncEditorToAlgolia(editor: Editor): Promise<boolean> {
  try {
    if (!writeKey) {
      console.warn('Algolia write key not configured, skipping sync');
      return false;
    }

    const writeClient = algoliasearch(appId, writeKey);
    const writeIndex = writeClient.initIndex(EDITORS_INDEX);

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

    await writeIndex.saveObject(algoliaEditor);
    console.log(`✅ Synced editor ${editor.name} to Algolia`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to sync editor to Algolia:`, error);
    return false;
  }
} 