# Glazing Requirements Schema Update Guide

This guide outlines the steps to update the `glazing_requirements` table schema in your Supabase database and update your codebase to reflect these changes.

## Changes to be made:

1. **Delete the `length` field**
2. **Rename `panel_count` to `panel_width`**

## Step 1: Database Schema Update

Log in to your Supabase dashboard and make the following changes to the `glazing_requirements` table:

1. Delete the `length` column
2. Rename the `panel_count` column to `panel_width` (maintain the same data type and constraints)

## Step 2: Update Type Definitions

Update the type definitions in `src/types/supabase.ts` for the `glazing_requirements` table:

### Row Interface:
- Remove the `length: number;` field
- Change `panel_count: number | null;` to `panel_width: number | null;`

### Insert Interface:
- Remove the `length: number;` field
- Change `panel_count?: number | null;` to `panel_width?: number | null;`

### Update Interface:
- Remove the `length?: number;` field
- Change `panel_count?: number | null;` to `panel_width?: number | null;`

## Step 3: Update Components

Search for any components that reference these fields and update them:

1. Update any references to `length` field (remove or replace as appropriate)
2. Update any references to `panel_count` to use `panel_width` instead

## Step 4: Import Modified Data

Use the modified CSV file to import the data back into Supabase:

```bash
node scripts/import-glazing-requirements.js
```

When prompted, provide the path to the modified CSV file:
`/Users/robertstarnes/CascadeProjects/sb1-bueqwatz-greenhouse-builder/glazing-requirements-modified-2025-05-16T22-13-11-590Z.csv`

## Step 5: Test the Application

After completing all the updates, thoroughly test the application to ensure everything works correctly with the updated schema.

## Files that may need updating:

- `src/types/supabase.ts`
- `src/components/GlazingWizard.tsx`
- `src/components/settings/GlazingRequirementForm.tsx`
- `src/components/settings/GlazingRequirementsTab.tsx`
- Any other components that interact with the glazing_requirements table
