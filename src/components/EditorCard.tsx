'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Editor, Credit, Award } from '@/types';

interface EditorCardProps {
  editor: Editor;
  credits: Credit[];
  awards: Award[];
  onSelect?: (editor: Editor) => void;
  showDetails?: boolean;
}

const EditorCard = ({ 
  editor, 
  credits, 
  awards, 
  onSelect, 
  showDetails = false 
}: EditorCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(editor);
    }
    setIsExpanded(!isExpanded);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUnionStatusColor = (status: string) => {
    switch (status) {
      case 'guild': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'non-union': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`group bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 ${
      showDetails ? 'p-6' : 'p-5'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/editor/${editor.id}`}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors group-hover:text-primary"
            >
              {editor.name}
            </Link>
            {/* Research indicator */}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-accent/20 text-accent border border-accent/30">
              🧠 Intel
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>📍 {editor.location.city}, {editor.location.state}</span>
            {editor.location.remote && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/20 text-secondary border border-secondary/30">
                Remote OK
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
              getAvailabilityColor(editor.professional.availability)
            }`}>
              {editor.professional.availability === 'available' ? '✅ Available' : 
               editor.professional.availability === 'busy' ? '🔴 Busy' : '❓ Unknown'}
            </span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
              getUnionStatusColor(editor.professional.unionStatus)
            }`}>
              {editor.professional.unionStatus === 'guild' ? 'Guild Member' : 
               editor.professional.unionStatus === 'non-union' ? 'Non-Union' : 'Unknown'}
            </span>
          </div>
        </div>
        
        {/* Verified Badge */}
        {editor.metadata.verified && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30">
              ✓ Verified
            </span>
          </div>
        )}
      </div>

      {/* Experience & Specialties */}
      <div className="mb-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <span>🎬</span>
            <span>{editor.experience.yearsActive} years</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📅</span>
            <span>Since {editor.experience.startYear}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {editor.experience.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-muted/50 text-muted-foreground border border-muted"
            >
              {specialty}
            </span>
          ))}
          {editor.experience.specialties.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-muted/30 text-muted-foreground">
              +{editor.experience.specialties.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Awards Summary */}
      {awards.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-600">🏆</span>
            <span className="text-foreground/80">
              {awards.filter(a => a.award.status === 'won').length} awards won, {' '}
              {awards.filter(a => a.award.status === 'nominated').length} nominations
            </span>
          </div>
        </div>
      )}

      {/* Recent Credits Preview */}
      {credits.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-2">Recent Work</h4>
          <div className="space-y-2">
            {credits.slice(0, showDetails ? credits.length : 2).map((credit, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{credit.show.title}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{credit.show.network}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {credit.timeline.startYear}{credit.timeline.endYear ? `-${credit.timeline.endYear}` : ''} • {credit.role.position.replace('-', ' ')}
                </div>
              </div>
            ))}
            {!showDetails && credits.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{credits.length - 2} more credits
              </div>
            )}
          </div>
        </div>
      )}

      {/* Knowledge Insights Preview */}
      <div className="mb-4 p-3 bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-accent">🧠</span>
          <span className="text-sm font-medium text-foreground">Intelligence Summary</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Research database contains insights about work style, rates, and industry connections.
        </div>
        <Link 
          href={`/editor/${editor.id}?tab=research`}
          className="inline-flex items-center mt-2 text-xs text-accent hover:text-accent/80 transition-colors"
        >
          View Research & Intelligence →
        </Link>
      </div>

      {/* Expanded Details */}
      {(isExpanded || showDetails) && (
        <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
          {/* Contact Information */}
          {(editor.email || editor.phone || editor.professional.representation) && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Contact</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {editor.email && (
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>{editor.email}</span>
                  </div>
                )}
                {editor.phone && (
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <span>{editor.phone}</span>
                  </div>
                )}
                {editor.professional.representation?.agent && (
                  <div className="flex items-center gap-2">
                    <span>🎭</span>
                    <span>Agent: {editor.professional.representation.agent}</span>
                  </div>
                )}
                {editor.professional.representation?.manager && (
                  <div className="flex items-center gap-2">
                    <span>👔</span>
                    <span>Manager: {editor.professional.representation.manager}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Awards */}
          {awards.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Awards & Recognition</h4>
              <div className="space-y-2">
                {awards.map((award, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-foreground">
                      {award.award.status === 'won' ? '🏆' : '🥉'} {award.award.name} ({award.award.year})
                    </div>
                    <div className="text-muted-foreground">{award.award.category}</div>
                    {award.show && (
                      <div className="text-muted-foreground/80">for "{award.show.title}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External Links */}
          <div className="flex gap-2 flex-wrap">
            {editor.professional.imdbId && (
              <a
                href={`https://www.imdb.com/name/${editor.professional.imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 text-xs bg-yellow-500/20 text-yellow-700 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
              >
                IMDb Profile
              </a>
            )}
            <Link
              href={`/editor/${editor.id}`}
              className="inline-flex items-center px-3 py-1 text-xs bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-colors"
            >
              Full Profile
            </Link>
            <button className="inline-flex items-center px-3 py-1 text-xs bg-muted/50 text-muted-foreground border border-muted hover:bg-muted/70 rounded-lg transition-colors">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Expand/Collapse Button */}
      {!showDetails && (
        <button
          onClick={handleCardClick}
          className="w-full mt-4 py-3 text-sm text-foreground/80 hover:text-foreground transition-colors border-t border-border/50 pt-3 group-hover:text-primary"
        >
          {isExpanded ? 'Show Less' : 'View Details'}
        </button>
      )}
    </div>
  );
};

export default EditorCard; 