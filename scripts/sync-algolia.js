#!/usr/bin/env node

/**
 * Algolia Data Sync Script
 * 
 * Syncs editor data from Firebase Firestore to Algolia search index
 * 
 * Usage:
 *   node scripts/sync-algolia.js
 *   node scripts/sync-algolia.js --clear-first  # Clear index before sync
 *   node scripts/sync-algolia.js --test-only    # Test connection only
 */

const admin = require('firebase-admin');
const { algoliasearch } = require('algoliasearch');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || 
                           path.join(__dirname, '../serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin SDK initialized with default credentials');
  } catch (fallbackError) {
    console.error('❌ Failed to initialize Firebase Admin SDK');
    console.error('Make sure you have proper credentials configured');
    process.exit(1);
  }
}

// Initialize Algolia (using Admin API key for write operations)
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID || 'V0KR3LXR6K', 
  process.env.ALGOLIA_ADMIN_KEY || '9a28b30f46a25c06117cd4479a1b2514'
);
const EDITORS_INDEX = 'editors_index';

/**
 * Test Algolia connection
 */
async function testAlgoliaConnection() {
  try {
    console.log('🔍 Testing Algolia connection...');
    
    const response = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 1
      }]
    });
    
    console.log('✅ Algolia connection successful');
    console.log(`📊 Index "${EDITORS_INDEX}" has ${response.results[0]?.nbHits || 0} records`);
    return true;
  } catch (error) {
    console.error('❌ Algolia connection failed:', error.message);
    return false;
  }
}

/**
 * Clear Algolia index
 */
async function clearAlgoliaIndex() {
  try {
    console.log('🗑️ Clearing Algolia index...');
    await client.clearObjects({ indexName: EDITORS_INDEX });
    console.log('✅ Algolia index cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear Algolia index:', error.message);
    return false;
  }
}

/**
 * Configure Algolia index settings
 */
async function configureAlgoliaIndex() {
  try {
    console.log('⚙️ Configuring Algolia index settings...');
    
    await client.setSettings({
      indexName: EDITORS_INDEX,
      indexSettings: {
        // Searchable attributes (what users can search)
        searchableAttributes: [
          'name',
          'experience.specialties',
          'location.city',
          'location.state'
        ],
        
        // Attributes for faceting (filters)
        attributesForFaceting: [
          'experience.specialties',
          'professional.unionStatus',
          'location.state',
          'location.remote',
          'metadata.verified'
        ],
        
        // Custom ranking for relevance
        customRanking: [
          'desc(experience.yearsActive)',
          'desc(metadata.verified)'
        ],
        
        // Highlighting
        attributesToHighlight: [
          'name',
          'experience.specialties'
        ],
        
        // Snippet
        attributesToSnippet: [
          'name:10'
        ],
        
        // Pagination
        hitsPerPage: 20,
        maxValuesPerFacet: 100,
        
        // Typo tolerance
        typoTolerance: true,
        minWordSizefor1Typo: 4,
        minWordSizefor2Typos: 8
      }
    });
    
    console.log('✅ Algolia index configured');
    return true;
  } catch (error) {
    console.error('❌ Failed to configure Algolia index:', error.message);
    return false;
  }
}

/**
 * Fetch all editors from Firestore
 */
