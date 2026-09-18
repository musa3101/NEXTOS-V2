-- NextOS Phase 1 MVP - InsForge Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'development', 'review', 'published', 'maintenance')),
    budget NUMERIC,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Documents Table (Invoices & Deliveries)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('invoice', 'delivery')),
    number TEXT NOT NULL UNIQUE,
    template_data JSONB NOT NULL,
    total_amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Activity Logs Table (System & Telegram)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('client', 'project', 'document', 'system')),
    entity_id UUID,
    details JSONB,
    source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'telegram', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_clients_modtime ON clients;
CREATE TRIGGER update_clients_modtime
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_projects_modtime ON projects;
CREATE TRIGGER update_projects_modtime
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_documents_modtime ON documents;
CREATE TRIGGER update_documents_modtime
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Deny public anon access by default (All backend operations use admin apiKey)
DROP POLICY IF EXISTS "Deny public access to clients" ON clients;
CREATE POLICY "Deny public access to clients" ON clients FOR ALL USING (false);

DROP POLICY IF EXISTS "Deny public access to projects" ON projects;
CREATE POLICY "Deny public access to projects" ON projects FOR ALL USING (false);

DROP POLICY IF EXISTS "Deny public access to documents" ON documents;
CREATE POLICY "Deny public access to documents" ON documents FOR ALL USING (false);

DROP POLICY IF EXISTS "Deny public access to activity_logs" ON activity_logs;
CREATE POLICY "Deny public access to activity_logs" ON activity_logs FOR ALL USING (false);
