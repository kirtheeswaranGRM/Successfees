---
description: Repository Information Overview
alwaysApply: true
---

# Success Fees Management Information

## Summary
A full-stack TypeScript application for managing student fees, categories, and payments. It features a dashboard with analytics, PDF receipt generation, and authentication (Google OAuth2 and Local). The project uses a React frontend and an Express backend with MongoDB (Mongoose) for data storage.

## Structure
- **`client/`**: React frontend with Vite, Tailwind CSS, and Recharts.
- **`server/`**: Express backend, handling API routes, authentication, and database connections.
- **`shared/`**: Shared schemas and route definitions between client and server.
- **`script/`**: Build scripts using `esbuild` and `vite`.
- **`attached_assets/`**: Project-related images and documentation.

## Language & Runtime
**Language**: TypeScript  
**Version**: Node.js v20.x (Targeted)  
**Build System**: Vite (Client), esbuild (Server)  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- **Frontend**: `react`, `wouter`, `@tanstack/react-query`, `recharts`, `jspdf`, `framer-motion`, `tailwind-merge`.
- **Backend**: `express`, `mongoose`, `passport`, `passport-google-oauth20`, `passport-local`, `ws`.
- **Shared**: `zod` for schema validation.

**Development Dependencies**:
- `tsx`, `typescript`, `cross-env`, `@types/node`, `@types/express`.

## Build & Installation
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Start the production server
npm start

# Type checking
npm run check
```

## Main Files & Resources
**Entry Points**:
- **Client**: [./client/src/main.tsx](./client/src/main.tsx)
- **Server**: [./server/index.ts](./server/index.ts)

**Configuration**:
- **Database**: [./server/db.ts](./server/db.ts) (Mongoose models and connection)
- **Routing**: [./server/routes.ts](./server/routes.ts) and [./shared/routes.ts](./shared/routes.ts)
- **Schema**: [./shared/schema.ts](./shared/schema.ts)
- **Styling**: [./tailwind.config.ts](./tailwind.config.ts), [./postcss.config.js](./postcss.config.js)

## Testing
**Framework**: None explicitly configured in `package.json`.
**Validation**: Zod is used for runtime data validation across the application.
