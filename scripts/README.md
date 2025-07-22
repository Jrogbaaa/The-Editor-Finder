# Scripts Directory

This directory contains import scripts to populate your TV Editor Finder database with professional editor data.

## 📂 Files

### Data Files
- `prominent-editors-data.json` - **32 industry-verified editors** (original dataset)
- `global-tv-editors-data.json` - **35 international editors** (global expansion dataset)

### Import Scripts
- `import-prominent-editors-simple.ts` - Import original 32 editors
- `import-global-editors.ts` - **NEW**: Import 35 global editors
- `add-sample-data.ts` - Add sample test data (development only)

## 🌍 **COMPLETE DATABASE SETUP**

### **Recommended: Import Full Global Database (65+ Editors)**

```bash
# Step 1: Import original prominent editors (32 editors)
npx tsx scripts/import-prominent-editors-simple.ts

# Step 2: Import new global research (35 editors) 
npx tsx scripts/import-global-editors.ts
```

**Total Result: 65+ professional TV editors with verified credentials**

## 🎯 **What You'll Get**

### **🇺🇸 United States (Enhanced)**
- **Recent Emmy Winners**: The Last of Us, BEEF, Succession editors
- **Classic Emmy Winners**: Breaking Bad, Stranger Things, Game of Thrones, The Bear
- **Streaming Specialists**: Netflix, HBO, Apple TV+ editors
- **Genre Experts**: Comedy, animation, reality specialists

### **🇬🇧 United Kingdom (NEW)**
- **BAFTA Craft Award Winners**: This Is Going to Hurt, Baby Reindeer, Chernobyl
- **BBC Productions**: Doctor Who, Silent Witness, Three Girls
- **International Co-productions**: House of the Dragon, The Crown

### **🇪🇸 Spain (NEW)**
- **Complete Money Heist Team**: 6 International Emmy winners
- **Netflix Spanish Originals**: Sky Rojo, Berlin, The Pier
- **Spanish TV Industry**: Antena 3, Movistar+ productions

### **🇩🇪 Germany (NEW)**
- **Netflix German Originals**: Dark editing team (3 Grimme-Preis winners)
- **Auteur-Driven Series**: The Empress, 1899
- **German Television**: Das Erste, international co-productions

### **🇦🇹 Austria (NEW)**
- **International Productions**: Safe, Tatort
- **Netflix Content**: Dark (co-editor)

### **🇩🇰 Denmark (NEW)**
- **Nordic Noir Pioneer**: Borgen, The Killing, Unit One
- **Danish Broadcasting**: DR1 productions
- **International Influence**: Nordic TV model

## 🔥 Firebase Setup

### 1. **Environment Variables**
Create `.env.local` in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. **Firestore Security Rules**
**IMPORTANT**: Temporarily open write access during import:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow public writes for import
    match /editors/{editorId} {
      allow read, write: if true;
      
      match /credits/{creditId} {
        allow read, write: if true;
      }
      
      match /awards/{awardId} {
        allow read, write: if true;
      }
    }
    
    // All other collections remain secure
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Apply in Firebase Console → Firestore Database → Rules → Publish**

## 🚀 Running the Import

### **Option 1: Complete Global Database (Recommended)**

```bash
# Import both datasets for complete coverage
npx tsx scripts/import-prominent-editors-simple.ts
npx tsx scripts/import-global-editors.ts
```

### **Option 2: Individual Imports**

```bash
# Just original dataset (32 editors)
npx tsx scripts/import-prominent-editors-simple.ts

# Just global expansion (35 editors)  
npx tsx scripts/import-global-editors.ts
```

## 📊 What Gets Imported

### **Editors Collection**
- **Personal Information**: Name, location (with country), experience
- **Professional Details**: Union status, specialties, availability
- **Metadata**: Data sources, verification status, creation dates

### **Credits Collection**
- **Show Details**: Title, network, genre, type (series/limited series)
- **Timeline**: Start/end years, duration
- **Verification**: Data sources, credibility scoring

