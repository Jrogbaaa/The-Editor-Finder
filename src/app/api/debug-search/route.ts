import { NextResponse } from 'next/server';
import { SearchService } from '@/lib/search-service';
import { SearchFilters } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Test filter that should trigger web search (CBS talk show editors)
  const testFilters: SearchFilters = {
    query: '',
    genres: ['Talk Show'],
    networks: ['CBS'],
    experienceRange: { min: 0, max: 25 },
    location: { 
      cities: [], 
      states: [], 
      remoteOnly: false 
    },
    unionStatus: ['guild'],
    awardWinners: false,
    showTypes: []
  };

  console.log('🧪 Debug: Testing filter-based search logic...');
  console.log('🔍 Test filters:', testFilters);

  try {
    const searchService = new SearchService();
    
    // Test local search first
    console.log('📊 Testing local database search...');
    const localResults = await (searchService as any).searchLocalDatabase(testFilters);
    console.log(`📊 Local results: ${localResults.editors.length} editors found`);

    // Test web search query building
    console.log('🌐 Testing web search query building...');
    const webQuery = (searchService as any).buildQueryFromFilters(testFilters);
    console.log(`🔍 Generated web query: "${webQuery}"`);

    // Test web search directly
    console.log('🌐 Testing web search directly...');
    let webSearchError = null;
    let webResults = null;
    try {
      webResults = await (searchService as any).searchWebForEditors(webQuery, testFilters);
      console.log(`🌐 Direct web search results: ${webResults?.editors?.length || 0} editors found`);
    } catch (error) {
      webSearchError = error instanceof Error ? error.message : 'Unknown web search error';
      console.error('🐛 Web search error:', error);
    }

    // Test full hybrid search
    console.log('🔄 Testing full hybrid search...');
    const fullResults = await searchService.searchEditors(testFilters);
    console.log(`✅ Full search results: ${fullResults.editors.length} editors found`);

    return NextResponse.json({
      success: true,
      debug: {
        testFilters,
        localResultCount: localResults.editors.length,
        generatedWebQuery: webQuery,
        directWebResultCount: webResults?.editors?.length || 0,
        webSearchError,
        fullResultCount: fullResults.editors.length,
        webSearchTriggered: fullResults.editors.length > localResults.editors.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('🐛 Debug search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Debug search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 