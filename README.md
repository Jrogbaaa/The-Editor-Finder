# 🌌 TV Editor Finder | Northern Lights Platform

> **A premium platform for discovering professional television editors with stunning aurora-inspired design**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-v10-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-Northern%20Lights-aurora?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

## ✨ **Features**

### 🎨 **Northern Lights Design System**
- **Aurora-inspired color palette** with green, purple, and blue gradients
- **Stripe-inspired UI components** with modern cards and animations
- **Dark mode by default** with beautiful backdrop blur effects
- **Custom SVG logo** with film strip design and glow animations
- **Professional typography** using Plus Jakarta Sans, Source Serif 4, and JetBrains Mono

### 🔍 **Advanced Search & Discovery**
- **Intelligent search interface** with quick filters and advanced options
- **Real-time availability tracking** for editors
- **Genre, network, and experience filtering**
- **Award winners and union status filtering**
- **Remote work and location preferences**
- **Professional grid and list view modes**

### 🧠 **Intelligence & Research System**
- **Editor knowledge database** with work style insights
- **Rate and availability pattern tracking**
- **Industry connection mapping**
- **Performance metrics and risk assessment**
- **Comprehensive research entry system**

### 📊 **Data Integration**
- **TMDb API integration** for show and credit data
- **IMDb scraping capabilities** (framework ready)
- **Emmy Awards database** (planned)
- **Professional network aggregation**
- **Multi-source data verification and quality assurance**

### 🛠 **Admin & Management**
- **Beautiful admin dashboard** with Northern Lights theme
- **Data synchronization controls**
- **System status monitoring**
- **Bulk data import/export capabilities**
- **Analytics and reporting tools**

## 🚀 **Tech Stack**

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Northern Lights design system
- **React Hooks** - Modern state management

### **Backend & Database**
- **Next.js API Routes** - Serverless backend functions
- **Firebase Firestore** - NoSQL cloud database
- **Firebase Authentication** - User management (ready)
- **Firebase Storage** - Media and document storage

### **Search & Analytics**
- **Algolia** - Advanced search capabilities
- **TMDb API** - Movie and TV show data
- **Custom analytics** - Search and usage tracking

### **External Integrations**
- **IMDb** - Industry standard editor credits
- **Emmy Database** - Awards and recognition data
- **Professional Networks** - Staff Me Up, ProductionHUB, etc.

## 🎨 **Northern Lights Color Palette**

```css
/* Aurora Colors */
--primary: oklch(0.6487 0.1538 150.3071);    /* Aurora Green */
--secondary: oklch(0.5880 0.0993 245.7394);  /* Deep Purple */
--accent: oklch(0.6746 0.1414 261.3380);     /* Vibrant Purple-Blue */

/* Dark Theme */
--background: oklch(0.2303 0.0125 264.2926); /* Dark Navy */
--card: oklch(0.3210 0.0078 223.6661);       /* Blue-Gray Cards */
--foreground: oklch(0.9219 0 0);             /* Bright Text */
```

## 🏃‍♂️ **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication
- TMDb API key
- Algolia account (optional)

### **Installation**

```bash
# Clone the repository
git clone <repository-url>
cd tv-editor-finder

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### **Environment Variables**

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
ALGOLIA_WRITE_KEY=your_write_key

# TMDb API Configuration
TMDB_API_KEY=your_tmdb_api_key

# Rate Limiting
SCRAPING_DELAY_MS=2000
MAX_CONCURRENT_REQUESTS=5
```

## 📱 **Application Structure**

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage with search
│   ├── admin/             # Admin dashboard
│   ├── editor/[id]/       # Editor profile pages
│   ├── api/               # API routes
│   └── globals.css        # Northern Lights theme
├── components/            # Reusable UI components
│   ├── Header.tsx         # Navigation with logo
│   ├── SearchInterface.tsx # Advanced search form
│   ├── SearchResults.tsx   # Results grid/list
│   └── EditorCard.tsx     # Editor profile cards
├── lib/                   # Core utilities
│   ├── firebase.ts        # Firebase configuration
│   ├── algolia.ts         # Search client
│   ├── tmdb.ts           # TMDb API integration
│   ├── data-sync.ts      # Data synchronization
│   └── firestore-schema.ts # Database helpers
└── types/                 # TypeScript definitions
    ├── index.ts           # Core types
    └── research.ts        # Research system types
