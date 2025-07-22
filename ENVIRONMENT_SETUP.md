# 🔧 Environment Setup Guide

## Required API Keys

### 📱 **Frontend Keys (Public - Safe to Expose)**
Add these to your `.env.local`:

```env
# Algolia Frontend Configuration
NEXT_PUBLIC_ALGOLIA_APP_ID=V0KR3LXR6K
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=c41b30a5664e8eb5d270a8261877c37e
```

### 🔒 **Backend Keys (Private - NEVER Expose to Client)**
Add these to your `.env.local`:

```env
# Algolia Backend Configuration (for seeding scripts)
ALGOLIA_APP_ID=V0KR3LXR6K
ALGOLIA_ADMIN_KEY=9a28b30f46a25c06117cd4479a1b2514

# Alternative: Use Write Key instead of Admin Key
# ALGOLIA_WRITE_KEY=efb30d8bb71e6c4cf3a0d8eca69afd80
```

### 🎬 **TMDb API (for IMDB-like TV show data)**
```env
TMDB_API_KEY=your_tmdb_api_key_here
```

### 📊 **Optional Analytics Keys (NOT Required)**
These are for advanced analytics and monitoring:

```env
# Optional - Only needed for usage analytics
ALGOLIA_USAGE_KEY=8f25d3e21edbe9bae380a05b1086194a
ALGOLIA_MONITORING_KEY=dc0b8f9ea0d1a0a6ab3953b4c21d1241
```

## 🔑 **API Key Summary**

| Key Type | Purpose | Required? | Where Used |
|----------|---------|-----------|------------|
| **Application ID** | Identifies your Algolia app | ✅ Yes | Frontend + Backend |
| **Search Key** | Public search queries | ✅ Yes | Frontend only |
| **Admin Key** | Full write/read access | ✅ Yes | Backend scripts |
| **Write Key** | Write-only access | 🔄 Alternative | Backend scripts |
| **Usage Key** | Analytics data | ❌ No | Analytics |
| **Monitoring Key** | Performance metrics | ❌ No | Monitoring |

## 🎯 **Which Keys Do You Need?**

For **basic functionality**:
- ✅ Application ID
- ✅ Search Key (frontend)
- ✅ Admin Key OR Write Key (backend)

For **advanced features**:
- 📊 Usage Key (search analytics)
- 📈 Monitoring Key (performance tracking)

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