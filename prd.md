# JustForum - Product Requirements Document (PRD)

## 🎯 Project Overview

### Product Name
**JustForum** - Korean Community Forum Platform

### Product Description
A modern, real-time Korean community forum application that enables users to create posts, engage in discussions through nested comments, and interact through likes. Built with cutting-edge web technologies and optimized for both desktop and mobile experiences.

### Target Users
- Korean-speaking community members
- Users seeking Q&A platform functionality
- Community managers and moderators
- Mobile and desktop users

---

## 🏗 Technical Architecture

### Core Technology Stack

#### Frontend Framework
```yaml
primary: Next.js 15
- App Router architecture
- React 19.1.0
- TypeScript 5
- Turbopack for development

styling: Tailwind CSS 4
- CSS-in-JS configuration
- Responsive design utilities
- Custom design tokens

ui_framework: Radix UI
- Accessible components
- Headless UI primitives
- shadcn/ui component system
```

#### Backend Infrastructure
```yaml
database: Convex
- Real-time database
- Automatic API generation
- Built-in authentication
- Real-time subscriptions

authentication: Clerk
- JWT token management
- Social login support
- User management
- Webhook integration

content: TipTap
- Rich text editor
- WYSIWYG interface
- HTML content storage
```

#### Development Tools
```yaml
language: TypeScript
validation: Zod schemas
forms: React Hook Form
state: Convex real-time queries
icons: Lucide React
notifications: Sonner (toast)
date_handling: date-fns with Korean locale
```

---

## 📊 Database Schema

### Core Entities

#### Users Table
```typescript
interface User {
  _id: Id<"users">
  _creationTime: number
  clerkId: string        // Clerk authentication ID
  name: string          // Display name
}

// Indexes
indexes: {
  by_clerk_id: ["clerkId"]
  by_name: ["name"]
}
```

#### Subjects Table (Categories)
```typescript
interface Subject {
  _id: Id<"subjects">
  _creationTime: number
  name: string          // "question" | "feedback"
  description?: string  // Optional description
}

// Indexes
indexes: {
  by_name: ["name"]
}

// Pre-populated data
initial_subjects: [
  { name: "question", description: "질문을 물어보세요" }
  { name: "feedback", description: "의견이나 제안을 남겨주세요" }
]
```

#### Posts Table
```typescript
interface Post {
  _id: Id<"posts">
  _creationTime: number
  title: string         // Post title
  content: string       // HTML content from TipTap
  views: number         // View counter
  subjectId: Id<"subjects">
  type: "notice" | "general"
  authorId: Id<"users">
}

// Indexes
indexes: {
  by_subject: ["subjectId"]
  by_author: ["authorId"]
  by_type: ["type"]
  search_title: {
    searchField: "title"
    filterFields: ["type", "subjectId"]
  }
  search_content: {
    searchField: "content"
    filterFields: ["type", "subjectId"]
  }
}
```

#### Comments Table
```typescript
interface Comment {
  _id: Id<"comments">
  _creationTime: number
  content: string       // Comment text content
  authorId: Id<"users">
  postId: Id<"posts">
  parentId?: Id<"comments">  // For nested replies
}

// Indexes
indexes: {
  by_post: ["postId"]
  by_author: ["authorId"]
  by_parent: ["parentId"]
}
```

#### Likes Table
```typescript
interface Like {
  _id: Id<"likes">
  _creationTime: number
  userId: Id<"users">
  postId?: Id<"posts">      // For post likes
  commentId?: Id<"comments"> // For comment likes
  type: "post" | "comment"
}

// Indexes
indexes: {
  by_user: ["userId"]
  by_post: ["postId"]
  by_comment: ["commentId"]
  by_user_and_post: ["userId", "postId"]
  by_user_and_comment: ["userId", "commentId"]
  by_type: ["type"]
}
```

---

## 🎨 UI/UX Design System

### Design Principles
- **Mobile-first responsive design**
- **Korean language optimization**
- **Accessibility compliance (WCAG 2.1 AA)**
- **Clean, modern interface**
- **Real-time feedback**

