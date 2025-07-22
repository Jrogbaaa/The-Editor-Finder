'use client';

import { useState } from 'react';
import { SearchResult, SearchFilters, Editor, Credit, Award } from '@/types';
import EditorCard from './EditorCard';

interface SearchResultsProps {
  results: SearchResult;
  loading: boolean;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onExport: () => void;
}

const SearchResults = ({ results, loading, filters, onFiltersChange, onExport }: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState<'relevance' | 'experience' | 'recent' | 'awards'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for demonstration
  const mockEditors: Editor[] = [
    {
      id: "ed-001",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      phone: "+1 (555) 123-4567",
      location: { city: "Los Angeles", state: "CA", country: "USA", remote: true },
      experience: { yearsActive: 12, startYear: 2012, specialties: ["Drama", "Thriller", "Limited Series"] },
      professional: { unionStatus: 'guild', imdbId: "nm1234567", availability: 'available' },
      metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["TMDb", "IMDb"], verified: true }
    },
    {
      id: "ed-002", 
      name: "Marcus Rodriguez",
      email: "marcus.r@example.com",
      location: { city: "New York", state: "NY", country: "USA", remote: false },
      experience: { yearsActive: 8, startYear: 2016, specialties: ["Comedy", "Reality TV", "Live Events"] },
      professional: { unionStatus: 'guild', availability: 'busy' },
      metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["TMDb"], verified: true }
    },
    {
      id: "ed-003",
      name: "Elena Volkov", 
      location: { city: "Remote", state: "Worldwide", country: "International", remote: true },
      experience: { yearsActive: 15, startYear: 2009, specialties: ["Documentary", "News", "Sports"] },
      professional: { unionStatus: 'non-union', availability: 'available' },
      metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["Manual"], verified: false }
    }
  ];

  const mockCredits: Credit[] = [
    { 
      id: "cr-001", 
      editorId: "ed-001", 
      show: { 
        title: "Breaking Point", 
        network: "Netflix", 
        type: "series",
        genre: ["Drama", "Thriller"],
        imdbId: "tt1234567"
      }, 
      role: { 
        position: "supervising-editor", 
        episodeCount: 10,
        seasonCount: 2
      }, 
      timeline: { 
        startYear: 2023, 
        endYear: 2024, 
        current: false 
      },
      metadata: { 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        dataSource: "TMDb", 
        verified: true 
      } 
    },
    { 
      id: "cr-002", 
      editorId: "ed-002", 
      show: { 
        title: "Comedy Central Presents", 
        network: "Comedy Central", 
        type: "series",
        genre: ["Comedy"],
        imdbId: "tt2345678"
      },
      role: { 
        position: "editor",
        episodeCount: 24,
        seasonCount: 1
      },
      timeline: { 
        startYear: 2022, 
        current: true 
      },
      metadata: { 
        createdAt: new Date(), 
        updatedAt: new Date(), 
        dataSource: "TMDb", 
        verified: true 
      } 
    }
  ];

  const mockAwards: Award[] = [
    { id: "aw-001", editorId: "ed-001", 
      award: { name: "Emmy Award", category: "Outstanding Picture Editing", year: 2023, status: "won" },
      show: { title: "Breaking Point", network: "Netflix" },
      metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: "Emmy", verified: true } }
  ];

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    // TODO: Implement actual sorting logic
  };

  const renderFacets = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Genres</h3>
        <div className="space-y-2">
          {Object.entries(results.facets.genres).map(([genre, count]) => (
            <button
              key={genre}
              onClick={() => {
                const newGenres = filters.genres.includes(genre)
                  ? filters.genres.filter(g => g !== genre)
                  : [...filters.genres, genre];
                onFiltersChange({ ...filters, genres: newGenres });
              }}
              className={`flex items-center justify-between w-full p-2 text-sm rounded-lg transition-all ${
                filters.genres.includes(genre)
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:text-foreground hover:bg-accent/10'
              }`}
            >
              <span>{genre}</span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Networks</h3>
        <div className="space-y-2">
          {Object.entries(results.facets.networks).map(([network, count]) => (
            <button
              key={network}
              onClick={() => {
                const newNetworks = filters.networks.includes(network)
                  ? filters.networks.filter(n => n !== network)
                  : [...filters.networks, network];
                onFiltersChange({ ...filters, networks: newNetworks });
              }}
              className={`flex items-center justify-between w-full p-2 text-sm rounded-lg transition-all ${
                filters.networks.includes(network)
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-foreground/70 hover:text-foreground hover:bg-accent/10'
              }`}
            >
              <span>{network}</span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/50 border border-border/50 rounded-full backdrop-blur-sm">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-foreground/80">Searching for editors...</span>
          </div>
        </div>
        
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card/50 border border-border/50 rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-muted rounded" />
                  <div className="w-24 h-3 bg-muted/60 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-3 bg-muted/60 rounded" />
                <div className="w-3/4 h-3 bg-muted/60 rounded" />
                <div className="flex gap-2">
                  <div className="w-16 h-6 bg-muted/60 rounded-full" />
                  <div className="w-20 h-6 bg-muted/60 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const editorsToShow = results.editors.length > 0 ? results.editors : mockEditors;

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {editorsToShow.length > 0 ? `${editorsToShow.length} Editors Found` : 'No Results'}
          </h2>
          {editorsToShow.length > 0 && (
            <p className="text-foreground/70">
              Showing professional television editors matching your criteria
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-foreground/80 hover:text-foreground border border-border hover:bg-accent/5 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="relevance">Most Relevant</option>
            <option value="experience">Most Experienced</option>
            <option value="recent">Recently Active</option>
            <option value="awards">Most Awards</option>
          </select>
        </div>
      </div>

      {editorsToShow.length > 0 ? (
        <div className="flex gap-8">
          {/* Results Grid/List */}
          <div className="flex-1">
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {editorsToShow.map((editor) => (
                <EditorCard
                  key={editor.id}
                  editor={editor}
                  credits={mockCredits.filter(c => c.editorId === editor.id)}
                  awards={mockAwards.filter(a => a.editorId === editor.id)}
                  showDetails={viewMode === 'list'}
                />
              ))}
            </div>
          </div>

          {/* Facets Sidebar */}
          <div className="hidden lg:block w-64">
            <div className="sticky top-24">
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Refine Search
                </h3>
                {renderFacets()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Results State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted/20 to-muted/40 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No editors found
            </h3>
            <p className="text-foreground/70 mb-6">
              Try adjusting your search criteria or browse all editors to find the perfect match for your project.
            </p>
            <button
              onClick={() => onFiltersChange({
                query: '',
                genres: [],
                networks: [],
                experienceRange: { min: 0, max: 25 },
                location: { cities: [], states: [], remoteOnly: false },
                unionStatus: [],
                awardWinners: false,
                showTypes: [],
                availability: []
              })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 