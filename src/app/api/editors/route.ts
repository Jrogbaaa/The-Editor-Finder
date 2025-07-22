import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { SearchFilters, Editor, ApiResponse, SearchResult } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const searchQuery = searchParams.get('q') || '';
    const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
    const networks = searchParams.get('networks')?.split(',').filter(Boolean) || [];
    const minExperience = parseInt(searchParams.get('minExperience') || '0');
    const maxExperience = parseInt(searchParams.get('maxExperience') || '25');
    const unionStatus = searchParams.get('unionStatus')?.split(',').filter(Boolean) || [];
    const awardWinners = searchParams.get('awardWinners') === 'true';
    const remoteOnly = searchParams.get('remoteOnly') === 'true';
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const cursor = searchParams.get('cursor');

    // Build Firestore query
    let editorsQuery = query(collection(db, 'editors'));

    // Add filters
    if (unionStatus.length > 0) {
      editorsQuery = query(editorsQuery, where('professional.unionStatus', 'in', unionStatus));
    }

    if (remoteOnly) {
      editorsQuery = query(editorsQuery, where('location.remote', '==', true));
    }

    if (minExperience > 0 || maxExperience < 25) {
      editorsQuery = query(
        editorsQuery,
        where('experience.yearsActive', '>=', minExperience),
        where('experience.yearsActive', '<=', maxExperience)
      );
    }

    // Add ordering and pagination
    editorsQuery = query(editorsQuery, orderBy('metadata.updatedAt', 'desc'), limit(pageSize));

    if (cursor) {
      // TODO: Implement cursor-based pagination
    }

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
          createdAt: data.metadata.createdAt?.toDate(),
          updatedAt: data.metadata.updatedAt?.toDate(),
        }
      } as Editor);
    });

    // Filter by genres if specified (since Firestore doesn't support array-contains-any with other where clauses)
    let filteredEditors = editors;
    if (genres.length > 0) {
      // This would require getting credits and filtering - simplified for now
      filteredEditors = editors; // TODO: Implement genre filtering through credits subcollection
    }

    // Filter by networks if specified
    if (networks.length > 0) {
      // This would require getting credits and filtering - simplified for now
      filteredEditors = filteredEditors; // TODO: Implement network filtering through credits subcollection
    }

    // Filter by search query if provided
    if (searchQuery) {
      filteredEditors = filteredEditors.filter(editor =>
        editor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        editor.experience.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
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
      // Location facets
      const locationKey = `${editor.location.city}, ${editor.location.state}`;
      facets.locations[locationKey] = (facets.locations[locationKey] || 0) + 1;

      // Experience facets
      const expRange = editor.experience.yearsActive < 5 ? '0-5 years' :
                     editor.experience.yearsActive < 10 ? '5-10 years' : '10+ years';
      facets.experience[expRange] = (facets.experience[expRange] || 0) + 1;
    });

    const result: SearchResult = {
      editors: filteredEditors,
      totalCount: filteredEditors.length,
      facets
    };

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