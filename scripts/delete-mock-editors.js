#!/usr/bin/env node

/**
 * Delete Mock Editors Script
 * 
 * Removes all mock/web-generated editors that cause "Editor Not Found" errors.
 * Uses Firebase Admin SDK for direct database access.
 * 
 * Usage:
 *   node scripts/delete-mock-editors.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'editor-finder',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Mock editors and problematic entries to remove
const mockEditorNames = [
  'John Smith',
  'Jane Doe', 
  'Travis Fimmel',
  'Mickey Rourke',
  'Matthew Modine',
  'Not specified',
  'Sarah Martinez',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim'
];

async function deleteMockEditors() {
  console.log('🧹 Starting deletion of mock editors...\n');
  
  let totalDeleted = 0;
  
  try {
    // Get all editors from Firebase
    console.log('📊 Fetching all editors from database...');
    const editorsRef = db.collection('editors');
    const snapshot = await editorsRef.get();
    
    console.log(`Found ${snapshot.size} total editors in database\n`);
    
    const batch = db.batch();
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
      const editor = doc.data();
      const editorId = doc.id;
      const editorName = editor.name;
      
      let shouldDelete = false;
      let reason = '';

      // Check 1: Mock editor names
      if (mockEditorNames.includes(editorName)) {
        shouldDelete = true;
        reason = 'Known mock/actor name';
      }
      
      // Check 2: Web-generated IDs
      else if (editorId.startsWith('web-') || editorId.startsWith('web-credit-')) {
        shouldDelete = true;
        reason = 'Web-generated mock ID';
      }
      
      // Check 3: Unknown location editors (web-scraped mock data)
      else if (editor.location?.city === 'Unknown' && editor.location?.state === 'Unknown') {
        shouldDelete = true;
        reason = 'Unknown location (web-scraped)';
      }

      if (shouldDelete) {
        console.log(`🗑️  Deleting: ${editorName} (${reason})`);
        batch.delete(doc.ref);
        totalDeleted++;
        batchCount++;
        
        // Commit batch every 400 operations (Firestore limit is 500)
        if (batchCount >= 400) {
          await batch.commit();
          console.log(`    ✅ Committed batch of ${batchCount} deletions`);
          
          // Create new batch
          const newBatch = db.batch();
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

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
deleteMockEditors()
  .then(() => {
    console.log('\n🚀 Mock editor cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }); 