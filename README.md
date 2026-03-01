# Research Reader

Research Reader is a client-side React application for reading research documents with AI-assisted comprehension tools.

It supports PDF and DOCX uploads, lets users select passages for explanation, extracts and resolves footnotes, runs web research queries, and offers a Q&A panel for self-testing.

## Contents

- [What It Does](#what-it-does)
- [Core Features](#core-features)
- [Quick Start](#quick-start)
- [User Tutorial](#user-tutorial)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Security and Privacy](#security-and-privacy)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

## What It Does

Research Reader helps users process dense academic text by combining:

- Document parsing and structured rendering
- In-context AI explanation for selected text
- Footnote marker detection and reference lookup
- Related-source web search
- Simple comprehension practice (Q&A)

The app is frontend-only (no custom backend service).

## Core Features

1. Document upload and parsing
- Supports `.pdf`, `.docx`, and `.doc`
- Enforces 50 MB max file size
- Extracts plain text and heuristic content structure (headings + paragraphs)

2. AI explanations
- Select text from the document viewer
- Generate explanations through OpenAI Chat Completions
- Displays generated response in the Explanations panel

3. Footnote resolution
- Detects bracket markers like `[1]`, `[2]`, etc.
- Attempts to locate footnote definitions from document text
- Clicking a footnote in the sidebar scrolls to the matching marker in content

4. Web research
- Uses Tavily Search API to fetch related sources
- Returns title, snippet, URL, and relevance score

5. Interactive Q&A
- Generates a question set trigger using AI call
- Current implementation displays a fixed mock question set and simple answer scoring

## Quick Start

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm (bundled with Node.js)

### Install and Run

```bash
cd /Users/hwitzthum/AGY-Projects/research-reader
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
npm run preview
```

## User Tutorial

### 1. Launch the app

Run `npm run dev` and open the app in your browser.

### 2. Configure API keys

1. Click `Settings` in the header.
2. Paste your OpenAI API key (starts with `sk-`).
3. Paste your Tavily API key.
4. Click `Save` for each key.

Without keys:

- Explanations and Q&A generation will fail without OpenAI key.
- Research search will fail without Tavily key.

### 3. Upload a document

1. Drag and drop a research paper into the upload area (or click to browse).
2. Wait for parsing to complete.
3. Verify document metadata and extracted content appear in the viewer.

### 4. Ask for an explanation

1. Highlight a passage in the document pane.
2. Open the `Explanations` tab if not already active.
3. Click `Get Explanation`.
4. Review the generated explanation and clear selection when done.

### 5. Resolve footnotes

1. Open `Footnotes` tab.
2. Click a detected footnote entry.
3. The viewer scrolls to the corresponding in-text marker and highlights it briefly.

### 6. Run related research searches

1. Open `Research` tab.
2. Enter a question or topic.
3. Press Enter or click `Search`.
4. Open returned sources in a new tab.

### 7. Test comprehension

1. Open `Q&A` tab.
2. Click `Generate Questions`.
3. Write answers and use `Check Answer` for feedback.

## Architecture

### High-level design

- Single-page React app (`Vite + TypeScript`)
- Zustand for local app state
- Browser-only runtime; external API calls from client
- Modular split between UI components, stores, services, and utils

### Architecture diagram

```mermaid
graph TD
    U[User] --> UI[React UI]
    UI --> DS[Document Store\nZustand]
    UI --> SS[Selection Store\nZustand]
    UI --> DP[Document Parser Service]
    UI --> AIS[AI Service]
    UI --> RS[Research Service]
    DP --> PDFJS[pdfjs-dist]
    DP --> MAM[mammoth]
    AIS --> OAI[OpenAI Chat Completions API]
    RS --> TAV[Tavily Search API]
    UI --> AK[API Key Storage Utils]
    AK --> LS[localStorage\n(obfuscated)]
```

### UI composition

- `App.tsx`
- Global layout and state-driven view switching (upload screen vs split-screen reader)
- Hosts Settings modal

- `DocumentUploader.tsx`
- File drag-drop and validation
- Triggers parse flow and document store updates

- `DocumentViewer.tsx`
- Renders structured content blocks
- Captures user text selection
- Displays metadata and inline footnote markers

- `Sidebar.tsx`
- Tab routing between functional panels

- `ExplanationsPanel.tsx`
- Uses selected text and AI service for explanations

- `FootnotesPanel.tsx`
- Lists extracted footnotes and enables jump-to-reference behavior

- `ResearchPanel.tsx`
- Tavily-backed web search UI

- `QAPanel.tsx`
- Question generation trigger and answer feedback workflow

- `SettingsPanel.tsx`
- API key create/read/update/clear UX

### State management

- `documentStore`
- Holds parsed document, original file, loading state, and error state
- Provides mutations for set/clear/loading/error transitions

- `selectionStore`
- Holds selected text and selection status for explanation workflows

### Service layer

- `documentParser.ts`
- Detects file type and routes to PDF/DOCX parser
- PDF parsing: `pdfjs-dist`
- DOCX parsing: `mammoth`
- Builds content blocks and extracted footnote definitions

- `aiService.ts`
- Sends Chat Completions request to OpenAI
- Used by explanation panel and Q&A generation trigger

- `researchService.ts`
- Sends query to Tavily Search API and normalizes response shape

### Utilities

- `apiKeyStorage.ts`
- Wrapper around localStorage get/set/clear for OpenAI and Tavily keys

- `encryption.ts`
- Base64 + XOR obfuscation helper functions
- Includes key masking and lightweight format validation

## Data Flow

### Document ingestion flow

1. User uploads file
2. `DocumentUploader` validates file type and size
3. `parseDocument(file)` extracts text and metadata
4. Parsed result stored in `documentStore`
5. `DocumentViewer` renders structured blocks and metadata

### Explanation flow

1. User selects text in viewer
2. Selection stored in `selectionStore`
3. `ExplanationsPanel` calls `generateExplanation(selectedText, context)`
4. OpenAI response displayed in panel

### Research flow

1. User enters query in `ResearchPanel`
2. `searchResearch(query)` calls Tavily API
3. Results normalized and rendered with relevance score and links

## Security and Privacy

- API keys are stored in browser localStorage only.
- Keys are obfuscated (not strongly encrypted) in client-side storage.
- Keys are sent directly to provider APIs when features are used.
- No server-side secret management exists in current architecture.

Recommendation for production use:

1. Move API calls to a backend service.
2. Keep provider keys in server-side secret storage.
3. Add request throttling, abuse protection, and centralized logging.

## Project Structure

```text
research-reader/
  public/
    pdf.worker.min.mjs
  src/
    components/
      DocumentUploader.tsx
      DocumentViewer.tsx
      ExplanationsPanel.tsx
      FootnotesPanel.tsx
      QAPanel.tsx
      ResearchPanel.tsx
      SettingsPanel.tsx
      Sidebar.tsx
    services/
      aiService.ts
      documentParser.ts
      researchService.ts
    store/
      documentStore.ts
      selectionStore.ts
    utils/
      apiKeyStorage.ts
      encryption.ts
    App.tsx
    main.tsx
  package.json
  vite.config.ts
```

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- Zustand (state)
- pdfjs-dist (PDF parsing)
- mammoth (DOCX parsing)
- OpenAI Chat Completions API
- Tavily Search API
- Framer Motion (available dependency)

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Type-check and production build
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint

## Troubleshooting

### "OpenAI API key not found"

- Open `Settings`
- Ensure key starts with `sk-`
- Save key again and retry explanation/Q&A

### "Tavily API key not found"

- Open `Settings`
- Save a valid Tavily key and retry search

### "Unsupported file type"

- Upload only PDF, DOCX, or DOC

### Footnotes missing or incomplete

- Footnote extraction is regex/heuristic-based
- Some PDF text layouts may not preserve reference definition structure

### Build/runtime issues

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Known Limitations

1. No backend proxy for API calls (keys used in browser context).
2. Key storage is obfuscation, not cryptographic secret protection.
3. Heading and footnote extraction rely on text heuristics.
4. Q&A currently uses static mock questions and basic answer correctness checks.
5. PDF rendering currently uses text reconstruction in `DocumentViewer` instead of page-accurate PDF canvas rendering.
6. No automated test suite is configured yet.

## Future Improvements

1. Add backend API gateway for secure key management.
2. Replace heuristic parsing with richer document structure extraction.
3. Implement structured-output Q&A generation and semantic answer grading.
4. Add citation graph and source-verification workflow.
5. Add unit/integration tests (parser, services, stores, key UI flows).
6. Re-enable advanced PDF page rendering path where needed.
