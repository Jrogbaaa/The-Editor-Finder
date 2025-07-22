# 🎬 TV Editor Data Import Scripts

This directory contains scripts and data for importing prominent TV editors into your Firebase database.

## 📁 Files

- `prominent-editors-data.json` - JSON export of 32 prominent TV editors from industry research
- `import-prominent-editors.ts` - Import script to add editors to Firebase
- This README.md

## 🔧 Firebase Setup

Before running the import script, you need to configure Firebase:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or use an existing project
3. Enable Firestore Database (in "Build" section)

### 2. Get Configuration Values
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon to create a web app (if not already created)
4. Copy the configuration values

### 3. Create Environment File
Create a `.env.local` file in your project root with these values:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Algolia Configuration (optional for now)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_search_key
ALGOLIA_WRITE_KEY=your_write_key
```

## 🚀 Running the Import

Once Firebase is configured:

```bash
# Install dependencies (if not already done)
npm install

# Run the import script
npx tsx scripts/import-prominent-editors.ts
```

## 📊 What Gets Imported

The script will import **32 prominent TV editors** including:

### Emmy Winners
- **Kelley Dixon** (Breaking Bad, Better Call Saul)
- **Chris G. Willingham** (24 - 3 Emmy wins)
- **Tim Porter** (Game of Thrones)
- **Katie Weiland** (Game of Thrones)
- **Yan Miles** (The Crown, Sherlock)
- **Dean Zimmerman** (Stranger Things - 2 Emmy wins)
- **Ken Eluto** (Succession, 30 Rock)
- **John M. Valerio** (The White Lotus)
- **A.J. Catoline** (Ted Lasso)
- **Joanna Naugle** (The Bear - 2 Emmy wins)

### BAFTA Winners
- **Gary Dollner** (Fleabag)
- **Elen Pierce Lewis** (Broadchurch)
- **Sarah Brewerton** (It's a Sin)

### International Editors
- **Nam Na-yeong** (Squid Game, Kingdom) - South Korea
- **Aarti Bajaj** (Sacred Games, Delhi Crime) - India
- **Raúl Mora** (La Casa de Papel, Vis a Vis) - Spain
- **Dana Stein** (Babylon Berlin, Tribes of Europa) - Germany

### Plus Many More From Major Shows
- Succession, The Bear, Severance, Ted Lasso, The White Lotus
- Breaking Bad universe, Game of Thrones universe
- Lost, Westworld, The Crown, Stranger Things
- And many more acclaimed series

## 📈 Data Structure

Each editor includes:
- **Personal Info**: Name, location, remote work availability
- **Experience**: Years active, start year, specialties (Drama, Comedy, etc.)
- **Professional**: Union status, availability
- **Credits**: TV shows with network, genre, role details
- **Awards**: Emmy/BAFTA wins and nominations with years
- **Metadata**: Data sources, verification status

## 🔍 After Import

Once imported, you can:

1. **Start your dev server**: `npm run dev`
2. **Search for editors** by name, genre, location, or show
3. **Filter by awards**, union status, remote availability
4. **View detailed profiles** with complete filmographies
5. **Sync to Algolia** for faster search: `npm run sync:algolia`

## 🌟 Search Examples

Try searching for:
- "Emmy" - Find all Emmy winners
- "Game of Thrones" - Find GoT editors
- "Comedy" - Find comedy specialists
- "London" - Find UK-based editors
- "Breaking Bad" - Find editors from the series
- "guild" - Find union editors

## 🛠️ Troubleshooting

### Firebase Errors
- **auth/invalid-api-key**: Check your `.env.local` file has correct values
- **Permission denied**: Ensure Firestore rules allow writes (check firestore.rules)

### Import Errors
- **File not found**: Ensure `prominent-editors-data.json` is in scripts/ directory
- **Network errors**: Check your internet connection and Firebase project status

### Environment Issues
- **Missing variables**: Run the script - it will tell you exactly which env vars are missing
- **Wrong project**: Double-check your PROJECT_ID matches your Firebase project

## 📝 Notes

- The import script is safe to run multiple times (it creates new documents each time)
- All imported data is marked as `verified: true` and `dataSource: ["industry-research"]`
- Random episode/season counts are generated for credits
- Awards include exact years and status (won/nominated)
- Geographic data includes major TV production centers (LA, NY, London, etc.)

---

**Need help?** Check the main README.md or create an issue in the repository. 