### Color Palette
```css
:root {
  --background: oklch(1 0 0);           /* White */
  --foreground: oklch(0.1884 0.0128 248.5103); /* Dark text */
  --primary: oklch(0.6959 0.1491 162.4796);    /* Brand color */
  --secondary: oklch(0.9806 0.0021 197.1221);  /* Light gray */
  --muted: oklch(0.9806 0.0021 197.1221);      /* Muted text */
  --accent: oklch(0.9581 0.0168 168.5006);     /* Accent color */
  --destructive: oklch(0.5919 0.2186 10.5826); /* Error red */
  --border: oklch(0.9614 0.0045 214.3285);     /* Border color */
}
```

### Typography
```css
font_primary: "Geist Sans" (fallback: system fonts)
font_mono: "Geist Mono" (fallback: monospace)
sizes: {
  xs: 0.75rem
  sm: 0.875rem
  base: 1rem
  lg: 1.125rem
  xl: 1.25rem
  2xl: 1.5rem
}
```

### Layout Breakpoints
```css
breakpoints: {
  sm: 640px    /* Mobile landscape */
  md: 768px    /* Tablet */
  lg: 1024px   /* Desktop */
  xl: 1280px   /* Large desktop */
}
```

---

## 🚀 Core Features

### 1. Authentication System

#### Requirements
- **Social login support** via Clerk
- **Automatic user synchronization** with Convex
- **JWT token management**
- **Protected routes middleware**

#### Implementation Details
```typescript
// Middleware protection
protected_routes: ["/create/**"]
public_routes: ["/", "/[pid]/**"]

// User sync via webhook
webhook_endpoint: "/api/clerk/webhook"
sync_events: ["user.created", "user.updated", "user.deleted"]
```

### 2. Post Management

#### Core Functionality
- **Rich text editing** with TipTap
- **Category classification** (Question/Feedback)
- **Real-time view counter**
- **Post search** (title and content)
- **Pagination support**

#### Post Creation Flow
1. User authentication check
2. Category selection (Question/Feedback)
3. Rich text content input
4. Form validation (Zod schema)
5. Real-time post creation
6. Redirect to post detail

#### Post List Features
```typescript
features: {
  pagination: {
    items_per_page: 10
    cursor_based: true
  }
  search: {
    types: ["title", "content"]
    real_time: true
  }
  filtering: {
    by_category: ["question", "feedback", "all"]
    by_type: ["general", "notice"]
  }
  sorting: {
    default: "creation_time_desc"
  }
}
```

### 3. Comment System

#### Features
- **Nested comments** (unlimited depth)
- **Real-time updates**
- **Comment likes**
- **Author permissions** (edit/delete own comments)

#### Comment Structure
```typescript
comment_hierarchy: {
  root_comments: "parentId === undefined"
  replies: "parentId === parent_comment_id"
  max_depth: "unlimited"
  sorting: "creation_time_asc"
}
```

### 4. Like System

#### Implementation
- **Real-time like counts**
- **User-specific like state**
- **Support for both posts and comments**
- **Toggle functionality**

### 5. Search & Filtering

#### Search Capabilities
```typescript
search_features: {
  full_text_search: {
    fields: ["title", "content"]
    index_type: "convex_search"
  }
  filters: {
    category: ["question", "feedback"]
    type: ["general", "notice"]
  }
  real_time: true
  debounced: true
}
```

---

## 📱 Responsive Design Requirements

### Mobile Optimization (≤400px)
```css
mobile_adaptations: {
  header: {
    title: "text-xl → text-lg"
    buttons: "smaller padding"
    logout_button: "hidden on mobile"
  }
  post_list: {
    layout: "vertical stacking"
    metadata: "moved to bottom"
    spacing: "reduced padding"
  }
  search: {
    layout: "full-width vertical"
    inputs: "stacked arrangement"
  }
  navigation: {
    tabs: "grid layout (3 columns)"
    size: "text-xs on mobile"
  }
}
```

### Tablet & Desktop (>640px)
```css
desktop_features: {
  layout: "two-column with sidebar potential"
  post_items: "horizontal layout with right metadata"
  search: "horizontal inline layout"
  navigation: "traditional tab layout"
}
```

---

## 🔧 Component Architecture

### Core Components

#### Layout Components
```typescript
// src/app/layout.tsx
RootLayout: {
  providers: ["ClerkProvider", "ConvexClientProvider"]
  header: "fixed navigation"
  main: "content area with top padding"
  toaster: "global notifications"
}

// src/components/header.tsx
Header: {
  logo: "JustForum brand"
  auth_buttons: "login/logout with user menu"
  responsive: "mobile-optimized"
}
```

