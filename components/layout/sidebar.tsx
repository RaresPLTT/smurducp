"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Users, Shield, LogOut, Activity } from "lucide-react";
import { RANK_LABELS } from "@/lib/callsign";
import { Rank } from "@prisma/client";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/members", icon: Users, label: "Membri" },
];

const adminItems = [{ href: "/admin", icon: Shield, label: "Management" }];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isManagement =
    session?.user?.rank === "DIRECTOR_GENERAL" ||
    session?.user?.rank === "DIRECTOR_ADJUNCT";

  const getRankClass = (rank: string) => {
    const classes: Record<string, string> = {
      DIRECTOR_GENERAL: "rank-director-general",
      DIRECTOR_ADJUNCT: "rank-director-adjunct",
      MEDIC_PRIMAR: "rank-medic-primar",
      MEDIC_CHIRURG: "rank-medic-chirurg",
      MEDIC_REZIDENT: "rank-medic-rezident",
      ASISTENT: "rank-asistent",
      PARAMEDIC: "rank-paramedic",
      STAGIAR: "rank-stagiar",
    };
    return classes[rank] || "rank-stagiar";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[var(--bg-secondary)] border-r border-[var(--glass-border)] z-50">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center pulse-glow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-gradient">
                SMURD
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                User Control Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isManagement && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Administrare
                </p>
              </div>
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {session?.user && (
          <div className="p-4 border-t border-[var(--glass-border)]">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full ring-2 ring-[var(--accent)]"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {session.user.nameIC}
                  </p>
                  <span
                    className={`rank-badge text-[10px] mt-1 ${getRankClass(
                      session.user.rank
                    )}`}
                  >
                    {session.user.callsign}
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Deconectare</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
