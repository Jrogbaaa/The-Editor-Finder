/**
 * Research and Knowledge Database Types
 * For storing detailed research, insights, and intelligence about editors
 */

// Research Entry Types
export interface ResearchEntry {
  id: string;
  editorId: string;
  type: ResearchType;
  title: string;
  content: string;
  tags: string[];
  sources: ResearchSource[];
  confidence: 'low' | 'medium' | 'high' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'archived' | 'disputed';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string; // user ID
    updatedBy: string;
    version: number;
  };
}

export type ResearchType = 
  | 'biography'           // Personal background, career history
  | 'technical-skills'    // Software expertise, techniques
  | 'work-style'         // Collaboration preferences, working methods
  | 'availability'       // Schedule patterns, booking trends
  | 'rates'              // Pricing information, negotiation notes
  | 'networking'         // Industry connections, referrals
  | 'projects'           // Detailed project breakdowns
  | 'client-feedback'    // Reviews, testimonials, reputation
  | 'career-trajectory'  // Growth pattern, future potential
  | 'specialization'     // Genre expertise, niche skills
  | 'equipment'          // Hardware/software preferences
  | 'location'           // Studio details, remote setup
  | 'communication'      // Response patterns, preferred contact
  | 'negotiation'        // Contract preferences, deal terms
  | 'performance'        // Quality metrics, deadline adherence
  | 'industry-intel'     // Market insights, trend analysis
  | 'competitive-analysis' // Comparison with other editors
  | 'opportunity'        // Potential projects, career moves
  | 'risk-assessment'    // Reliability concerns, red flags
  | 'recommendation'     // Internal notes, hiring advice;

export interface ResearchSource {
  type: 'interview' | 'website' | 'social-media' | 'industry-report' | 'client-feedback' | 'public-record' | 'networking' | 'observation' | 'other';
  url?: string;
  title?: string;
  author?: string;
  date?: Date;
  reliability: 'low' | 'medium' | 'high' | 'verified';
  notes?: string;
}

// Knowledge Graph Types
export interface EditorKnowledge {
  editorId: string;
  summary: KnowledgeSummary;
  insights: EditorInsight[];
  connections: EditorConnection[];
  opportunities: OpportunityAssessment[];
  risks: RiskAssessment[];
  metrics: PerformanceMetrics;
  lastUpdated: Date;
  completeness: number; // 0-100% knowledge coverage
}

export interface KnowledgeSummary {
  keyStrengths: string[];
  primarySpecialties: string[];
  careerStage: 'emerging' | 'established' | 'veteran' | 'legend';
  availabilityPattern: 'always-busy' | 'selective' | 'emerging-availability' | 'unknown';
  rateRange: {
    min?: number;
    max?: number;
    currency: string;
    unit: 'hourly' | 'daily' | 'weekly' | 'project';
    lastUpdated: Date;
  };
  preferredProjectTypes: string[];
  workingStyle: string[];
  communicationStyle: string;
  lastKnownStatus: string;
}

export interface EditorInsight {
  id: string;
  category: 'technical' | 'creative' | 'business' | 'personal' | 'industry';
  insight: string;
  impact: 'low' | 'medium' | 'high';
  confidence: 'low' | 'medium' | 'high' | 'verified';
  sources: string[]; // Research entry IDs
  createdAt: Date;
}

export interface EditorConnection {
  type: 'frequent-collaborator' | 'mentor' | 'mentee' | 'competitor' | 'reference' | 'client' | 'agent' | 'manager';
  connectedToId?: string; // Other editor ID if applicable
  connectedToName: string;
  relationship: string;
  strength: 'weak' | 'moderate' | 'strong' | 'very-strong';
  notes: string;
  lastUpdated: Date;
}

export interface OpportunityAssessment {
  id: string;
  type: 'immediate' | 'short-term' | 'long-term' | 'career-changing';
  title: string;
  description: string;
  probability: number; // 0-100%
  timeframe: string;
  requirements: string[];
  potentialValue: string;
  createdAt: Date;
}

export interface RiskAssessment {
  id: string;
  type: 'availability' | 'reliability' | 'communication' | 'technical' | 'financial' | 'reputation' | 'legal';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100%
  mitigation: string[];
  createdAt: Date;
}

export interface PerformanceMetrics {
  responseTime: {
    average: number; // hours
    reliability: number; // 0-100%
    lastUpdated: Date;
  };
  projectCompletion: {
    onTimeRate: number; // 0-100%
    qualityScore: number; // 0-100%
    clientSatisfaction: number; // 0-100%
    lastUpdated: Date;
  };
  collaboration: {
    teamworkScore: number; // 0-100%
    communicationScore: number; // 0-100%
    flexibilityScore: number; // 0-100%
    lastUpdated: Date;
  };
  technicalSkills: {
    softwareProficiency: { [software: string]: number }; // 0-100%
    adaptabilityScore: number; // 0-100%
    innovationScore: number; // 0-100%
    lastUpdated: Date;
  };
}

// Research Activity Types
export interface ResearchActivity {
  id: string;
  editorId: string;
  action: 'created' | 'updated' | 'archived' | 'verified' | 'disputed' | 'linked';
  resourceType: 'research-entry' | 'insight' | 'connection' | 'opportunity' | 'risk';
  resourceId: string;
  description: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Research Template Types (for structured data entry)
export interface ResearchTemplate {
  id: string;
  name: string;
  type: ResearchType;
  description: string;
  fields: TemplateField[];
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multi-select' | 'url' | 'email';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Search and Filter Types
export interface ResearchSearchFilters {
  editorIds?: string[];
  types?: ResearchType[];
  tags?: string[];
  confidence?: ('low' | 'medium' | 'high' | 'verified')[];
  priority?: ('low' | 'medium' | 'high' | 'critical')[];
  status?: ('draft' | 'active' | 'archived' | 'disputed')[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  createdBy?: string[];
  searchQuery?: string;
}

export interface ResearchSearchResult {
  entries: ResearchEntry[];
  totalCount: number;
  facets: {
    types: { [key in ResearchType]?: number };
    tags: { [key: string]: number };
    confidence: { [key: string]: number };
    priority: { [key: string]: number };
    status: { [key: string]: number };
  };
}

// Component Props Types
export interface ResearchPanelProps {
  editorId: string;
  onUpdate?: () => void;
}

export interface ResearchEntryFormProps {
  editorId: string;
  entry?: ResearchEntry;
  onSave: (entry: ResearchEntry) => void;
  onCancel: () => void;
}

export interface KnowledgeGraphProps {
  editorId: string;
  knowledge: EditorKnowledge;
  interactive?: boolean;
}

export interface ResearchTimelineProps {
  editorId: string;
  activities: ResearchActivity[];
  limit?: number;
} 