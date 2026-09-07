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
      return '/cases';
    case 'CITIZEN':
    default:
      return '/explore';
  }
}

export function getRoleHomeLabel(role?: string | null): string {
  switch (role) {
    case 'MINISTRY_ADMIN':
    case 'MINISTRY_OFFICIAL':
      return 'National Command';
    case 'STATE_NODAL_AUTHORITY':
    case 'STATE_AUTHORITY':
      return 'State Console';
    case 'DISTRICT_AUTHORITY':
      return 'District Hub';
    case 'MP':
      return 'Constituency Desk';
    case 'AUDITOR':
    case 'ANALYST':
      return 'Audit Docket';
    case 'CITIZEN':
    default:
      return 'Overview & Map';
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
  const homeRoute = getRoleHomeRoute(role);
  const homeLabel = getRoleHomeLabel(role);

  return {
    workspaceLink: { to: homeRoute, label: homeLabel },
    primaryLinks: [
      { to: homeRoute, label: homeLabel },
      { to: '/anomalies', label: 'AI Anomaly Center' },
      { to: '/works', label: 'Public Works' },
      { to: '/mps', label: 'MP Tracker' },
      { to: '/cases', label: 'Cases & Alerts' },
    ],
  };
}

