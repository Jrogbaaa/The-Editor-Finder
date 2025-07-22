# 🔍 Algolia Integration Setup Guide

Complete guide for setting up and configuring Algolia search in the TV Editor Finder application.

## 📋 Prerequisites

1. **Algolia Account**: Sign up at [algolia.com](https://www.algolia.com)
2. **Node.js 18+**: For development environment
3. **Firebase Project**: Primary database

## 🚀 Quick Setup

### 1. Create Algolia Application

```bash
# Sign up and create new application
# Choose your closest region for optimal performance
# Note down your Application ID and API keys
```

### 2. Configure Environment Variables

```env
# Add to .env.local
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
ALGOLIA_WRITE_KEY=your_write_key
```

### 3. Install Dependencies

```bash
npm install algoliasearch
```

### 4. Initialize Index

```bash
# Run the initialization script
node scripts/init-algolia.js
```

## 🏗️ Index Configuration

### Primary Index: `editors_index`

Following [Algolia best practices](https://www.algolia.com/doc/guides/managing-results/relevance-overview/):

```javascript
const indexSettings = {
  // Text search configuration
  searchableAttributes: [
    'name',                    // Most important - editor names
    'experience.specialties',  // Genre expertise
    'location.city',          // Geographic search
    'location.state'
  ],

  // Faceted filtering
  attributesForFaceting: [
    'filterOnly(experience.specialties)',     // Drama, Action, etc.
    'filterOnly(professional.unionStatus)',   // Guild membership
    'filterOnly(location.state)',            // State/region
    'filterOnly(location.remote)',           // Remote availability
    'filterOnly(metadata.verified)'         // Award verification
  ],

  // Relevance ranking
  customRanking: [
    'desc(experience.yearsActive)',  // Experience priority
    'desc(metadata.verified)',      // Verified editors first
    'desc(metadata.confidenceScore)' // Data quality
  ],

  // Advanced settings
  typoTolerance: true,
  allowTyposOnNumericTokens: false,
  minWordSizefor1Typo: 4,
  minWordSizefor2Typos: 8,
  
  // Performance optimization
  hitsPerPage: 20,
  maxValuesPerFacet: 100,
  
  // Highlighting
  highlightPreTag: '<mark>',
  highlightPostTag: '</mark>',
  
  // Pagination
  paginationLimitedTo: 1000
};
```

### Replica Indices (Optional)

For advanced sorting options:

```javascript
// Sort by experience (high to low)
const experienceReplicaSettings = {
  ...baseSettings,
  ranking: [
    'desc(experience.yearsActive)',
    'typo',
    'geo',
    'words',
    'filters',
    'proximity',
    'attribute',
    'exact'
  ]
};

// Sort by location relevance
const locationReplicaSettings = {
  ...baseSettings,
  ranking: [
    'geo',
    'typo',
    'words',
    'filters',
    'proximity',
    'attribute',
    'exact',
    'desc(experience.yearsActive)'
  ]
};
```

## 🔧 Implementation Details

### Client Configuration

```typescript
// src/lib/algolia.ts
import { algoliasearch } from 'algoliasearch';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

export const EDITORS_INDEX = 'editors_index';
```

### Search Implementation

```typescript
export async function searchEditors(filters: SearchFilters): Promise<SearchResult> {
  const searchParams = {
    hitsPerPage: 20,
    attributesToRetrieve: ['*'],
    attributesToHighlight: ['name', 'experience.specialties'],
    facets: [
      'experience.specialties',
      'professional.unionStatus',
      'location.state',
      'location.remote',
      'metadata.verified'
    ],
    filters: buildAlgoliaFilters(filters),
    numericFilters: buildNumericFilters(filters)
  };

  const response = await client.search({
    requests: [{
      indexName: EDITORS_INDEX,
      query: filters.query || '',
      ...searchParams
    }]
  });

  return transformAlgoliaResponse(response);
}
```

### Data Synchronization

```typescript
export async function syncEditorToAlgolia(editor: Editor): Promise<boolean> {
  try {
    const algoliaRecord = {
      objectID: editor.id,
      ...editor,
      // Flatten nested objects for better searchability
      'experience.yearsActive': editor.experience.yearsActive,
      'experience.specialties': editor.experience.specialties,
      'location.city': editor.location.city,
      'location.state': editor.location.state,
      'location.remote': editor.location.remote,
      'professional.unionStatus': editor.professional.unionStatus,
      'metadata.verified': editor.metadata.verified,
      'metadata.confidenceScore': editor.metadata.confidenceScore,
      
      // Convert dates to timestamps for sorting
      'metadata.createdAt': editor.metadata.createdAt.getTime(),
      'metadata.updatedAt': editor.metadata.updatedAt.getTime()
    };

    await client.saveObjects({
      indexName: EDITORS_INDEX,
      objects: [algoliaRecord]
    });

    return true;
  } catch (error) {
    console.error('Algolia sync failed:', error);
    return false;
  }
}
```

## 🎯 Search Features Implementation

### 1. Text Search with Highlighting

```typescript
// API endpoint: /api/editors?q=maria
const textSearchResults = await searchEditors({
  query: 'maria',
  // ... other filters
});

// Results include highlighting
textSearchResults.editors.forEach(editor => {
  console.log(editor._highlightResult.name.value); // <mark>Maria</mark> Gonzales
});
```

### 2. Faceted Filtering

```typescript
// API endpoint: /api/editors?genres=Drama,Action&unionStatus=guild
const facetedResults = await searchEditors({
  genres: ['Drama', 'Action'],
  unionStatus: ['guild'],
  // ... other filters
});

// Facet counts available
console.log(facetedResults.facets);
// {
//   genres: { "Drama": 45, "Action": 23, "Comedy": 12 },
//   unionStatus: { "guild": 89, "non-union": 34 }
// }
```

### 3. Geographic Search

```typescript
// API endpoint: /api/editors?remoteOnly=true
const remoteResults = await searchEditors({
  location: {
    remoteOnly: true
  }
});

// For geo-radius search (future enhancement)
const geoParams = {
  aroundLatLng: '34.0522,-118.2437', // Los Angeles
  aroundRadius: 50000 // 50km radius
};
```

### 4. Experience Range Filtering

```typescript
// API endpoint: /api/editors?minExperience=5&maxExperience=15
const experienceResults = await searchEditors({
  experienceRange: {
    min: 5,
    max: 15
  }
});
```

## 📊 Analytics & Insights

### Click Tracking

```typescript
// Track user interactions
import { insights } from 'search-insights';

insights('init', {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!,
});

// Track clicks
insights('clickedObjectIDsAfterSearch', {
  index: EDITORS_INDEX,
  eventName: 'Editor Profile Clicked',
  queryID: searchResponse.queryID,
  objectIDs: [editor.id],
  positions: [1]
});
```

### Conversion Tracking

```typescript
// Track when users contact editors
insights('convertedObjectIDsAfterSearch', {
  index: EDITORS_INDEX,
  eventName: 'Editor Contacted',
  queryID: searchResponse.queryID,
  objectIDs: [editor.id]
});
```

## 🔒 Security Configuration

### API Key Restrictions

```javascript
// Search Key restrictions (applied in Algolia dashboard)
{
  "validUntil": null,
  "maxQueriesPerIPPerHour": 1000,
  "maxHitsPerQuery": 100,
  "indexes": ["editors_index"],
  "referers": ["https://yourdomain.com/*", "http://localhost:3000/*"],
  "queryParameters": {
    "typoTolerance": "true",
    "allowTyposOnNumericTokens": "false",
    "hitsPerPage": "20"
  }
}
```

### Rate Limiting

```typescript
// Implement client-side rate limiting
const searchWithRateLimit = rateLimit(searchEditors, {
  interval: 1000, // 1 second
  uniqueTokenPerInterval: 100 // Max 100 unique searches per second
});
```

## 🧪 Testing & Quality Assurance

### Connection Testing

```typescript
export async function testAlgoliaConnection(): Promise<boolean> {
  try {
    await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 1
      }]
    });
    return true;
  } catch (error) {
    console.error('Algolia connection failed:', error);
    return false;
  }
}
```

### Data Quality Validation

```typescript
export async function validateIndexData(): Promise<ValidationReport> {
  const response = await client.browse({
    indexName: EDITORS_INDEX
  });

  const issues: string[] = [];
  
  response.hits.forEach((hit: any) => {
    // Validate required fields
    if (!hit.name) issues.push(`Missing name for ${hit.objectID}`);
    if (!hit.experience?.specialties?.length) {
      issues.push(`Missing specialties for ${hit.objectID}`);
    }
    
    // Validate data types
    if (typeof hit.experience?.yearsActive !== 'number') {
      issues.push(`Invalid yearsActive for ${hit.objectID}`);
    }
  });

  return {
    totalRecords: response.hits.length,
    issues,
    isValid: issues.length === 0
  };
}
```

## 🚀 Performance Optimization

### Search Performance

```typescript
// Optimize search parameters for speed
const optimizedSearchParams = {
  hitsPerPage: 20,              // Reasonable page size
  attributesToRetrieve: [       // Only fetch needed fields
    'objectID',
    'name',
    'experience.specialties',
    'location',
    'metadata.verified'
  ],
  getRankingInfo: false,        // Disable ranking info unless needed
  analytics: true,              // Enable for insights
  clickAnalytics: true,         // Track user interactions
  enablePersonalization: false  // Disable if not using personalization
};
```

### Caching Strategy

```typescript
// Implement search result caching
const searchCache = new Map();

export async function cachedSearch(filters: SearchFilters): Promise<SearchResult> {
  const cacheKey = JSON.stringify(filters);
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }
  
  const result = await searchEditors(filters);
  
  // Cache for 5 minutes
  searchCache.set(cacheKey, result);
  setTimeout(() => searchCache.delete(cacheKey), 5 * 60 * 1000);
  
  return result;
}
```

## 🔄 Data Synchronization Strategy

### Real-time Sync

```typescript
// Firebase function to sync on editor updates
export const syncEditorOnUpdate = functions.firestore
  .document('editors/{editorId}')
  .onWrite(async (change, context) => {
    const editorId = context.params.editorId;
    
    if (change.after.exists) {
      // Update or create in Algolia
      const editorData = change.after.data() as Editor;
      await syncEditorToAlgolia({ id: editorId, ...editorData });
    } else {
      // Delete from Algolia
      await client.deleteObjects({
        indexName: EDITORS_INDEX,
        objectIDs: [editorId]
      });
    }
  });
```

### Batch Synchronization

```typescript
export async function batchSyncToAlgolia(): Promise<SyncReport> {
  const editorsSnapshot = await getDocs(collection(db, 'editors'));
  const records: any[] = [];
  
  editorsSnapshot.forEach((doc) => {
    const editor = { id: doc.id, ...doc.data() } as Editor;
    records.push(transformForAlgolia(editor));
  });
  
  // Process in batches of 1000 (Algolia limit)
  const batchSize = 1000;
  const results = [];
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const result = await client.saveObjects({
      indexName: EDITORS_INDEX,
      objects: batch
    });
    results.push(result);
  }
  
  return {
    totalSynced: records.length,
    batches: results.length,
    success: true
  };
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Index Not Found Error
```typescript
// Ensure index exists before searching
try {
  await client.getSettings({ indexName: EDITORS_INDEX });
} catch (error) {
  console.error('Index does not exist, creating...');
  await initializeIndex();
}
```

#### 2. Search Returning No Results
```typescript
// Debug search parameters
console.log('Search filters:', filters);
console.log('Algolia query:', searchParams);

// Check index statistics
const stats = await client.getSettings({ indexName: EDITORS_INDEX });
console.log('Index settings:', stats);
```

#### 3. Facet Values Not Appearing
```javascript
// Ensure attributes are configured for faceting
{
  "attributesForFaceting": [
    "filterOnly(experience.specialties)", // Correct
    "experience.specialties"              // Also searchable
  ]
}
```

### Monitoring & Alerts

```typescript
// Set up error monitoring
export function setupAlgoliaMonitoring() {
  client.on('error', (error: any) => {
    console.error('Algolia error:', error);
    // Send to monitoring service (Sentry, DataDog, etc.)
  });
  
  client.on('retry', (request: any) => {
    console.warn('Algolia retry:', request);
    // Log retry attempts
  });
}
```

## 📈 Advanced Features

### A/B Testing Setup

```typescript
// Implement search A/B testing
export async function performABTest(
  query: string,
  controlSettings: any,
  variantSettings: any
): Promise<ABTestResult> {
  const isVariant = Math.random() > 0.5;
  
  const searchParams = isVariant ? variantSettings : controlSettings;
  const result = await searchEditors({ query, ...searchParams });
  
  // Track which variant was used
  analytics.track('Search AB Test', {
    variant: isVariant ? 'B' : 'A',
    query,
    resultCount: result.totalCount
  });
  
  return { ...result, variant: isVariant ? 'B' : 'A' };
}
```

### Personalization

```typescript
// Enable personalization based on user behavior
export async function personalizedSearch(
  filters: SearchFilters,
  userProfile: UserProfile
): Promise<SearchResult> {
  const personalizationParams = {
    userToken: userProfile.id,
    enablePersonalization: true,
    personalizationFilters: [
      `experience.specialties:${userProfile.preferredGenres.join(' OR ')}`
    ]
  };
  
  return searchEditors({ ...filters, ...personalizationParams });
}
```

## 🎓 Best Practices Summary

1. **Index Design**: Keep records flat and searchable
2. **Performance**: Use appropriate pagination and caching
3. **Security**: Restrict API keys and implement rate limiting
4. **Analytics**: Track user interactions for optimization
5. **Testing**: Validate search quality regularly
6. **Monitoring**: Set up alerts for search failures
7. **Documentation**: Keep search behavior documented

## 📚 Additional Resources

- [Algolia Documentation](https://www.algolia.com/doc/)
- [Search UI Patterns](https://www.algolia.com/doc/guides/building-search-ui/)
- [Performance Best Practices](https://www.algolia.com/doc/guides/scaling/)
- [Security Guidelines](https://www.algolia.com/doc/guides/security/)

---

*For support with Algolia integration, check the main README or create an issue.* 