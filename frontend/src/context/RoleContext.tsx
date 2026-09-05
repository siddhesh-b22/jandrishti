import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole =
  | 'MINISTRY_ADMIN'
  | 'MINISTRY_OFFICIAL'
  | 'STATE_NODAL_AUTHORITY'
  | 'DISTRICT_AUTHORITY'
  | 'MP'
  | 'AUDITOR'
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
  AUDITOR: {
    code: 'AUDITOR',
    label: 'Public Finance Integrity Auditor',
    shortLabel: 'Integrity Auditor',
    badge: 'Forensic Audit',
    description: 'Empirical anomaly discovery, time-series fraud indicators, contractor HHI concentration, and evidence dossiers without financial record tampering.',
    scope: 'All India / Forensic Integrity Mandate',
    permittedActions: ['Open Forensic Case', 'Audit Double-Entry Proofs', 'Empirical Hypothesis Testing', 'Export Audit Ledger']
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

import { api, AuthUser } from '../api/client';

export interface RoleContextType {
  currentRole: UserRole;
  roleConfig: RoleConfig;
  setRole: (role: UserRole) => void;
  selectedState: string;
  setSelectedState: (s: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (d: string) => void;
  selectedMpId: string;
  setSelectedMpId: (mpId: string) => void;
  viewingState: string;
  setViewingState: (s: string) => void;
  viewingDistrict: string;
  setViewingDistrict: (d: string) => void;
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  canEdit: (state?: string | null, district?: string | null, mpId?: string | null) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('jandrishti_token') || null;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('jandrishti_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.role && u.role !== 'CITIZEN') return u;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const savedUserStr = localStorage.getItem('jandrishti_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u && u.role && u.role in ROLE_CONFIGS && u.role !== 'CITIZEN') {
          return u.role as UserRole;
        }
      } catch {
        // ignore
      }
    }
    return 'CITIZEN';
  });

  const [selectedState, setSelectedState] = useState<string>('MAHARASHTRA');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('PUNE');
  const [selectedMpId, setSelectedMpId] = useState<string>('');  // No default — derived from authenticated user

  // Administrative Drill-Down View (Viewing another district without privilege escalation)
  const [viewingState, setViewingState] = useState<string>('MAHARASHTRA');
  const [viewingDistrict, setViewingDistrict] = useState<string>('PUNE');

  const isAuthenticated = Boolean(token && user && user.role !== 'CITIZEN');

  useEffect(() => {
    localStorage.setItem('jandrishti_user_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    if (user) {
      if (user.role && user.role in ROLE_CONFIGS) {
        setCurrentRole(user.role as UserRole);
      }
      if (user.state) setSelectedState(user.state.toUpperCase());
      if (user.district) setSelectedDistrict(user.district.toUpperCase());
      if (user.mp_id) setSelectedMpId(user.mp_id);
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const res = await api.login({ username, password });
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('jandrishti_token', res.access_token);
    localStorage.setItem('jandrishti_user', JSON.stringify(res.user));
    if (res.user.role in ROLE_CONFIGS) {
      setCurrentRole(res.user.role as UserRole);
    }
    if (res.user.state) setSelectedState(res.user.state.toUpperCase());
    if (res.user.district) setSelectedDistrict(res.user.district.toUpperCase());
    if (res.user.mp_id) setSelectedMpId(res.user.mp_id);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jandrishti_token');
    localStorage.removeItem('jandrishti_user');
    setCurrentRole('CITIZEN');
  };

  const canEdit = (state?: string | null, district?: string | null, mpId?: string | null): boolean => {
    const activeRole = user?.role || currentRole;
    if (activeRole === 'CITIZEN') return false;
    if (activeRole === 'MINISTRY_ADMIN' || activeRole === 'MINISTRY_OFFICIAL' || activeRole === 'ANALYST') return true;

    const myState = (user?.state || selectedState || '').toUpperCase();
    const myDistrict = (user?.district || user?.constituency || selectedDistrict || '').toUpperCase();
    const myMpId = user?.mp_id || selectedMpId;

    if (activeRole === 'STATE_NODAL_AUTHORITY') {
      if (!state) return true;
      return state.toUpperCase() === myState;
    }

    if (activeRole === 'DISTRICT_AUTHORITY') {
      if (state && state.toUpperCase() !== myState) return false;
      if (district && district.toUpperCase() !== myDistrict) return false;
      return true;
    }

    if (activeRole === 'MP') {
      if (mpId && mpId === myMpId) return true;
      if (district && district.toUpperCase() === myDistrict) return true;
      return false;
    }

    return false;
  };

  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.MINISTRY_ADMIN;

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
        viewingState,
        setViewingState,
        viewingDistrict,
        setViewingDistrict,
        isAuthenticated,
        user,
        token,
        login,
        logout,
        canEdit,
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

