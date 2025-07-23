#!/usr/bin/env node

/**
 * Add Classic TV Show Editors to Algolia
 * 
 * Adds editors for popular classic shows like The Simpsons, Friends, etc.
 * 
 * Usage:
 *   node scripts/add-classic-shows.js
 */

const { algoliasearch } = require('algoliasearch');

// Initialize Algolia
const client = algoliasearch('V0KR3LXR6K', '9a28b30f46a25c06117cd4479a1b2514');
const EDITORS_INDEX = 'editors_index';

/**
 * Classic TV show editors data
 */
const classicTVEditors = [
  {
    objectID: 'classic-simpsons-001',
    name: 'Neil Affleck',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 25,
      startYear: 1999,
      specialties: ['Animation', 'Comedy', 'Long-form Series']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['industry-research', 'imdb']
    },
    // Aggregated data for search
    creditsCount: 300,
    awardsCount: 0,
    networks: ['FOX', 'Disney+'],
    genres: ['Animation', 'Comedy'],
    hasAwards: false,
    recentShows: ['The Simpsons'],
    currentProjects: ['The Simpsons S36'],
    lastActiveYear: 2025,
    classicShows: ['The Simpsons'] // Adding classic shows field
  },
  {
    objectID: 'classic-simpsons-002',
    name: 'Bob Anderson',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 20,
      startYear: 2004,
      specialties: ['Animation', 'Comedy', 'Post-Production']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['industry-research']
    },
    creditsCount: 200,
    awardsCount: 0,
    networks: ['FOX'],
    genres: ['Animation', 'Comedy'],
    hasAwards: false,
    recentShows: ['The Simpsons'],
    currentProjects: [],
    lastActiveYear: 2024,
    classicShows: ['The Simpsons']
  },
  {
    objectID: 'classic-friends-001',
    name: 'Stephen Prime',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: false
    },
    experience: {
      yearsActive: 30,
      startYear: 1994,
      specialties: ['Comedy', 'Multi-Camera', 'Sitcom']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmys', 'industry-research']
    },
    creditsCount: 50,
    awardsCount: 1,
    networks: ['NBC', 'HBO Max'],
    genres: ['Comedy', 'Sitcom'],
    hasAwards: true,
    recentShows: ['Friends (Re-releases)'],
    currentProjects: [],
    lastActiveYear: 2023,
    classicShows: ['Friends']
  },
  {
    objectID: 'classic-seinfeld-001', 
    name: 'Janet Ashikaga',
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 28,
      startYear: 1996,
      specialties: ['Comedy', 'Sitcom', 'Multi-Camera']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmys', 'industry-research']
    },
    creditsCount: 45,
    awardsCount: 2,
    networks: ['NBC', 'Netflix'],
    genres: ['Comedy', 'Sitcom'],
    hasAwards: true,
    recentShows: ['Seinfeld (Streaming)'],
    currentProjects: [],
    lastActiveYear: 2023,
    classicShows: ['Seinfeld']
  },
  {
    objectID: 'classic-office-001',
    name: 'Dean Holland',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 18,
      startYear: 2006,
      specialties: ['Comedy', 'Mockumentary', 'Single-Camera']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmys', 'industry-research']
    },
    creditsCount: 30,
    awardsCount: 1,
    networks: ['NBC', 'Peacock'],
    genres: ['Comedy', 'Mockumentary'],
    hasAwards: true,
    recentShows: ['The Office (Extended Cuts)'],
    currentProjects: [],
    lastActiveYear: 2024,
    classicShows: ['The Office']
  },
  {
    objectID: 'classic-comedy-001',
    name: 'Michael Jablow',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 22,
      startYear: 2002,
      specialties: ['Comedy', 'Animation', 'Variety']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmys', 'industry-research']
    },
    creditsCount: 100,
    awardsCount: 3,
    networks: ['Comedy Central', 'Adult Swim', 'HBO'],
    genres: ['Comedy', 'Animation', 'Variety'],
    hasAwards: true,
    recentShows: ['South Park', 'Rick and Morty'],
    currentProjects: ['South Park S27'],
    lastActiveYear: 2025,
    classicShows: ['South Park', 'Family Guy']
  },
  {
    objectID: 'classic-drama-001',
    name: 'Hal Craighead',
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      remote: true
    },
    experience: {
      yearsActive: 25,
      startYear: 1999,
      specialties: ['Drama', 'Crime', 'Procedural']
    },
    professional: {
      unionStatus: 'guild',
      availability: 'available'
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['emmys', 'industry-research']
    },
    creditsCount: 80,
    awardsCount: 1,
    networks: ['CBS', 'NBC', 'ABC'],
    genres: ['Drama', 'Crime', 'Procedural'],
    hasAwards: true,
    recentShows: ['CSI: Vegas', 'NCIS'],
    currentProjects: ['CSI: Vegas S4'],
    lastActiveYear: 2025,
    classicShows: ['CSI', 'Law & Order']
  }
];

