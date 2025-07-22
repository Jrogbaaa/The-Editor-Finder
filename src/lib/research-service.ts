/**
 * Research and Knowledge Database Service
 * Handles CRUD operations for editor research and intelligence
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  ResearchEntry, 
  EditorKnowledge, 
  ResearchActivity, 
  ResearchTemplate,
  ResearchType,
  ResearchSource,
  KnowledgeSummary,
  EditorInsight,
  PerformanceMetrics
} from '@/types/research';

// Collection references
const RESEARCH_COLLECTION = 'research';
const EDITOR_KNOWLEDGE_COLLECTION = 'editorKnowledge';
const RESEARCH_ACTIVITIES_COLLECTION = 'researchActivities';
const RESEARCH_TEMPLATES_COLLECTION = 'researchTemplates';

// Constants for ResearchPanel
export const RESEARCH_TYPES = [
  'credits',
  'awards',
  'performance',
  'biography',
  'client_feedback',
  'industry_news',
  'projects',
  'skills',
  'contact_info',
  'other'
] as const;

export const CONFIDENCE_LEVELS = [
  { value: 'high', label: 'High (95-100%)', color: 'text-green-600' },
  { value: 'medium', label: 'Medium (70-94%)', color: 'text-yellow-600' },
  { value: 'low', label: 'Low (50-69%)', color: 'text-orange-600' },
  { value: 'unverified', label: 'Unverified (<50%)', color: 'text-red-600' }
] as const;

export const PRIORITY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'low', label: 'Low', color: 'text-blue-600' }
] as const;

/**
 * Research Entry Management
 */

export const addResearchEntry = async (
  editorId: string, 
  researchData: Omit<ResearchEntry, 'id' | 'editorId' | 'metadata'>
): Promise<string | null> => {
  try {
    const batch = writeBatch(db);
    
    // Create research entry
    const researchRef = doc(collection(db, RESEARCH_COLLECTION));
    const researchEntry: Omit<ResearchEntry, 'id'> = {
      editorId,
      ...researchData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system', // TODO: Replace with actual user ID when auth is implemented
        updatedBy: 'system',
        version: 1
      }
    };
    
    batch.set(researchRef, researchEntry);
    
    // Log research activity
    const activityRef = doc(collection(db, RESEARCH_ACTIVITIES_COLLECTION));
    const activity: Omit<ResearchActivity, 'id'> = {
      editorId,
      action: 'created',
      resourceType: 'research-entry',
      resourceId: researchRef.id,
      description: `New research entry: ${researchData.title}`,
      userId: 'system',
      timestamp: new Date(),
      metadata: {
        researchType: researchData.type,
        confidence: researchData.confidence,
        priority: researchData.priority
      }
    };
    
    batch.set(activityRef, activity);
    
    await batch.commit();
    
    // Trigger knowledge update (async)
    updateEditorKnowledge(editorId).catch(console.error);
    
    return researchRef.id;
  } catch (error) {
    console.error('Error adding research entry:', error);
    return null;
  }
};

export const getResearchEntries = async (
  editorId: string,
  options: {
    type?: ResearchType;
    status?: 'draft' | 'active' | 'archived' | 'disputed';
    limit?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'priority';
  } = {}
): Promise<ResearchEntry[]> => {
  try {
    let q = query(
      collection(db, RESEARCH_COLLECTION),
      where('editorId', '==', editorId)
    );
    
    if (options.type) {
      q = query(q, where('type', '==', options.type));
    }
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    // Default to active entries only
    if (!options.status) {
      q = query(q, where('status', '==', 'active'));
    }
    
    const orderField = options.orderBy || 'updatedAt';
    q = query(q, orderBy(`metadata.${orderField}`, 'desc'));
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as ResearchEntry);
  } catch (error) {
    console.error('Error fetching research entries:', error);
    return [];
  }
};