#### Post Components
```typescript
// src/components/post/PostList.tsx
PostList: {
  props: ["posts: Post[]"]
  features: ["empty state", "loading state"]
  item_component: "PostItem"
}

// src/components/post/PostItem.tsx
PostItem: {
  layout: "responsive (mobile/desktop)"
  metadata: ["author", "time", "views", "comments"]
  interactions: ["click to navigate"]
}

// src/components/post/WritePostForm.tsx
WritePostForm: {
  editor: "TipTap rich text"
  validation: "Zod schema"
  categories: "Question/Feedback selection"
  form_library: "React Hook Form"
}
```

#### Comment Components
```typescript
// src/components/comment/CommentSection.tsx
CommentSection: {
  features: ["comment count", "nested display"]
  input: "CommentInput component"
  list: "Comment components with replies"
}

// src/components/comment/Comment.tsx
Comment: {
  features: ["nested replies", "like button", "author info"]
  permissions: "edit/delete for authors"
  time_display: "relative time (Korean)"
}
```

#### UI Components (shadcn/ui based)
```typescript
ui_components: {
  primitives: "Radix UI base"
  styling: "Tailwind CSS classes"
  components: [
    "Button", "Input", "Textarea", "Card",
    "Dialog", "DropdownMenu", "Tabs",
    "Pagination", "Badge", "Select"
  ]
}
```

---

## 🔄 Real-time Features

### Convex Integration
```typescript
real_time_features: {
  post_list: "useQuery(api.posts.list)"
  post_detail: "useQuery(api.posts.get)"
  comments: "auto-update on new comments"
  likes: "immediate count updates"
  view_counts: "increment on page visit"
}

query_patterns: {
  list_queries: "pagination support"
  detail_queries: "join with related data"
  mutations: "authentication required"
  subscriptions: "automatic UI updates"
}
```

---

## 🌐 Routing Structure

### App Router (Next.js 15)
```typescript
pages: {
  "/": "Home page with post list and filters"
  "/create": "Post creation page (protected)"
  "/[pid]": "Post detail page with comments"
}

api_routes: {
  "/api/clerk/webhook": "User synchronization"
}

middleware: {
  file: "src/middleware.ts"
  protection: "Clerk authentication"
  routes: "createRouteMatcher pattern"
}
```

---

## 🎯 User Experience Requirements

### Performance Targets
```yaml
metrics: {
  first_contentful_paint: "< 1.5s"
  largest_contentful_paint: "< 2.5s"
  cumulative_layout_shift: "< 0.1"
  first_input_delay: "< 100ms"
}

optimization: {
  images: "Next.js Image optimization"
  fonts: "Google Fonts with display=swap"
  bundling: "Turbopack for fast builds"
  caching: "Convex automatic caching"
}
```

### Accessibility Requirements
```yaml
wcag_compliance: "AA level"
features: {
  keyboard_navigation: "all interactive elements"
  screen_reader: "ARIA labels and semantic HTML"
  color_contrast: "minimum 4.5:1 ratio"
  focus_management: "visible focus indicators"
}
```

### Korean Language Support
```yaml
localization: {
  ui_language: "Korean"
  date_formatting: "Korean locale (date-fns/locale/ko)"
  time_display: "relative time in Korean"
  form_validation: "Korean error messages"
}
```

---

## 🔐 Security Requirements

### Authentication & Authorization
```typescript
security_measures: {
  authentication: "Clerk JWT tokens"
  route_protection: "Next.js middleware"
  api_security: "Convex auth validation"
  user_permissions: "author-only edit/delete"
}

data_protection: {
  input_validation: "Zod schemas"
  xss_prevention: "React built-in protection"
  csrf_protection: "Next.js CSRF headers"
  content_sanitization: "TipTap content filtering"
}
```

---

## 📦 Deployment Configuration

