'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Editor, Credit, Award } from '@/types';
import { getEditor, getEditorCredits, getEditorAwards } from '@/lib/firestore-schema';
import EditorCard from '@/components/EditorCard';
import ResearchPanel from '@/components/ResearchPanel';

export default function EditorProfilePage() {
  const params = useParams();
  const editorId = params.id as string;
  
  const [editor, setEditor] = useState<Editor | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'research'>('profile');

  useEffect(() => {
    if (editorId) {
      loadEditorData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorId]);

  const loadEditorData = async () => {
    setLoading(true);
    try {
      const [editorData, creditsData, awardsData] = await Promise.all([
        getEditor(editorId),
        getEditorCredits(editorId),
        getEditorAwards(editorId)
      ]);

      setEditor(editorData);
      setCredits(creditsData);
      setAwards(awardsData);
    } catch (error) {
      console.error('Error loading editor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResearchUpdate = () => {
    // Reload editor data when research is updated
    loadEditorData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Editor Not Found</h1>
          <p className="text-gray-600 mb-6">
            The editor you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{editor.name}</h1>
              <p className="text-gray-600 mt-1">
                {editor.location.city}, {editor.location.state} • {editor.experience.yearsActive} years experience
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {editor.professional.availability && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  editor.professional.availability === 'available'
                    ? 'bg-green-100 text-green-800'
                    : editor.professional.availability === 'busy'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {editor.professional.availability === 'available' ? '✅ Available' : 
                   editor.professional.availability === 'busy' ? '🔴 Busy' : '❓ Unknown'}
                </span>
              )}
              
              {editor.metadata.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Profile & Credits
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'research'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Research & Intelligence
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2">
              <EditorCard 
                editor={editor}
                credits={credits}
                awards={awards}
                showDetails={true}
              />
              
              {/* Detailed Credits */}
              {credits.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Filmography</h2>
                  <div className="space-y-4">
                    {credits.map((credit, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{credit.show.title}</h3>
                            <div className="text-sm text-gray-600">
                              {credit.show.network} • {credit.timeline.startYear}
                              {credit.timeline.endYear && ` - ${credit.timeline.endYear}`}
                              {credit.timeline.current && ' (Current)'}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {credit.role.position.replace('-', ' ')}
                              {credit.role.episodeCount && ` • ${credit.role.episodeCount} episodes`}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {credit.show.genre.map((genre, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {editor.email && (
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">📧</span>
                      <a href={`mailto:${editor.email}`} className="text-blue-600 hover:text-blue-700">
                        {editor.email}
                      </a>
                    </div>
                  )}
                  {editor.phone && (
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">📞</span>
                      <a href={`tel:${editor.phone}`} className="text-blue-600 hover:text-blue-700">
                        {editor.phone}
                      </a>
                    </div>
                  )}
                  {editor.professional.representation?.agent && (
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">🎭</span>
                      <span>{editor.professional.representation.agent}</span>
                    </div>
                  )}
                  {editor.professional.imdbId && (
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-3">🎬</span>
                      <a
                        href={`https://www.imdb.com/name/${editor.professional.imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        IMDb Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {editor.experience.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Awards Summary */}
              {awards.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Awards & Recognition</h3>
                  <div className="space-y-3">
                    {awards.map((award, index) => (
                      <div key={index} className="border-l-4 border-yellow-500 pl-3">
                        <div className="font-medium text-gray-900">
                          {award.award.status === 'won' ? '🏆' : '🥉'} {award.award.name}
                        </div>
                        <div className="text-sm text-gray-600">{award.award.category} ({award.award.year})</div>
                        {award.show && (
                          <div className="text-sm text-gray-500">for &quot;{award.show.title}&quot;</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Research Tab */
          <ResearchPanel 
            editorId={editorId}
            onUpdate={handleResearchUpdate}
          />
        )}
      </div>
    </div>
  );
} 