import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { SearchFilters, Editor, ApiResponse, SearchResult } from '@/types';
import { realEmmyService } from '@/lib/real-emmy-service';

// Temporarily disable Algolia due to import issues
// TODO: Re-enable Algolia once import issues are resolved
// let algoliaSearchEditors: ((filters: SearchFilters) => Promise<SearchResult>) | null = null;
// let isAlgoliaConfigured: (() => boolean) | null = null;

// try {
//   const algoliaModule = require('@/lib/algolia');
//   algoliaSearchEditors = algoliaModule.searchEditors;
//   isAlgoliaConfigured = algoliaModule.isAlgoliaConfigured;
// } catch (error) {
//   console.log('Algolia not available, using Firebase search only');
// }

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters into SearchFilters
    const filters: SearchFilters = {
      query: searchParams.get('q') || '',
      genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
      networks: searchParams.get('networks')?.split(',').filter(Boolean) || [],
      experienceRange: {
        min: parseInt(searchParams.get('minExperience') || '0'),
        max: parseInt(searchParams.get('maxExperience') || '25')
      },
      location: {
        cities: [],
        states: [],
        remoteOnly: searchParams.get('remoteOnly') === 'true'
      },
      unionStatus: searchParams.get('unionStatus')?.split(',').filter(Boolean) as ('guild' | 'non-union')[] || [],
      awardWinners: searchParams.get('awardWinners') === 'true',
      showTypes: [],
      availability: []
    };

    const pageSize = parseInt(searchParams.get('limit') || '20');
    
    // Use Firebase search for now
    console.log('🔍 Using Firebase search');
    const result = await searchWithFirebase(filters, pageSize);

    // If no editors found, try to initialize with Emmy data
    if (result.editors.length === 0) {
      console.log('📊 No editors found, checking Emmy database...');
      try {
        await realEmmyService.initializeRealEmmyDatabase();
        console.log('✅ Emmy database initialized');
      } catch (error) {
        console.log('ℹ️ Emmy database already initialized or failed:', error);
      }
    }

    const response: ApiResponse<SearchResult> = {
      data: result,
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search error:', error);
    
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * Firebase-based search implementation
 */
async function searchWithFirebase(filters: SearchFilters, pageSize: number): Promise<SearchResult> {
  let editorsQuery = query(collection(db, 'editors'));

  // Add filters
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
  editorsQuery = query(editorsQuery, orderBy('metadata.updatedAt', 'desc'), limit(pageSize));

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
      )
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

  // Calculate facets for filtered results
  const facets = {
    genres: {} as { [key: string]: number },
    networks: {} as { [key: string]: number },
    locations: {} as { [key: string]: number },
    experience: {} as { [key: string]: number }
  };

  // Build facets
  filteredEditors.forEach(editor => {
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

  return {
    editors: filteredEditors,
    totalCount: filteredEditors.length,
    facets
  };
}

export async function POST(request: NextRequest) {
  try {
    const filters: SearchFilters = await request.json();
    
    // Convert filters to query parameters and call GET
    const searchParams = new URLSearchParams();
    
    if (filters.query) searchParams.set('q', filters.query);
    if (filters.genres.length > 0) searchParams.set('genres', filters.genres.join(','));
    if (filters.networks.length > 0) searchParams.set('networks', filters.networks.join(','));
    if (filters.experienceRange.min > 0) searchParams.set('minExperience', filters.experienceRange.min.toString());
    if (filters.experienceRange.max < 25) searchParams.set('maxExperience', filters.experienceRange.max.toString());
    if (filters.unionStatus.length > 0) searchParams.set('unionStatus', filters.unionStatus.join(','));
    if (filters.awardWinners) searchParams.set('awardWinners', 'true');
    if (filters.location.remoteOnly) searchParams.set('remoteOnly', 'true');

    // Create a new request with the search parameters
    const url = new URL(request.url);
    url.search = searchParams.toString();
    
    const getRequest = new NextRequest(url, { method: 'GET' });
    return GET(getRequest);
  } catch (error) {
    console.error('Search POST error:', error);
    
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Invalid request body',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 400 });
  }
} 