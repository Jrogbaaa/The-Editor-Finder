import { NextRequest, NextResponse } from 'next/server';
import { dataSyncService, SyncResult } from '@/lib/data-sync';
import { realEmmyService } from '@/lib/real-emmy-service';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, maxItems = 50 } = body;

    // Validate source parameter
    if (!source || !['tmdb', 'imdb', 'emmy', 'all'].includes(source)) {
      const response: ApiResponse<null> = {
        data: null,
        success: false,
        error: 'Invalid source. Must be one of: tmdb, imdb, emmy, all',
        timestamp: new Date()
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.log(`Starting data sync from ${source} with maxItems: ${maxItems}`);
    
    let syncResult: SyncResult;

    switch (source) {
      case 'tmdb':
        syncResult = await dataSyncService.syncFromTMDb(maxItems);
        break;
      
      case 'imdb':
        // TODO: Implement IMDb sync
        syncResult = {
          success: false,
          editorsProcessed: 0,
          editorsAdded: 0,
          editorsUpdated: 0,
          creditsAdded: 0,
          errors: ['IMDb sync not yet implemented']
        };
        break;
      
      case 'emmy':
        try {
          const emmyResult = await realEmmyService.initializeRealEmmyDatabase();
          syncResult = {
            success: emmyResult.success,
            editorsProcessed: emmyResult.count,
            editorsAdded: 0, // Emmy data goes to separate collection
            editorsUpdated: 0,
            creditsAdded: emmyResult.count,
            errors: emmyResult.success ? [] : [emmyResult.message]
          };
        } catch (error) {
          syncResult = {
            success: false,
            editorsProcessed: 0,
            editorsAdded: 0,
            editorsUpdated: 0,
            creditsAdded: 0,
            errors: [`Emmy sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
          };
        }
        break;
      
      case 'all':
        // Run all sync operations sequentially
        const tmdbResult = await dataSyncService.syncFromTMDb(maxItems);
        
        let emmyResult;
        try {
          const emmyInit = await realEmmyService.initializeRealEmmyDatabase();
          emmyResult = {
            success: emmyInit.success,
            editorsProcessed: emmyInit.count,
            editorsAdded: 0,
            editorsUpdated: 0,
            creditsAdded: emmyInit.count,
            errors: emmyInit.success ? [] : [emmyInit.message]
          };
        } catch (error) {
          emmyResult = {
            success: false,
            editorsProcessed: 0,
            editorsAdded: 0,
            editorsUpdated: 0,
            creditsAdded: 0,
            errors: [`Emmy sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
          };
        }
        
        // Combine results
        syncResult = {
          success: tmdbResult.success && emmyResult.success,
          editorsProcessed: tmdbResult.editorsProcessed + emmyResult.editorsProcessed,
          editorsAdded: tmdbResult.editorsAdded + emmyResult.editorsAdded,
          editorsUpdated: tmdbResult.editorsUpdated + emmyResult.editorsUpdated,
          creditsAdded: tmdbResult.creditsAdded + emmyResult.creditsAdded,
          errors: [...tmdbResult.errors, ...emmyResult.errors]
        };
        break;
      
      default:
        throw new Error('Unexpected source type');
    }

    const response: ApiResponse<SyncResult> = {
      data: syncResult,
      success: syncResult.success,
      timestamp: new Date()
    };

    return NextResponse.json(response, { 
      status: syncResult.success ? 200 : 500 
    });

  } catch (error) {
    console.error('Sync API error:', error);
    
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error occurred',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');

    // Return sync status or available sources
    if (!source) {
      const response: ApiResponse<{
        availableSources: string[];
        status: string;
      }> = {
        data: {
          availableSources: ['tmdb', 'imdb', 'emmy', 'all'],
          status: 'Data sync service is ready'
        },
        success: true,
        timestamp: new Date()
      };
      return NextResponse.json(response);
    }

    // TODO: Implement sync status checking
    const response: ApiResponse<{
      source: string;
      status: string;
      lastSync?: Date;
    }> = {
      data: {
        source,
        status: 'No sync history available yet'
      },
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Sync status error:', error);
    
    const response: ApiResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
} 