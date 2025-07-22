'use client';

import { useState, useEffect } from 'react';
import { SearchFilters, SearchResult, Editor } from '@/types';
import SearchInterface from '@/components/SearchInterface';
import SearchResults from '@/components/SearchResults';
import Header from '@/components/Header';

const initialFilters: SearchFilters = {
  query: '',
  genres: [],
  networks: [],
  experienceRange: { min: 0, max: 25 },
  location: { cities: [], states: [], remoteOnly: false },
  unionStatus: [],
  awardWinners: false,
  showTypes: [],
  availability: []
};

const mockResults: SearchResult = {
  editors: [],
  totalCount: 0,
  facets: {
    genres: {},
    networks: {},
    locations: {},
    experience: {}
  }
};

export default function HomePage() {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult>(mockResults);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (newFilters: SearchFilters) => {
    setLoading(true);
    setFilters(newFilters);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting results...');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="relative">
        {/* Hero Section with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
          <div className="relative container mx-auto px-4 pt-16 pb-24">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Find Your Perfect
                <br />
                TV Editor
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
                Connect with professional television editors worldwide. 
                Search by genre, experience, awards, and availability.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span>10,000+ Verified Editors</span>
                </div>
                <div className="w-1 h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                  <span>Live Availability</span>
                </div>
                <div className="w-1 h-4 bg-border" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span>Industry Intelligence</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="relative -mt-12 z-10">
          <div className="container mx-auto px-4">
            <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8">
              <SearchInterface 
                filters={filters} 
                onSearch={handleSearch} 
                loading={loading} 
              />
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="container mx-auto px-4 py-16">
          <SearchResults 
            results={results} 
            loading={loading} 
            filters={filters} 
            onFiltersChange={setFilters} 
            onExport={handleExport} 
          />
        </div>

        {/* Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        </div>
      </main>
    </div>
  );
}
