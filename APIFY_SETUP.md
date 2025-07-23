# 🌐 Apify Web Search Integration Setup

Complete guide for setting up and configuring Apify web search in the TV Editor Finder application.

## 📋 Prerequisites

1. **Apify Account**: Sign up at [apify.com](https://apify.com)
2. **Firebase Project**: Primary database for storing search results
3. **Node.js 18+**: For development environment

## 🚀 Quick Setup

### 1. Create Apify Account and Get API Token

```bash
# Sign up at https://apify.com
# Go to Settings > Integrations > API tokens
# Create a new token with full access
# Copy your API token
```

### 2. Configure Environment Variables

Add to your `.env.local`:

```env
# Apify Configuration (Required)
APIFY_API_TOKEN=your_apify_api_token_here

# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Enhanced features
TMDB_API_KEY=your_tmdb_key_for_additional_tv_data
FIRECRAWL_API_KEY=your_firecrawl_key_for_advanced_scraping
```

### 3. Verify Actor Integration

The application uses the **Web Scraping API** actor (`dCWf2xghxeZgpcrsQ`) which is already configured.

## 🏗️ How the System Works

### Search Flow

```
1. User searches for "The Office editors"
   ↓
2. System searches local Firebase database
   ↓
3. If < 3 results found:
   ↓
4. Trigger Apify web search:
   - Google search: "The Office TV show editors credits IMDB"
   - Scrape top 5 result pages
   - Extract editor names and information
   ↓
5. Parse and validate extracted data
   ↓
6. Store new editors in Firebase database
   ↓
7. Return combined local + web results
```

### Web Scraping Configuration

The system uses structured data extraction:

```json
{
  "endpoint": "scrape",
  "url": "scraped_page_url",
  "fields": {
    "editors": [
      {
        "name": "< Full name of the TV editor >",
        "role": "< Their role like 'Editor', 'Supervising Editor' >",
        "show": "< Name of the TV show they worked on >",
        "network": "< TV network or streaming service >",
        "years": "< Years they worked on the show >",
        "awards": "< Any Emmy or other awards mentioned >"
      }
    ],
    "credits": [
      {
        "editor_name": "< Editor's full name >",
        "position": "< Job title like 'Film Editor' >",
        "project": "< TV show or movie title >",
        "year": "< Year of the project >"
      }
    ]
  }
}
```

## 🎯 Search Enhancement Features

### Smart Query Building

The system automatically enhances user queries:

- **"simpsons"** → `"The Simpsons TV show editors credits IMDB"`
- **"comedy editors"** → `"comedy TV show editors Emmy winners"`
- **"friends"** → `"Friends TV show editors credits IMDB"`
- **"drama"** → `"drama TV series editors Emmy awards"`

### Data Quality Filtering

```typescript
// Validates editor names
private isValidEditorName(name: string): boolean {
  const invalidNames = [
    'the simpsons', 'tv show', 'emmy award',
    'director', 'producer', 'writer', 'creator'
  ];

  return !invalidNames.some(invalid => 
    name.toLowerCase().includes(invalid)
  ) && name.split(' ').length >= 2 && name.length < 50;
}
```

### Auto-Storage System

Web-found editors are automatically stored in Firebase:

```typescript
// Check for duplicates
const existingQuery = query(
  collection(db, 'editors'),
  where('name', '==', editor.name)
);

if (existingSnapshot.empty) {
  // Add new editor with web search metadata
  await addDoc(collection(db, 'editors'), {
    ...editor,
    metadata: {
      ...editor.metadata,
      originalSearchQuery: searchQuery,
      addedViaWebSearch: true
    }
  });
}
```

## 🔧 Configuration Options

### Search Thresholds

```typescript
// In src/lib/search-service.ts
// Trigger web search if local results < 3
if (localResults.editors.length >= 3 || !filters.query?.trim()) {
  return localResults;
}
```

### Web Search Limits

```typescript
// Limit to 3 queries per search to avoid excessive API calls
return queries.slice(0, 3);

// Limit to top 5 results per query
for (const url of searchResults.slice(0, 5)) {
  // Process each URL
}

// Limit final results to 10 web-found editors
const limitedResults = uniqueEditors.slice(0, 10);
```

## 💰 Cost Management

### Apify Pricing

- **$2 per 1,000 pages** scraped
- **Free tier**: $10 credit (covers 5,000 pages)
- **No monthly minimums**

### Cost Optimization Strategies

1. **Local Database First**: Always search Firebase before web
2. **Result Caching**: Store web results to avoid re-scraping
3. **Smart Queries**: Limit to 3 enhanced queries per search
4. **Page Limits**: Only scrape top 5 pages per query
5. **Deduplication**: Avoid storing duplicate editors

### Usage Monitoring

```typescript
// Track web search usage
console.log(`🌐 Searching web for: "${query}"`);
console.log(`📄 Scraped ${editors.length} editors from ${url}`);
console.log(`💾 Storing ${editors.length} web-found editors in database...`);
```

## 🔍 Testing Your Setup

### 1. Test Local Search

```bash
# Should return existing editors from database
curl "http://localhost:3000/api/editors?q=drama"
```

### 2. Test Web Search

```bash
# Should trigger web search (new show not in database)
curl "http://localhost:3000/api/editors?q=stranger+things+editors"
```

### 3. Test Hybrid Results

```bash
# Should combine local and web results
curl "http://localhost:3000/api/editors?q=comedy+editors"
```

### 4. Verify Database Storage

Check your Firebase console to see new editors being added with:
- `metadata.addedViaWebSearch: true`
- `metadata.originalSearchQuery: "user_query"`
- `metadata.dataSource: ["web-search", "apify"]`

## 📊 Monitoring & Analytics

### Search Performance

Monitor these metrics in your Firebase console:

- **Local Search Response Time**: < 500ms
- **Web Search Response Time**: 2-10 seconds
- **New Editors Added**: Track growth from web searches
- **Search Success Rate**: Percentage of searches returning results

### Firebase Database Growth

```javascript
// Track database growth from web searches
editors/
├── existing_editors_from_seeds (17 editors)
└── web_search_results/
    ├── simpsons_search_2025_01_22 (2 new editors)
    ├── friends_search_2025_01_22 (1 new editor)
    └── ...
```

## 🚨 Troubleshooting

### Common Issues

#### 1. No Web Search Results
```bash
# Check API token
echo $APIFY_API_TOKEN

# Verify actor is available
curl -H "Authorization: Bearer $APIFY_API_TOKEN" \
  https://api.apify.com/v2/acts/dCWf2xghxeZgpcrsQ
```

#### 2. Database Storage Fails
```typescript
// Check Firebase permissions
// Ensure Firestore rules allow writes to 'editors' collection
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /editors/{document} {
      allow write: if true; // During development
    }
  }
}
```

#### 3. Poor Search Quality
```typescript
// Adjust search queries in buildWebSearchQueries()
// Add more specific patterns for better results
if (baseQuery.includes('your_show')) {
  queries.push('Your Show TV editors credits IMDB Emmy');
}
```

## 🔒 Security Best Practices

### API Key Security

```env
# ✅ Good: Store in environment variables
APIFY_API_TOKEN=your_token

# ❌ Bad: Never commit to code
const token = "apify_api_1234567890abcdef";
```

### Rate Limiting

```typescript
// Implement request throttling
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

for (const url of searchResults) {
  await delay(1000); // 1 second between requests
  await scrapeEditorsFromPage(url, query);
}
```

### Data Validation

```typescript
// Always validate scraped data
if (!name || !this.isValidEditorName(name)) {
  return null;
}
```

## 🚀 Advanced Features

### Custom Search Patterns

Add new TV shows to the search pattern matching:

```typescript
// In buildWebSearchQueries()
if (baseQuery.includes('your_new_show')) {
  queries.push('Your New Show TV editors credits IMDB');
  queries.push('Your New Show post-production team');
}
```

### Enhanced Data Extraction

Improve the scraping fields:

```json
{
  "editors": [
    {
      "name": "< Full name >",
      "role": "< Role >",
      "show": "< Show name >",
      "network": "< Network >",
      "years": "< Years active >",
      "awards": "< Awards >",
      "location": "< Location if mentioned >",
      "union_status": "< Guild membership if mentioned >"
    }
  ]
}
```

### Result Caching

Implement Redis or memory caching:

```typescript
// Cache web search results for 1 hour
const searchCache = new Map();
const cacheKey = `search:${query}`;

if (searchCache.has(cacheKey)) {
  return searchCache.get(cacheKey);
}

const results = await searchWebForEditors(query, filters);
searchCache.set(cacheKey, results);
setTimeout(() => searchCache.delete(cacheKey), 3600000);
```

## 📚 Resources

- **[Apify Documentation](https://docs.apify.com/)**
- **[Web Scraping API Actor](https://console.apify.com/actors/dCWf2xghxeZgpcrsQ)**
- **[Firebase Firestore](https://firebase.google.com/docs/firestore)**
- **[Search API Reference](./README.md#api-endpoints)**

---

🎉 **Your search system is now powered by web scraping!** Users can find editors for any TV show, whether in your database or across the web. 