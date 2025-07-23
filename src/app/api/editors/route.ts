import { NextRequest, NextResponse } from 'next/server';
import { SearchFilters, ApiResponse, SearchResult } from '@/types';
import { searchService } from '@/lib/search-service';

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

    console.log('🔍 API Search request:', filters);
    
    // Use the new hybrid search service (Firebase + Apify web search)
    const result = await searchService.searchEditors(filters);

    const response: ApiResponse<SearchResult> = {
      data: result,
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Search API error:', error);
    
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
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