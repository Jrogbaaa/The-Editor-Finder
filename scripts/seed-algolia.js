#!/usr/bin/env node

/**
 * Algolia Sample Data Seeding Script
 * 
 * Populates Algolia with comprehensive sample TV editor data for testing
 * 
 * Usage:
 *   node scripts/seed-algolia.js
 *   node scripts/seed-algolia.js --clear-first
 */

const { algoliasearch } = require('algoliasearch');

// Initialize Algolia
const client = algoliasearch('V0KR3LXR6K', '9a28b30f46a25c06117cd4479a1b2514');
const EDITORS_INDEX = 'editors_index';

/**
 * Comprehensive sample editor data with real TV shows and realistic information
 */
const sampleEditors = [
  {
    objectID: 'editor-1',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@example.com',
    phone: '+1-555-0123',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 12,
      startYear: 2012,
      specialties: ['Drama', 'Limited Series', 'Thriller']
    },
    professional: {
      unionStatus: 'guild',
      imdbId: 'nm1234567',
      availability: 'available',
      representation: {
        agent: 'Creative Artists Agency',
        agentContact: 'agent@caa.com'
      }
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['manual', 'imdb']
    },
    // Aggregated data for search
    creditsCount: 8,
    awardsCount: 2,
    networks: ['Netflix', 'HBO', 'Amazon Prime'],
    genres: ['Drama', 'Thriller', 'Limited Series'],
    hasAwards: true
  },
  {
    objectID: 'editor-2',
    name: 'Michael Chen',
    email: 'mike.chen@example.com',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      remote: false
    },
    experience: {
      yearsActive: 8,
      startYear: 2016,
      specialties: ['Comedy', 'Talk Shows', 'Reality TV']
    },
    professional: {
      unionStatus: 'guild',
      imdbId: 'nm2345678',
      availability: 'busy',
      representation: {
        agent: 'William Morris Endeavor'
      }
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['manual', 'linkedin']
    },
    creditsCount: 15,
    awardsCount: 1,
    networks: ['NBC', 'Comedy Central', 'TBS'],
    genres: ['Comedy', 'Talk Shows', 'Reality TV'],
    hasAwards: true
  },
  {
    objectID: 'editor-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    location: {
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 15,
      startYear: 2009,
      specialties: ['Documentary', 'News', 'Sports']
    },
    professional: {
      unionStatus: 'guild',
      imdbId: 'nm3456789',
      availability: 'available'
    },
    metadata: {
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['manual']
    },
    creditsCount: 22,
    awardsCount: 0,
    networks: ['CNN', 'ESPN', 'National Geographic'],
    genres: ['Documentary', 'News', 'Sports'],
    hasAwards: false
  },
  {
    objectID: 'editor-4',
    name: 'David Kim',
    location: {
      city: 'Vancouver',
      state: 'BC',
      country: 'Canada',
      remote: true
    },
    experience: {
      yearsActive: 6,
      startYear: 2018,
      specialties: ['Animation', 'Children\'s TV', 'VFX']
    },
    professional: {
      unionStatus: 'non-union',
      availability: 'available'
    },
    metadata: {
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['manual']
    },
    creditsCount: 12,
    awardsCount: 0,
    networks: ['Disney+', 'Nickelodeon', 'Cartoon Network'],
    genres: ['Animation', 'Children\'s TV', 'VFX'],
    hasAwards: false
  },
  {
    objectID: 'editor-5',
    name: 'Maria Gonzales',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 10,
      startYear: 2014,
      specialties: ['Drama', 'Historical', 'Limited Series']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmy', 'imdb']
    },
    creditsCount: 6,
    awardsCount: 1,
    networks: ['FX', 'Hulu', 'Netflix'],
    genres: ['Drama', 'Historical'],
    hasAwards: true
  },
  {
    objectID: 'editor-6',
    name: 'Aika Miyake',
    location: {
      city: 'Vancouver',
      state: 'BC',
      country: 'Canada',
      remote: false
    },
    experience: {
      yearsActive: 8,
      startYear: 2016,
      specialties: ['Drama', 'Action', 'Historical']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'busy'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmy', 'imdb']
    },
    creditsCount: 4,
    awardsCount: 1,
    networks: ['FX', 'Hulu'],
    genres: ['Drama', 'Action', 'Historical'],
    hasAwards: true
  },
  {
    objectID: 'editor-7',
    name: 'Jennifer Thompson',
    email: 'jen.thompson@example.com',
    location: {
      city: 'Nashville',
      state: 'TN',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 14,
      startYear: 2010,
      specialties: ['Music', 'Documentary', 'Reality TV']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['manual']
    },
    creditsCount: 18,
    awardsCount: 0,
    networks: ['CMT', 'MTV', 'VH1'],
    genres: ['Music', 'Documentary', 'Reality TV'],
    hasAwards: false
  },
  {
    objectID: 'editor-8',
    name: 'Robert Johnson',
    email: 'rob.johnson@example.com',
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      remote: false
    },
    experience: {
      yearsActive: 20,
      startYear: 2004,
      specialties: ['Crime', 'Drama', 'Procedural']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'busy'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['imdb', 'manual']
    },
    creditsCount: 35,
    awardsCount: 3,
    networks: ['NBC', 'CBS', 'FOX'],
    genres: ['Crime', 'Drama', 'Procedural'],
    hasAwards: true
  }
];

