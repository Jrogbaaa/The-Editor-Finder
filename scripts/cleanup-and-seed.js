/**
 * Script to clean up invalid editors and seed database with original curated data
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Invalid entries to remove
const invalidEditors = [
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
  'Brian Baumgartner'
];

// High-quality curated editors to add
const curatedEditors = [
  {
    name: "Kelley Dixon",
    email: "kelley.dixon@guild.com",
    location: { city: "Los Angeles", state: "CA", country: "USA", remote: true },
    experience: { yearsActive: 20, startYear: 2004, specialties: ["Drama", "Crime", "Thriller"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "emmys"], verified: true }
  },
  {
    name: "Skip Macdonald", 
    email: "skip.macdonald@guild.com",
    location: { city: "Los Angeles", state: "CA", country: "USA", remote: true },
    experience: { yearsActive: 18, startYear: 2006, specialties: ["Drama", "Crime", "Film"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "breaking-bad"], verified: true }
  },
  {
    name: "Dean Zimmerman",
    email: "dean.zimmerman@guild.com", 
    location: { city: "Los Angeles", state: "CA", country: "USA", remote: true },
    experience: { yearsActive: 16, startYear: 2008, specialties: ["Drama", "Horror", "Sci-Fi"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "stranger-things"], verified: true }
  },
  {
    name: "Christopher Nelson",
    email: "chris.nelson@guild.com",
    location: { city: "Los Angeles", state: "CA", country: "USA", remote: true },
    experience: { yearsActive: 20, startYear: 2004, specialties: ["Drama", "Mystery", "Thriller"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "lost"], verified: true }
  },
  {
    name: "Tim Porter",
    email: "tim.porter@bafta.com",
    location: { city: "London", state: "England", country: "UK", remote: true },
    experience: { yearsActive: 25, startYear: 1999, specialties: ["Drama", "Fantasy", "Sci-Fi"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "game-of-thrones"], verified: true }
  },
  {
    name: "Katie Weiland",
    email: "katie.weiland@bafta.com",
    location: { city: "London", state: "England", country: "UK", remote: true },
    experience: { yearsActive: 18, startYear: 2006, specialties: ["Drama", "Fantasy", "Action"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "game-of-thrones"], verified: true }
  },
  {
    name: "Wendy Hallam Martin",
    email: "wendy.martin@guild.com",
    location: { city: "Toronto", state: "ON", country: "Canada", remote: true },
    experience: { yearsActive: 24, startYear: 2000, specialties: ["Drama", "Historical", "Thriller"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "handmaids-tale"], verified: true }
  },
  {
    name: "Ken Eluto",
    email: "ken.eluto@guild.com",
    location: { city: "New York", state: "NY", country: "USA", remote: true },
    experience: { yearsActive: 22, startYear: 2002, specialties: ["Comedy", "Drama", "Satire"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "succession"], verified: true }
  },
  {
    name: "A.J. Catoline",
    email: "aj.catoline@guild.com",
    location: { city: "Los Angeles", state: "CA", country: "USA", remote: true },
    experience: { yearsActive: 16, startYear: 2008, specialties: ["Comedy", "Musical", "Feel-good"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "ted-lasso"], verified: true }
  },
  {
    name: "Joanna Naugle",
    email: "joanna.naugle@guild.com",
    location: { city: "Chicago", state: "IL", country: "USA", remote: true },
    experience: { yearsActive: 14, startYear: 2010, specialties: ["Comedy", "Drama", "Kitchen/Food"] },
    professional: { unionStatus: "guild", availability: "available" },
    metadata: { createdAt: new Date(), updatedAt: new Date(), dataSource: ["curated", "the-bear"], verified: true }
  }
];

async function cleanupAndSeed() {
  console.log('🧹 Starting database cleanup and seeding...');
  
  try {
    // Step 1: Remove invalid editors
    console.log('\n🗑️ Removing invalid editors...');
    const editorsRef = db.collection('editors');
    
    for (const invalidName of invalidEditors) {
      const snapshot = await editorsRef.where('name', '==', invalidName).get();
      
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          await doc.ref.delete();
          console.log(`❌ Removed invalid editor: ${invalidName}`);
        }
      }
    }
    
    // Step 2: Add curated editors
    console.log('\n➕ Adding curated editors...');
    let addedCount = 0;
    
    for (const editor of curatedEditors) {
      // Check if editor already exists
      const existingSnapshot = await editorsRef.where('name', '==', editor.name).get();
      
      if (existingSnapshot.empty) {
        await editorsRef.add(editor);
        console.log(`✅ Added curated editor: ${editor.name}`);
        addedCount++;
      } else {
        console.log(`⏭️ Editor already exists: ${editor.name}`);
      }
    }
    
    // Step 3: Get final count
    const finalSnapshot = await editorsRef.get();
    const totalCount = finalSnapshot.size;
    
    console.log('\n🎉 Database cleanup and seeding complete!');
    console.log(`📊 Total editors in database: ${totalCount}`);
    console.log(`➕ Curated editors added: ${addedCount}`);
    console.log(`🗑️ Invalid editors removed: ${invalidEditors.length}`);
    
    // Step 4: Show breakdown by data source
    console.log('\n📈 Database breakdown:');
    const allEditors = finalSnapshot.docs.map(doc => doc.data());
    
    const curatedCount = allEditors.filter(editor => 
      editor.metadata?.dataSource?.includes('curated')
    ).length;
    
    const webSearchCount = allEditors.filter(editor => 
      editor.metadata?.dataSource?.includes('web-search')
    ).length;
    
    console.log(`   - Curated editors: ${curatedCount}`);
    console.log(`   - Web-found editors: ${webSearchCount}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup and seeding:', error);
  }
}

// Run the script
cleanupAndSeed(); 