'use client';

import React, { useState } from 'react';
import { SearchResult, SearchFilters, Editor } from '@/types';
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

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    
    // Sort the results based on the selected criteria
    const sortedEditors = [...results.editors].sort((a, b) => {
      switch (newSort) {
        case 'experience':
          return b.experience.yearsActive - a.experience.yearsActive;
        case 'recent':
          return new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime();
        case 'awards':
          // This would require fetching award data - simplified for now
          return 0;
        case 'relevance':
        default:
          return 0;
      }
    });
    
    // Note: In a real implementation, this would trigger a re-fetch with sort parameters
    console.log('Sorting results by:', newSort);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!results.editors || results.editors.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No Editors Found</h3>
          <p className="text-muted-foreground mb-6">
            {filters.query 
              ? `No editors match your search for "${filters.query}". Try adjusting your filters or search terms.`
              : 'No editors match your current filters. Try broadening your search criteria.'
            }
          </p>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>💡 <strong>Suggestions:</strong></p>
            <ul className="space-y-1">
              <li>• Try searching for specific shows, networks, or genres</li>
              <li>• Expand your experience range or location filters</li>
              <li>• Search for Emmy-winning editors to see verified professionals</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {results.totalCount} Editor{results.totalCount !== 1 ? 's' : ''} Found
          </h2>
          <p className="text-muted-foreground">
            {filters.query && `Results for "${filters.query}"`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="px-3 py-1 border border-border rounded-md bg-background"
            >
              <option value="relevance">Relevance</option>
              <option value="experience">Experience</option>
              <option value="recent">Recently Updated</option>
              <option value="awards">Awards</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'grid' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'list' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              List
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Export Results
          </button>
        </div>
      </div>

      {/* Results Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }>
               {results.editors.map((editor) => (
         <EditorCard 
           key={editor.id} 
           editor={editor}
           credits={(editor as any).credits || []}
           awards={(editor as any).awards || []}
           showDetails={true}
         />
       ))}
      </div>

      {/* Load More / Pagination */}
      {results.editors.length < results.totalCount && (
        <div className="text-center py-8">
          <button 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => {
              // TODO: Implement pagination
              console.log('Load more results');
            }}
          >
            Load More Editors
          </button>
        </div>
      )}

      {/* Results Footer */}
      <div className="text-center text-sm text-muted-foreground border-t pt-6">
        <p>
          Showing {results.editors.length} of {results.totalCount} editors • 
          Data sourced from Emmy Awards, IMDb, and industry databases
        </p>
      </div>
    </div>
  );
};

export default SearchResults; 