/**
 * Clear and populate Algolia index
 */
async function seedAlgolia(clearFirst = false) {
  try {
    console.log('🚀 Starting Algolia seeding process...\n');
    
    // Test connection
    console.log('🔍 Testing Algolia connection...');
    const testResponse = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 1
      }]
    });
    console.log(`✅ Connected to Algolia - Current records: ${testResponse.results[0]?.nbHits || 0}`);
    
    // Clear index if requested
    if (clearFirst) {
      console.log('🗑️ Clearing existing index...');
      await client.clearObjects({ indexName: EDITORS_INDEX });
      console.log('✅ Index cleared');
    }
    
    // Configure index settings
    console.log('⚙️ Configuring index settings...');
    await client.setSettings({
      indexName: EDITORS_INDEX,
      indexSettings: {
        searchableAttributes: [
          'name',
          'experience.specialties',
          'location.city',
          'location.state',
          'networks',
          'genres'
        ],
        attributesForFaceting: [
          'experience.specialties',
          'professional.unionStatus',
          'location.state',
          'location.remote',
          'metadata.verified',
          'networks',
          'genres',
          'hasAwards'
        ],
        customRanking: [
          'desc(experience.yearsActive)',
          'desc(metadata.verified)',
          'desc(awardsCount)',
          'desc(creditsCount)'
        ],
        attributesToHighlight: [
          'name',
          'experience.specialties',
          'networks',
          'genres'
        ],
        hitsPerPage: 20,
        typoTolerance: true
      }
    });
    console.log('✅ Index configured');
    
    // Add sample data
    console.log(`📤 Adding ${sampleEditors.length} sample editors...`);
    await client.saveObjects({
      indexName: EDITORS_INDEX,
      objects: sampleEditors
    });
    console.log('✅ Sample editors added');
    
    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    
    // Test 1: Basic search
    const searchTest1 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: 'drama',
        hitsPerPage: 5
      }]
    });
    console.log(`📋 Drama search: ${searchTest1.results[0].nbHits} results`);
    
    // Test 2: Location filter
    const searchTest2 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        filters: 'location.state:"CA"',
        hitsPerPage: 5
      }]
    });
    console.log(`📋 California editors: ${searchTest2.results[0].nbHits} results`);
    
    // Test 3: Award winners
    const searchTest3 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        filters: 'metadata.verified:true',
        hitsPerPage: 5
      }]
    });
    console.log(`📋 Verified editors: ${searchTest3.results[0].nbHits} results`);
    
    // Final summary
    const finalTest = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 0
      }]
    });
    
    console.log(`\n🎉 Algolia seeding completed successfully!`);
    console.log(`📊 Total editors in index: ${finalTest.results[0].nbHits}`);
    console.log(`📋 Sample editor names: ${sampleEditors.slice(0, 4).map(e => e.name).join(', ')}`);
    console.log(`\n🔗 Your search should now return more diverse results!`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const clearFirst = args.includes('--clear-first');
  
  if (args.includes('--help')) {
    console.log('🌱 Algolia Sample Data Seeding Script\n');
    console.log('Usage:');
    console.log('  node scripts/seed-algolia.js              # Add sample data');
    console.log('  node scripts/seed-algolia.js --clear-first # Clear then add');
    console.log('  node scripts/seed-algolia.js --help        # Show help');
    return;
  }
  
  await seedAlgolia(clearFirst);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedAlgolia }; 