export const updateResearchEntry = async (
  researchId: string,
  updates: Partial<ResearchEntry>
): Promise<boolean> => {
  try {
    const researchRef = doc(db, RESEARCH_COLLECTION, researchId);
    const researchDoc = await getDoc(researchRef);
    
    if (!researchDoc.exists()) {
      throw new Error('Research entry not found');
    }
    
    const currentData = researchDoc.data() as ResearchEntry;
    
    await updateDoc(researchRef, {
      ...updates,
      'metadata.updatedAt': serverTimestamp(),
      'metadata.updatedBy': 'system', // TODO: Replace with actual user ID
      'metadata.version': increment(1)
    });
    
    // Log activity
    await logResearchActivity(currentData.editorId, {
      action: 'updated',
      resourceType: 'research-entry',
      resourceId: researchId,
      description: `Updated research: ${currentData.title}`,
      metadata: { changes: Object.keys(updates) }
    });
    
    // Trigger knowledge update
    updateEditorKnowledge(currentData.editorId).catch(console.error);
    
    return true;
  } catch (error) {
    console.error('Error updating research entry:', error);
    return false;
  }
};

/**
 * Editor Knowledge Management
 */

export const getEditorKnowledge = async (editorId: string): Promise<EditorKnowledge | null> => {
  try {
    const knowledgeRef = doc(db, EDITOR_KNOWLEDGE_COLLECTION, editorId);
    const knowledgeDoc = await getDoc(knowledgeRef);
    
    if (!knowledgeDoc.exists()) {
      // Create initial knowledge summary if doesn't exist
      return await createInitialKnowledge(editorId);
    }
    
    return {
      editorId,
      ...knowledgeDoc.data()
    } as EditorKnowledge;
  } catch (error) {
    console.error('Error fetching editor knowledge:', error);
    return null;
  }
};

const createInitialKnowledge = async (editorId: string): Promise<EditorKnowledge> => {
  const initialKnowledge: Omit<EditorKnowledge, 'editorId'> = {
    summary: {
      completenessScore: 0,
      totalEntries: 0,
      lastResearched: new Date(),
      researchQuality: 'needs_attention',
      keyStrengths: [],
      knowledgeGaps: [
        'Work style and collaboration preferences',
        'Rate information and negotiation history',
        'Technical skills and software expertise',
        'Industry connections and referral sources',
        'Availability patterns and booking trends'
      ],
      careerStage: 'unknown'
    },
    insights: [],
    connections: [],
    opportunities: [],
    risks: [],
    performance: {
      qualityScore: 0,
      reliabilityScore: 0,
      collaborationScore: 0,
      timelinessScore: 0,
      communicationScore: 0,
      averageProjectRating: 0,
      totalProjects: 0,
      repeatClientRate: 0,
      referralScore: 0
    },
    lastUpdated: new Date()
  };
  
  try {
    const knowledgeRef = doc(db, EDITOR_KNOWLEDGE_COLLECTION, editorId);
    await updateDoc(knowledgeRef, initialKnowledge);
    
    return {
      editorId,
      ...initialKnowledge
    };
  } catch (error) {
    console.error('Error creating initial knowledge:', error);
    throw error;
  }
};

