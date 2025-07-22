# 🎬 TV Editor Finder

A Next.js application for discovering and connecting with professional TV editors worldwide. Built with **Algolia-powered search**, Firebase, and modern web technologies.

## ✨ Features

### 🔍 **Advanced Search & Discovery**
- **⚡ Lightning-fast search** powered by [Algolia](https://www.algolia.com/doc/)
- **🎯 Smart filtering** by specialties, union status, location, and experience
- **📊 Real-time faceted search** with dynamic result counts
- **🌐 Geographic search** with remote work options
- **🏆 Award-winner highlighting** for verified editors

### 🧠 **AI-Powered Intelligence**
- **📈 Research automation** for editor backgrounds
- **🔗 Credit aggregation** from multiple sources
- **📝 Knowledge management** with confidence scoring
- **🎭 Emmy database integration** for award verification

### 🌍 **Global Professional Editor Database**
- **🎬 65+ acclaimed TV editors** from comprehensive industry research
- **🏆 Emmy, BAFTA & International Award winners** from top shows
- **🌍 True international coverage** across 6 countries and 4 continents
- **✅ Verified profiles** with complete filmographies
- **📊 Award tracking** with years and categories

### 🏗️ **Modern Architecture**
- **⚡ Next.js 15** with App Router and Turbopack
- **🔥 Firebase Firestore** for real-time data
- **🔍 Algolia Search** for instant results
- **🎨 TailwindCSS** for modern UI
- **📱 Responsive design** for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore
- Algolia account (free tier available)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tv-editor-finder

# Install dependencies
npm install

# Set up environment variables (see Environment Configuration below)
```

### 🎬 **Instant Global Professional Database**

Get started immediately with **65+ prominent TV editors** including Emmy, BAFTA, and international award winners:

```bash
# Import 32 industry-verified editor profiles (original dataset)
npx tsx scripts/import-prominent-editors.ts

# Import 35 additional global editors (new comprehensive dataset)
npx tsx scripts/import-global-editors.ts
```

**🌍 GLOBAL COVERAGE INCLUDES:**

### 🇺🇸 **United States - Emmy & ACE Eddie Winners**
- 🏆 **The Last of Us** (Timothy A. Good, Emily Mendez - Emmy winners)
- 👑 **Succession** (Bill Henry - Emmy nominee)
- 🍳 **BEEF** (Nat Fuller, Laura Zempel - Emmy winners)
- 🎭 **The Queen's Gambit** (Michelle Tesoro - Emmy & ACE Eddie winner)
- 🌟 **Breaking Bad, Stranger Things, The Bear** (original dataset)

### 🇬🇧 **United Kingdom - BAFTA Craft Award Winners**
- 🏥 **This Is Going to Hurt** (Selina MacArthur - BAFTA winner)
- 🦌 **Baby Reindeer** (Peter H. Oliver, Benjamin Gerstein - Emmy & ACE Eddie winners)
- ☢️ **Chernobyl** (Simon Smith, Jinx Godfrey - BAFTA winners)
- 👑 **Three Girls, The Crown** (Úna Ní Dhonghaíle - BAFTA winner)

### 🇪🇸 **Spain - Money Heist Editing Team**
- 💰 **Money Heist** (David Pelegrín, Luis Miguel González Bedmar, Verónica Callón, Regino Hernández, Raquel Marraco, Patricia Rubio - International Emmy winners)

### 🇩🇪 **Germany - Netflix Originals**
- 🌀 **Dark** (Anja Siemens, Boris Gromatzki - Grimme-Preis winners)
- 👑 **The Empress** (Boris Gromatzki)

### 🇦🇹 **Austria - International Productions**
- 🌀 **Dark, Safe** (Simon Gstöttmayr - Grimme-Preis winner)

### 🇩🇰 **Denmark - Nordic Noir Masters**
- 🏛️ **Borgen, The Killing** (Gerd Tjur - Nordic Noir pioneer)

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

## 🔍 Algolia Search Integration

Our search is powered by **Algolia v5** with advanced configuration following [Algolia best practices](https://www.algolia.com/doc/guides/getting-started/what-is-algolia/):

### Index Configuration

```javascript
// Searchable attributes for text matching
searchableAttributes: [
  'name',                    // Editor names
  'experience.specialties',  // Genre specialties
  'location.city',          // Geographic locations
  'location.state'
]

// Faceted filtering capabilities
attributesForFaceting: [
  'experience.specialties',     // Drama, Action, Comedy, etc.
  'professional.unionStatus',   // Guild vs non-union
  'location.state',            // Geographic filtering
  'location.remote',           // Remote work availability
  'metadata.verified'          // Award winners
]

// Custom ranking for relevance
customRanking: [
  'desc(experience.yearsActive)',  // Experience level
  'desc(metadata.verified)'       // Award winners first
]
```

### Search Features

#### Text Search
```bash
# Search editor names
GET /api/editors?q=Maria

# Search by specialty
GET /api/editors?q=Drama
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

#### Faceted Search
```bash
# Search with genre facets
GET /api/editors?genres=Drama,Action

# Complex multi-filter search
GET /api/editors?q=Emmy&unionStatus=guild&genres=Drama&remoteOnly=true
```

### Fallback Strategy

The application implements **intelligent fallback**:
1. **Primary**: Algolia search (sub-100ms response)
2. **Fallback**: Firebase Firestore search (if Algolia unavailable)
3. **Auto-retry**: Automatic error recovery

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

### Next Features
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
