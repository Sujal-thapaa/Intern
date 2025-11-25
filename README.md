# DAS Company Dashboard

A modern React + TypeScript dashboard for DAS Company built with Supabase, TanStack Query, and Recharts.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router DOM** - Routing
- **ShadCN UI** - Component library
- **Recharts** - Charting library
- **Supabase** - Backend/Database
- **TanStack Query** - Data fetching
- **Zustand** - State management

## Project Structure

```
src/
 ├─ components/
 │   ├─ charts/          # Chart components (to be added)
 │   ├─ layouts/         # Layout components (Sidebar, Layout)
 │   ├─ ui/              # ShadCN UI components
 ├─ pages/
 │   ├─ Home/            # Dashboard home page
 │   ├─ Participants/    # Participants page
 │   ├─ Courses/         # Courses page
 │   ├─ Revenue/         # Revenue page
 │   ├─ Registrations/   # Registrations page
 │   ├─ Licenses/        # Licenses page
 ├─ supabase/
 │   ├─ client.ts        # Supabase client setup
 ├─ hooks/               # Custom React Query hooks
 ├─ store/               # Zustand stores
 ├─ lib/                 # Utilities
 ├─ App.tsx
 ├─ main.tsx
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Pages

- **Dashboard (Home)** - Overview with key metrics and charts
- **Participants** - Participant management and analytics
- **Courses** - Course performance and analytics
- **Revenue** - Revenue analytics and financial insights
- **Registrations** - Course registration timeline and analytics
- **Licenses** - Participant licensing information

## Database Tables

The dashboard connects to the following Supabase tables:
- `participant`
- `participant_course`
- `payment`
- `course`
- `course_location_data`
- `participant_license`

## Development

This project is set up with:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Dark mode support

## Next Steps

This is Prompt #1 - the base project setup. The following prompts will implement:
- Prompt #2: Home Dashboard Page (charts and visualizations)
- Prompt #3: Participants Page
- Prompt #4: Courses Page
- Prompt #5: Revenue Page
- Prompt #6: Registrations Page
- Prompt #7: Licenses Page