```

## 🗄️ **Database Schema**

### **Editors Collection**
```typescript
interface Editor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location: {
    city: string;
    state: string;
    country: string;
    remote: boolean;
  };
  experience: {
    yearsActive: number;
    startYear: number;
    specialties: string[];
  };
  professional: {
    unionStatus: 'guild' | 'non-union' | 'unknown';
    imdbId?: string;
    availability: 'available' | 'busy' | 'unknown';
    representation?: {
      agent?: string;
      manager?: string;
    };
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    dataSource: string[];
    verified: boolean;
  };
}
```

### **Research Intelligence**
```typescript
interface EditorKnowledge {
  editorId: string;
  summary: KnowledgeSummary;
  insights: EditorInsight[];
  connections: EditorConnection[];
  opportunities: OpportunityAssessment[];
  risks: RiskAssessment[];
  performance: PerformanceMetrics;
  lastUpdated: Date;
}
```

## 🔧 **Development Commands**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks

# Database
npm run db:seed          # Add sample data
npm run db:sync          # Sync external data sources
npm run db:backup        # Backup Firestore data

# Deployment
npm run deploy           # Deploy to Vercel
npm run deploy:firebase  # Deploy to Firebase Hosting
```

## 🌟 **API Endpoints**

### **Search & Discovery**
- `GET /api/editors` - Search editors with filters
- `POST /api/editors/search` - Advanced search with complex queries
- `GET /api/editors/[id]` - Get single editor profile
- `GET /api/editors/[id]/credits` - Get editor's credits
- `GET /api/editors/[id]/awards` - Get editor's awards

### **Data Management**
- `POST /api/sync` - Trigger data synchronization
- `GET /api/sync/status` - Check sync status
- `POST /api/editors` - Create new editor (admin)
- `PUT /api/editors/[id]` - Update editor (admin)

### **Research Intelligence**
- `GET /api/research/[editorId]` - Get research data
- `POST /api/research/[editorId]` - Add research entry
- `GET /api/knowledge/[editorId]` - Get editor knowledge summary

## 🔐 **Security & Rules**

### **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to editors
    match /editors/{editorId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Research data - admin only write
    match /editorKnowledge/{editorId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
  }
}
```

## 📊 **Performance Features**

- **Server-side rendering** with Next.js 14
- **Static generation** for editor profiles
- **Image optimization** with Next.js Image
- **Code splitting** and lazy loading
- **CDN deployment** with Vercel/Firebase
- **Database indexing** for fast queries
- **Search optimization** with Algolia

## 🚀 **Deployment Options**

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```

### **Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### **Custom Deployment**
- Build: `npm run build`
- Start: `npm start`
- Port: `3000` (configurable)

## 🛠 **Development Roadmap**

### **Phase 1: Foundation ✅**
- [x] Next.js setup with Northern Lights theme
- [x] Firebase integration and schema
- [x] Basic search interface
- [x] TMDb data integration
- [x] Admin dashboard

### **Phase 2: Intelligence System 🚧**
- [ ] Research database implementation
- [ ] Editor knowledge aggregation
- [ ] Industry intelligence features
- [ ] Advanced analytics

### **Phase 3: Data Expansion 📋**
- [ ] Emmy Awards integration
- [ ] IMDb scraping enhancement
- [ ] Professional network connections
- [ ] Data quality improvements

### **Phase 4: User Features 📋**
- [ ] User authentication system
- [ ] Saved searches and favorites
- [ ] Editor contact management
- [ ] Project collaboration tools

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the Northern Lights design system
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎬 **About**

Built with ❤️ for the television industry. The Northern Lights theme represents the creative energy and professional excellence of TV editors worldwide.

---

**Visit the live application:** [TV Editor Finder](http://localhost:3000)

**Admin Dashboard:** [Admin Panel](http://localhost:3000/admin)