/**
 * Add classic TV editors to Algolia
 */
async function addClassicShows() {
  try {
    console.log('🎬 Adding classic TV show editors to Algolia...\n');
    
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
    
    // Update index settings to include classic shows
    console.log('⚙️ Updating index settings for classic shows...');
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
          'currentProjects',
          'classicShows' // Add classic shows to searchable attributes
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
          'lastActiveYear',
          'filterOnly(classicShows)'
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
          'recentShows',
          'classicShows'
        ],
        hitsPerPage: 20,
        typoTolerance: true,
        minWordSizefor1Typo: 4,
        minWordSizefor2Typos: 8
      }
    });
    console.log('✅ Index configured for classic shows');
    
    // Add classic show editors
    console.log(`📤 Adding ${classicTVEditors.length} classic TV editors...`);
    await client.saveObjects({
      indexName: EDITORS_INDEX,
      objects: classicTVEditors
    });
    console.log('✅ Classic TV editors added');
    
    // Test classic show searches
    console.log('\n🔍 Testing classic show searches...');
    
    // Test 1: The Simpsons
    const simpsonsTest = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: 'simpsons',
        hitsPerPage: 5
      }]
    });
    console.log(`📺 "simpsons" search: ${simpsonsTest.results[0].nbHits} results`);
    
    // Test 2: Comedy editors
    const comedyTest = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: 'comedy editors',
        hitsPerPage: 5
      }]
    });
    console.log(`😂 "comedy editors" search: ${comedyTest.results[0].nbHits} results`);
    
    // Test 3: Friends
    const friendsTest = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: 'friends',
        hitsPerPage: 5
      }]
    });
    console.log(`👫 "friends" search: ${friendsTest.results[0].nbHits} results`);
    
    // Test 4: Animation
    const animationTest = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: 'animation',
        hitsPerPage: 5
      }]
    });
    console.log(`🎨 "animation" search: ${animationTest.results[0].nbHits} results`);
    
    // Final count
    const finalTest = await client.search({
      requests: [{
        indexName: EDITORS_INDEX,
        query: '',
        hitsPerPage: 0
      }]
    });
    
    console.log(`\n🎉 Classic TV editors added successfully!`);
    console.log(`📊 Total editors in index: ${finalTest.results[0].nbHits}`);
    console.log(`📺 Classic shows added: The Simpsons, Friends, Seinfeld, The Office, South Park`);
    console.log(`👥 New editor names: ${classicTVEditors.slice(0, 3).map(e => e.name).join(', ')}`);
    console.log(`\n🔍 Your searches for classic shows should now return results!`);
    
  } catch (error) {
    console.error('❌ Adding classic shows failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log('🎬 Add Classic TV Show Editors Script\n');
    console.log('Usage:');
    console.log('  node scripts/add-classic-shows.js       # Add classic show editors');
    console.log('  node scripts/add-classic-shows.js --help # Show help');
    console.log('\nAdds editors for:');
    console.log('  • The Simpsons (Animation)');
    console.log('  • Friends (Sitcom)');
    console.log('  • Seinfeld (Comedy)');
    console.log('  • The Office (Mockumentary)');
    console.log('  • South Park (Animation)');
    console.log('  • Classic procedurals (CSI, Law & Order)');
    return;
  }
  
  await addClassicShows();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { addClassicShows }; 