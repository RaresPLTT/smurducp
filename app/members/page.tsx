"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RANK_LABELS, RANK_ORDER } from "@/lib/callsign";
import { Rank } from "@prisma/client";
import { Search, User, BadgeCheck, Phone, Filter, X } from "lucide-react";

interface Member {
  id: number;
  nameIC: string;
  rank: Rank;
  callsign: string;
  phoneNumber: string;
  avatarUrl: string | null;
  discordId: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<Rank | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [search, rankFilter, members]);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((m) => m.nameIC.toLowerCase().includes(s) || m.callsign.includes(search) || m.phoneNumber.includes(search));
    }
    if (rankFilter !== "ALL") {
      filtered = filtered.filter((m) => m.rank === rankFilter);
    }
    filtered.sort((a, b) => {
      const aIndex = RANK_ORDER.indexOf(a.rank);
      const bIndex = RANK_ORDER.indexOf(b.rank);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return parseInt(a.callsign) - parseInt(b.callsign);
    });
    setFilteredMembers(filtered);
  };

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
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 slide-in">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Director Membri</h1>
          <p className="text-[var(--text-secondary)]">Caută și vizualizează profilurile membrilor SMURD</p>
        </div>

        <div className="glass-card p-4 mb-6 slide-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Caută după nume, indicativ sau telefon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value as Rank | "ALL")}
                className="pl-12 pr-8 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent)] min-w-[200px]"
              >
                <option value="ALL">Toate Gradele</option>
                {RANK_ORDER.map((rank) => (
                  <option key={rank} value={rank}>{RANK_LABELS[rank]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 accent-gradient rounded-xl flex items-center justify-center pulse-glow">
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member, index) => (
              <div key={member.id} className="glass-card p-5 slide-in hover:scale-[1.02] transition-transform" style={{ animationDelay: `${0.2 + index * 0.05}s` }}>
                <div className="flex items-start gap-4">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.nameIC} className="w-14 h-14 rounded-xl ring-2 ring-[var(--glass-border)] object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center ring-2 ring-[var(--glass-border)]">
                      <User className="w-7 h-7 text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{member.nameIC}</h3>
                    <span className={`rank-badge text-[10px] mt-1 ${getRankClass(member.rank)}`}>
                      <BadgeCheck className="w-3 h-3" />
                      {RANK_LABELS[member.rank]}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg text-[var(--accent)]">{member.callsign}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Phone className="w-4 h-4" />
                    <span>{member.phoneNumber}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredMembers.length === 0 && !loading && (
              <div className="col-span-full text-center py-20">
                <User className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4" />
                <p className="text-[var(--text-secondary)]">Nu au fost găsiți membri.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
