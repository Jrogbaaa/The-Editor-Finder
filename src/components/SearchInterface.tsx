'use client';

import { useState, useEffect } from 'react';
import { SearchFilters } from '@/types';

interface SearchInterfaceProps {
  filters: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
  loading: boolean;
}

const SearchInterface = ({ filters, onSearch, loading }: SearchInterfaceProps) => {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const genreOptions = [
    'Drama', 'Comedy', 'Reality', 'Documentary', 'News', 'Sports',
    'Children', 'Talk Show', 'Game Show', 'Variety', 'Horror', 'Sci-Fi',
    'Crime', 'Action', 'Romance', 'Thriller', 'Musical', 'Animation'
  ];

  const networkOptions = [
    'Netflix', 'HBO', 'Amazon Prime', 'Apple TV+', 'Disney+', 'Hulu',
    'NBC', 'CBS', 'ABC', 'FOX', 'CW', 'FX', 'AMC', 'USA', 'TNT',
    'Discovery', 'History', 'National Geographic', 'ESPN', 'MTV', 'VH1'
  ];

  const showTypeOptions = [
    { value: 'series', label: 'TV Series' },
    { value: 'miniseries', label: 'Limited Series' },
    { value: 'special', label: 'TV Special' },
    { value: 'documentary', label: 'Documentary' }
  ];

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof SearchFilters, value: string) => {
    setLocalFilters(prev => {
      const currentArray = prev[field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      genres: [],
      networks: [],
      experienceRange: { min: 0, max: 25 },
      location: { cities: [], states: [], remoteOnly: false },
      unionStatus: [],
      awardWinners: false,
      showTypes: []
    };
    setLocalFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search TV shows, genres, keywords... (e.g., 'Game of Thrones', 'comedy', 'drama')"
            value={localFilters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Award Winners Toggle */}
        <button
          type="button"
          onClick={() => handleInputChange('awardWinners', !localFilters.awardWinners)}
          className={`p-4 rounded-xl border transition-all text-left ${
            localFilters.awardWinners
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-card border-border hover:border-border/80 text-card-foreground'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏆</span>
            <span className="font-medium">Award Winners</span>
          </div>
          <span className="text-xs text-muted-foreground">Emmy & Critics Choice</span>
        </button>

        {/* Remote Work Toggle */}
        <button
          type="button"
          onClick={() => handleInputChange('location', { 
            ...localFilters.location, 
            remoteOnly: !localFilters.location.remoteOnly 
          })}
          className={`p-4 rounded-xl border transition-all text-left ${
            localFilters.location.remoteOnly
              ? 'bg-secondary/10 border-secondary text-secondary'
              : 'bg-card border-border hover:border-border/80 text-card-foreground'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌐</span>
            <span className="font-medium">Remote Work</span>
          </div>
          <span className="text-xs text-muted-foreground">Work from anywhere</span>
        </button>

        {/* Union Status */}
        <button
          type="button"
          onClick={() => handleArrayToggle('unionStatus', 'guild')}
          className={`p-4 rounded-xl border transition-all text-left ${
            localFilters.unionStatus.includes('guild')
              ? 'bg-accent/10 border-accent text-accent'
              : 'bg-card border-border hover:border-border/80 text-card-foreground'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⚖️</span>
            <span className="font-medium">Guild Member</span>
          </div>
          <span className="text-xs text-muted-foreground">Union professionals</span>
        </button>

        {/* Experience Level Quick Filter */}
        <button
          type="button"
          onClick={() => handleInputChange('experienceRange', { 
            min: localFilters.experienceRange.min, 
            max: localFilters.experienceRange.max === 25 ? 15 : 25 
          })}
          className={`p-4 rounded-xl border transition-all text-left ${
            localFilters.experienceRange.max < 25
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-card border-border hover:border-border/80 text-card-foreground'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">⭐</span>
            <span className="font-medium">Experienced</span>
          </div>
          <span className="text-xs text-muted-foreground">15+ years experience</span>
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-2 px-6 py-3 text-foreground/80 hover:text-foreground border border-border rounded-full hover:bg-accent/5 transition-all"
        >
          <span>Advanced Filters</span>
          <svg 
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="space-y-8 p-6 bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm">
          {/* Experience Range */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Experience Level
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="30"
                value={localFilters.experienceRange.max}
                onChange={(e) => handleInputChange('experienceRange', {
                  ...localFilters.experienceRange,
                  max: parseInt(e.target.value)
                })}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Entry Level</span>
                <span className="font-medium text-foreground">
                  {localFilters.experienceRange.max}+ years
                </span>
                <span>Veteran</span>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Genres & Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {genreOptions.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleArrayToggle('genres', genre)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    localFilters.genres.includes(genre)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background border-border hover:border-border/80 text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Networks */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Networks & Platforms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {networkOptions.map((network) => (
                <button
                  key={network}
                  type="button"
                  onClick={() => handleArrayToggle('networks', network)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    localFilters.networks.includes(network)
                      ? 'bg-secondary/10 border-secondary text-secondary'
                      : 'bg-background border-border hover:border-border/80 text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {network}
                </button>
              ))}
            </div>
          </div>

          {/* Show Types */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              Content Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {showTypeOptions.map((type) => (
                                 <button
                   key={type.value}
                   type="button"
                   onClick={() => handleArrayToggle('showTypes', type.value as 'series' | 'miniseries' | 'special' | 'documentary')}
                   className={`p-3 text-sm rounded-lg border transition-all text-center ${
                     localFilters.showTypes.includes(type.value as 'series' | 'miniseries' | 'special' | 'documentary')
                       ? 'bg-accent/10 border-accent text-accent'
                       : 'bg-background border-border hover:border-border/80 text-foreground/80 hover:text-foreground'
                   }`}
                 >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 md:flex-initial md:px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            'Search Editors'
          )}
        </button>
        
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-4 text-foreground/80 hover:text-foreground border border-border hover:bg-accent/5 rounded-xl transition-all"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default SearchInterface; 