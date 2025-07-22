#!/usr/bin/env node

/**
 * Admin User Setup Script
 * 
 * This script sets up admin users with custom claims for the TV Editor Finder application.
 * Run this script after deploying to production to grant admin privileges.
 * 
 * Usage:
 *   node scripts/setup-admin.js your-admin-email@domain.com
 *   node scripts/setup-admin.js --list-users
 *   node scripts/setup-admin.js --remove-admin your-email@domain.com
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || 
                           path.join(__dirname, '../serviceAccountKey.json');

try {
  // Try to initialize with service account
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
  console.log('✅ Firebase Admin SDK initialized with service account');
} catch (error) {
  // Fallback to application default credentials (for cloud environments)
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin SDK initialized with default credentials');
  } catch (fallbackError) {
    console.error('❌ Failed to initialize Firebase Admin SDK');
    console.error('Make sure you have set up authentication:');
    console.error('1. Download service account key from Firebase Console');
    console.error('2. Set FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable');
    console.error('3. Or run: gcloud auth application-default login');
    process.exit(1);
  }
}

/**
 * Grant admin privileges to a user
 */
async function makeUserAdmin(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    const user = await admin.auth().getUserByEmail(email);
    
    console.log(`👤 Found user: ${user.displayName || user.email} (${user.uid})`);
    
    // Set admin custom claims
    await admin.auth().setCustomUserClaims(user.uid, { 
      admin: true,
      role: 'admin',
      grantedAt: new Date().toISOString(),
      grantedBy: 'setup-script'
    });
    
    console.log(`✅ Admin privileges granted to ${email}`);
    console.log(`📋 Custom claims set:`, {
      admin: true,
      role: 'admin',
      grantedAt: new Date().toISOString()
    });
    
    // Verify the claims were set
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log(`🔍 Verified custom claims:`, updatedUser.customClaims);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User not found: ${email}`);
      console.error('Make sure the user has signed up/logged in at least once');
    } else {
      console.error('❌ Error granting admin privileges:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Remove admin privileges from a user
 */
async function removeUserAdmin(email) {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    const user = await admin.auth().getUserByEmail(email);
    
    console.log(`👤 Found user: ${user.displayName || user.email} (${user.uid})`);
    
    // Remove admin custom claims
    await admin.auth().setCustomUserClaims(user.uid, { 
      admin: false,
      role: 'user',
      removedAt: new Date().toISOString(),
      removedBy: 'setup-script'
    });
    
    console.log(`❌ Admin privileges removed from ${email}`);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User not found: ${email}`);
    } else {
      console.error('❌ Error removing admin privileges:', error.message);
    }
    process.exit(1);
  }
}

/**
 * List all users with their custom claims
 */
async function listUsers() {
  try {
    console.log('📋 Listing all users...\n');
    
    const listUsersResult = await admin.auth().listUsers();
    
    if (listUsersResult.users.length === 0) {
      console.log('No users found');
      return;
    }
    
    console.log('👥 Users:');
    console.log('═'.repeat(80));
    
    for (const user of listUsersResult.users) {
      const isAdmin = user.customClaims?.admin === true;
      const adminIndicator = isAdmin ? '👑 ADMIN' : '👤 User';
      
      console.log(`${adminIndicator} ${user.email || 'No email'}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Name: ${user.displayName || 'No name'}`);
      console.log(`   Created: ${user.metadata.creationTime}`);
      console.log(`   Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);
      
      if (user.customClaims && Object.keys(user.customClaims).length > 0) {
        console.log(`   Custom Claims:`, user.customClaims);
      }
      
      console.log('─'.repeat(40));
    }
    
    const adminCount = listUsersResult.users.filter(user => user.customClaims?.admin === true).length;
    console.log(`\n📊 Summary: ${listUsersResult.users.length} total users, ${adminCount} admins`);
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
    process.exit(1);
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show usage instructions
 */
function showUsage() {
  console.log('🎬 TV Editor Finder - Admin Setup Script\n');
  console.log('Usage:');
  console.log('  node scripts/setup-admin.js <email>              # Grant admin privileges');
  console.log('  node scripts/setup-admin.js --list-users         # List all users');
  console.log('  node scripts/setup-admin.js --remove-admin <email> # Remove admin privileges');
  console.log('  node scripts/setup-admin.js --help               # Show this help');
  console.log('\nExamples:');
  console.log('  node scripts/setup-admin.js admin@example.com');
  console.log('  node scripts/setup-admin.js --list-users');
  console.log('  node scripts/setup-admin.js --remove-admin user@example.com');
  console.log('\nEnvironment Variables:');
  console.log('  FIREBASE_SERVICE_ACCOUNT_KEY_PATH - Path to service account JSON file');
  console.log('  NEXT_PUBLIC_FIREBASE_PROJECT_ID   - Firebase project ID');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showUsage();
    process.exit(0);
  }
  
  try {
    if (args.includes('--list-users')) {
      await listUsers();
    } else if (args.includes('--remove-admin')) {
      const emailIndex = args.indexOf('--remove-admin') + 1;
      const email = args[emailIndex];
      
      if (!email) {
        console.error('❌ Please provide an email address');
        showUsage();
        process.exit(1);
      }
      
      if (!isValidEmail(email)) {
        console.error('❌ Invalid email format');
        process.exit(1);
      }
      
      await removeUserAdmin(email);
    } else {
      // Grant admin privileges
      const email = args[0];
      
      if (!isValidEmail(email)) {
        console.error('❌ Invalid email format');
        process.exit(1);
      }
      
      await makeUserAdmin(email);
    }
    
    console.log('\n✅ Operation completed successfully');
    
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up
    try {
      await admin.app().delete();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  makeUserAdmin,
  removeUserAdmin,
  listUsers
}; 