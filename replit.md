# TranscribeAI - AI-Powered Audio & Video Transcription

## Overview
TranscribeAI is a React-based web application that provides AI-powered audio and video transcription services. The platform allows users to convert their media files into accurate text transcriptions with features like speaker identification and multiple export formats.

## Project Architecture

### Tech Stack
- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 4.5.14
- **Routing**: React Router DOM 6.16.0
- **UI Components**: Radix UI primitives
- **Styling**: TailwindCSS 3.3.3 with animations
- **Animation**: Framer Motion 10.16.4
- **Backend Services**: Supabase (Authentication & Functions)
- **Export Formats**: Support for TXT, DOCX, PDF, and SRT formats

### Project Structure
```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Radix UI component wrappers
│   └── ...          # Feature components
├── contexts/        # React context providers
├── lib/             # Utilities and configurations
├── pages/           # Page components
└── App.jsx          # Main application component
```

## Core Features
1. **Free Transcription Service**: 10 free transcriptions daily without sign-up required
2. **Large File Support**: Upload files up to 500MB with no duration limits
3. **English-Only Experience**: Streamlined interface without language switching
4. **Multiple Export Formats**: Download transcripts as TXT, DOCX, PDF, or SRT
5. **Speaker Identification**: Automatic detection and labeling of different speakers
6. **User Authentication**: Optional Supabase-based authentication system

## Recent Changes
- **2025-10-16**: Google AdSense Integration
  - **Action**: Added Google AdSense script to index.html head section
  - **Implementation**: AdSense script loads asynchronously on all pages
  - **Publisher ID**: ca-pub-2118843663565567
  - **Ad Components Removed**: Deleted placeholder AdPlaceholder and GoogleAd components from all 8 pages
  - **Clean Implementation**: Ads now managed entirely through Google AdSense auto-ads system
  - **Pages Cleaned**: LandingPage, AboutPage, PrivacyPage, PricingPage, SecurityPage, TermsPage, TranscriptionsPage, UploadPage

- **2025-10-14**: Vite Build Configuration Fix
  - **Problem**: Deployment failing with "Could not resolve entry module index.html" error
  - **Root Cause**: Missing index.html in root directory and missing build.rollupOptions.input configuration
  - **Solution**: 
    - Recreated index.html in project root with proper React app structure
    - Updated vite.config.js with explicit `root: '.'` and `build.rollupOptions.input` configuration
    - Set `outDir: 'dist'` to match server static file serving path
  - **Result**: Build succeeds, generates proper dist output for production

- **2025-10-14**: Production Deployment Fix - Proxy Configuration & Single Server Architecture
  - **Problem Solved**: Fixed production deployment issue where frontend couldn't reach backend API (ECONNREFUSED error)
  - **Root Cause**: Vite proxy only works in development mode, not in production builds
  - **Solution Implemented**: 
    - Configured server.js to serve both API endpoints AND static frontend files in production
    - Backend now runs on port 5000 in production (same as frontend), eliminating proxy need
    - Updated deployment config to use Autoscale deployment with single unified server
    - Development mode unchanged: still uses Vite dev (port 5000) + Express backend (port 3001) with proxy
    - Fixed Express v5 compatibility issue with catch-all routes (changed from `app.get('*')` to `app.use()`)
    - Added absolute path resolution using ES module `__dirname` equivalent for static file serving
  - **Smart PORT Detection**: Server automatically uses correct port based on environment:
    - Development: PORT 3001 (backend only, Vite proxy handles routing)
    - Production: PORT 5000 (serves both API and static files)

- **2025-10-14**: Timestamp Display Fix - Smart Detection System
  - **Problem**: Timestamps showing "00:00:00" for legacy data
  - **Root Cause**: Legacy data stored in seconds (0.4, 10.48), new data in milliseconds (400, 10480)
  - **Solution**: Implemented smart detection in `toSeconds()` function:
    - Values >= 1000 → treated as milliseconds, divided by 1000
    - Values < 1000 → treated as seconds, used as-is
  - **Result**: Both legacy and new data display correctly without migration

