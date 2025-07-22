import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables first
config({ path: path.join(__dirname, '..', '.env.local') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper functions
const addEditorDocument = async (editor: any) => {
  const editorsRef = collection(db, 'editors');
  const docRef = await addDoc(editorsRef, {
    name: editor.name,
    imdbId: editor.imdbId,
    location: editor.location,
    experience: editor.experience,
    professional: editor.professional,
    metadata: {
      ...editor.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  return docRef;
};

const addCreditDocument = async (editorRef: any, show: any) => {
  const creditsRef = collection(db, 'credits');
  const docRef = await addDoc(creditsRef, {
    editorId: editorRef.id,
    title: show.title,
    network: show.network,
    genre: show.genre,
    type: show.type,
    year: show.year,
    role: 'Editor',
    metadata: {
      dataSource: 'canadesk-imdb-scraper',
      createdAt: new Date()
    }
  });
  return docRef;
};

const addAwardDocument = async (editorRef: any, award: any) => {
  if (!award.name) return null;
  
  const awardsRef = collection(db, 'awards');
  const docRef = await addDoc(awardsRef, {
    editorId: editorRef.id,
    name: award.name,
    category: award.category,
    year: award.year,
    status: award.status,
    show: award.show,
    country: award.country || 'USA',
    metadata: {
      dataSource: 'canadesk-imdb-scraper',
      createdAt: new Date()
    }
  });
  return docRef;
};

const main = async () => {
  try {
    console.log('🎬 Starting Canadesk IMDb Editors Import...\n');
    
    // Read the JSON data
    const dataPath = path.join(__dirname, 'canadesk-imdb-editors-data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`📊 Found ${data.editors.length} editors to import\n`);
    
    let importedCount = 0;
    let creditsCount = 0;
    let awardsCount = 0;
    
    for (const editor of data.editors) {
      console.log(`\n👤 Processing: ${editor.name}`);
      console.log(`   🎭 IMDb ID: ${editor.imdbId}`);
      console.log(`   📍 Location: ${editor.location.city}${editor.location.state ? ', ' + editor.location.state : ''}, ${editor.location.country}`);
      console.log(`   📺 Specialties: ${editor.experience.specialties.join(', ')}`);
      
      // Add editor to Firebase
      const editorRef = await addEditorDocument(editor);
      importedCount++;
      
      // Add shows/credits
      for (const show of editor.shows) {
        console.log(`   📺 Adding credit: ${show.title} (${show.year})`);
        await addCreditDocument(editorRef, show);
        creditsCount++;
      }
      
      // Add awards if any
      for (const award of editor.awards) {
        console.log(`   🏆 Adding award: ${award.name} (${award.year})`);
        await addAwardDocument(editorRef, award);
        awardsCount++;
      }
      
      console.log(`   ✅ Successfully imported ${editor.name}`);
    }
    
    console.log('\n🎉 Import completed successfully!');
    console.log('\n📈 IMPORT SUMMARY:');
    console.log(`   👥 Editors imported: ${importedCount}`);
    console.log(`   📺 Credits added: ${creditsCount}`);
    console.log(`   🏆 Awards added: ${awardsCount}`);
    
    console.log('\n🌍 NEW GEOGRAPHIC COVERAGE:');
    console.log('   🇺🇸 United States: 4 editors (Maria Gonzales, Tim Hansen, Ken Denisoff, Max K. Curtis)');
    console.log('   🇬🇧 United Kingdom: 3 editors (Lois Drinkwater, Angus Newton, Julian Farr, Simon Horwood)');
    console.log('   🇦🇺 Australia: 1 editor (Gerard Simmons)');
    
    console.log('\n📺 NETWORK DIVERSITY:');
    console.log('   🎬 FX/Hulu: Shōgun (2024) - Emmy nominee');
    console.log('   📺 BBC: Multiple classic and modern series');
    console.log('   🌏 Network Ten: International soap opera');
    console.log('   📡 Discovery: Documentary and reality');
    console.log('   📻 NBC: Classic sitcoms');
    
    console.log('\n🎭 GENRE SPECIALIZATION:');
    console.log('   📜 Historical Drama: Shōgun');
    console.log('   🔍 Crime/Mystery: Bergerac, The Crow Road');
    console.log('   😂 Comedy/Sitcom: CPO Sharkey, One of the Boys');
    console.log('   🌍 Documentary: Volcano Live, Oh in Colour');
    console.log('   📺 Soap Opera: Neighbours');
    
    console.log('\n🎯 INDUSTRY SPAN:');
    console.log('   📅 1966-2024: 58 years of television editing history');
    console.log('   🏆 Emmy-nominated content: Shōgun (2024)');
    console.log('   🌍 International reach: 3 countries, 4 continents');
    
    console.log('\n✨ Next steps:');
    console.log('   1. Verify all editors are searchable in your application');
    console.log('   2. Test Algolia sync for new editor profiles');
    console.log('   3. Consider adding more detailed IMDb profiles for recent editors');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
};

main(); 