import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EditorKnowledge, KnowledgeSummary } from '@/types/research';
import { ApiResponse } from '@/types';

interface KnowledgeApiResponse extends ApiResponse<any> {
  data: EditorKnowledge | { message: string };
}

/**
 * GET /api/knowledge/[editorId]
 * Get editor knowledge summary and intelligence
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { editorId: string } }
): Promise<NextResponse<KnowledgeApiResponse>> {
  try {
    const knowledgeRef = doc(db, 'editorKnowledge', params.editorId);
    const knowledgeDoc = await getDoc(knowledgeRef);

    if (!knowledgeDoc.exists()) {
      // Create initial knowledge structure
      const initialKnowledge: Omit<EditorKnowledge, 'editorId'> = {
        summary: {
          keyStrengths: [],
          primarySpecialties: [],
          careerStage: 'emerging',
          availabilityPattern: 'unknown',
          rateRange: {
            currency: 'USD',
            unit: 'project',
            lastUpdated: new Date()
          },
          preferredProjectTypes: [],
          workingStyle: [],
          communicationStyle: 'Unknown',
          lastKnownStatus: 'No recent information available'
        },
        insights: [],
        connections: [],
        opportunities: [],
        risks: [],
        metrics: {
          responseTime: {
            average: 0,
            reliability: 0,
            lastUpdated: new Date()
          },
          projectCompletion: {
            onTimeRate: 0,
            qualityScore: 0,
            clientSatisfaction: 0,
            lastUpdated: new Date()
          },
          collaboration: {
            teamworkScore: 0,
            communicationScore: 0,
            flexibilityScore: 0,
            lastUpdated: new Date()
          },
          technicalSkills: {
            softwareProficiency: {},
            adaptabilityScore: 0,
            innovationScore: 0,
            lastUpdated: new Date()
          }
        },
        lastUpdated: new Date(),
        completeness: 0
      };

      await setDoc(knowledgeRef, initialKnowledge);

      const response: KnowledgeApiResponse = {
        data: {
          editorId: params.editorId,
          ...initialKnowledge
        },
        success: true,
        timestamp: new Date()
      };

      return NextResponse.json(response);
    }

    const knowledgeData = knowledgeDoc.data() as Omit<EditorKnowledge, 'editorId'>;
    const knowledge: EditorKnowledge = {
      editorId: params.editorId,
      ...knowledgeData
    };

    const response: KnowledgeApiResponse = {
      data: knowledge,
      success: true,
      timestamp: new Date()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching editor knowledge:', error);
    
    const response: KnowledgeApiResponse = {
      data: { message: 'Failed to fetch editor knowledge' },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/knowledge/[editorId]
 * Update or regenerate editor knowledge summary
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { editorId: string } }
): Promise<NextResponse<KnowledgeApiResponse>> {
  try {
    const body = await request.json();
    const { action = 'update' } = body;

    if (action === 'regenerate') {
      // TODO: Implement knowledge regeneration from research entries
      // This would analyze all research entries and generate new insights
      
      const response: KnowledgeApiResponse = {
        data: { message: 'Knowledge regeneration started. This feature is coming soon.' },
        success: true,
        timestamp: new Date()
      };

      return NextResponse.json(response);
    }

    if (action === 'update') {
      const updates = { ...body };
      delete updates.action;
      delete updates.editorId;

      const knowledgeRef = doc(db, 'editorKnowledge', params.editorId);
      await updateDoc(knowledgeRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });

      const response: KnowledgeApiResponse = {
        data: { message: 'Knowledge updated successfully' },
        success: true,
        timestamp: new Date()
      };

      return NextResponse.json(response);
    }

    const response: KnowledgeApiResponse = {
      data: { message: 'Invalid action. Use "update" or "regenerate"' },
      success: false,
      error: 'Invalid action',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 400 });
  } catch (error) {
    console.error('Error updating editor knowledge:', error);
    
    const response: KnowledgeApiResponse = {
      data: { message: 'Failed to update editor knowledge' },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };

    return NextResponse.json(response, { status: 500 });
  }
} 