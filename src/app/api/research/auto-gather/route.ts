import { NextRequest, NextResponse } from 'next/server';
import { autoResearchService } from '@/lib/auto-research-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting automated research for all editors...');
    
    // Check for admin authorization (optional - remove if not needed)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Start the automated research process
    await autoResearchService.gatherDataForAllEditors();
    
    return NextResponse.json({
      success: true,
      message: 'Automated research completed for all editors',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Auto research API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to gather research data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Automated Research Service',
    description: 'POST to this endpoint to trigger research gathering for all editors',
    status: 'ready'
  });
} 