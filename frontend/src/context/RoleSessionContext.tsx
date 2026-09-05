import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, AuthUser } from '../api/client';

export type UserRole =
  | 'MINISTRY_ADMIN'
  | 'MINISTRY_OFFICIAL'
  | 'STATE_NODAL_AUTHORITY'
  | 'DISTRICT_AUTHORITY'
  | 'MP'
  | 'ANALYST'
  | 'CITIZEN';

export interface RoleConfig {
  code: UserRole;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
  scope: string;
  permittedActions: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  MINISTRY_ADMIN: {
    code: 'MINISTRY_ADMIN',
    label: 'Ministry / MoSPI Administrator',
    shortLabel: 'Ministry / MoSPI',
    badge: 'National Oversight',
    description: 'National overview, cross-state performance benchmarks, high-risk flags, policy audit trails, and risk engine weight tuning.',
    scope: 'All India (36 States & UTs)',
    permittedActions: ['Audit All Works', 'Configure Risk Engine Weights', 'Review Inter-State Allocations', 'Export Regulatory CSV']
  },
  MINISTRY_OFFICIAL: {
    code: 'MINISTRY_OFFICIAL',
    label: 'National Ministry / CAG Auditor',
    shortLabel: 'Ministry / CAG',
    badge: 'National Oversight',
    description: 'Bicameral macro allocation control, double-entry audit proofs, and inter-state fiscal velocity monitoring.',
    scope: 'All India (36 States & UTs)',
    permittedActions: ['Audit All Vouchers', 'Create National Review Case', 'Freeze Tranches', 'Export Regulatory CSV']
  },
  STATE_NODAL_AUTHORITY: {
    code: 'STATE_NODAL_AUTHORITY',
    label: 'State Nodal Authority (SNA)',
    shortLabel: 'State Nodal',
    badge: 'State Oversight',
    description: 'State-wide MPLADS monitoring, district comparisons, sanction vs expenditure tracking, and delayed project escalations.',
    scope: 'State & Inter-District',
    permittedActions: ['Inspect District Ranks', 'Coordinate Inquiries', 'Track Delayed Works', 'Review Implementing Agencies']
  },
  DISTRICT_AUTHORITY: {
    code: 'DISTRICT_AUTHORITY',
    label: 'District Implementing Authority (IDA / DM)',
    shortLabel: 'District Authority',
    badge: 'Ground Execution',
    description: 'Technical sanction approvals, physical milestone verifications, contractor delay warnings, and local alert resolutions.',
    scope: 'District & Nodal Agency Level',
    permittedActions: ['Resolve Local Alerts', 'Verify Physical Works', 'Authorize Payment Tranche', 'Upload Milestone Proof']
  },
  MP: {
    code: 'MP',
    label: 'Member of Parliament (MP)',
    shortLabel: 'Parliamentarian',
    badge: 'Constituency Rep',
    description: 'Tracks statutory annual ₹5.00 Cr quota, scheme recommendation status, progress divergence, and local constituency development.',
    scope: 'Constituency & State Quota',
    permittedActions: ['Track Recommendations', 'Monitor Nodal Approvals', 'View Contractor Velocity', 'Request District Status']
  },
  ANALYST: {
    code: 'ANALYST',
    label: 'Public Finance Integrity Auditor',
    shortLabel: 'Analyst',
    badge: 'National Audit',
    description: 'Cross-jurisdiction investigation, case notes, and explainable anomaly review without policy administration.',
    scope: 'All India analytical access',
    permittedActions: ['Create Review Cases', 'Annotate Anomalies', 'Export Audit Packs']
  },
  CITIZEN: {
    code: 'CITIZEN',
    label: 'Citizen / Transparency Advocate',
    shortLabel: 'Citizen Public Mode',
    badge: 'Open Democracy',
    description: 'Zero-barrier access to verified public infrastructure dossiers, RTI-ready voucher records, and explainable AI risk indicators.',
    scope: 'Public Access & Social Audit',
    permittedActions: ['Inspect Ground Works', 'Verify Treasury Outflows', 'Download Audit Dossier', 'Submit Public Inquiry']
  }
};

interface RoleContextType {
  currentRole: UserRole;
  roleConfig: RoleConfig;
  setRole: (role: UserRole) => void;
  selectedState: string;
  setSelectedState: (s: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  selectedMpId: string;
  setSelectedMpId: (mpId: string) => void;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  canMutate: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function roleFromUser(user: AuthUser | null): UserRole {
  const role = (user?.role || localStorage.getItem('jandrishti_user_role') || 'CITIZEN') as UserRole;
  if (role === 'MINISTRY_OFFICIAL') return 'MINISTRY_ADMIN';
  return ROLE_CONFIGS[role] ? role : 'CITIZEN';
}

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('jandrishti_user');
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => roleFromUser(user));
  const [selectedState, setSelectedState] = useState<string>(user?.state || 'MAHARASHTRA');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(user?.district || 'PUNE');
  const [selectedMpId, setSelectedMpId] = useState<string>(user?.mp_id || '');  // No hardcoded fallback


  useEffect(() => {
    localStorage.setItem('jandrishti_user_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    if (!user) return;
    setCurrentRole(roleFromUser(user));
    if (user.state) setSelectedState(user.state);
    if (user.district) setSelectedDistrict(user.district);
    if (user.mp_id) setSelectedMpId(user.mp_id);
  }, [user]);

  const login = useCallback(async (username: string, password: string) => {
    const session = await api.login({ username, password });
    localStorage.setItem('jandrishti_access_token', session.access_token);
    localStorage.setItem('jandrishti_user', JSON.stringify(session.user));
    localStorage.setItem('jandrishti_user_role', session.user.role);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jandrishti_access_token');
    localStorage.removeItem('jandrishti_user');
    setUser(null);
    setCurrentRole('CITIZEN');
  }, []);

  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.CITIZEN;

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        roleConfig,
        setRole: setCurrentRole,
        selectedState,
        setSelectedState,
        selectedDistrict,
        setSelectedDistrict,
        selectedMpId,
        setSelectedMpId,
        user,
        isAuthenticated: Boolean(user && (typeof window === 'undefined' ? false : localStorage.getItem('jandrishti_access_token'))),
        login,
        logout,
        canMutate: Boolean(user?.can_mutate_cases),
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
