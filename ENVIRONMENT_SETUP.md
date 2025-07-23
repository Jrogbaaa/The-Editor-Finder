# 🔧 Environment Setup Guide

## Required API Keys

### 🌐 **Apify Configuration (Required for Web Search)**
Add these to your `.env.local`:

```env
# Apify API Token (Required)
APIFY_API_TOKEN=your_apify_api_token_here
```

Get your token from [Apify Console](https://console.apify.com/settings/integrations):
1. Sign up at apify.com
2. Go to Settings > Integrations > API tokens
3. Create a new token with full access
4. Copy your API token

### 🔥 **Firebase Configuration (Required)**
```env
# Firebase Project Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 🎬 **TMDb API (Optional - for additional TV show data)**
```env
TMDB_API_KEY=your_tmdb_api_key_here
```

### 🕸️ **Firecrawl Integration (Optional - alternative web scraping)**
```env
FIRECRAWL_API_KEY=your_firecrawl_key_for_advanced_scraping
```

## 🔑 **API Key Summary**

| Service | Purpose | Required? | Cost |
|---------|---------|-----------|------|
| **Apify** | Web scraping & Google search | ✅ Yes | $2/1000 pages |
| **Firebase** | Database & hosting | ✅ Yes | Free tier available |
| **TMDb** | Additional TV show metadata | ❌ No | Free |
| **Firecrawl** | Advanced web scraping | ❌ No | $2/1000 pages |

## 🎯 **Minimum Setup Required**

For **basic functionality**:
- ✅ `APIFY_API_TOKEN` (web search)
- ✅ Firebase configuration (database)

For **enhanced features**:
- 📺 `TMDB_API_KEY` (richer TV show data)
- 🕸️ `FIRECRAWL_API_KEY` (alternative scraping)

## 🚀 **Complete .env.local Example**

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Algolia Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=V0KR3LXR6K
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=c41b30a5664e8eb5d270a8261877c37e
ALGOLIA_APP_ID=V0KR3LXR6K
ALGOLIA_ADMIN_KEY=9a28b30f46a25c06117cd4479a1b2514

# TMDb API for TV Show Data
TMDB_API_KEY=get_from_themoviedb.org

# Optional Keys
FIRECRAWL_API_KEY=your_firecrawl_key
```

## 🔒 **Security Best Practices**

1. **Never commit `.env.local`** to version control
2. **Use Admin Key only in backend scripts**
3. **Search Key is safe for frontend** (read-only)
4. **Usage/Monitoring keys are optional** for basic functionality
5. **Rotate keys regularly** in production 