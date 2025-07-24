import { NextResponse } from 'next/server';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST() {
  console.log('🧹 Starting cleanup of mock editors...');

  try {
    // Specific mock editor IDs and names to remove
    const mockEditorIdentifiers = [
      'web-credit-john-smith-1753273738874',
      'web-credit-jane-doe-1753273738874', 
      'web-credit-travis-fimmel-1753273234452',
      'web-credit-mickey-rourke-1753273234452',
      'web-credit-matthew-modine-1753273234451',
      'web-credit-not-specified-1753273289273'
    ];

    const mockEditorNames = [
      'John Smith',
      'Jane Doe',
      'Travis Fimmel', 
      'Mickey Rourke',
      'Matthew Modine',
      'Not specified'
    ];

    let deletedCount = 0;
    const deletionPromises = [];

    // Delete by specific IDs
    for (const editorId of mockEditorIdentifiers) {
      try {
        const editorRef = doc(db, 'editors', editorId);
        deletionPromises.push(
          deleteDoc(editorRef).then(() => {
            console.log(`✅ Deleted editor with ID: ${editorId}`);
            deletedCount++;
          }).catch(error => {
            console.log(`⚠️  Could not delete ${editorId}: ${error.message}`);
          })
        );
      } catch (error) {
        console.log(`❌ Error deleting ${editorId}:`, error);
      }
    }

    // Delete by names for any we missed
    for (const name of mockEditorNames) {
      try {
        const q = query(collection(db, 'editors'), where('name', '==', name));
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(docSnap => {
          deletionPromises.push(
            deleteDoc(docSnap.ref).then(() => {
              console.log(`✅ Deleted editor: ${name}`);
              deletedCount++;
            }).catch(error => {
              console.log(`⚠️  Could not delete ${name}: ${error.message}`);
            })
          );
        });
      } catch (error) {
        console.log(`❌ Error finding ${name}:`, error);
      }
    }

    // Delete any editor with web-generated IDs
    try {
      const editorsRef = collection(db, 'editors');
      const snapshot = await getDocs(editorsRef);
      
      snapshot.docs.forEach(docSnap => {
        const editorId = docSnap.id;
        const editor = docSnap.data();
        
        // Check for web-generated IDs or unknown locations
        if (editorId.startsWith('web-') || 
            editorId.startsWith('web-credit-') ||
            (editor.location?.city === 'Unknown' && editor.location?.state === 'Unknown')) {
          
          deletionPromises.push(
            deleteDoc(docSnap.ref).then(() => {
              console.log(`✅ Deleted web-generated editor: ${editor.name} (${editorId})`);
              deletedCount++;
            }).catch(error => {
              console.log(`⚠️  Could not delete ${editor.name}: ${error.message}`);
            })
          );
        }
      });
    } catch (error) {
      console.log(`❌ Error querying all editors:`, error);
    }

    // Wait for all deletions to complete
    await Promise.allSettled(deletionPromises);

    console.log(`🎉 Cleanup completed! Deleted ${deletedCount} mock editors.`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} mock editors`,
      deletedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup mock editors',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Mock Editor Cleanup API',
    description: 'Removes mock editors like John Smith, Jane Doe that cause Editor Not Found errors',
    usage: 'POST to this endpoint to trigger cleanup',
    timestamp: new Date().toISOString()
  });
} 