### **Awards Collection**
- **Award Information**: Name, category, year, status (won/nominated)
- **Show Association**: Which show the award was for
- **International Recognition**: Emmy, BAFTA, Grimme-Preis, ACE Eddie, International Emmy

## 🗄️ Data Structure

### **Editor Document**
```typescript
{
  name: "Timothy A. Good",
  location: { 
    city: "Los Angeles", 
    state: "CA", 
    country: "USA",        // NEW: International support
    remote: true 
  },
  experience: {
    yearsActive: 18,
    startYear: 2006,
    specialties: ["Drama", "Sci-Fi", "Thriller"]
  },
  professional: {
    unionStatus: "guild",
    availability: "available"
  },
  metadata: {
    dataSource: ["emmys", "industry-research"],  // NEW: Multi-source
    verified: true,
    createdAt: "2025-01-22",
    updatedAt: "2025-01-22"
  }
}
```

### **Credit Document**
```typescript
{
  editorId: "editor_document_id",
  title: "The Last of Us",
  network: "HBO",
  genre: ["Drama", "Horror", "Post-Apocalyptic"],
  type: "series",
  timeline: {
    startYear: 2023,
    endYear: null
  },
  metadata: {
    dataSource: ["industry-research"],
    verified: true,
    createdAt: "2025-01-22"
  }
}
```

### **Award Document**
```typescript
{
  editorId: "editor_document_id",
  name: "Emmy Award",
  category: "Outstanding Picture Editing for a Drama Series",
  year: 2023,
  status: "won",
  show: "The Last of Us",
  metadata: {
    dataSource: ["awards-database"],
    verified: true,
    createdAt: "2025-01-22"
  }
}
```

## ✅ After Import

### 1. **Restore Secure Rules**
Replace the temporary rules with your secure production rules.

### 2. **Sync to Algolia** (Optional)
```bash
npm run sync:algolia
```

### 3. **Verify Data**
Check your Firebase console to confirm data was imported correctly.

## 🔍 Search Examples

Once imported, you can search for:

### **By Name**
- "Timothy Good" (The Last of Us editor)
- "Selina MacArthur" (This Is Going to Hurt editor)

### **By Show**
- "Money Heist" (finds entire Spanish editing team)
- "Dark" (finds German Netflix editors)
- "Breaking Bad" (finds original dataset editors)

### **By Awards**
- Emmy Winners filter (finds all Emmy-winning editors)
- BAFTA Winners (finds UK award winners)
- International Awards (finds global recognition)

### **By Country**
- United States, United Kingdom, Spain, Germany, Austria, Denmark

### **By Network**
- Netflix, HBO, BBC, Apple TV+, Disney+, Amazon Prime

## 🔧 Troubleshooting

### **Permission Denied Errors**
- Check that Firestore rules allow writes during import
- Verify environment variables are correctly set
- Ensure Firebase project exists and is accessible

### **Environment Variable Issues**
- Confirm `.env.local` is in project root (not `/scripts/`)
- Check variable names match exactly (including `NEXT_PUBLIC_` prefix)
- Restart terminal after adding new variables

### **Import Failures**
- Check internet connection for Firebase access
- Verify Firebase project configuration
- Look for typos in data files

## 📈 Import Results

### **Expected Output (Global Import)**
```
🎉 GLOBAL IMPORT COMPLETE!
═══════════════════════════════════════
✅ Editors imported: 35
📺 Credits imported: 120+
🏆 Awards imported: 50+
═══════════════════════════════════════

🌍 NEW GLOBAL COVERAGE:
   🇺🇸 USA: Emmy & ACE Eddie winners
   🇬🇧 UK: BAFTA Craft Award winners
   🇪🇸 Spain: Money Heist editing team
   🇩🇪 Germany: Dark & Netflix originals
   🇦🇹 Austria: International productions
   🇩🇰 Denmark: Nordic Noir masters
```

## 🌟 **Success!**

You now have a comprehensive global database of 65+ professional TV editors with verified credentials, international coverage, and award documentation.

**Ready to search your expanded database!** 🚀 