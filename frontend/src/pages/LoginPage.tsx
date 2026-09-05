import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Landmark, Layers, Building2, Users, ShieldCheck, BarChart3, LogIn, ArrowRight } from 'lucide-react';
import { useRole, UserRole } from '../context/RoleContext';
import { api, DemoAccount } from '../api/client';
import { getRoleHomeRoute } from '../utils/roleRoutes';

const ROLE_ICON: Record<string, React.ElementType> = {
  MINISTRY_ADMIN: Landmark,
  MINISTRY_OFFICIAL: Landmark,
  STATE_NODAL_AUTHORITY: Layers,
  DISTRICT_AUTHORITY: Building2,
  MP: Users,
  AUDITOR: BarChart3,
  ANALYST: BarChart3,
  CITIZEN: ShieldCheck,
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useRole();
  const [username, setUsername] = useState('ministry');
  const [password, setPassword] = useState('Demo@Ministry2026');
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname;
      const targetRoute = from || getRoleHomeRoute(user.role);
      navigate(targetRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  useEffect(() => {
    api.getDemoAccounts().then(setAccounts).catch(() => {
      setAccounts([]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const loggedUser = await login(username, password);
      const from = (location.state as any)?.from?.pathname;
      const targetRoute = from || getRoleHomeRoute(loggedUser.role);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handle1ClickLogin = async (acctUsername: string, acctPass: string) => {
    setUsername(acctUsername);
    setPassword(acctPass);
    setSubmitting(true);
    setError(null);
    try {
      const loggedUser = await login(acctUsername, acctPass);
      const from = (location.state as any)?.from?.pathname;
      const targetRoute = from || getRoleHomeRoute(loggedUser.role);
      navigate(targetRoute, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-8 shadow-xs">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-semibold">
            JanDrishti Statutory Access
          </p>
          <h1 className="mt-2 text-3xl font-serif text-[#121316]">Sign in with an authority role</h1>
          <p className="mt-2 text-sm text-[#71717A] font-light leading-relaxed">
            Statutory roles map directly to the governance hierarchy. What you see and can execute follows
            national, state, district, or constituency mandate with strictly zero locked placeholders.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-[11px] font-mono uppercase text-[#71717A]">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] px-3 py-2.5 text-sm text-[#121316] outline-none focus:border-[#C85A32]"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-mono uppercase text-[#71717A]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E4E2DC] bg-[#FAF8F5] px-3 py-2.5 text-sm text-[#121316] outline-none focus:border-[#C85A32]"
                autoComplete="current-password"
              />
            </label>
            {error && (
              <p className="text-sm text-[#C85A32]">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="cw-btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{submitting ? 'Authenticating...' : 'Enter Dedicated Role Workspace'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E4E2DC] text-center">
            <button
              type="button"
              onClick={() => navigate('/explore', { replace: true })}
              className="text-xs text-[#71717A] hover:text-[#121316] transition inline-flex items-center gap-1.5"
            >
              <span>Continue as Public User without login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4E2DC] bg-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#C85A32] font-semibold">
              1-Click Demo Evaluation Identities
            </p>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#1E7E34] border border-[#BCE2C5]">
              Supabase Connected
            </span>
          </div>
          <p className="text-xs text-[#71717A] px-1 font-light">
            Select any statutory role below to immediately enter JanDrishti tailored for that jurisdiction:
          </p>
          <div className="space-y-2">
            {accounts.map((acct) => {
              const Icon = ROLE_ICON[acct.role] || ShieldCheck;
              return (
                <div
                  key={acct.username}
                  className="w-full text-left p-3 rounded-xl border border-[#E4E2DC] hover:border-[#C85A32] hover:bg-[#FAF8F5] transition flex items-center justify-between gap-3 group"
                >
                  <div
                    className="flex items-start gap-3 min-w-0 cursor-pointer flex-1"
                    onClick={() => handle1ClickLogin(acct.username, acct.password)}
                  >
                    <div className="p-2 rounded-lg bg-[#FAF0EB] text-[#C85A32] group-hover:bg-[#C85A32] group-hover:text-white transition shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#121316] group-hover:text-[#C85A32] transition">
                        {acct.display_name}
                      </div>
                      <div className="text-[11px] text-[#71717A] font-mono">
                        {acct.username} &bull; {acct.jurisdiction_type}
                        {acct.can_mutate_cases ? ' &bull; full executive authority' : ' &bull; forensic read-only'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handle1ClickLogin(acct.username, acct.password)}
                    className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-[#FAF0EB] text-[#C85A32] hover:bg-[#C85A32] hover:text-white transition shrink-0 border border-[#E8C5B6] cursor-pointer"
                  >
                    Enter →
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E4E2DC]/80 flex items-center justify-between text-xs text-[#71717A]">
            <span>Need open public civic view?</span>
            <button
              type="button"
              onClick={() => handle1ClickLogin('citizen', 'Demo@Citizen2026')}
              className="font-medium text-[#C85A32] hover:underline cursor-pointer"
            >
              Enter as Citizen Auditor →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
