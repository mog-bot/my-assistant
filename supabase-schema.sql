-- Supabase SQL: Create tables for My Assistant
-- Run this in the Supabase SQL Editor (left sidebar → SQL Editor → New query)

-- 1. Signups table
CREATE TABLE IF NOT EXISTS signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agents table (stores scraped business data per user)
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  business_name TEXT,
  business_email TEXT,
  website_url TEXT,
  title TEXT,
  description TEXT,
  content TEXT,
  internal_links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Chat logs table
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT,
  unanswered BOOLEAN DEFAULT false,
  agent_id TEXT DEFAULT 'demo',
  business_email TEXT,
  business_name TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_logs_agent_id ON chat_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_logs_unanswered ON chat_logs(unanswered) WHERE unanswered = true;
CREATE INDEX IF NOT EXISTS idx_agents_agent_id ON agents(agent_id);

-- Enable Row Level Security (but allow all access via anon key for now)
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Policies: allow full access via the publishable key (we'll tighten later with auth)
CREATE POLICY "Allow all signups" ON signups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all agents" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all chat_logs" ON chat_logs FOR ALL USING (true) WITH CHECK (true);
