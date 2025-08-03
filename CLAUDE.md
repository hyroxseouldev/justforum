# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Development Commands

```bash
# Development server with Turbopack
pnpm dev
# or
npm run dev

# Build for production
npm run build

# Lint the codebase
npm run lint

# Run type checking
npx tsc --noEmit
```

## Architecture Overview

This is a **Korean language forum application** built with modern full-stack architecture:

### Core Stack
- **Frontend**: Next.js 15 (App Router) with React 19, TypeScript
- **Backend**: Convex (real-time database with built-in API layer)
- **Authentication**: Clerk (integrated with Convex)
- **UI**: Radix UI primitives + Tailwind CSS 4
- **Rich Text**: TipTap editor with extensions
- **Forms**: React Hook Form + Zod validation

### Key Architectural Decisions

**Database Schema (Convex)**:
- `users` - Synced with Clerk authentication
- `subjects` - Post categories (질문/피드백)
- `posts` - Forum posts with views, likes, author relations
- `comments` - Nested comments with parent/child relationships
- `likes` - User post likes

**Authentication Flow**:
- Clerk handles user management and JWT tokens
- Convex auth.config.ts validates JWT tokens
- Users auto-sync to Convex database via webhook handlers
- Protected routes use middleware.ts + Clerk route protection

**Real-time Data Flow**:
- Convex provides real-time subscriptions for all data
- Posts, comments, likes update automatically across clients
- No separate API routes needed - Convex handles all backend logic

## Subject/Category System

The app uses a fixed subject system defined in `src/lib/subjects.ts`:
- **질문** (Questions) - ID: `jn77gxsqpv9ax20e8gs6wkg17x7mzse7`
- **피드백** (Feedback) - ID: `jn75r4nbsjmyqwmjs7knsax3eh7myk5m`

When adding new subjects:
1. Add to Convex database first
2. Update `SUBJECT_IDS` mapping in subjects.ts
3. Update UI styling in `SUBJECT_INFO`

## Component Architecture

**Post Components**:
- `PostList` - Renders list of posts with empty state
- `PostItem` - Individual post card with metadata
- `WritePostForm` - Rich text editor with TipTap integration
- `SubjectBadge` - Category display with consistent styling

**UI System**:
- Radix UI primitives in `src/components/ui/`
- Custom wrapper components for consistent styling
- Tailwind 4 with CSS-in-JS configuration
- Form validation through React Hook Form + Zod schemas

## Convex Integration Patterns

**Query Pattern**:
```tsx
// In React components
const posts = useQuery(api.posts.list, { subjectId: "..." });

// In Server Components (Next.js App Router)
const posts = await fetchQuery(api.posts.list, {});
```

**Mutation Pattern**:
```tsx
const createPost = useMutation(api.posts.create);
await createPost({ title, content, subjectId, type });
```

**Authentication in Convex Functions**:
```tsx
// Get current user
const identity = await ctx.auth.getUserIdentity();
const user = await getCurrentUser(ctx);

// Protect mutations
if (!identity) throw new Error("Authentication required");
```

## Development Workflow

**Working with Posts**:
1. Posts use rich text content (HTML from TipTap)
2. Always include subject relationship and author
3. Views increment automatically on access
4. Likes are separate entities with user/post relationships

**Adding New Features**:
1. Define Convex schema changes first
2. Add corresponding TypeScript types
3. Create Convex query/mutation functions
4. Build React components with real-time subscriptions
5. Add form validation with Zod schemas

**Authentication Testing**:
- Sign in/out flows automatically sync with Convex
- Test protected routes through middleware
- User data available through `useUser()` and Convex queries

## File Structure Notes

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Home with post list and Korean UI
│   ├── create/       # Post creation page
│   └── [pid]/        # Individual post pages (not implemented)
├── components/
│   ├── post/         # Post-related components
│   └── ui/           # Radix UI primitive wrappers
├── lib/
│   ├── subjects.ts   # Subject/category constants and helpers
│   └── utils.ts      # Utility functions
└── middleware.ts     # Clerk route protection

convex/
├── schema.ts         # Database schema definitions
├── posts.ts          # Post CRUD operations
├── subjects.ts       # Subject management
├── users.ts          # User sync and management
└── auth.config.ts    # Clerk JWT validation
```

## Korean Language Considerations

- All user-facing text is in Korean
- Database content supports Korean text
- Form validation messages in Korean
- UI labels and navigation in Korean
- Consider Korean text length in UI sizing

## Common Patterns

**Form Handling**:
- Use React Hook Form with Zod validation
- Include `PreventForm` wrapper for unsaved changes warning
- Handle loading states with disabled buttons and spinners

**Real-time Updates**:
- Convex automatically updates UI when data changes
- No manual cache invalidation needed
- Use optimistic updates for better UX where appropriate

**Error Handling**:
- Toast notifications for user feedback (using sonner)
- Proper error boundaries for React components
- Convex mutations include Korean error messages

## Development Guidance

- **Convex Directory**: 
  - dont edit convex dir