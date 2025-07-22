'use client';

import { useState } from 'react';
import Link from 'next/link';

// Beautiful Logo Component inspired by Northern Lights
const EditorFinderLogo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Aurora Background */}
        <defs>
          <linearGradient id="aurora" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.6487 0.1538 150.3071)" />
            <stop offset="50%" stopColor="oklch(0.6746 0.1414 261.3380)" />
            <stop offset="100%" stopColor="oklch(0.8269 0.1080 211.9627)" />
          </linearGradient>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.6487 0.1538 150.3071)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="oklch(0.6746 0.1414 261.3380)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Background Glow */}
        <circle cx="20" cy="20" r="18" fill="url(#glow)" className="animate-pulse" />
        
        {/* Main Symbol - TV/Film Strip */}
        <rect x="8" y="12" width="24" height="16" rx="3" fill="url(#aurora)" />
        <rect x="10" y="14" width="20" height="12" rx="2" fill="currentColor" fillOpacity="0.1" />
        
        {/* Film Perforations */}
        <rect x="6" y="15" width="2" height="2" rx="1" fill="url(#aurora)" />
        <rect x="6" y="19" width="2" height="2" rx="1" fill="url(#aurora)" />
        <rect x="6" y="23" width="2" height="2" rx="1" fill="url(#aurora)" />
        <rect x="32" y="15" width="2" height="2" rx="1" fill="url(#aurora)" />
        <rect x="32" y="19" width="2" height="2" rx="1" fill="url(#aurora)" />
        <rect x="32" y="23" width="2" height="2" rx="1" fill="url(#aurora)" />
        
        {/* Center Play Symbol */}
        <polygon points="17,17 17,23 23,20" fill="url(#aurora)" />
        
        {/* Aurora Lines */}
        <path d="M5 8 Q20 12 35 8" stroke="url(#aurora)" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M5 32 Q20 28 35 32" stroke="url(#aurora)" strokeWidth="1.5" fill="none" opacity="0.7" />
      </svg>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-lg animate-pulse" />
    </div>
    
    <div className="flex flex-col">
      <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Editor Finder
      </span>
      <span className="text-xs text-muted-foreground tracking-wider uppercase">
        Television
      </span>
    </div>
  </div>
);

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <EditorFinderLogo className="transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="relative text-foreground/80 hover:text-foreground transition-colors group"
            >
              <span>Search</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all group-hover:w-full" />
            </Link>
            <Link 
              href="/browse" 
              className="relative text-foreground/80 hover:text-foreground transition-colors group"
            >
              <span>Browse</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all group-hover:w-full" />
            </Link>
            <Link 
              href="/admin" 
              className="relative text-foreground/80 hover:text-foreground transition-colors group"
            >
              <span>Admin</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all group-hover:w-full" />
            </Link>
            <Link 
              href="/about" 
              className="relative text-foreground/80 hover:text-foreground transition-colors group"
            >
              <span>About</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all group-hover:w-full" />
            </Link>
            <Link 
              href="/contact" 
              className="relative text-foreground/80 hover:text-foreground transition-colors group"
            >
              <span>Contact</span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all group-hover:w-full" />
            </Link>
          </nav>

          {/* CTA Button & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* CTA Button - Hidden on mobile */}
            <Link
              href="/contact"
              className="hidden md:inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-full hover:shadow-lg hover:shadow-primary/25 transition-all transform hover:scale-105"
            >
              Get Started
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-foreground/60 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="flex items-center px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Search
              </Link>
              <Link 
                href="/browse" 
                className="flex items-center px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
              <Link 
                href="/about" 
                className="flex items-center px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="flex items-center px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile CTA */}
              <div className="px-4 pt-4 border-t border-border/50">
                <Link
                  href="/contact"
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Header Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
    </header>
  );
};

export default Header; 