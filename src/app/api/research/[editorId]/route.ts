import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ResearchEntry, ResearchType } from '@/types/research';
import { ApiResponse } from '@/types';

interface ResearchApiResponse extends ApiResponse<ResearchEntry[] | { message: string }> {
  data: ResearchEntry[] | { message: string };
}

/**
 * GET /api/research/[editorId]
 * Fetch research entries for a specific editor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ editorId: string }> }
): Promise<NextResponse<ResearchApiResponse>> {
  const { editorId } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ResearchType | null;
    const status = searchParams.get('status') as 'draft' | 'active' | 'archived' | 'disputed' | null;
    const limitCount = parseInt(searchParams.get('limit') || '50');

    // Build query
    let q = query(
      collection(db, 'research'),
      where('editorId', '==', editorId)
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    if (status) {
      q = query(q, where('status', '==', status));
    } else {
      // Default to active entries only
      q = query(q, where('status', '==', 'active'));
    }

    q = query(q, orderBy('metadata.updatedAt', 'desc'), limit(limitCount));

    const snapshot = await getDocs(q);
    const entries: ResearchEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ResearchEntry));

    const response: ResearchApiResponse = {
      data: entries,
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching research entries:', error);
    
    const response: ResearchApiResponse = {
      data: { message: 'Failed to fetch research entries' },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/research/[editorId]
 * Create a new research entry for an editor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ editorId: string }> }
): Promise<NextResponse<ResearchApiResponse>> {
  const { editorId } = await params;
  try {
    const body = await request.json();
    const { 
      type, 
      title, 
      content, 
      tags, 
      sources, 
      confidence, 
      priority, 
      status 
    } = body;

    // Validate required fields
    if (!type || !title || !content) {
      const response: ResearchApiResponse = {
        data: { message: 'Missing required fields: type, title, content' },
        success: false,
        error: 'Validation failed',
        timestamp: new Date()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create research entry
    const researchEntry: Omit<ResearchEntry, 'id'> = {
      editorId: editorId,
      type: type as ResearchType,
      title,
      content,
      tags: tags || [],
      sources: sources || [],
      confidence: confidence || 'medium',
      priority: priority || 'medium',
      status: status || 'active',
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system', // TODO: Replace with actual user ID
        updatedBy: 'system',
        version: 1
      }
    };

    const docRef = await addDoc(collection(db, 'research'), researchEntry);

    // Log research activity
    await addDoc(collection(db, 'researchActivities'), {
      editorId: editorId,
      action: 'created',
      resourceType: 'research-entry',
      resourceId: docRef.id,
      description: `New research entry: ${title}`,
      userId: 'system',
      timestamp: new Date(),
      metadata: {
        researchType: type,
        confidence,
        priority
      }
    });

    const response: ResearchApiResponse = {
      data: { 
        message: 'Research entry created successfully'
      },
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating research entry:', error);
    
    const response: ResearchApiResponse = {
      data: { message: 'Failed to create research entry' },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/research/[editorId]
 * Update a research entry (requires researchId in query params)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { editorId: string } }
): Promise<NextResponse<ResearchApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const researchId = searchParams.get('id');

    if (!researchId) {
      const response: ResearchApiResponse = {
        data: { message: 'Research ID is required in query parameters' },
        success: false,
        error: 'Missing parameter',
        timestamp: new Date()
      };
      return NextResponse.json(response, { status: 400 });
    }

    const body = await request.json();
    const updates = { ...body };
    delete updates.id; // Don't allow ID updates
    delete updates.editorId; // Don't allow editor ID changes

    // Update research entry
    const researchRef = doc(db, 'research', researchId);
    await updateDoc(researchRef, {
      ...updates,
      'metadata.updatedAt': new Date(), // Use serverTimestamp() for Firestore
      'metadata.updatedBy': 'system', // TODO: Replace with actual user ID
      'metadata.version': new Date() // Increment version
    });

    // Log research activity
    await addDoc(collection(db, 'researchActivities'), {
      editorId: params.editorId,
      action: 'updated',
      resourceType: 'research-entry',
      resourceId: researchId,
      description: `Updated research entry`,
      userId: 'system',
      timestamp: new Date(),
      metadata: { changes: Object.keys(updates) }
    });

    const response: ResearchApiResponse = {
      data: { message: 'Research entry updated successfully' },
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating research entry:', error);
    
    const response: ResearchApiResponse = {
      data: { message: 'Failed to update research entry' },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/research/[editorId]
 * Archive a research entry (requires researchId in query params)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { editorId: string } }
): Promise<NextResponse<ResearchApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const researchId = searchParams.get('id');

    if (!researchId) {
      const response: ResearchApiResponse = {
        data: { message: 'Research ID is required in query parameters' },
        success: false,
        error: 'Missing parameter',
        timestamp: new Date()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Archive instead of delete (soft delete)
    const researchRef = doc(db, 'research', researchId);
    await updateDoc(researchRef, {
      status: 'archived',
      'metadata.updatedAt': new Date(), // Use serverTimestamp() for Firestore
      'metadata.updatedBy': 'system'
    });

    // Log research activity
    await addDoc(collection(db, 'researchActivities'), {
      editorId: params.editorId,
      action: 'archived',
      resourceType: 'research-entry',
      resourceId: researchId,
      description: `Archived research entry`,
      userId: 'system',
      timestamp: new Date()
    });

    const response: ResearchApiResponse = {
      data: { message: 'Research entry archived successfully' },
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error archiving research entry:', error);
    
    const response: ResearchApiResponse = {
      data: { message: 'Failed to archive research entry' },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
} 