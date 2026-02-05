"use client";

import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RANK_LABELS } from "@/lib/callsign";
import { Rank } from "@prisma/client";
import { User, BadgeCheck, Activity, TrendingUp, Users, Clock } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

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

  if (!session?.user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 slide-in">
          <h1 className="font-display font-bold text-3xl text-white mb-2">
            Bun venit, {session.user.nameIC}!
          </h1>
          <p className="text-[var(--text-secondary)]">
            Vizualizează-ți profilul și informațiile personale
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-card p-6 slide-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-6">
              <div className="relative">
                {session.user.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-24 h-24 rounded-2xl ring-4 ring-[var(--accent)] object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center ring-4 ring-[var(--accent)]">
                    <User className="w-12 h-12 text-[var(--text-muted)]" />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl accent-gradient flex items-center justify-center font-display font-bold text-sm text-white shadow-lg">
                  {session.user.callsign}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="font-display font-bold text-2xl text-white mb-1">{session.user.nameIC}</h2>
                <span className={`rank-badge ${getRankClass(session.user.rank)}`}>
                  <BadgeCheck className="w-3 h-3" />
                  {RANK_LABELS[session.user.rank as Rank]}
                </span>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Indicativ</p>
                    <p className="font-display font-bold text-xl text-[var(--accent)]">{session.user.callsign}</p>
                  </div>
                  <div className="bg-[var(--bg-tertiary)] rounded-xl p-3">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Discord ID</p>
                    <p className="font-mono text-sm text-white truncate">{session.user.discordId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 slide-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--accent)]" />
              Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Cont</span>
                <span className="flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Activ
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Acces</span>
                <span className="text-white">
                  {session.user.rank === "DIRECTOR_GENERAL" || session.user.rank === "DIRECTOR_ADJUNCT" ? "Administrator" : "Membru"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Membri", value: "—", color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: TrendingUp, label: "Activi Astăzi", value: "—", color: "text-green-400", bg: "bg-green-500/10" },
            { icon: Clock, label: "Ore Serviciu", value: "—", color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: Activity, label: "Intervenții", value: "—", color: "text-[var(--accent)]", bg: "bg-red-500/10" },
          ].map((stat, index) => (
            <div key={stat.label} className="glass-card p-5 slide-in" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
