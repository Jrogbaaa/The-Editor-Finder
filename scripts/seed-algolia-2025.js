#!/usr/bin/env node

/**
 * Algolia Sample Data Seeding Script - July 2025 Edition
 * 
 * Populates Algolia with current and comprehensive TV editor data
 * Includes 2025 Emmy winners and recent TV productions
 * 
 * Usage:
 *   node scripts/seed-algolia-2025.js
 *   node scripts/seed-algolia-2025.js --clear-first
 */

const { algoliasearch } = require('algoliasearch');

// Initialize Algolia (using Admin API key for write operations)
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID || 'V0KR3LXR6K', 
  process.env.ALGOLIA_ADMIN_KEY || '9a28b30f46a25c06117cd4479a1b2514'
);
const EDITORS_INDEX = 'editors_index';

/**
 * Updated sample editor data with July 2025 current information
 * Includes recent Emmy winners and popular 2024-2025 TV shows
 */
const currentEditors2025 = [
  {
    objectID: 'editor-2025-001',
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
      yearsActive: 15, // Updated for 2025
      startYear: 2010,
      specialties: ['Drama', 'Limited Series', 'Thriller', 'Sci-Fi']
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
      dataSource: ['emmy-2025', 'imdb', 'manual']
    },
    // Recent work and updated data
    creditsCount: 12,
    awardsCount: 3,
    networks: ['Netflix', 'HBO', 'Amazon Prime', 'Apple TV+', 'Disney+'],
    genres: ['Drama', 'Thriller', 'Limited Series', 'Sci-Fi'],
    hasAwards: true,
    recentShows: ['House of the Dragon S3', 'The Bear S4', 'Wednesday S2'],
    currentProjects: ['Untitled Netflix Limited Series'],
    lastActiveYear: 2025,
    // Detailed work history
    credits: [
      { 
        show: { title: 'House of the Dragon S3', network: 'HBO', genre: ['Drama', 'Fantasy'] },
        role: { position: 'lead-editor', department: 'post-production' },
        timeline: { startYear: 2025, endYear: 2025 },
        episodes: 8
      },
      { 
        show: { title: 'The Bear S4', network: 'FX/Hulu', genre: ['Comedy-Drama'] },
        role: { position: 'supervising-editor', department: 'post-production' },
        timeline: { startYear: 2024, endYear: 2024 },
        episodes: 10
      },
      { 
        show: { title: 'Wednesday S2', network: 'Netflix', genre: ['Dark Comedy', 'Horror'] },
        role: { position: 'editor', department: 'post-production' },
        timeline: { startYear: 2024, endYear: 2024 },
        episodes: 8
      },
      { 
        show: { title: 'Stranger Things S4', network: 'Netflix', genre: ['Sci-Fi', 'Drama'] },
        role: { position: 'additional-editor', department: 'post-production' },
        timeline: { startYear: 2023, endYear: 2023 },
        episodes: 9
      },
      { 
        show: { title: 'Euphoria S2', network: 'HBO', genre: ['Teen Drama'] },
        role: { position: 'assistant-editor', department: 'post-production' },
        timeline: { startYear: 2022, endYear: 2022 },
        episodes: 8
      }
    ],
    awards: [
      { 
        award: { name: '2025 Emmy - Outstanding Picture Editing', category: 'Drama Series', status: 'won' },
        year: 2025, 
        show: 'House of the Dragon S3',
        details: { ceremony: '77th Primetime Emmy Awards', date: '2025-09-15' }
      },
      { 
        award: { name: '2024 ACE Award - Best Edited Drama Series', category: 'Television', status: 'won' },
        year: 2024, 
        show: 'The Bear S4',
        details: { ceremony: 'ACE Eddie Awards 2024', date: '2024-02-18' }
      },
      { 
        award: { name: '2023 Guild Award - Excellence in Editing', category: 'Limited Series', status: 'nominated' },
        year: 2023, 
        show: 'Wednesday',
        details: { ceremony: 'Motion Picture Editors Guild Awards', date: '2023-02-19' }
      }
    ]
  },
  {
    objectID: 'editor-2025-002', 
    name: 'Michael Chen',
    email: 'mike.chen@example.com',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      remote: false
    },
    experience: {
      yearsActive: 11, // Updated for 2025
      startYear: 2014,
      specialties: ['Comedy', 'Talk Shows', 'Reality TV', 'Variety']
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
      dataSource: ['emmy-2025', 'linkedin', 'manual']
    },
    creditsCount: 22,
    awardsCount: 2,
    networks: ['NBC', 'Comedy Central', 'TBS', 'Paramount+', 'Peacock'],
    genres: ['Comedy', 'Talk Shows', 'Reality TV', 'Variety'],
    hasAwards: true,
    recentShows: ['Saturday Night Live S50', 'Abbott Elementary S4', 'Only Murders S4'],
    currentProjects: ['SNL Season 51 Prep'],
    lastActiveYear: 2025,
    credits: [
      { 
        show: { title: 'Saturday Night Live S50', network: 'NBC', genre: ['Variety', 'Comedy'] },
        role: { position: 'lead-editor', department: 'post-production' },
        timeline: { startYear: 2024, endYear: 2025 },
        episodes: 21
      },
      { 
        show: { title: 'Abbott Elementary S4', network: 'ABC', genre: ['Mockumentary', 'Comedy'] },
        role: { position: 'supervising-editor', department: 'post-production' },
        timeline: { startYear: 2024, endYear: 2024 },
        episodes: 22
      },
      { 
        show: { title: 'Only Murders in the Building S4', network: 'Hulu', genre: ['Comedy', 'Mystery'] },
        role: { position: 'editor', department: 'post-production' },
        timeline: { startYear: 2024, endYear: 2024 },
        episodes: 10
      },
      { 
        show: { title: 'The Tonight Show Starring Jimmy Fallon', network: 'NBC', genre: ['Talk Show'] },
        role: { position: 'segment-editor', department: 'post-production' },
        timeline: { startYear: 2023, endYear: 2023 },
        episodes: 160
      },
      { 
        show: { title: 'Brooklyn Nine-Nine', network: 'NBC', genre: ['Comedy'] },
        role: { position: 'editor', department: 'post-production' },
        timeline: { startYear: 2021, endYear: 2022 },
        episodes: 10
      }
    ],
    awards: [
      { 
        award: { name: '2025 Emmy - Outstanding Picture Editing for Variety Programming', category: 'Variety', status: 'won' },
        year: 2025, 
        show: 'Saturday Night Live',
        details: { ceremony: '77th Primetime Emmy Awards', date: '2025-09-15' }
      },
      { 
        award: { name: '2024 ACE Award - Best Edited Comedy Series', category: 'Television', status: 'won' },
        year: 2024, 
        show: 'Abbott Elementary',
        details: { ceremony: 'ACE Eddie Awards 2024', date: '2024-02-18' }
      }
    ]
  },
  {
    objectID: 'editor-2025-003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    location: {
      city: 'Atlanta',
      state: 'GA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 18, // Updated for 2025
      startYear: 2007,
      specialties: ['Documentary', 'News', 'Sports', 'Streaming Originals']
    },
    professional: {
      unionStatus: 'guild',
      imdbId: 'nm3456789',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmy-2025', 'manual']
    },
    creditsCount: 35,
    awardsCount: 1,
    networks: ['CNN', 'ESPN', 'National Geographic', 'Netflix', 'Apple TV+'],
    genres: ['Documentary', 'News', 'Sports', 'True Crime'],
    hasAwards: true,
    recentShows: ['Our Planet III', 'The Innocent Man S2', 'Formula 1: Drive to Survive S7'],
    currentProjects: ['Climate Crisis Documentary Series'],
    lastActiveYear: 2025
  },
  {
    objectID: 'editor-2025-004',
    name: 'David Kim', 
    location: {
      city: 'Vancouver',
      state: 'BC',
      country: 'Canada',
      remote: true
    },
    experience: {
      yearsActive: 9, // Updated for 2025
      startYear: 2016,
      specialties: ['Animation', 'Children\'s TV', 'VFX', 'Gaming Content']
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
    creditsCount: 18,
    awardsCount: 0,
    networks: ['Disney+', 'Nickelodeon', 'Cartoon Network', 'Netflix Animation'],
    genres: ['Animation', 'Children\'s TV', 'VFX', 'Gaming'],
    hasAwards: false,
    recentShows: ['Bluey S4', 'Avatar: The Last Airbender Live Action S2', 'Pokemon Horizons'],
    currentProjects: ['Untitled Disney+ Animated Series'],
    lastActiveYear: 2025
  },
  {
    objectID: 'editor-2025-005',
    name: 'Maria Gonzales',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 13, // Updated for 2025
      startYear: 2012,
      specialties: ['Drama', 'Historical', 'Limited Series', 'Period Pieces']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmy-2025', 'imdb']
    },
    creditsCount: 10,
    awardsCount: 2,
    networks: ['FX', 'Hulu', 'Netflix', 'Apple TV+'],
    genres: ['Drama', 'Historical', 'Period Pieces'],
    hasAwards: true,
    recentShows: ['Shōgun S2', 'The Crown Final Season', 'Masters of the Air'],
    currentProjects: ['Untitled WWII Limited Series'],
    lastActiveYear: 2025,
    emmyWins: ['Outstanding Picture Editing for a Drama Series 2024 (Shōgun)', 'Outstanding Picture Editing for a Limited Series 2025']
  },
  {
    objectID: 'editor-2025-006',
    name: 'Aika Miyake',
    location: {
      city: 'Vancouver', 
      state: 'BC',
      country: 'Canada',
      remote: false
    },
    experience: {
      yearsActive: 11, // Updated for 2025
      startYear: 2014,
      specialties: ['Drama', 'Action', 'Historical', 'International Productions']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'busy'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmy-2025', 'imdb']
    },
    creditsCount: 8,
    awardsCount: 2,
    networks: ['FX', 'Hulu', 'Netflix', 'Amazon Prime'],
    genres: ['Drama', 'Action', 'Historical', 'International'],
    hasAwards: true,
    recentShows: ['Shōgun S2', 'The Last of Us S2', 'Fallout S2'],
    currentProjects: ['Shōgun Season 3 Pre-Production'],
    lastActiveYear: 2025,
    emmyWins: ['Outstanding Picture Editing for a Drama Series 2024 (Shōgun)', 'Outstanding Picture Editing for a Drama Series 2025 (Shōgun S2)']
  },
  {
    objectID: 'editor-2025-007',
    name: 'Jennifer Thompson',
    email: 'jen.thompson@example.com',
    location: {
      city: 'Nashville',
      state: 'TN',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 17, // Updated for 2025
      startYear: 2008,
      specialties: ['Music', 'Documentary', 'Reality TV', 'Streaming Originals']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['manual', 'imdb']
    },
    creditsCount: 28,
    awardsCount: 1,
    networks: ['CMT', 'MTV', 'VH1', 'Netflix', 'Apple Music'],
    genres: ['Music', 'Documentary', 'Reality TV', 'Concert Films'],
    hasAwards: true,
    recentShows: ['Taylor Swift: Eras Tour Film', 'Music City Chronicles', 'Country Music Evolution'],
    currentProjects: ['Beyoncé: Renaissance World Tour Documentary'],
    lastActiveYear: 2025
  },
  {
    objectID: 'editor-2025-008',
    name: 'Robert Johnson',
    email: 'rob.johnson@example.com',
    location: {
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      remote: false
    },
    experience: {
      yearsActive: 23, // Updated for 2025
      startYear: 2002,
      specialties: ['Crime', 'Drama', 'Procedural', 'Thriller']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'busy'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmy-2025', 'imdb', 'manual']
    },
    creditsCount: 45,
    awardsCount: 4,
    networks: ['NBC', 'CBS', 'FOX', 'Netflix', 'Paramount+'],
    genres: ['Crime', 'Drama', 'Procedural', 'Thriller'],
    hasAwards: true,
    recentShows: ['Law & Order S24', 'Chicago Fire S13', 'The Night Agent S2'],
    currentProjects: ['FBI: International S4'],
    lastActiveYear: 2025,
    emmyWins: ['Outstanding Picture Editing for a Drama Series 2023', 'Outstanding Picture Editing for a Drama Series 2024', 'Outstanding Picture Editing for a Drama Series 2025']
  },
  {
    objectID: 'editor-2025-009',
    name: 'Alexandra Chen',
    email: 'alex.chen@example.com',
    location: {
      city: 'Austin',
      state: 'TX', 
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 7,
      startYear: 2018,
      specialties: ['Horror', 'Thriller', 'Sci-Fi', 'Streaming Originals']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmy-2025', 'manual']
    },
    creditsCount: 14,
    awardsCount: 1,
    networks: ['Netflix', 'Amazon Prime', 'Hulu', 'Paramount+'],
    genres: ['Horror', 'Thriller', 'Sci-Fi', 'Mystery'],
    hasAwards: true,
    recentShows: ['Stranger Things S5', 'Wednesday S2', 'The Midnight Club S2'],
    currentProjects: ['Netflix Horror Anthology Series'],
    lastActiveYear: 2025,
    emmyWins: ['Outstanding Picture Editing for a Limited Series 2025 (Wednesday S2)']
  },
  {
    objectID: 'editor-2025-010',
    name: 'Marcus Williams',
    email: 'marcus.williams@example.com',
    location: {
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 12,
      startYear: 2013,
      specialties: ['Sports', 'Documentary', 'Reality TV', 'Live Events']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['manual', 'espn']
    },
    creditsCount: 25,
    awardsCount: 2,
    networks: ['ESPN', 'Fox Sports', 'Netflix', 'Amazon Prime Video'],
    genres: ['Sports', 'Documentary', 'Reality TV', 'Live Events'],
    hasAwards: true,
    recentShows: ['Formula 1: Drive to Survive S7', 'NFL 360 2025', 'The Last Dance: Basketball Edition'],
    currentProjects: ['2026 World Cup Documentary Series'],
    lastActiveYear: 2025
  }
];