export const updateEditorKnowledge = async (editorId: string): Promise<boolean> => {
  try {
    // Get all active research entries for this editor
    const researchEntries = await getResearchEntries(editorId, { status: 'active' });
    
    // Calculate completeness score based on research coverage
    const completenessScore = calculateCompletenessScore(researchEntries);
    
    // Generate insights from research data
    const insights = generateInsights(researchEntries);
    
    // Calculate performance metrics
    const performance = calculatePerformanceMetrics(researchEntries);
    
    // Determine career stage
    const careerStage = determineCareerStage(researchEntries);
    
    // Identify knowledge gaps
    const knowledgeGaps = identifyKnowledgeGaps(researchEntries);
    
    // Extract key strengths
    const keyStrengths = extractKeyStrengths(researchEntries);
    
    const summary: KnowledgeSummary = {
      completenessScore,
      totalEntries: researchEntries.length,
      lastResearched: new Date(),
      researchQuality: completenessScore >= 80 ? 'excellent' : 
                      completenessScore >= 60 ? 'good' : 
                      completenessScore >= 40 ? 'fair' : 'needs_attention',
      keyStrengths,
      knowledgeGaps,
      careerStage
    };
    
    const knowledgeUpdate = {
      summary,
      insights,
      performance,
      lastUpdated: serverTimestamp()
    };
    
    const knowledgeRef = doc(db, EDITOR_KNOWLEDGE_COLLECTION, editorId);
    await updateDoc(knowledgeRef, knowledgeUpdate);
    
    // Log knowledge update activity
    await logResearchActivity(editorId, {
      type: 'knowledge_updated',
      title: 'Knowledge summary updated',
      description: `Updated knowledge completeness: ${completenessScore}%`,
      metadata: { 
        completenessScore, 
        totalEntries: researchEntries.length,
        researchQuality: summary.researchQuality
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating editor knowledge:', error);
    return false;
  }
};

/**
 * Research Activity Logging
 */

export const logResearchActivity = async (
  editorId: string,
  activity: Omit<ResearchActivity, 'id' | 'editorId' | 'userId' | 'timestamp'>
): Promise<string | null> => {
  try {
    const activityRef = doc(collection(db, RESEARCH_ACTIVITIES_COLLECTION));
    const activityData: Omit<ResearchActivity, 'id'> = {
      editorId,
      userId: 'system', // TODO: Replace with actual user ID
      timestamp: new Date(),
      ...activity
    };
    
    await addDoc(collection(db, RESEARCH_ACTIVITIES_COLLECTION), activityData);
    return activityRef.id;
  } catch (error) {
    console.error('Error logging research activity:', error);
    return null;
  }
};

export const getResearchActivities = async (
  editorId: string,
  limitCount = 50
): Promise<ResearchActivity[]> => {
  try {
    const q = query(
      collection(db, RESEARCH_ACTIVITIES_COLLECTION),
      where('editorId', '==', editorId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as ResearchActivity);
  } catch (error) {
    console.error('Error fetching research activities:', error);
    return [];
  }
};

/**
 * Intelligence Analysis Functions
 */

const calculateCompletenessScore = (entries: ResearchEntry[]): number => {
  const requiredTypes: ResearchType[] = [
    'biography', 'technical_skills', 'work_style', 'rates', 
    'networking', 'availability', 'projects', 'performance'
  ];
  
  const coveredTypes = new Set(entries.map(entry => entry.type));
  const coverage = (coveredTypes.size / requiredTypes.length) * 100;
  
  // Bonus points for high-confidence entries
  const highConfidenceBonus = entries.filter(e => e.confidence === 'verified').length * 2;
  
  return Math.min(100, Math.round(coverage + highConfidenceBonus));
};

const generateInsights = (entries: ResearchEntry[]): EditorInsight[] => {
  const insights: EditorInsight[] = [];
  
  // Skill analysis
  const skillEntries = entries.filter(e => e.type === 'technical_skills');
  if (skillEntries.length > 0) {
    const skills = skillEntries.flatMap(e => e.tags);
    const topSkills = [...new Set(skills)].slice(0, 5);
    
    insights.push({
      id: `skill-analysis-${Date.now()}`,
      type: 'strength',
      category: 'technical_skills',
      title: 'Technical Expertise',
      content: `Strong proficiency in ${topSkills.join(', ')}`,
      confidence: 'high',
      impact: 'high',
      sources: skillEntries.map(e => e.id),
      generatedAt: new Date()
    });
  }
  
  // Availability patterns
  const availabilityEntries = entries.filter(e => e.type === 'availability');
  if (availabilityEntries.length > 0) {
    insights.push({
      id: `availability-analysis-${Date.now()}`,
      type: 'pattern',
      category: 'availability',
      title: 'Availability Patterns',
      content: 'Consistent availability tracking shows reliable booking patterns',
      confidence: 'medium',
      impact: 'medium',
      sources: availabilityEntries.map(e => e.id),
      generatedAt: new Date()
    });
  }
  
  return insights;
};

const calculatePerformanceMetrics = (entries: ResearchEntry[]): PerformanceMetrics => {
  const performanceEntries = entries.filter(e => e.type === 'performance');
  const clientFeedbackEntries = entries.filter(e => e.type === 'client_feedback');
  
  return {
    qualityScore: calculateAverageScore(performanceEntries, 'quality'),
    reliabilityScore: calculateAverageScore(performanceEntries, 'reliability'),
    collaborationScore: calculateAverageScore(clientFeedbackEntries, 'collaboration'),
    timelinessScore: calculateAverageScore(performanceEntries, 'timeliness'),
    communicationScore: calculateAverageScore(clientFeedbackEntries, 'communication'),
    averageProjectRating: calculateAverageRating(clientFeedbackEntries),
    totalProjects: entries.filter(e => e.type === 'projects').length,
    repeatClientRate: calculateRepeatClientRate(entries),
    referralScore: calculateReferralScore(entries)
  };
};

const calculateAverageScore = (entries: ResearchEntry[], metric: string): number => {
  // Placeholder implementation - would parse content for specific metrics
  return entries.length > 0 ? 85 : 0;
};

const calculateAverageRating = (entries: ResearchEntry[]): number => {
  // Placeholder implementation - would parse ratings from content
  return entries.length > 0 ? 4.2 : 0;
};

const calculateRepeatClientRate = (entries: ResearchEntry[]): number => {
  // Placeholder implementation - would analyze project entries for repeat clients
  const projectEntries = entries.filter(e => e.type === 'projects');
  return projectEntries.length > 0 ? 0.65 : 0;
};

const calculateReferralScore = (entries: ResearchEntry[]): number => {
  // Placeholder implementation - would analyze networking and referral entries
  const networkingEntries = entries.filter(e => e.type === 'networking');
  return networkingEntries.length * 10; // Simplified scoring
};

const determineCareerStage = (entries: ResearchEntry[]): 'emerging' | 'established' | 'veteran' | 'legend' | 'unknown' => {
  const biographyEntries = entries.filter(e => e.type === 'biography');
  const projectEntries = entries.filter(e => e.type === 'projects');
  
  if (biographyEntries.length === 0) return 'unknown';
  
  const totalProjects = projectEntries.length;
  const hasAwards = entries.some(e => e.type === 'industry_intel' && e.content.includes('award'));
  
  if (totalProjects > 50 && hasAwards) return 'legend';
  if (totalProjects > 25) return 'veteran';
  if (totalProjects > 10) return 'established';
  return 'emerging';
};

const identifyKnowledgeGaps = (entries: ResearchEntry[]): string[] => {
  const requiredTypes: { type: ResearchType; description: string }[] = [
    { type: 'biography', description: 'Personal background and career history' },
    { type: 'technical_skills', description: 'Software expertise and technical capabilities' },
    { type: 'work_style', description: 'Collaboration preferences and working methods' },
    { type: 'rates', description: 'Pricing information and negotiation history' },
    { type: 'availability', description: 'Schedule patterns and booking trends' },
    { type: 'networking', description: 'Industry connections and referral sources' },
    { type: 'projects', description: 'Detailed project breakdowns and experience' },
    { type: 'client_feedback', description: 'Reviews, testimonials, and client satisfaction' }
  ];
  
  const coveredTypes = new Set(entries.map(e => e.type));
  
  return requiredTypes
    .filter(({ type }) => !coveredTypes.has(type))
    .map(({ description }) => description);
};

const extractKeyStrengths = (entries: ResearchEntry[]): string[] => {
  const strengths: string[] = [];
  
  // Extract from high-confidence entries
  const highConfidenceEntries = entries.filter(e => e.confidence === 'verified' || e.confidence === 'high');
  
  highConfidenceEntries.forEach(entry => {
    if (entry.type === 'technical_skills') {
      strengths.push(`Expert in ${entry.tags.join(', ')}`);
    }
    if (entry.type === 'client_feedback' && entry.content.includes('excellent')) {
      strengths.push('Consistently receives excellent client feedback');
    }
    if (entry.type === 'performance' && entry.content.includes('deadline')) {
      strengths.push('Strong track record of meeting deadlines');
    }
  });
  
  return [...new Set(strengths)].slice(0, 5); // Top 5 unique strengths
};

/**
 * Research Templates
 */

export const getResearchTemplates = async (): Promise<ResearchTemplate[]> => {
  try {
    const q = query(
      collection(db, RESEARCH_TEMPLATES_COLLECTION),
      orderBy('metadata.createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as ResearchTemplate);
  } catch (error) {
    console.error('Error fetching research templates:', error);
    return [];
  }
};

export const createResearchTemplate = async (
  template: Omit<ResearchTemplate, 'id' | 'metadata'>
): Promise<string | null> => {
  try {
    const templateData: Omit<ResearchTemplate, 'id'> = {
      ...template,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system', // TODO: Replace with actual user ID
        version: 1,
        active: true
      }
    };
    
    const templateRef = await addDoc(collection(db, RESEARCH_TEMPLATES_COLLECTION), templateData);
    return templateRef.id;
  } catch (error) {
    console.error('Error creating research template:', error);
    return null;
  }
};

// Create research service instance
export const researchService = {
  addResearchEntry,
  getResearchEntries,
  updateResearchEntry,
  getEditorKnowledge,
  updateEditorKnowledge,
  logResearchActivity,
  getResearchActivities,
  getResearchTemplates,
  createResearchTemplate
};

export default researchService; 