async function fetchEditorsFromFirestore() {
  try {
    console.log('📥 Fetching editors from Firestore...');
    
    const db = admin.firestore();
    const editorsSnapshot = await db.collection('editors').get();
    
    if (editorsSnapshot.empty) {
      console.log('⚠️ No editors found in Firestore');
      return [];
    }
    
    const editors = [];
    
    for (const doc of editorsSnapshot.docs) {
      const editorData = { id: doc.id, ...doc.data() };
      
      // Fetch credits for this editor
      const creditsSnapshot = await db.collection('editors').doc(doc.id).collection('credits').get();
      const credits = creditsSnapshot.docs.map(creditDoc => ({ id: creditDoc.id, ...creditDoc.data() }));
      
      // Fetch awards for this editor
      const awardsSnapshot = await db.collection('editors').doc(doc.id).collection('awards').get();
      const awards = awardsSnapshot.docs.map(awardDoc => ({ id: awardDoc.id, ...awardDoc.data() }));
      
      // Prepare editor for Algolia
      const algoliaEditor = {
        objectID: doc.id,
        name: editorData.name,
        email: editorData.email,
        phone: editorData.phone,
        location: editorData.location,
        experience: editorData.experience,
        professional: editorData.professional,
        metadata: {
          ...editorData.metadata,
          // Convert Firestore timestamps to ISO strings
          createdAt: editorData.metadata?.createdAt?.toDate ? 
                     editorData.metadata.createdAt.toDate().toISOString() : 
                     new Date().toISOString(),
          updatedAt: editorData.metadata?.updatedAt?.toDate ? 
                     editorData.metadata.updatedAt.toDate().toISOString() : 
                     new Date().toISOString()
        },
        // Add aggregated data for better search
        creditsCount: credits.length,
        awardsCount: awards.length,
        networks: [...new Set(credits.map(c => c.show?.network).filter(Boolean))],
        genres: [...new Set(credits.flatMap(c => c.show?.genre || []))],
        hasAwards: awards.length > 0
      };
      
      editors.push(algoliaEditor);
    }
    
    console.log(`✅ Fetched ${editors.length} editors from Firestore`);
    return editors;
    
  } catch (error) {
    console.error('❌ Failed to fetch editors from Firestore:', error.message);
    return [];
  }
}

/**
 * Sync editors to Algolia
 */
async function syncEditorsToAlgolia(editors) {
  try {
    console.log(`📤 Syncing ${editors.length} editors to Algolia...`);
    
    if (editors.length === 0) {
      console.log('⚠️ No editors to sync');
      return true;
    }
    
    // Save objects to Algolia in batches
    const batchSize = 100;
    let syncedCount = 0;
    
    for (let i = 0; i < editors.length; i += batchSize) {
      const batch = editors.slice(i, i + batchSize);
      
      await client.saveObjects({
        indexName: EDITORS_INDEX,
        objects: batch
      });
      
      syncedCount += batch.length;
      console.log(`📤 Synced ${syncedCount}/${editors.length} editors...`);
    }
    
    console.log('✅ All editors synced to Algolia successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to sync editors to Algolia:', error.message);
    return false;
  }
}

/**
 * Main sync function
 */
async function syncData(options = {}) {
  console.log('🚀 Starting Algolia sync process...\n');
  
  try {
    // Test connection first
    const connected = await testAlgoliaConnection();
    if (!connected) {
      process.exit(1);
    }
    
    if (options.testOnly) {
      console.log('\n✅ Test completed successfully');
      return;
    }
    
    // Clear index if requested
    if (options.clearFirst) {
      await clearAlgoliaIndex();
    }
    
    // Configure index
    await configureAlgoliaIndex();
    
    // Fetch editors from Firestore
    const editors = await fetchEditorsFromFirestore();
    
    // Sync to Algolia
    await syncEditorsToAlgolia(editors);
    
    // Final test
    console.log('\n🔍 Testing search after sync...');
    const testResponse = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 5
      }]
    });
    
    const result = testResponse.results[0];
    console.log(`✅ Search test successful: ${result.nbHits} total records`);
    console.log(`📋 Sample records: ${result.hits.map(h => h.name).join(', ')}`);
    
    console.log('\n🎉 Algolia sync completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Sync process failed:', error.message);
    process.exit(1);
  }
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('🔍 TV Editor Finder - Algolia Sync Script\n');
  console.log('Usage:');
  console.log('  node scripts/sync-algolia.js              # Sync all data');
  console.log('  node scripts/sync-algolia.js --clear-first # Clear index before sync');
  console.log('  node scripts/sync-algolia.js --test-only   # Test connection only');
  console.log('  node scripts/sync-algolia.js --help        # Show this help');
  console.log('\nEnvironment Variables:');
  console.log('  FIREBASE_SERVICE_ACCOUNT_KEY_PATH - Path to service account JSON file');
  console.log('  NEXT_PUBLIC_FIREBASE_PROJECT_ID   - Firebase project ID');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    showUsage();
    process.exit(0);
  }
  
  const options = {
    clearFirst: args.includes('--clear-first'),
    testOnly: args.includes('--test-only')
  };
  
  try {
    await syncData(options);
    console.log('\n✅ Operation completed successfully');
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    try {
      await admin.app().delete();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  syncData,
  testAlgoliaConnection,
  configureAlgoliaIndex
}; 