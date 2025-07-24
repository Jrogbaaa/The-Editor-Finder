#!/usr/bin/env npx tsx

/**
 * Gather Research Data Script
 * 
 * This script uses Apify to automatically gather comprehensive research data
 * for all editors in the database. It creates research entries and editor
 * knowledge documents to populate the research panel.
 * 
 * Usage:
 *   npx tsx scripts/gather-research-data.ts
 * 
 * Environment Variables Required:
 *   - NEXT_PUBLIC_APIFY_TOKEN: Your Apify API token
 *   - Firebase config (automatically loaded from .env.local)
 */

import '../src/lib/firebase'; // Initialize Firebase
import { autoResearchService } from '../src/lib/auto-research-service';

async function main() {
  console.log('🎬 TV Editor Research Data Gathering');
  console.log('=====================================');
  
  try {
    // Check if Apify token is configured
    if (!process.env.NEXT_PUBLIC_APIFY_TOKEN) {
      console.log('⚠️  Warning: NEXT_PUBLIC_APIFY_TOKEN not found');
      console.log('   Research will use mock data instead of real web scraping');
      console.log('   To use real data, add your Apify token to .env.local');
      console.log('');
    }

    console.log('🔍 Starting automated research for all editors...');
    console.log('   This process will:');
    console.log('   • Search the web for editor information using Apify');
    console.log('   • Create research entries for biography, projects, awards');
    console.log('   • Generate editor knowledge documents');
    console.log('   • Skip editors with recent data (< 7 days old)');
    console.log('');

    const startTime = Date.now();
    
    // Run the automated research
    await autoResearchService.gatherDataForAllEditors();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('✅ Research data gathering completed!');
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   1. Start your dev server: npm run dev');
    console.log('   2. Search for any editor and click on their profile');
    console.log('   3. Navigate to the "Research & Intelligence" tab');
    console.log('   4. You should now see populated research data!');
    console.log('');
    console.log('📊 The research panel will show:');
    console.log('   • Professional Biography');
    console.log('   • Recent Projects');
    console.log('   • Awards & Recognition');
    console.log('   • Intelligence Summary');
    
  } catch (error) {
    console.error('❌ Research gathering failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export default main; 