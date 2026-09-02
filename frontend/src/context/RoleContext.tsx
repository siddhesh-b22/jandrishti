import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'MINISTRY_OFFICIAL' | 'MP' | 'DISTRICT_AUTHORITY' | 'CITIZEN';

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
  MINISTRY_OFFICIAL: {
    code: 'MINISTRY_OFFICIAL',
    label: 'National Ministry / CAG Auditor',
    shortLabel: 'Ministry / CAG',
    badge: 'National Oversight',
    description: 'Bicameral macro allocation control, double-entry audit proofs, and inter-state fiscal velocity monitoring.',
    scope: 'All India (36 States & UTs)',
    permittedActions: ['Audit All Vouchers', 'Create National Review Case', 'Freeze Tranches', 'Export Regulatory CSV']
  },
  MP: {
    code: 'MP',
    label: 'Member of Parliament (MP)',
    shortLabel: 'Parliamentarian',
    badge: 'Constituency Rep',
    description: 'Tracks statutory annual ₹5.00 Cr quota, scheme recommendation status, and local constituency development.',
    scope: 'Constituency & State Quota',
    permittedActions: ['Track Recommendations', 'Monitor Nodal Approvals', 'View Contractor Velocity', 'Request District Status']
  },
  DISTRICT_AUTHORITY: {
    code: 'DISTRICT_AUTHORITY',
    label: 'District Implementing Authority (IDA)',
    shortLabel: 'District Authority',
    badge: 'Ground Execution',
    description: 'Technical sanction approvals, physical milestone verifications, contractor delay warnings, and disbursement releases.',
    scope: 'District & Nodal Agency Level',
    permittedActions: ['Upload Milestone Proof', 'Issue Delay Show-Cause', 'Verify Physical Works', 'Authorize Payment Tranche']
  },
  CITIZEN: {
    code: 'CITIZEN',
    label: 'Citizen / Transparency Advocate',
    shortLabel: 'Citizen Public Mode',
    badge: 'Open Democracy',
    description: 'Zero-barrier access to verified public infrastructure dossiers, RTI-ready voucher records, and explainable AI audit flags.',
    scope: 'Public Access & Social Audit',
    permittedActions: ['Inspect Ground Works', 'Verify Treasury Outflows', 'Download Audit Dossier', 'Submit Public Inquiry']
  }
};

interface RoleContextType {
  currentRole: UserRole;
  roleConfig: RoleConfig;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('jandrishti_user_role');
    return (saved as UserRole) || 'MINISTRY_OFFICIAL';
  });

  useEffect(() => {
    localStorage.setItem('jandrishti_user_role', currentRole);
  }, [currentRole]);

  const roleConfig = ROLE_CONFIGS[currentRole];

  return (
    <RoleContext.Provider value={{ currentRole, roleConfig, setRole: setCurrentRole }}>
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
