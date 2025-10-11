# TranscribeAI - AI-Powered Audio & Video Transcription

## Overview
TranscribeAI is a React-based web application that provides AI-powered audio and video transcription services. The platform allows users to convert their media files into accurate text transcriptions with features like speaker identification, multiple export formats, and multi-language support.

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
2. **Large File Support**: Upload files up to 200MB and 5 minutes long
3. **Multi-language Support**: Supports 30+ languages
4. **Multiple Export Formats**: Download transcripts as TXT, DOCX, PDF, or SRT
5. **Speaker Identification**: Automatic detection and labeling of different speakers
6. **User Authentication**: Optional Supabase-based authentication system

## Recent Changes
- **2025-10-11**: Initial Replit setup completed
  - Configured Vite dev server to run on port 5000 with 0.0.0.0 host
  - Fixed vite binary permissions issue
  - Set up Frontend workflow for development
  - Configured deployment for autoscale with build and preview commands
  - Added .gitignore for Node.js/React/Replit environment

## Development

### Running the Project
The project uses a configured workflow that automatically starts the development server:
- Server runs on `http://0.0.0.0:5000`
- Hot module replacement (HMR) enabled
- Vite dev server with CORS and allowed hosts configured

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
The project is configured for Replit Autoscale deployment:
- **Build Command**: `npm run build`
- **Run Command**: `npm run preview`
- **Deployment Type**: Autoscale (suitable for static sites)

## External Services
- **Supabase URL**: `https://clrjcjuotgwrssjcwzxj.supabase.co`
- **Transcription API**: Supabase Functions endpoint at `/functions/v1/transcribe`

## Known Issues & Notes
- Minor React warnings about DOM properties (using `class` instead of `className` in some components)
- React Router future flag warnings (can be addressed in future updates)
- The application uses visual editor plugins for development (Replit-specific features)

## User Preferences
- No specific user preferences documented yet
