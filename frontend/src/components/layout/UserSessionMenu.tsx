import React from 'react';
import { LogOut } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const UserSessionMenu: React.FC = () => {
  const { roleConfig, user, logout } = useRole();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex flex-col items-end leading-tight">
        <span className="text-xs font-medium text-[#121316]">{user?.display_name || roleConfig.shortLabel}</span>
        <span className="text-[9px] font-mono uppercase text-[#71717A]">{roleConfig.badge}</span>
      </div>
      <button
        type="button"
        onClick={logout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#F0EFEA] border border-[#E4E2DC] text-[#121316] text-xs font-medium min-h-[38px]"
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  );
};
