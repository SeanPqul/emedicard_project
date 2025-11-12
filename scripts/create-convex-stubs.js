#!/usr/bin/env node

/**
 * Creates stub Convex generated files for build environments
 * This allows the build to complete without requiring Convex authentication
 */

const fs = require('fs');
const path = require('path');

const backendPath = path.join(__dirname, '..', 'backend');
const generatedPath = path.join(backendPath, 'convex', '_generated');

// Create the _generated directory if it doesn't exist
if (!fs.existsSync(generatedPath)) {
  fs.mkdirSync(generatedPath, { recursive: true });
}

console.log('Creating Convex stub files for build...');

// api.js - Exports the API types
const apiContent = `/*
 * AUTO-GENERATED FILE FOR BUILD PURPOSES
 * Replace with actual Convex generated files in production
 */

// Stub API exports for build
export const api = new Proxy({}, {
  get: (target, prop) => {
    return new Proxy({}, {
      get: (innerTarget, innerProp) => {
        return new Proxy({}, {
          get: () => () => {} // Return a function for any property access
        });
      }
    });
  }
});

export default api;
`;

// dataModel.js - Exports data model types
const dataModelContent = `/*
 * AUTO-GENERATED FILE FOR BUILD PURPOSES
 */

export type Id<T extends string = string> = string & { __tableName: T };
export type Doc<T extends string = string> = any;

export type DataModel = any;
`;

// server.js - Server utilities
const serverContent = `/*
 * AUTO-GENERATED FILE FOR BUILD PURPOSES
 */

export const query = () => {};
export const mutation = () => {};
export const action = () => {};
export const httpAction = () => {};
export const internalQuery = () => {};
export const internalMutation = () => {};
export const internalAction = () => {};
`;

// react.js - React hooks
const reactContent = `/*
 * AUTO-GENERATED FILE FOR BUILD PURPOSES
 */

export const useQuery = () => undefined;
export const useMutation = () => () => Promise.resolve();
export const useAction = () => () => Promise.resolve();
export const usePaginatedQuery = () => ({ results: [], loadMore: () => {} });
export const useConvexAuth = () => ({ isAuthenticated: false, isLoading: false });
export const useConvex = () => ({});
export const ConvexProvider = ({ children }) => children;
export const ConvexReactClient = class {};
`;

// api.d.ts - TypeScript definitions
const apiDtsContent = `/*
 * AUTO-GENERATED FILE FOR BUILD PURPOSES
 */

import type { ApiFromModules } from "convex/server";

declare const fullApi: any;
export declare const api: typeof fullApi;
export declare const internal: typeof fullApi;
`;

// Write all the files
const files = [
  { name: 'api.js', content: apiContent },
  { name: 'dataModel.js', content: dataModelContent },
  { name: 'server.js', content: serverContent },
  { name: 'react.js', content: reactContent },
  { name: 'api.d.ts', content: apiDtsContent }
];

files.forEach(file => {
  const filePath = path.join(generatedPath, file.name);
  fs.writeFileSync(filePath, file.content);
  console.log(`✓ Created ${file.name}`);
});

console.log(`✅ Successfully created ${files.length} stub files in convex/_generated/`);
console.log('Note: These are stub files for build purposes only.');