# 🌌 TV Editor Finder Setup Guide | Northern Lights Platform

Complete setup guide for the TV Editor Finder platform with the stunning Northern Lights design system.

## 🎨 **Design System Overview**

### **Northern Lights Theme**
The platform features a beautiful aurora-inspired color palette:
- **Aurora Green**: `oklch(0.6487 0.1538 150.3071)` - Primary actions and highlights
- **Deep Purple**: `oklch(0.5880 0.0993 245.7394)` - Secondary elements
- **Vibrant Purple-Blue**: `oklch(0.6746 0.1414 261.3380)` - Accent colors
- **Dark Navy**: `oklch(0.2303 0.0125 264.2926)` - Background
- **Professional Typography**: Plus Jakarta Sans, Source Serif 4, JetBrains Mono

### **Stripe-Inspired Components**
- Modern card layouts with backdrop blur effects
- Smooth hover animations and transitions
- Professional spacing and typography
- Glass-morphism design elements

## 🚀 **Quick Setup (5 minutes)**

### **1. Install Dependencies**
```bash
cd tv-editor-finder
npm install
```

### **2. Environment Configuration**
Create `.env.local` file:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDY37yG_w6g9SlMdSRC9Yn3FUSu7uphwGg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=editor-finder.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=editor-finder
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=editor-finder.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=865898888497
NEXT_PUBLIC_FIREBASE_APP_ID=1:865898888497:web:c580f49a97f9c0c37f8410
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-VKRG8YGSMH

# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=V0KR3LXR6K
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=c41b30a5664e8eb5d270a8261877c37e
ALGOLIA_WRITE_KEY=efb30d8bb71e6c4cf3a0d8eca69afd80

# TMDb API Configuration
TMDB_API_KEY=your_tmdb_key_here

# Rate Limiting Configuration
SCRAPING_DELAY_MS=2000
MAX_CONCURRENT_REQUESTS=5
```

### **3. Start Development Server**
```bash
npm run dev
```

Visit **http://localhost:3000** to see the beautiful Northern Lights interface!

## 🔧 **Firebase Configuration**

### **1. Firestore Security Rules**
Apply these rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public read access to editors collection
    // Write access restricted to authenticated admin users
    match /editors/{editorId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
      
      // Credits subcollection - public read, admin write
      match /credits/{creditId} {
        allow read: if true;
        allow write: if request.auth != null && 
                     request.auth.token.admin == true;
      }
      
      // Awards subcollection - public read, admin write  
      match /awards/{awardId} {
        allow read: if true;
        allow write: if request.auth != null && 
                     request.auth.token.admin == true;
      }
    }
    
    // Search analytics - write-only for all users (no read access)
    // Used for tracking search patterns and analytics
    match /searches/{searchId} {
      allow read: if false;
      allow create: if true;
      allow update, delete: if false;
    }
    
    // General analytics collection - admin only access
    match /analytics/{document=**} {
      allow read, write: if request.auth != null && 
                          request.auth.token.admin == true;
    }
    
    // User favorites and saved searches (future feature)
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
      
      match /favorites/{favoriteId} {
        allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
      }
      
      match /savedSearches/{searchId} {
        allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
      }
    }
    
    // Research and knowledge database - admin only
    match /research/{researchId} {
      allow read, write: if request.auth != null && 
                          request.auth.token.admin == true;
    }
    
    // Editor knowledge summaries - public read, admin write
    match /editorKnowledge/{editorId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Research activities log - admin only
    match /researchActivities/{activityId} {
      allow read, write: if request.auth != null && 
                          request.auth.token.admin == true;
    }
    
    // Research templates - admin only
    match /researchTemplates/{templateId} {
      allow read, write: if request.auth != null && 
                          request.auth.token.admin == true;
    }
    
    // Data source synchronization logs - admin only
    match /syncLogs/{logId} {
      allow read, write: if request.auth != null && 
                          request.auth.token.admin == true;
    }
    
    // Rate limiting and API usage tracking - system only
    match /rateLimits/{document=**} {
      allow read, write: if false; // System service account only
    }
  }
}
```

### **2. Firebase Storage Rules**
Apply these rules in Firebase Console > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Editor profile photos - public read, admin write
    match /editors/{editorId}/photos/{photoId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Editor portfolios and documents - public read, admin write
    match /editors/{editorId}/documents/{documentId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Editor reels and demo videos - public read, admin write
    match /editors/{editorId}/reels/{reelId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Research documents and notes - admin only
    match /research/{editorId}/{documentId} {
      allow read, write: if request.auth != null && 
                          request.auth.token.admin == true;
    }
    
    // Temporary uploads - authenticated users only
    match /temp/{userId}/{fileName} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == userId;
      allow delete: if request.auth != null && 
                    request.auth.uid == userId;
    }
    
    // Public assets (logos, icons, etc.) - public read, admin write
    match /public/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
  }
}
```

## 🎬 **TMDb API Setup**

### **1. Get TMDb API Key**
1. Visit [TMDb](https://www.themoviedb.org/settings/api)
2. Create an account and request API access
3. Add your API key to `.env.local`:
   ```env
   TMDB_API_KEY=your_actual_tmdb_key
   ```

### **2. Test TMDb Integration**
Visit the admin dashboard at **http://localhost:3000/admin** and try syncing data from TMDb.

## 🔍 **Algolia Setup (Optional)**

### **1. Create Algolia Account**
1. Sign up at [Algolia](https://www.algolia.com/)
2. Create a new application
3. Get your App ID and API keys

### **2. Configure Algolia**
Add your Algolia credentials to `.env.local`:
```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
ALGOLIA_WRITE_KEY=your_write_key
```

## 🗄️ **Database Structure**

### **Core Collections**
```
editors/
├── {editorId}/
│   ├── credits/        # Editor's TV show credits
│   └── awards/         # Awards and nominations