### Environment Variables
```bash
# Convex
CONVEX_DEPLOYMENT=<deployment-id>
NEXT_PUBLIC_CONVEX_URL=<convex-url>

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<publishable-key>
CLERK_SECRET_KEY=<secret-key>
CLERK_WEBHOOK_SECRET=<webhook-secret>
CLERK_JWT_ISSUER_DOMAIN=<issuer-domain>

# App Configuration
NEXT_PUBLIC_SITE_URL=<production-url>
GOOGLE_SITE_VERIFICATION=<verification-code>
NAVER_SITE_VERIFICATION=<verification-code>
```

### Build Configuration
```typescript
// next.config.ts
config: {
  typescript: { ignoreBuildErrors: false }
  eslint: { ignoreDuringBuilds: false }
  experimental: { turbo: true }
}

// package.json scripts
scripts: {
  "dev": "next dev --turbopack"
  "build": "next build"
  "start": "next start"
  "lint": "next lint"
}
```

---

## 🧪 Testing Strategy

### Testing Requirements
```typescript
testing_approach: {
  unit_tests: "Component testing with React Testing Library"
  integration_tests: "API route testing"
  e2e_tests: "User flow testing with Playwright"
  accessibility_tests: "axe-core integration"
}

quality_gates: {
  typescript: "strict mode enabled"
  linting: "ESLint with Next.js config"
  formatting: "Prettier integration"
  build_validation: "zero TypeScript errors"
}
```

---

## 📈 Analytics & Monitoring

### Tracking Requirements
```typescript
analytics: {
  user_engagement: "post views, likes, comments"
  performance_monitoring: "Core Web Vitals"
  error_tracking: "client-side error reporting"
  search_analytics: "search query patterns"
}

monitoring: {
  database_performance: "Convex query metrics"
  authentication: "Clerk user metrics"
  real_time_connections: "WebSocket connection status"
}
```

---

## 🔄 Development Workflow

### Setup Instructions
```bash
# 1. Clone and install
git clone <repository>
cd justforum
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Fill in environment variables

# 3. Setup Convex
npm install -g convex
npx convex dev

# 4. Start development
pnpm dev
```

### Development Commands
```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # Code linting
npx tsc --noEmit      # Type checking
npx convex dev        # Convex development server
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Next.js 15 project setup with App Router
- [ ] Tailwind CSS 4 configuration
- [ ] TypeScript strict mode
- [ ] Convex database setup
- [ ] Clerk authentication integration

### Phase 2: Core Features
- [ ] User management and sync
- [ ] Database schema implementation
- [ ] Post CRUD operations
- [ ] Rich text editor (TipTap)
- [ ] Comment system with nesting

### Phase 3: Advanced Features
- [ ] Real-time subscriptions
- [ ] Search functionality
- [ ] Like system
- [ ] Pagination
- [ ] Mobile responsive design

### Phase 4: Polish
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation

### Phase 5: Deployment
- [ ] Production environment setup
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] Testing suite

---

## 🎨 Design Assets

### Subject Badge Styling
```typescript
subject_styles: {
  question: {
    label: "질문"
    icon: "❓"
    colors: {
      text: "text-blue-600"
      background: "bg-blue-50"
      border: "border-blue-200"
    }
  }
  feedback: {
    label: "피드백"
    icon: "💬"
    colors: {
      text: "text-green-600"
      background: "bg-green-50"
      border: "border-green-200"
    }
  }
}
```

### Responsive Utilities
```css
/* Custom utilities for text clamping */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

---

## 🔗 External Dependencies

### Critical Dependencies
```json
{
  "dependencies": {
    "next": "15.4.5",
    "react": "19.1.0",
    "convex": "^1.25.4",
    "@clerk/nextjs": "^6.28.1",
    "@tiptap/react": "^3.0.9",
    "@tiptap/starter-kit": "^3.0.9",
    "react-hook-form": "^7.62.0",
    "zod": "^4.0.14",
    "tailwindcss": "^4",
    "lucide-react": "^0.536.0",
    "date-fns": "^4.1.0",
    "sonner": "^2.0.7"
  }
}
```

---

## 📚 Documentation Requirements

### Code Documentation
- **Component props and interfaces**
- **Convex function signatures**
- **Utility function documentation**
- **Configuration explanations**

### User Documentation
- **Setup and installation guide**
- **Environment configuration**
- **Development workflow**
- **Deployment instructions**

---

*This PRD serves as a complete blueprint for rebuilding JustForum. All technical specifications, architectural decisions, and implementation details are documented to enable accurate reconstruction of the application.*