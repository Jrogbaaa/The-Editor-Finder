#!/usr/bin/env node

/**
 * TMDb TV Show Editor Sync Script
 * 
 * Gets real TV show editing credits from The Movie Database (TMDb)
 * This is the best alternative to IMDB for getting editor data
 * 
 * Usage:
 *   node scripts/tmdb-sync.js
 *   node scripts/tmdb-sync.js --popular-shows=20
 *   node scripts/tmdb-sync.js --show-id=1399  # Game of Thrones
 */

require('dotenv/config');
const { algoliasearch } = require('algoliasearch');

// Initialize Algolia
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID || 'V0KR3LXR6K', 
  process.env.ALGOLIA_ADMIN_KEY || '9a28b30f46a25c06117cd4479a1b2514'
);
const EDITORS_INDEX = 'editors_index';

// TMDb API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY required. Get one free at https://www.themoviedb.org/settings/api');
  process.exit(1);
}

/**
 * Get popular TV shows from TMDb
 */
async function getPopularTVShows(pages = 1) {
  const shows = [];
  
  for (let page = 1; page <= pages; page++) {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.status}`);
    }
    
    const data = await response.json();
    shows.push(...data.results);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return shows;
}

/**
 * Get TV show credits (cast and crew) from TMDb
 */
async function getTVCredits(tvId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}/credits?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error(`TMDb credits error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get detailed TV show information
 */
async function getTVShow(tvId) {
  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`
  );
  
  if (!response.ok) {
    throw new Error(`TMDb show error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Extract editors from crew data
 */
function extractEditors(credits) {
  const editorJobs = [
    'Editor',
    'Supervising Editor', 
    'Additional Editor',
    'Assistant Editor',
    'Associate Editor',
    'Online Editor',
    'Offline Editor',
    'Picture Editor'
  ];

  return credits.crew.filter(member => 
    editorJobs.includes(member.job) || 
    member.department === 'Editing'
  );
}

/**
 * Convert TMDb data to Algolia editor format
 */
function convertToAlgoliaEditor(show, editor) {
  return {
    objectID: `tmdb-${editor.id}`,
    name: editor.name,
    experience: {
      yearsActive: Math.max(1, new Date().getFullYear() - 2000), // Estimated
      startYear: 2000, // Estimated
      specialties: show.genres.map(g => g.name)
    },
    professional: {
      unionStatus: 'unknown',
      availability: 'unknown',
      imdbId: show.external_ids?.imdb_id
    },
    location: {
      city: 'Unknown',
      state: 'Unknown',
      country: 'Unknown',
      remote: false
    },
    metadata: {
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSource: ['tmdb']
    },
    // Aggregated data for search
    creditsCount: 1,
    awardsCount: 0,
    networks: show.networks.map(n => n.name),
    genres: show.genres.map(g => g.name),
    hasAwards: false,
    
    // Work history
    credits: [{
      show: {
        title: show.name,
        network: show.networks[0]?.name || 'Unknown',
        genre: show.genres.map(g => g.name)
      },
      role: {
        position: editor.job.toLowerCase().replace(/\s+/g, '-'),
        department: 'post-production'
      },
      timeline: {
        startYear: new Date(show.first_air_date).getFullYear(),
        endYear: show.last_air_date ? new Date(show.last_air_date).getFullYear() : undefined
      },
      episodes: show.number_of_episodes || 1
    }],
    
    // Recent shows
    recentShows: [show.name],
    currentProjects: show.status === 'Returning Series' ? [show.name] : [],
    lastActiveYear: new Date().getFullYear()
  };
}

/**
 * Main sync function
 */
async function syncTMDbData() {
  try {
    console.log('🎬 Starting TMDb TV editor sync...');
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const popularShowsCount = args.find(arg => arg.startsWith('--popular-shows='))?.split('=')[1] || 5;
    const specificShowId = args.find(arg => arg.startsWith('--show-id='))?.split('=')[1];
    
    let shows = [];
    
    if (specificShowId) {
      console.log(`📺 Getting specific show ID: ${specificShowId}`);
      const show = await getTVShow(specificShowId);
      shows = [show];
    } else {
      console.log(`📺 Getting ${popularShowsCount} popular TV shows...`);
      shows = await getPopularTVShows(Math.ceil(popularShowsCount / 20));
      shows = shows.slice(0, popularShowsCount);
    }
    
    console.log(`✅ Found ${shows.length} shows to process`);
    
    const allEditors = [];
    let processedShows = 0;
    
    for (const show of shows) {
      try {
        console.log(`🔍 Processing "${show.name}" (${show.first_air_date?.split('-')[0]})...`);
        
        const [showDetails, credits] = await Promise.all([
          getTVShow(show.id),
          getTVCredits(show.id)
        ]);
        
        const editors = extractEditors(credits);
        console.log(`   Found ${editors.length} editors`);
        
        for (const editor of editors) {
          const algoliaEditor = convertToAlgoliaEditor(showDetails, editor);
          
          // Check if editor already exists and merge data
          const existingEditorIndex = allEditors.findIndex(e => e.name === editor.name);
          if (existingEditorIndex >= 0) {
            // Merge credits
            allEditors[existingEditorIndex].credits.push(...algoliaEditor.credits);
            allEditors[existingEditorIndex].recentShows.push(...algoliaEditor.recentShows);
            allEditors[existingEditorIndex].creditsCount++;
            allEditors[existingEditorIndex].networks = [...new Set([
              ...allEditors[existingEditorIndex].networks,
              ...algoliaEditor.networks
            ])];
            allEditors[existingEditorIndex].genres = [...new Set([
              ...allEditors[existingEditorIndex].genres,
              ...algoliaEditor.genres
            ])];
          } else {
            allEditors.push(algoliaEditor);
          }
        }
        
        processedShows++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 250));
        
      } catch (error) {
        console.error(`❌ Error processing "${show.name}": ${error.message}`);
      }
    }
    
    console.log(`\n📊 Sync Results:`);
    console.log(`   Shows processed: ${processedShows}/${shows.length}`);
    console.log(`   Unique editors found: ${allEditors.length}`);
    
    if (allEditors.length > 0) {
      console.log(`\n📤 Uploading ${allEditors.length} editors to Algolia...`);
      
      const index = client.initIndex(EDITORS_INDEX);
      await index.saveObjects(allEditors);
      
      console.log(`✅ Successfully uploaded ${allEditors.length} editors!`);
      
      // Show sample results
      console.log(`\n🎭 Sample editors found:`);
      allEditors.slice(0, 5).forEach(editor => {
        console.log(`   • ${editor.name} - ${editor.credits.length} credits`);
        editor.recentShows.slice(0, 2).forEach(show => {
          console.log(`     └ ${show}`);
        });
      });
    }
    
    console.log(`\n🎉 TMDb sync completed successfully!`);
    
  } catch (error) {
    console.error(`❌ TMDb sync failed:`, error.message);
    process.exit(1);
  }
}

// Run the sync
if (require.main === module) {
  syncTMDbData();
}

module.exports = { syncTMDbData }; 