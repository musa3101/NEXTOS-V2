-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for Client Status
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'lead');

-- Enum for Project Status
CREATE TYPE project_status AS ENUM ('pending', 'development', 'review', 'published', 'maintenance');

-- Enum for Document Type
CREATE TYPE document_type AS ENUM ('invoice', 'delivery');

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    status client_status DEFAULT 'lead',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'pending',
    budget DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    type document_type NOT NULL,
    number TEXT NOT NULL UNIQUE,
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);

-- Setup Row Level Security (RLS)
-- For MVP, we'll allow all operations via service role (API routes) and anon key (browser).
-- If we want stricter security, we would define policies here.
-- Note: Since this is an internal OS, anon key access is typically protected by app-level auth if any.
-- For now, enabling RLS and allowing anon/service access (as it's an internal tool managed by Telegram/API).
-- WARNING: In a real public app, you would restrict anon key access.
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for anon and service_role on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon and service_role on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon and service_role on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all operations for anon and service_role on activity_logs" ON activity_logs FOR ALL USING (true);
