# 🎬 TV Editor Finder

A Next.js application for discovering and connecting with professional TV editors worldwide. Built with **Apify web search**, Firebase, and modern web technologies.

**🌐 Live Demo**: [tv-editor-finder.vercel.app](https://tv-editor-finder.vercel.app)

## ✨ Features

### 🔍 **Hybrid Search & Discovery**
- **🌐 Web search integration** powered by [Apify](https://console.apify.com) for comprehensive coverage
- **🔄 Hybrid search** combining local database and live web scraping
- **🎯 Smart filtering** by specialties, union status, location, and experience
- **📊 Auto-storage** of web results in Firebase for future searches
- **🏆 Award-winner highlighting** for verified editors

### 🧠 **AI-Powered Intelligence**
- **📈 Research automation** for editor backgrounds
- **🔗 Credit aggregation** from multiple sources
- **📝 Knowledge management** with confidence scoring
- **🎭 Emmy database integration** for award verification

### 🌍 **Global Professional Editor Database**
- **🎬 75+ acclaimed TV editors** from comprehensive industry research
- **🏆 Emmy, BAFTA & International Award winners** from top shows
- **🌍 True international coverage** across 7 countries and 4 continents
- **✅ Verified profiles** with complete filmographies
- **📊 Award tracking** with years and categories

### 🏗️ **Modern Architecture**
- **⚡ Next.js 15** with App Router and Turbopack
- **🔥 Firebase Firestore** for real-time data
- **🌐 Apify Web Search** for unlimited coverage
- **🎨 TailwindCSS** for modern UI
- **📱 Responsive design** for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore
- Apify account (free tier: $10 credit)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tv-editor-finder

# Install dependencies
npm install

# Configure environment (see ENVIRONMENT_SETUP.md)
cp .env.example .env.local
# Add your Apify API token and Firebase config

# Run development server
npm run dev

# Visit http://localhost:3000
```

### 🚀 **Deploy to Production**

```bash
# Deploy to Vercel (automatic with GitHub integration)
git add .
git commit -m "Production ready: Apify web search system"
git push origin main

# Manual deployment
npm run deploy
```

### Test Your Live Site

Try these searches on your production site:
- **"The Simpsons"** → Animation editors
- **"Breaking Bad"** → Drama editors  
- **"comedy editors"** → Genre specialists
- **"Stranger Things"** → Modern show editors

### 🎬 **Instant Global Professional Database**

Get started immediately with **75+ prominent TV editors** including Emmy, BAFTA, and international award winners:

```bash
# Import 32 industry-verified editor profiles (original dataset)
npx tsx scripts/import-prominent-editors.ts

# Import 35 additional global editors (comprehensive international dataset)
npx tsx scripts/import-global-editors.ts

# Import 9 IMDb-verified editors from Canadesk scraper (NEW)
npx tsx scripts/import-canadesk-editors.ts
```

**🌍 GLOBAL COVERAGE INCLUDES:**

### 🇺🇸 **United States - Emmy & ACE Eddie Winners**
- 🏆 **The Last of Us** (Timothy A. Good, Emily Mendez - Emmy winners)
- 👑 **Succession** (Bill Henry - Emmy nominee)
- 🍳 **BEEF** (Nat Fuller, Laura Zempel - Emmy winners)
- 🎭 **The Queen's Gambit** (Michelle Tesoro - Emmy & ACE Eddie winner)
- ⚔️ **Shōgun** (Maria Gonzales - Emmy nominee)
- 🌟 **Breaking Bad, Stranger Things, The Bear** (original dataset)

### 🇬🇧 **United Kingdom - BAFTA Craft Award Winners**
- 🏥 **This Is Going to Hurt** (Selina MacArthur - BAFTA winner)
- 🦌 **Baby Reindeer** (Peter H. Oliver, Benjamin Gerstein - Emmy & ACE Eddie winners)
- ☢️ **Chernobyl** (Simon Smith, Jinx Godfrey - BAFTA winners)
- 👑 **Three Girls, The Crown** (Úna Ní Dhonghaíle - BAFTA winner)
- 🔍 **Bergerac** (Lois Drinkwater), **The Crow Road** (Angus Newton)

### 🇪🇸 **Spain - Money Heist Editing Team**
- 💰 **Money Heist** (David Pelegrín, Luis Miguel González Bedmar, Verónica Callón, Regino Hernández, Raquel Marraco, Patricia Rubio - International Emmy winners)

### 🇩🇪 **Germany - Netflix Originals**
- 🌀 **Dark** (Anja Siemens, Boris Gromatzki - Grimme-Preis winners)
- 👑 **The Empress** (Boris Gromatzki)

### 🇦🇹 **Austria - International Productions**
- 🌀 **Dark, Safe** (Simon Gstöttmayr - Grimme-Preis winner)

### 🇩🇰 **Denmark - Nordic Noir Masters**
- 🏛️ **Borgen, The Killing** (Gerd Tjur - Nordic Noir pioneer)

### 🇦🇺 **Australia - International Television**
- 📺 **Neighbours** (Gerard Simmons - Daily television pioneer)

### 🎌 **Japan/International**
- ⚔️ **Shogun** (Aika Miyake - ACE Eddie winner)

*See `scripts/README.md` for complete setup instructions.*

### Environment Configuration

Create `.env.local` with your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Algolia Configuration (for production)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
ALGOLIA_WRITE_KEY=your_write_key

# TMDb API (optional)
TMDB_API_KEY=your_tmdb_key

# Firecrawl Integration (optional)
FIRECRAWL_API_KEY=your_firecrawl_key
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔍 Hybrid Search System

Our search combines **local database** and **web scraping** for comprehensive coverage:

### Search Flow

```
User Query → Local Firebase Search → If <3 results → Web Search → Store Results
```

### Web Search Integration

**Powered by [Apify Web Scraping API](https://console.apify.com/actors/dCWf2xghxeZgpcrsQ)**:
- **Google Search**: Finds relevant editor pages across the web
- **Smart Scraping**: Extracts editor names, roles, and credits from IMDB, industry sites
- **Auto-Storage**: Saves web-found editors to Firebase for future searches
- **Deduplication**: Removes duplicates across local and web results

### API Endpoints

#### Text Search
```bash
# Search editor names (local + web)
GET /api/editors?q=Maria

# Search by TV show (triggers web search)
GET /api/editors?q=The+Office
```

#### Advanced Filtering
```bash
# Filter by union status
GET /api/editors?unionStatus=guild

# Filter by location and remote work
GET /api/editors?remoteOnly=true

# Filter by experience range
GET /api/editors?minExperience=5&maxExperience=15

# Filter award winners only
GET /api/editors?awardWinners=true
```

#### Complex Searches
```bash
# Search with genre facets
GET /api/editors?genres=Drama,Action

# Complex multi-filter search
GET /api/editors?q=comedy+editors&unionStatus=guild&remoteOnly=true
```

### Search Features

1. **Local Database Search** - Fast retrieval from Firebase (17+ curated editors)
2. **Web Search Fallback** - Searches IMDB, industry sites when local results are insufficient
3. **Auto-Storage** - Web-found editors automatically saved to database
4. **Smart Queries** - Enhanced search terms for better web discovery
5. **Result Combination** - Merges local and web results intelligently

## 🗄️ Data Architecture

### Editor Schema

```typescript
interface Editor {
  id: string;
  name: string;
  experience: {
    yearsActive: number;
    specialties: string[];        // Drama, Comedy, Action, etc.
    notableWorks: Credit[];
  };
  professional: {
    unionStatus: 'guild' | 'non-union';
    availability: 'available' | 'busy' | 'unavailable';
    rates?: RateStructure;
  };
  location: {
    city: string;
    state: string;
    country: string;              // NEW: International support
    remote: boolean;
  };
  contact: ContactInfo;
  metadata: {
    verified: boolean;           // Emmy/award verification
    dataSource: string[];       // NEW: Multiple sources
    createdAt: Date;
    updatedAt: Date;
    confidenceScore: number;     // Data reliability (0-100)
  };
}
```

### International Award Integration

```typescript
interface Award {
  name: string;                  // Emmy, BAFTA, Grimme-Preis, etc.
  category: string;
  year: number;
  status: 'won' | 'nominated';
  show: string;
  country?: string;              // NEW: Award country
}
```

### Research & Intelligence

```typescript
interface ResearchEntry {
  id: string;
  editorId: string;
  type: 'credit' | 'award' | 'interview' | 'industry_mention';
  title: string;
  content: string;
  sources: ResearchSource[];
  confidence: 'low' | 'medium' | 'high';
  metadata: {
    createdAt: Date;
    createdBy: string;
    version: number;
  };
}
```

## 🔬 Research & Intelligence Integration

### IMDb Data Pipeline
Our application integrates with **IMDb via Apify MCP** for comprehensive entertainment industry data:

#### Available IMDb Scrapers
- **`epctex/imdb-advanced-scraper`** - Advanced TV show and movie data extraction
- **`canadesk/imdb`** - ✅ **ACTIVE** Search and celebrity data retrieval  
- **`dtrungtin/imdb-scraper`** - Comprehensive IMDb API alternative
- **`maged120/imdb-trending-ppr`** - Real-time trending content

#### Editor Discovery Success
```typescript
// Successful editor discovery via Canadesk IMDb scraper
interface EditorDiscovery {
  method: 'canadesk-imdb-search';
  searchTerms: ['film editor', 'video editor', 'editorial department'];
  results: 9; // New verified editors added
  coverage: ['USA', 'UK', 'Australia']; // 3 countries
  timespan: '1966-2024'; // 58 years of TV history
  shows: ['Shōgun', 'Bergerac', 'Neighbours', 'The Crow Road'];
  verification: 'imdb-profile-confirmed';
}
```

#### Practical Integration Results
- **✅ 9 New Editors Added** via Canadesk IMDb scraper
- **📺 Emmy Content**: Shōgun (2024) Emmy-nominated series
- **🏆 Classic Series**: BBC's Bergerac, The Crow Road
- **🌍 International**: UK BBC productions, Australian soap opera
- **📅 Historical Range**: 1966-2024 (58 years of editing history)

#### Research Capabilities
```typescript
// Automated editor discovery
interface ResearchPipeline {
  sources: ['imdb', 'emmys', 'ace-eddie', 'bafta'];
  methods: ['web-scraping', 'award-tracking', 'industry-monitoring'];
  verification: 'multi-source-cross-reference';
  automation: 'real-time-updates';
}
```

### Award Database Integration
- **Emmy Awards** - Television Academy official data
- **ACE Eddie Awards** - American Cinema Editors recognition
- **BAFTA Craft Awards** - British Academy Television Awards
- **International Emmys** - Global television recognition
- **Grimme-Preis** - German television excellence

### Web Research Pipeline
Powered by **Firecrawl** for comprehensive editor discovery:

```javascript
// Example research query
const findEditors = async () => {
  const results = await firecrawl.search({
    query: "Emmy Award winning television editors 2024",
    sources: ['variety.com', 'deadline.com', 'televisionacademy.com'],
    extraction: 'structured-data'
  });
  
  return processEditorProfiles(results);
};
```

### Data Verification Process
1. **Primary Source** - Official award databases
2. **Cross-Reference** - Industry publications
3. **Profile Validation** - Professional networks
4. **Continuous Updates** - Automated monitoring

## 🛠️ API Reference

### Search Endpoints

#### `GET /api/editors`
Primary search endpoint with Algolia integration.

**Query Parameters:**
- `q` - Text search query
- `genres` - Comma-separated specialties
- `unionStatus` - Guild membership filter
- `minExperience` / `maxExperience` - Experience range
- `remoteOnly` - Remote work filter
- `awardWinners` - Award winners only
- `limit` - Results per page (default: 20)

**Response:**
```json
{
  "data": {
    "editors": [...],
    "totalCount": 156,
    "facets": {
      "genres": {"Drama": 45, "Comedy": 32},
      "locations": {"CA": 67, "NY": 34},
      "experience": {"5-10 years": 23}
    }
  },
  "success": true,
  "timestamp": "2025-01-22T..."
}
```

#### `GET /api/research/[editorId]`
Fetch research entries for specific editor.

#### `POST /api/research/[editorId]`
Create new research entry.

### Data Sync Endpoints

#### `GET /api/sync`
Trigger data synchronization from external sources.

## 🧪 Development & Testing

### Running Tests
```bash
# Unit tests
npm test

# Algolia connection test
npm run test:algolia

# End-to-end tests
npm run test:e2e
```

### Database Seeding
```bash
# RECOMMENDED: Import complete global database (65+ editors)
# Step 1: Import original prominent editors (32 editors)
npx tsx scripts/import-prominent-editors.ts

# Step 2: Import new global research (35 editors)
npx tsx scripts/import-global-editors.ts

# Alternative: Add sample editor data for testing only
npm run seed:editors

# Initialize Emmy database
npm run seed:emmys

# Sync to Algolia for faster search
npm run sync:algolia
```

## 🔒 Security & Best Practices

Following [Algolia security recommendations](https://www.algolia.com/doc/guides/security/api-keys/):

### API Key Management
- **Search Key**: Public, read-only access
- **Write Key**: Server-only, never exposed to client
- **Master Key**: Admin only, never in code

### Firebase Security Rules
```javascript
// Editors collection - read public, write admin only
match /editors/{editorId} {
  allow read: if true;
  allow write: if isAdmin();
}

// Research collection - read/write with editor-specific access
match /research/{docId} {
  allow read: if true;
  allow write: if isAuthenticated();
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run deploy

# Set environment variables in Vercel dashboard
# Configure custom domain
```

### Firebase Hosting
```bash
# Build and deploy
npm run build
firebase deploy
```

### Environment-Specific Configurations

#### Development
- Uses Algolia test environment
- Firebase emulators for local testing
- Hot reloading with Turbopack

#### Production
- Algolia production indices
- Firebase production database
- CDN optimization
- Analytics integration

## 📊 Analytics & Monitoring

### Search Analytics
- **Click tracking** for result optimization
- **Conversion metrics** for editor contact
- **Search performance** monitoring
- **Popular searches** analysis

### Performance Metrics
- **Search response time** (target: <100ms)
- **Database query optimization**
- **CDN cache hit rates**
- **Core Web Vitals** monitoring

## 🔮 Roadmap

### Recently Added ✅
- [x] **Global Editor Database** - 65+ industry professionals worldwide
- [x] **International Award Integration** - Emmy, BAFTA, Grimme-Preis, International Emmy
- [x] **Multi-Country Coverage** - USA, UK, Spain, Germany, Austria, Denmark, Japan
- [x] **Advanced Import Scripts** - Automated database population
- [x] **Verified International Profiles** - Industry-researched data
- [x] **Comprehensive Genre Coverage** - From Nordic Noir to Spanish Crime to German Sci-Fi
- [x] **IMDb Data Integration** - Apify MCP setup for advanced scraping capabilities
- [x] **Web Research Pipeline** - Firecrawl integration for editor discovery

### Current Capabilities
- [x] **Emmy Award Database** - Comprehensive Emmy, ACE Eddie, and international award tracking
- [x] **Real-time Research** - Automated discovery of new editors via web search
- [x] **Multi-source Verification** - Cross-referencing across industry databases
- [x] **International Coverage** - 6 countries across 4 continents

### Next Features
- [ ] **Enhanced IMDb Integration** - Direct crew member extraction from show pages  
- [ ] **ACE Eddie Database** - Complete American Cinema Editors award history
- [ ] **BAFTA Integration** - British Academy Television Craft Awards
- [ ] **Industry Newsletter Integration** - Automated updates from trade publications
- [ ] **TMDb Integration** - Real TV show data
- [ ] **Advanced Personalization** - User preferences
- [ ] **A/B Testing** - Search optimization
- [ ] **Recommendation Engine** - Similar editors
- [ ] **Mobile App** - React Native version

### International Expansion
- [ ] **Asian Markets** - Korean, Japanese, Indian editors
- [ ] **European Extension** - French, Italian, Scandinavian coverage
- [ ] **Latin American Coverage** - Mexican, Brazilian, Argentinian editors
- [ ] **Streaming Platform Integration** - Netflix, HBO, Amazon originals

### Research & Data Enhancement
- [ ] **Automated Emmy Tracking** - Real-time updates during award season
- [ ] **Industry Publication Monitoring** - Variety, Deadline, Hollywood Reporter
- [ ] **LinkedIn Professional Network** - Editor career tracking
- [ ] **Guild Membership Integration** - ACE, Motion Picture Editors Guild
- [ ] **Academic Institution Partnerships** - Film school alumni networks

### Search Enhancements
- [ ] **Synonyms Management** - Industry terminology
- [ ] **Query Rules** - Business logic
- [ ] **Visual Search** - Image-based matching
- [ ] **Voice Search** - Speech recognition

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use TailwindCSS for styling
- Implement proper error handling
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Documentation**: [Algolia Docs](https://www.algolia.com/doc/)
- **Issues**: GitHub Issues
- **Discord**: [Community Chat](#)
- **Email**: support@tveditorfinder.com

---

**Built with ❤️ for the TV editing community**

*Connecting talent with opportunity through intelligent search*