searches/               # Search analytics
analytics/              # Admin analytics
users/                  # User profiles (future)

research/               # Research database
editorKnowledge/        # Editor intelligence summaries
researchActivities/     # Research activity logs
researchTemplates/      # Research templates
syncLogs/               # Data sync logs
rateLimits/             # API rate limiting
```

### **Research Database Details**
The new research system includes:
- **ResearchEntry**: Individual research items about editors
- **EditorKnowledge**: Aggregated intelligence summaries
- **ResearchActivity**: Activity tracking and audit logs
- **ResearchTemplate**: Standardized research formats

## 🧪 **Testing the Application**

### **1. Homepage Search**
- Visit **http://localhost:3000**
- Test the beautiful search interface with Northern Lights theme
- Try quick filters (Award Winners, Remote Work, Guild Member, Available Now)
- Use advanced filters for genres, networks, experience levels

### **2. Admin Dashboard**
- Visit **http://localhost:3000/admin**
- Test data synchronization from TMDb
- Monitor sync results and system status

### **3. Editor Profiles**
- Click on any editor card to view detailed profiles
- Test the "Research & Intelligence" features
- Verify the beautiful Northern Lights styling

### **4. Research System Testing**
1. **Create Research Entry**:
   ```typescript
   // Test adding research about an editor
   await addResearchEntry(editorId, {
     type: 'contact_info',
     title: 'Updated Contact Information',
     content: 'New email and phone verified through agent',
     confidence: 'high'
   });
   ```

2. **View Editor Knowledge**:
   ```typescript
   // Test retrieving editor intelligence
   const knowledge = await getEditorKnowledge(editorId);
   console.log('Editor insights:', knowledge.insights);
   ```

## 🎨 **Design System Usage**

### **Color Palette**
```css
/* Use these CSS variables in components */
var(--primary)      /* Aurora Green */
var(--secondary)    /* Deep Purple */
var(--accent)       /* Purple-Blue */
var(--background)   /* Dark Navy */
var(--foreground)   /* Text */
var(--muted)        /* Subtle elements */
```

### **Component Classes**
```css
/* Card styling */
.card {
  @apply bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl;
}

/* Button styling */
.btn-primary {
  @apply bg-gradient-to-r from-primary to-secondary text-primary-foreground;
}

/* Input styling */
.input {
  @apply bg-background border border-border rounded-xl focus:ring-primary/50;
}
```

## 🚀 **Deployment**

### **Vercel Deployment (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

### **Firebase Hosting**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy
```

## 🛠 **Development Workflow**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### **Adding Sample Data**
```bash
# Run the sample data script
npx tsx src/scripts/add-sample-data.ts
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Firebase Connection Issues**
   - Verify your Firebase project ID and API keys
   - Check Firestore security rules are applied
   - Ensure billing is enabled for production usage

2. **Theme Not Loading**
   - Verify `globals.css` imports the Northern Lights theme
   - Check that `className="dark"` is set on the HTML element
   - Confirm Tailwind CSS is properly configured

3. **TMDb Sync Errors**
   - Verify your TMDb API key is valid
   - Check rate limiting settings in `.env.local`
   - Monitor network requests in browser dev tools

4. **Build Errors**
   - Run `npm run type-check` to identify TypeScript issues
   - Verify all environment variables are set
   - Check for missing dependencies

### **Debug Mode**
Enable debug logging by adding to `.env.local`:
```env
NODE_ENV=development
DEBUG=tv-editor-finder:*
```

## 📈 **Next Steps**

### **Phase 2: Intelligence System**
- Implement the research database features
- Add editor knowledge aggregation
- Build advanced analytics dashboard
- Create industry intelligence tools

### **Phase 3: Data Expansion**
- Complete Emmy Awards integration
- Enhance IMDb scraping capabilities
- Add professional network connections
- Improve data quality and verification

### **Phase 4: User Features**
- Add user authentication system
- Implement saved searches and favorites
- Create editor contact management
- Build project collaboration tools

---

## 🎬 **Ready to Launch!**

Your TV Editor Finder platform with the stunning Northern Lights theme is now ready! The beautiful aurora-inspired design creates a premium experience for discovering television editing talent.

**Live Application**: http://localhost:3000
**Admin Dashboard**: http://localhost:3000/admin

Enjoy the gorgeous Northern Lights interface! ✨ 