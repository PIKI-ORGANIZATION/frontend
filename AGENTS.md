# Project Guidelines & Code Standards (KTA PIKI)

## Standard Execution Rules for Code Audits & Implementations
Whenever reviewing, developing, or optimizing features in this project, adhere strictly to the following standards:

### 1. Clean Code & Architecture
- **No Monolithic Components**: Deconstruct large UI components (>350 lines) into focused subcomponents with single responsibilities.
- **Single Responsibility Principle (SRP)**: Each component, hook, and utility should do one thing well.
- **Eliminate Dead & Duplicate Code**: Regularly purge unused imports, dead variables, and redundant helper logic.
- **Separation of Concerns**: Keep business logic in custom hooks (`features/**/hooks/`), shared data contracts in `features/**/types.ts`, API communication in `lib/api.ts`, and UI strictly presentational.
- **Consistent TypeScript**: Enforce strict typing with zero `any` usage in new/updated code.

### 2. Bug Hunting & Edge Cases
- **Data Resiliency**: Never assume external or user data is well-formed. Always use safe fallbacks for image URLs (`getSafeImageSrc`), dates, and network payloads.
- **Race Conditions**: In async hooks and search/filter inputs, handle debounce timers and unmounted states cleanly.
- **State Synchronization**: Ensure CRUD mutations update TanStack Query cache or refetch correctly without stale UI state.
- **State Feedback**: Always provide clear, accessible Loading, Empty, Success, and Error states.
- **File Inputs**: Always clear `e.target.value = ""` in `finally` blocks so re-uploading the same file triggers `onChange`.

### 3. Performance Optimization
- **Render Efficiency**: Use `useMemo` and `useCallback` judiciously where child components are memoized or expensive calculations are performed.
- **Image Optimization**: Leverage Next.js `<Image />` with `sizes`, `loading="lazy"`, responsive aspect ratios, and safe fallback handling on errors.
- **Network Call Optimization**: Guard public pages against hitting protected admin endpoints (e.g. `fetchStats: false` in `useGaleri`).
- **Animation Capping**: Cap stagger animation delays (e.g., `Math.min(index * 0.03, 0.3)`) to maintain smooth UX on long lists.
- **Avoid Premature Optimization**: Optimize for actual bottlenecks, avoid unnecessary abstraction layers.

### 4. Security & Accessibility
- **Input Sanitization**: Validate all inputs both on the client and server. Sanitize URLs against XSS (`javascript:` URIs) and tracking parameter injection.
- **Spotlight Rule**: Only items of type `VIDEO` may have `featured: true` (Spotlight). Backend must strictly reject non-video items for spotlight.
- **Semantic HTML & WCAG A11y**: Ensure appropriate ARIA roles, keyboard focus management (Esc, Enter, Tab trapping in dialogs/drawers), and contrast standards.

### 5. Galeri Domain Rules & Specifications
- **Format Media**: `PHOTO`, `VIDEO` (YouTube / Upload lokal hingga 50MB), `INSTAGRAM` (Post/Reel embed).
- **Status Publikasi**: `PUBLISHED` (Tayang), `DRAFT` (Draf), `ARCHIVED` (Arsip).
- **Spotlight Video**: Wajib berformat VIDEO. Jika belum ada video yang di-set spotlight di CMS, gunakan default fallback YouTube resmi PIKI.
- **Categories**: Dynamic category merging (menggabungkan kategori default organisasi dan kategori kustom yang ditambahkan pengguna via CMS).

### 6. Verification & Testing Quality Gate
After making changes to any feature, always run:
1. `npx tsc --noEmit` -> 0 errors.
2. `npx eslint <target-files>` -> 0 errors, 0 warnings.
