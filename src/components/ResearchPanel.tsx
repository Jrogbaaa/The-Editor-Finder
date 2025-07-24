'use client';

import { useState, useEffect } from 'react';
import { ResearchEntry, EditorKnowledge, ResearchActivity } from '@/types/research';
import { researchService, RESEARCH_TYPES, CONFIDENCE_LEVELS, PRIORITY_LEVELS } from '@/lib/research-service';

interface ResearchPanelProps {
  editorId: string;
  onUpdate?: () => void;
}

const ResearchPanel = ({ editorId, onUpdate }: ResearchPanelProps) => {
  const [research, setResearch] = useState<ResearchEntry[]>([]);
  const [knowledge, setKnowledge] = useState<EditorKnowledge | null>(null);
  const [activities, setActivities] = useState<ResearchActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'research' | 'insights' | 'activity'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadResearchData();
  }, [editorId]);

  const loadResearchData = async () => {
    setLoading(true);
    try {
      const [researchData, knowledgeData, activitiesData] = await Promise.all([
        researchService.getEditorResearch(editorId),
        researchService.getEditorKnowledge(editorId),
        researchService.getEditorActivities(editorId)
      ]);

      setResearch(researchData);
      setKnowledge(knowledgeData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading research data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddResearch = () => {
    setShowAddForm(true);
  };

  const handleSaveResearch = async (entry: Omit<ResearchEntry, 'id'>) => {
    const entryId = await researchService.addResearchEntry({
      ...entry,
      editorId,
      metadata: {
        ...entry.metadata,
        createdBy: 'current-user', // TODO: Get from auth context
        updatedBy: 'current-user'
      }
    });

    if (entryId) {
      await loadResearchData();
      setShowAddForm(false);
      onUpdate?.();
    }
  };

  const getConfidenceColor = (confidence: string) => {
    const colors = {
      low: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800'
    };
    return colors[confidence as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Editor Intelligence
          </h2>
          <div className="flex items-center gap-3">
            {knowledge && (
              <div className="text-sm text-gray-600">
                {knowledge.completeness}% Complete
              </div>
            )}
            <button
              onClick={handleAddResearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Research
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'research', label: `Research (${research?.length || 0})` },
            { id: 'insights', label: `Insights (${knowledge?.insights?.length || 0})` },
            { id: 'activity', label: 'Activity' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && knowledge && (
          <div className="space-y-6">
            {/* Knowledge Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Knowledge Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Career Stage */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Career Stage</div>
                  <div className="text-lg capitalize">{knowledge.summary.careerStage}</div>
                </div>

                {/* Availability */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">Availability Pattern</div>
                  <div className="text-lg capitalize">{knowledge.summary.availabilityPattern}</div>
                </div>

                {/* Key Strengths */}
                {knowledge.summary.keyStrengths.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Key Strengths</div>
                    <div className="flex flex-wrap gap-1">
                      {knowledge.summary.keyStrengths.map((strength, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties */}
                {knowledge.summary.primarySpecialties.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Primary Specialties</div>
                    <div className="flex flex-wrap gap-1">
                      {knowledge.summary.primarySpecialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Insights */}
            {knowledge.insights.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Key Insights</h3>
                <div className="space-y-3">
                  {knowledge.insights.slice(0, 3).map((insight, index) => (
                    <div key={insight.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-blue-900 capitalize">
                            {insight.category} Insight
                          </div>
                          <div className="text-blue-800 mt-1">{insight.insight}</div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getConfidenceColor(insight.confidence)}`}>
                          {insight.confidence}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-4">
                            {(research?.length || 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <div>No research entries yet</div>
                <div className="text-sm">Add research to build comprehensive editor intelligence</div>
              </div>
            ) : (
              research.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{entry.title}</h4>
                      <div className="text-sm text-gray-600 capitalize">{entry.type.replace('-', ' ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getConfidenceColor(entry.confidence)}`}>
                        {entry.confidence}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPriorityColor(entry.priority)}`}>
                        {entry.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-gray-700 mb-3">{entry.content}</div>
                  
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Updated {entry.metadata.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'insights' && knowledge && (
          <div className="space-y-4">
            {knowledge.insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💡</div>
                <div>No insights generated yet</div>
                <div className="text-sm">Insights are automatically generated from research entries</div>
              </div>
            ) : (
              knowledge.insights.map((insight) => (
                <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                        {insight.category} • Impact: {insight.impact}
                      </div>
                      <div className="text-gray-900">{insight.insight}</div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {insight.createdAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
                            {(activities?.length || 0) === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📈</div>
                <div>No activity yet</div>
                <div className="text-sm">Research activities will appear here</div>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{activity.description}</div>
                    <div className="text-xs text-gray-500">
                      {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Research Form Modal */}
      {showAddForm && (
        <ResearchEntryForm
          editorId={editorId}
          onSave={handleSaveResearch}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

// Simple Research Entry Form
const ResearchEntryForm = ({ 
  editorId, 
  onSave, 
  onCancel 
}: { 
  editorId: string;
  onSave: (entry: Omit<ResearchEntry, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    type: 'biography' as any,
    title: '',
    content: '',
    tags: '',
    confidence: 'medium' as any,
    priority: 'medium' as any
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: Omit<ResearchEntry, 'id'> = {
      editorId,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      confidence: formData.confidence,
      priority: formData.priority,
      status: 'active',
      sources: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
        updatedBy: 'current-user',
        version: 1
      }
    };

    onSave(entry);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Research Entry</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RESEARCH_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g., avid, premiere, narrative, documentary"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confidence</label>
              <select
                value={formData.confidence}
                onChange={(e) => setFormData(prev => ({ ...prev, confidence: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONFIDENCE_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Research
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResearchPanel; 