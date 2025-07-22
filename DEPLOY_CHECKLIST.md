# 🚀 Production Deployment Checklist

## 📋 Pre-Deployment Steps

### 1. Environment Configuration
- [ ] All environment variables set in production
- [ ] Firebase project configured for production
- [ ] Algolia production indices created
- [ ] API keys and secrets properly configured
- [ ] Domain and SSL certificates ready

### 2. Security & Rules Deployment
- [ ] Firebase Security Rules updated (see below)
- [ ] Storage Rules updated (see below)  
- [ ] Admin user authentication configured
- [ ] API rate limiting configured

### 3. Code & Build Preparation
- [ ] All code committed and pushed to main branch
- [ ] Build passes locally (`npm run build`)
- [ ] TypeScript compilation successful
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm test`)

## 🔐 Firebase Security Rules Deployment

### Deploy Firestore Rules
```bash
# Test rules locally first
firebase emulators:start --only firestore

# Deploy to production
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules get
```

### Deploy Storage Rules  
```bash
# Deploy storage rules
firebase deploy --only storage

# Verify deployment
firebase storage:rules get
```

### Create Admin User
```bash
# Set admin custom claims via Firebase Admin SDK
# Add this to your admin script:
```

```javascript
// scripts/setup-admin.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

async function makeUserAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Admin privileges granted to ${email}`);
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

// Replace with your admin email
makeUserAdmin('your-admin-email@domain.com');
```

## 🌐 Vercel Deployment

### Option A: Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_ALGOLIA_APP_ID
# ... add all environment variables
```

### Option B: Deploy to Firebase Hosting
```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Set up custom domain
firebase hosting:sites:create your-domain-name
```

## 🧪 End-to-End Testing Procedures

### 1. Search Functionality Tests

#### Basic Search Test
```bash
# Test public search endpoint
curl "https://your-domain.com/api/editors?q=Drama"

# Expected: Returns editors with Drama specialty
# Verify: Response time < 500ms, proper data structure
```

#### Advanced Filter Test
```bash
# Test complex filtering
curl "https://your-domain.com/api/editors?genres=Drama,Action&unionStatus=guild&remoteOnly=true"

# Expected: Filtered results matching all criteria
# Verify: Facet counts, pagination works
```

#### Algolia Fallback Test
```bash
# Temporarily disable Algolia to test Firestore fallback
# Verify search still works with slower response times
```

### 2. Research & Intelligence Tests

#### Research Entry Creation Test
```javascript
// Test via admin dashboard or API
const testResearchEntry = {
  editorId: "test-editor-123",
  type: "biography",
  title: "Test Research Entry",
  content: "Test content for research functionality",
  confidence: "medium",
  sources: [{
    type: "website",
    url: "https://example.com",
    reliability: "medium"
  }]
};

// POST to /api/research/test-editor-123
// Expected: Entry created successfully, appears in UI
```

#### Knowledge Graph Test
```bash
# Test knowledge retrieval
curl "https://your-domain.com/api/knowledge/test-editor-123"

# Expected: Structured knowledge summary
# Verify: Data aggregation working correctly
```

#### Research Panel UI Test
- [ ] Navigate to editor detail page
- [ ] Open research panel  
- [ ] Add new research entry
- [ ] Verify entry appears immediately
- [ ] Test edit/delete functionality
- [ ] Check confidence scoring display

### 3. Data Synchronization Tests

#### Manual Sync Test
```bash
# Trigger data sync
curl -X POST "https://your-domain.com/api/sync" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Expected: Sync process initiated
# Verify: Logs created, data updated
```

#### Algolia Index Sync Test
```bash
# Test Algolia synchronization
npm run sync:algolia

