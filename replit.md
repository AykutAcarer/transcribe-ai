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
The project is configured for Replit VM deployment:
- **Build Command**: `npm run build`
- **Run Command**: `node server.js & npm run preview` (runs both backend and frontend)
- **Deployment Type**: VM (required for stateful backend server)
- **Ports**: Backend on 3001 (localhost), Frontend on 5000 (public)

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
