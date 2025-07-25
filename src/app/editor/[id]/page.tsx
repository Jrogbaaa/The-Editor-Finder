'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Editor, Credit, Award } from '@/types';
import { getEditor, getEditorCredits, getEditorAwards } from '@/lib/firestore-schema';
import EditorCard from '@/components/EditorCard';

export default function EditorProfilePage() {
  const params = useParams();
  const editorId = params.id as string;
  
  const [editor, setEditor] = useState<Editor | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

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



  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg shadow p-6 border border-border">
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-card rounded-lg shadow p-6 border border-border">
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Editor Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The editor you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{editor.name}</h1>
              <p className="text-muted-foreground mt-1">
                {editor.location.city}, {editor.location.state} • {editor.experience.yearsActive} years experience
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {editor.professional.availability && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  editor.professional.availability === 'available'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : editor.professional.availability === 'busy'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-muted text-muted-foreground border-border'
                }`}>
                  {editor.professional.availability === 'available' ? '✅ Available' : 
                   editor.professional.availability === 'busy' ? '🔴 Busy' : '❓ Unknown'}
                </span>
              )}
              
              {editor.metadata.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                <div className="mt-8 bg-card rounded-lg shadow border border-border p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Complete Filmography</h2>
                  <div className="space-y-4">
                    {credits.map((credit, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{credit.show.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              {credit.show.network} • {credit.timeline.startYear}
                              {credit.timeline.endYear && ` - ${credit.timeline.endYear}`}
                              {credit.timeline.current && ' (Current)'}
                            </div>
                            <div className="text-sm text-muted-foreground/80 capitalize">
                              {credit.role.position.replace('-', ' ')}
                              {credit.role.episodeCount && ` • ${credit.role.episodeCount} episodes`}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {credit.show.genre.map((genre, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground border border-border"
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
              <div className="bg-card rounded-lg shadow border border-border p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {editor.email && (
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-3">📧</span>
                      <a href={`mailto:${editor.email}`} className="text-primary hover:text-primary/80 transition-colors">
                        {editor.email}
                      </a>
                    </div>
                  )}
                  {editor.phone && (
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-3">📞</span>
                      <a href={`tel:${editor.phone}`} className="text-primary hover:text-primary/80 transition-colors">
                        {editor.phone}
                      </a>
                    </div>
                  )}
                  {editor.professional.representation?.agent && (
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-3">🎭</span>
                      <span className="text-foreground">{editor.professional.representation.agent}</span>
                    </div>
                  )}
                  {editor.professional.imdbId && (
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-3">🎬</span>
                      <a
                        href={`https://www.imdb.com/name/${editor.professional.imdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        IMDb Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Specialties */}
              <div className="bg-card rounded-lg shadow border border-border p-6">
                <h3 className="text-lg font-medium text-foreground mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {editor.experience.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/20 text-primary border border-primary/30"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Awards Summary */}
              {awards.length > 0 && (
                <div className="bg-card rounded-lg shadow border border-border p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">Awards & Recognition</h3>
                  <div className="space-y-3">
                    {awards.map((award, index) => (
                      <div key={index} className="border-l-4 border-yellow-500 pl-3">
                        <div className="font-medium text-foreground">
                          {award.award.status === 'won' ? '🏆' : '🥉'} {award.award.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{award.award.category} ({award.award.year})</div>
                        {award.show && (
                          <div className="text-sm text-muted-foreground/80">for &quot;{award.show.title}&quot;</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
} 