# Expected: All editors indexed in Algolia
# Verify: Search returns updated data
```

### 4. Authentication & Authorization Tests

#### Admin Access Test
- [ ] Login as admin user
- [ ] Access admin dashboard (/admin)  
- [ ] Create/edit/delete editor entries
- [ ] Upload files to Storage
- [ ] Access research management

#### Public Access Test  
- [ ] Browse site without authentication
- [ ] Search editors (should work)
- [ ] Try accessing admin areas (should fail)
- [ ] Verify read-only access to public data

#### User Access Test
- [ ] Login as regular user
- [ ] Save searches and favorites
- [ ] Access user profile
- [ ] Try admin actions (should fail)

### 5. Performance & Security Tests

#### Performance Test
```bash
# Test search response times
curl -w "@curl-format.txt" "https://your-domain.com/api/editors?q=Emmy"

# Expected: Response time < 200ms for Algolia
# Create curl-format.txt with timing info
```

#### Security Test
```bash
# Test rate limiting
for i in {1..20}; do
  curl "https://your-domain.com/api/editors" &
done

# Expected: Some requests blocked/throttled
```

#### File Upload Security Test
- [ ] Try uploading executable files (should fail)
- [ ] Try uploading oversized files (should fail)  
- [ ] Try directory traversal in filenames (should fail)
- [ ] Upload valid files (should succeed)

### 6. Error Handling Tests

#### 404 Error Test
```bash
curl "https://your-domain.com/api/editors/nonexistent-id"
# Expected: Proper 404 response with error message
```

#### Network Failure Test
- [ ] Disable internet connection temporarily
- [ ] Test offline behavior
- [ ] Verify graceful degradation
- [ ] Check error messages to users

## 📊 Production Monitoring Setup

### Analytics Setup
- [ ] Google Analytics configured
- [ ] Search analytics tracking enabled
- [ ] Performance monitoring active
- [ ] Error tracking configured (Sentry)

### Alerting Setup
- [ ] Uptime monitoring (Pingdom/UptimeRobot)
- [ ] Performance alerts (Core Web Vitals)
- [ ] Error rate monitoring
- [ ] Search failure alerts

### Backup & Recovery
- [ ] Firestore backup schedule configured
- [ ] Code repository backed up
- [ ] Environment variables documented
- [ ] Recovery procedures documented

## 🔍 Post-Deployment Verification

### Immediate Checks (First 30 minutes)
- [ ] Site loads correctly
- [ ] Search functionality works
- [ ] No JavaScript errors in browser console
- [ ] All API endpoints responding
- [ ] SSL certificate valid
- [ ] CDN caching working

### Extended Checks (First 24 hours)
- [ ] Search analytics data flowing
- [ ] No unexpected error spikes
- [ ] Performance within acceptable ranges
- [ ] User feedback positive
- [ ] Admin functionality working

### Long-term Monitoring (First week)
- [ ] Search result quality maintained
- [ ] Research features being used
- [ ] No security incidents
- [ ] Performance remains stable
- [ ] User engagement metrics positive

## 🆘 Rollback Procedures

### Quick Rollback (Vercel)
```bash
# List recent deployments
vercel list

# Rollback to previous deployment  
vercel rollback [deployment-url]
```

### Firebase Rules Rollback
```bash
# Get previous rules version
firebase firestore:rules get --version [VERSION]

# Restore previous rules
firebase deploy --only firestore:rules
```

### Emergency Contacts
- Firebase Support: [Link to support]
- Vercel Support: [Link to support] 
- Algolia Support: [Link to support]
- Domain Registrar: [Contact info]

## ✅ Success Criteria

Deployment is considered successful when:
- [ ] All tests pass
- [ ] Search response time < 200ms (95th percentile)
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9% in first 24 hours
- [ ] No security vulnerabilities detected
- [ ] User feedback positive
- [ ] Admin workflows functional
- [ ] Research features working correctly

---

## 📞 Support & Troubleshooting

### Common Issues & Solutions

**Search not working:**
- Check Algolia API keys
- Verify Firestore fallback
- Check network connectivity

**Admin access denied:**
- Verify custom claims set correctly
- Check Firebase Auth configuration  
- Confirm admin email whitelisted

**File uploads failing:**
- Check Storage rules deployment
- Verify file size/type restrictions
- Confirm authentication working

**Research panel empty:**
- Check Firestore rules
- Verify API endpoints responding
- Check browser console for errors

For additional support, contact the development team or refer to the project documentation. 