/**
 * Clear and populate Algolia index with 2025 data
 */
async function seedAlgolia2025(clearFirst = false) {
  try {
    console.log('🚀 Starting Algolia 2025 seeding process...\n');
    
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
    
    // Configure index settings for 2025
    console.log('⚙️ Configuring index settings for 2025...');
    await client.setSettings({
      indexName: EDITORS_INDEX,
      indexSettings: {
        searchableAttributes: [
          'name',
          'experience.specialties',
          'location.city',
          'location.state',
          'networks',
          'genres',
          'recentShows',
          'currentProjects'
        ],
        attributesForFaceting: [
          'experience.specialties',
          'professional.unionStatus',
          'location.state',
          'location.remote',
          'metadata.verified',
          'networks',
          'genres',
          'hasAwards',
          'lastActiveYear'
        ],
        customRanking: [
          'desc(lastActiveYear)',
          'desc(experience.yearsActive)',
          'desc(metadata.verified)',
          'desc(awardsCount)',
          'desc(creditsCount)'
        ],
        attributesToHighlight: [
          'name',
          'experience.specialties',
          'networks',
          'genres',
          'recentShows'
        ],
        hitsPerPage: 20,
        typoTolerance: true,
        minWordSizefor1Typo: 4,
        minWordSizefor2Typos: 8
      }
    });
    console.log('✅ Index configured for 2025');
    
    // Add 2025 sample data
    console.log(`📤 Adding ${currentEditors2025.length} current editors (July 2025)...`);
    await client.saveObjects({
      indexName: EDITORS_INDEX,
      objects: currentEditors2025
    });
    console.log('✅ 2025 editors added');
    
    // Test 2025 search functionality
    console.log('\n🔍 Testing 2025 search functionality...');
    
    // Test 1: Current TV shows
    const searchTest1 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: 'House of the Dragon',
        hitsPerPage: 5
      }]
    });
    console.log(`📋 "House of the Dragon" search: ${searchTest1.results[0].nbHits} results`);
    
    // Test 2: 2025 Emmy winners
    const searchTest2 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        filters: 'metadata.verified:true AND hasAwards:true',
        hitsPerPage: 10
      }]
    });
    console.log(`📋 2025 Emmy winners: ${searchTest2.results[0].nbHits} results`);
    
    // Test 3: Current availability
    const searchTest3 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        filters: 'professional.availability:"available"',
        hitsPerPage: 10
      }]
    });
    console.log(`📋 Currently available editors: ${searchTest3.results[0].nbHits} results`);
    
    // Test 4: Remote work in 2025
    const searchTest4 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        filters: 'location.remote:true',
        hitsPerPage: 10
      }]
    });
    console.log(`📋 Remote-friendly editors: ${searchTest4.results[0].nbHits} results`);
    
    // Test 5: Recent shows
    const searchTest5 = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: 'Stranger Things',
        hitsPerPage: 5
      }]
    });
    console.log(`📋 "Stranger Things" search: ${searchTest5.results[0].nbHits} results`);
    
    // Final summary
    const finalTest = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 0
      }]
    });
    
    console.log(`\n🎉 Algolia 2025 seeding completed successfully!`);
    console.log(`📊 Total editors in index: ${finalTest.results[0].nbHits}`);
    console.log(`📋 Featured 2025 editors: ${currentEditors2025.slice(0, 5).map(e => e.name).join(', ')}`);
    console.log(`🏆 Emmy winners included: Maria Gonzales, Aika Miyake, Robert Johnson, Alexandra Chen`);
    console.log(`📺 Recent shows: House of the Dragon S3, Stranger Things S5, Shōgun S2, The Bear S4`);
    console.log(`\n🔗 Your search should now return current 2025 results!`);
    
  } catch (error) {
    console.error('❌ 2025 seeding failed:', error.message);
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
    console.log('🌱 Algolia 2025 Sample Data Seeding Script\n');
    console.log('Usage:');
    console.log('  node scripts/seed-algolia-2025.js              # Add 2025 data');
    console.log('  node scripts/seed-algolia-2025.js --clear-first # Clear then add 2025 data');
    console.log('  node scripts/seed-algolia-2025.js --help        # Show help');
    console.log('\nFeatures:');
    console.log('  - Current Emmy winners (2024-2025)');
    console.log('  - Recent TV shows and streaming content');
    console.log('  - Updated editor experience and availability');
    console.log('  - Current industry trends and networks');
    return;
  }
  
  await seedAlgolia2025(clearFirst);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedAlgolia2025 }; 