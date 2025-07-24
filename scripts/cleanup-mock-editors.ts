#!/usr/bin/env npx tsx

/**
 * Cleanup Mock Editors Script
 * 
 * Removes all mock/sample/web-generated editors that cause "Editor Not Found" errors.
 * This includes editors with web-generated IDs and mock data like "John Smith", "Jane Doe".
 * 
 * Usage:
 *   npx tsx scripts/cleanup-mock-editors.ts
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  writeBatch
} from 'firebase/firestore';

// Firebase config from environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock editors and problematic entries to remove
const mockEditorsToRemove = [
  // Web-generated mock editors
  'John Smith',
  'Jane Doe',
  'Sarah Martinez',
  'Michael Chen', 
  'Emily Rodriguez',
  'David Kim',
  
  // Known non-editors (actors, producers, etc.)
  'Warner Home Video',
  'Lucasfilm Press',
  'Din Djarin',
  'Claire Foy',
  'Alicia Vikander',
  'Eva Green',
  'Matthew Perry',
  'Jennifer Aniston',
  'Courteney Cox',
  'Lisa Kudrow',
  'Matt LeBlanc',
  'David Schwimmer',
  'Brian Baumgartner',
  'Kelsey Grammer',
  'Julie Kavner',
  'Hank Azaria',
  'Nancy Cartwright',
  'Matt Groening',
  'Dan Castellaneta',
  'Travis Fimmel',
  'Mickey Rourke',
  'Matthew Modine',
  'Not specified',
  
  // Mock/sample entries
  'Sample Editor',
  'Test Editor',
  'Example Editor'
];

async function cleanupMockEditors() {
  console.log('🧹 Starting cleanup of mock editors...\n');
  
  let totalDeleted = 0;
  let errors = 0;

  try {
    // Get all editors from Firebase
    console.log('📊 Fetching all editors from database...');
    const editorsRef = collection(db, 'editors');
    const snapshot = await getDocs(editorsRef);
    
    console.log(`Found ${snapshot.size} total editors in database\n`);

    const batch = writeBatch(db);
    let batchCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const editor = docSnapshot.data();
      const editorId = docSnapshot.id;
      const editorName = editor.name;
      
      let shouldDelete = false;
      let reason = '';

      // Check 1: Mock editor names
      if (mockEditorsToRemove.includes(editorName)) {
        shouldDelete = true;
        reason = 'Known mock/non-editor';
      }
      
      // Check 2: Web-generated IDs
      else if (editorId.startsWith('web-') || editorId.startsWith('web-credit-')) {
        shouldDelete = true;
        reason = 'Web-generated mock ID';
      }
      
      // Check 3: Unknown location editors (likely web-scraped mock data)
      else if (editor.location?.city === 'Unknown' && editor.location?.state === 'Unknown') {
        shouldDelete = true;
        reason = 'Unknown location (web-scraped)';
      }
      
      // Check 4: Editors with all "unknown" professional data
      else if (editor.professional?.unionStatus === 'unknown' && 
               editor.professional?.availability === 'unknown' &&
               editor.location?.city === 'Unknown') {
        shouldDelete = true;
        reason = 'All unknown data';
      }

      if (shouldDelete) {
        console.log(`🗑️  Deleting: ${editorName} (${reason})`);
        
        // Delete editor document
        batch.delete(doc(db, 'editors', editorId));
        
        // Delete associated subcollections (credits, awards, research, etc.)
        try {
          const creditsRef = collection(db, 'editors', editorId, 'credits');
          const creditsSnapshot = await getDocs(creditsRef);
          creditsSnapshot.docs.forEach(creditDoc => {
            batch.delete(creditDoc.ref);
          });

          const awardsRef = collection(db, 'editors', editorId, 'awards');
          const awardsSnapshot = await getDocs(awardsRef);
          awardsSnapshot.docs.forEach(awardDoc => {
            batch.delete(awardDoc.ref);
          });
        } catch (subError) {
          console.log(`    ⚠️  Error cleaning subcollections: ${subError}`);
        }
        
        totalDeleted++;
        batchCount++;
        
        // Commit batch every 400 operations (Firestore limit is 500)
        if (batchCount >= 400) {
          await batch.commit();
          console.log(`    ✅ Committed batch of ${batchCount} deletions`);
          batchCount = 0;
        }
      }
    }
    
    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`    ✅ Committed final batch of ${batchCount} deletions`);
    }

    console.log('\n🎉 Cleanup completed successfully!');
    console.log(`✅ Deleted ${totalDeleted} mock editors`);
    console.log(`✅ ${snapshot.size - totalDeleted} real editors remain`);
    
    if (errors > 0) {
      console.log(`⚠️  ${errors} errors encountered during cleanup`);
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupMockEditors()
  .then(() => {
    console.log('\n🚀 Mock editor cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }); 