- **2025-10-14**: TranscriptEditorPage Improvements & Timestamp System Overhaul
  - **Timestamp System**: Implemented robust timestamp handling to fix display issues
    - All timestamps now stored in milliseconds (AssemblyAI native format)
    - Single `toSeconds()` conversion function for consistent display formatting
    - Fixed duration calculation to handle mixed units (audio_duration in seconds, segments in milliseconds)
    - Corrected all export formats (DOCX, SRT, VTT) to display accurate timestamps
  - **English UI Conversion**: Converted all Turkish text to English throughout TranscriptEditorPage
    - Updated all UI labels, buttons, placeholders, and descriptions
    - Translated feature sections (sentiment analysis, entity recognition, content safety, etc.)
  - **Conditional Rendering**: Implemented smart feature display
    - Sentiment analysis, entity recognition, content safety, IAB categories, and chapters only appear when data exists
    - LeMUR assistant always available for transcript processing

- **2025-10-14**: GitHub Import & Replit Environment Setup
  - Successfully imported GitHub repository into Replit environment
  - Fixed React JSX warnings by converting `class` to `className` in LandingPage component
  - Configured workflow to run both backend (port 3001) and frontend (port 5000) servers
  - Set up VM deployment with build and run commands for production
  - Verified backend API is running and responding correctly
  - Updated .gitignore to include environment files
  
- **2025-10-11**: Data Structure Migration & Frontend Updates
  - Migrated all frontend components to use new data structure (text, segments, duration, language)
  - Updated TranscriptEditorPage to read from new fields with legacy fallback support
  - Modified all export functions (TXT, DOCX, PDF, SRT) to use new data structure
  - Ensured backward compatibility with existing transcriptions
  - Verified complete data flow: upload → API → storage → display → export
  
- **2025-10-11**: AssemblyAI & Backend Integration
  - Integrated AssemblyAI API for audio/video transcription
  - Created Express backend server (port 3001) for handling transcription requests
  - Updated FileUpload component to use local API endpoint
  - Increased upload limit to 500MB and removed the 5-minute duration cap
  - Configured API proxy in Vite for seamless frontend-backend communication
  - Fixed translation context issues by adding sidebar translations

## Development

### Running the Project
The project uses a configured workflow that automatically starts both backend and frontend servers:
- **Frontend**: Vite dev server on `http://0.0.0.0:5000` with HMR enabled
- **Backend**: Express API server on `http://localhost:3001`
- **Proxy**: Vite proxies `/api` requests to the backend server
- **Host Configuration**: `allowedHosts: true` configured for Replit environment

### Building for Production
```bash
npm run build
```
Builds the application to the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

## Deployment
The project is configured for Replit Autoscale deployment with unified server architecture:
- **Build Command**: `npm run build` (creates static files in `dist/` directory)
- **Run Command**: `NODE_ENV=production PORT=5000 node server.js`
- **Deployment Type**: Autoscale (automatically scales based on traffic)
- **Architecture**: Single Express server serves both API endpoints (`/api/*`) and static frontend files
- **Port**: 5000 (both API and frontend on same port, no proxy needed)
- **Environment Variables**: 
  - `NODE_ENV=production` triggers static file serving from `dist/` directory
  - `PORT=5000` ensures server listens on correct port for public access

## External Services & Configuration

### API Keys Required
- **ASSEMBLYAI_API_KEY**: Required for transcription service. Set this as a Replit secret.

### Supabase (Optional)
- **URL**: `https://clrjcjuotgwrssjcwzxj.supabase.co`
- **Anon Key**: Currently hardcoded in `src/lib/customSupabaseClient.js`
- Note: Supabase integration is optional and used for authentication features

## Known Issues & Notes
- React Router future flag warnings for v7 migration (can be addressed in future updates)
- The application uses Replit visual editor plugins for development
- AssemblyAI API key must be configured as a Replit secret for transcription to work

## User Preferences
- No specific user preferences documented yet
