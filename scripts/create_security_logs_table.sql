-- scripts/create_security_logs_table.sql
-- Table for security alerting architecture in AVELLIN

CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL, -- e.g. 'BRUTE_FORCE', 'SUSPICIOUS_PAYLOAD', 'UNAUTHORIZED_ACCESS'
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    status TEXT DEFAULT 'unresolved', -- 'unresolved' | 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on status and created_at for fast admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_security_logs_status ON public.security_logs(status);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role / admin can view and update security logs
CREATE POLICY "Admins and service role can manage security logs"
ON public.security_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
