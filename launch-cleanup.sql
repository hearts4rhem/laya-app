-- Run this once before public launch if your Supabase project still contains test data.
-- This removes existing whispers and their related kindness/reaction/report rows.

delete from public.reports;
delete from public.kindness_reactions;
delete from public.kindness_replies;
delete from public.whispers;
