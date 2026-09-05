export function getRoleHomeRoute(role?: string | null): string {
  switch (role) {
    case 'MINISTRY_ADMIN':
    case 'MINISTRY_OFFICIAL':
      return '/admin/national';
    case 'STATE_NODAL_AUTHORITY':
    case 'STATE_AUTHORITY':
      return '/admin/state';
    case 'DISTRICT_AUTHORITY':
      return '/admin/district';
    case 'MP':
      return '/mp/constituency';
    case 'AUDITOR':
    case 'ANALYST':
      return '/audit';
    case 'CITIZEN':
    default:
      return '/explore';
  }
}

export interface NavItemConfig {
  to: string;
  label: string;
  desc?: string;
  badge?: string;
}

export interface RoleNavStructure {
  workspaceLink: { to: string; label: string };
  primaryLinks: { to: string; label: string }[];
  dropdowns?: {
    title: string;
    key: 'CASES' | 'INTELLIGENCE';
    items: NavItemConfig[];
  }[];
}

export function getNavStructureForRole(role?: string | null): RoleNavStructure {
  const currentRole = role || 'CITIZEN';

  switch (currentRole) {
    case 'MINISTRY_ADMIN':
    case 'MINISTRY_OFFICIAL':
      return {
        workspaceLink: { to: '/admin/national', label: 'National Console' },
        primaryLinks: [
          { to: '/admin/national', label: 'National Overview' },
          { to: '/states', label: 'State Allocations' },
          { to: '/data-quality', label: 'Audit Provenance' },
          { to: '/ingest', label: 'Data Ingest' },
        ],
        dropdowns: [
          {
            title: 'Intelligence',
            key: 'INTELLIGENCE',
            items: [
              { to: '/works', label: 'All Schemes', desc: 'National expenditure records' },
              { to: '/mps', label: 'Parliamentarians', desc: 'Lok & Rajya Sabha' },
              { to: '/states', label: 'State Atlas', desc: '36 States & UTs' },
              { to: '/vendors', label: 'Contractor Registry', desc: 'National vendor analytics' },
              { to: '/transactions', label: 'Treasury Vouchers', desc: 'Disbursement audit' },
            ],
          },
          {
            title: 'National Audit',
            key: 'CASES',
            items: [
              { to: '/cases', label: 'Priority Alerts', desc: 'National anomaly flags', badge: 'Live' },
              { to: '/anomalies', label: 'Statistical Signals', desc: 'Empirical risk anomalies' },
              { to: '/duplicates', label: 'Duplicate Schemes', desc: 'Cross-state duplication flags' },
              { to: '/data-quality', label: 'Ledger Provenance', desc: 'Cryptographic hash checks' },
            ],
          },
        ],
      };

    case 'STATE_NODAL_AUTHORITY':
    case 'STATE_AUTHORITY':
      return {
        workspaceLink: { to: '/admin/state', label: 'State Console' },
        primaryLinks: [
          { to: '/admin/state', label: 'State Dashboard' },
          { to: '/works', label: 'State Works' },
          { to: '/cases', label: 'State Inquiries' },
          { to: '/compare', label: 'District Benchmarks' },
        ],
        dropdowns: [
          {
            title: 'State Intelligence',
            key: 'INTELLIGENCE',
            items: [
              { to: '/works', label: 'State Works', desc: 'District execution schemes' },
              { to: '/vendors', label: 'State Contractors', desc: 'Implementing agency registry' },
              { to: '/transactions', label: 'State Disbursements', desc: 'Voucher payments' },
            ],
          },
        ],
      };

    case 'DISTRICT_AUTHORITY':
      return {
        workspaceLink: { to: '/admin/district', label: 'District Console' },
        primaryLinks: [
          { to: '/admin/district', label: 'District Execution' },
          { to: '/works', label: 'Works & Milestones' },
          { to: '/alerts', label: 'Local Alerts' },
          { to: '/track-area', label: 'Block Mapping' },
        ],
      };

    case 'MP':
      return {
        workspaceLink: { to: '/mp/constituency', label: 'Constituency Desk' },
        primaryLinks: [
          { to: '/mp/constituency', label: 'Quota & Proposals' },
          { to: '/works', label: 'Constituency Works' },
          { to: '/track-area', label: 'Constituency Delivery' },
        ],
      };

    case 'AUDITOR':
    case 'ANALYST':
      return {
        workspaceLink: { to: '/audit', label: 'Forensic Audit Desk' },
        primaryLinks: [
          { to: '/audit', label: 'Forensic Dossiers' },
          { to: '/anomalies', label: 'Statistical Anomalies' },
          { to: '/duplicates', label: 'Duplicate Detection' },
          { to: '/data-quality', label: 'Cryptographic Ledger' },
        ],
        dropdowns: [
          {
            title: 'Forensic Books',
            key: 'INTELLIGENCE',
            items: [
              { to: '/transactions', label: 'Voucher Ledger', desc: 'Double-entry treasury books' },
              { to: '/vendors', label: 'Contractor Risk', desc: 'Market concentration & HHI' },
              { to: '/works', label: 'Scheme Ledgers', desc: '102k public works' },
            ],
          },
        ],
      };

    case 'CITIZEN':
    default:
      return {
        workspaceLink: { to: '/explore', label: 'Public Portal' },
        primaryLinks: [
          { to: '/explore', label: 'Public Explorer' },
          { to: '/works', label: 'Verified Works' },
          { to: '/mps', label: 'MP Track' },
          { to: '/states', label: 'States Atlas' },
          { to: '/methodology', label: 'Methodology & RTI' },
        ],
      };
  }
}
