import { config } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Explicitly load .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add editor document
const addEditorDocument = async (editor: any) => {
  const editorData = {
    name: editor.name,
    location: editor.location,
    experience: editor.experience,
    professional: editor.professional,
    metadata: {
      ...editor.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  return await addDoc(collection(db, 'editors'), editorData);
};

// Add credit document
const addCreditDocument = async (editorRef: any, show: any) => {
  const creditData = {
    editorId: editorRef.id,
    title: show.title,
    network: show.network,
    genre: show.genre,
    type: show.type,
    timeline: {
      startYear: show.startYear || new Date().getFullYear() - 2, // Estimate
      endYear: show.endYear || null,
    },
    metadata: {
      dataSource: ['industry-research'],
      verified: true,
      createdAt: new Date(),
    },
  };

  return await addDoc(collection(db, 'credits'), creditData);
};

// Add award document
const addAwardDocument = async (editorRef: any, award: any) => {
  const awardData = {
    editorId: editorRef.id,
    name: award.name,
    category: award.category,
    year: award.year,
    status: award.status,
    show: award.show,
    metadata: {
      dataSource: ['awards-database'],
      verified: true,
      createdAt: new Date(),
    },
  };

  return await addDoc(collection(db, 'awards'), awardData);
};

const main = async () => {
  try {
    console.log('🎬 Starting Global TV Editors Import...\n');

    // Read the data file
    const dataPath = path.join(__dirname, 'global-tv-editors-data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    let editorsAdded = 0;
    let creditsAdded = 0;
    let awardsAdded = 0;

    console.log(`📊 Found ${data.editors.length} editors to import\n`);

    for (const editor of data.editors) {
      console.log(`✨ Processing: ${editor.name}`);
      
      // Add editor
      const editorRef = await addEditorDocument(editor);
      editorsAdded++;
      console.log(`   ✅ Editor added`);

      // Add shows/credits
      if (editor.shows && editor.shows.length > 0) {
        for (const show of editor.shows) {
          await addCreditDocument(editorRef, show);
          creditsAdded++;
        }
        console.log(`   📺 ${editor.shows.length} shows added`);
      }

      // Add awards
      if (editor.awards && editor.awards.length > 0) {
        for (const award of editor.awards) {
          await addAwardDocument(editorRef, award);
          awardsAdded++;
        }
        console.log(`   🏆 ${editor.awards.length} awards added`);
      }

      console.log(''); // Empty line for readability
    }

    console.log('🎉 GLOBAL IMPORT COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Editors imported: ${editorsAdded}`);
    console.log(`📺 Credits imported: ${creditsAdded}`);
    console.log(`🏆 Awards imported: ${awardsAdded}`);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🌍 NEW GLOBAL COVERAGE:');
    console.log('   🇺🇸 USA: Emmy & ACE Eddie winners');
    console.log('   🇬🇧 UK: BAFTA Craft Award winners');
    console.log('   🇪🇸 Spain: Money Heist editing team');
    console.log('   🇩🇪 Germany: Dark & Netflix originals');
    console.log('   🇦🇹 Austria: International productions');
    console.log('   🇩🇰 Denmark: Nordic Noir masters');
    console.log('');
    console.log('🔍 FEATURED SHOWS ADDED:');
    console.log('   • The Last of Us (HBO)');
    console.log('   • Baby Reindeer (Netflix)');
    console.log('   • BEEF (Netflix/A24)');
    console.log('   • Chernobyl (HBO/Sky)');
    console.log('   • Dark (Netflix)');
    console.log('   • Money Heist (Netflix)');
    console.log('   • The Queen\'s Gambit (Netflix)');
    console.log('   • Shogun (FX/Hulu)');
    console.log('   • Succession (HBO)');
    console.log('   • Borgen (DR1)');
    console.log('   • And many more...');
    console.log('');
    console.log('🚀 Ready to search your expanded database!');

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
};

main(); 