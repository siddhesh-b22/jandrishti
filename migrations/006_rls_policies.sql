-- =============================================================================
-- JANDRISHTI PRODUCTION MIGRATION 006: ROW-LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS across Governance and Field Data tables
ALTER TABLE gov.review_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE gov.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw.field_submissions_dump ENABLE ROW LEVEL SECURITY;

-- 1. Public Domain Tables: Open Read Access for Civic Transparency
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.constituencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.political_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.representative_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parliamentary_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.implementing_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treasury_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read States" ON public.states FOR SELECT USING (true);
CREATE POLICY "Public Read Districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Public Read Constituencies" ON public.constituencies FOR SELECT USING (true);
CREATE POLICY "Public Read Political Parties" ON public.political_parties FOR SELECT USING (true);
CREATE POLICY "Public Read Representatives" ON public.representatives FOR SELECT USING (true);
CREATE POLICY "Public Read Representative Terms" ON public.representative_terms FOR SELECT USING (true);
CREATE POLICY "Public Read Parliamentary Allocations" ON public.parliamentary_allocations FOR SELECT USING (true);
CREATE POLICY "Public Read Implementing Agencies" ON public.implementing_agencies FOR SELECT USING (true);
CREATE POLICY "Public Read Contractors" ON public.contractors FOR SELECT USING (true);
CREATE POLICY "Public Read Infrastructure Works" ON public.infrastructure_works FOR SELECT USING (true);
CREATE POLICY "Public Read Treasury Vouchers" ON public.treasury_vouchers FOR SELECT USING (true);

-- 2. Governance Layer Policies
CREATE POLICY "Public Read Review Cases" ON gov.review_cases FOR SELECT USING (true);
CREATE POLICY "Authenticated Users Create Review Cases" ON gov.review_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by_user_id);
CREATE POLICY "Auditors Update Review Cases" ON gov.review_cases FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' IN ('AUDITOR', 'DISTRICT_AUTHORITY', 'ADMIN'));

CREATE POLICY "Public Read Audit Trail" ON gov.audit_trail FOR SELECT USING (true);
CREATE POLICY "Authenticated Append Audit Trail" ON gov.audit_trail FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_user_id);
-- Zero UPDATE or DELETE permitted on gov.audit_trail for true immutability

-- 3. Field Verifications Policies
CREATE POLICY "Public Read Field Verifications" ON public.field_verifications FOR SELECT USING (verification_status = 'APPROVED_OFFICIAL');
CREATE POLICY "Authenticated Submit Field Verifications" ON public.field_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = inspector_user_id);
