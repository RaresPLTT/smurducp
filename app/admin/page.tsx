"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RANK_LABELS, RANK_ORDER } from "@/lib/callsign";
import { Rank } from "@prisma/client";
import { Shield, UserPlus, Users, ChevronUp, ChevronDown, UserX, Search, X, AlertCircle, CheckCircle, BadgeCheck, User } from "lucide-react";

interface Member {
  id: number;
  nameIC: string;
  cnp: string;
  discordId: string;
  phoneNumber: string;
  rank: Rank;
  callsign: string;
  avatarUrl: string | null;
}

type TabType = "members" | "recruit";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionModal, setActionModal] = useState<{ type: "promote" | "demote" | "dismiss" | null; member: Member | null }>({ type: null, member: null });
  const [actionReason, setActionReason] = useState("");
  const [targetRank, setTargetRank] = useState<Rank | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [recruitForm, setRecruitForm] = useState({ nameIC: "", cnp: "", discordId: "", phoneNumber: "" });
  const [recruitLoading, setRecruitLoading] = useState(false);

  const isManagement = session?.user?.rank === "DIRECTOR_GENERAL" || session?.user?.rank === "DIRECTOR_ADJUNCT";

  useEffect(() => {
    if (session && !isManagement) router.push("/dashboard");
  }, [session, isManagement, router]);

  useEffect(() => {
    if (isManagement) fetchMembers();
  }, [isManagement]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  const filteredMembers = members
    .filter((m) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return m.nameIC.toLowerCase().includes(s) || m.callsign.includes(search) || m.discordId.includes(search);
    })
    .sort((a, b) => {
      const aIndex = RANK_ORDER.indexOf(a.rank);
      const bIndex = RANK_ORDER.indexOf(b.rank);
      if (aIndex !== bIndex) return aIndex - bIndex;
      return parseInt(a.callsign) - parseInt(b.callsign);
    });

  const getRankClass = (rank: string) => {
    const c: Record<string, string> = {
      DIRECTOR_GENERAL: "rank-director-general", DIRECTOR_ADJUNCT: "rank-director-adjunct",
      MEDIC_PRIMAR: "rank-medic-primar", MEDIC_CHIRURG: "rank-medic-chirurg",
      MEDIC_REZIDENT: "rank-medic-rezident", ASISTENT: "rank-asistent",
      PARAMEDIC: "rank-paramedic", STAGIAR: "rank-stagiar",
    };
    return c[rank] || "rank-stagiar";
  };

  const getAvailablePromotions = (currentRank: Rank): Rank[] => {
    const i = RANK_ORDER.indexOf(currentRank);
    return RANK_ORDER.slice(0, i);
  };

  const getAvailableDemotions = (currentRank: Rank): Rank[] => {
    const i = RANK_ORDER.indexOf(currentRank);
    return RANK_ORDER.slice(i + 1);
  };

  const handleAction = async () => {
    if (!actionModal.member || !actionModal.type) return;
    setActionLoading(true);
    try {
      const endpoint = actionModal.type === "dismiss" ? "/api/admin/dismiss" : "/api/admin/rank-change";
      const body: Record<string, unknown> = { memberId: actionModal.member.id, reason: actionReason };
      if (actionModal.type !== "dismiss" && targetRank) body.newRank = targetRank;

      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (res.ok) {
        setNotification({
          type: "success",
          message: actionModal.type === "dismiss"
            ? `${actionModal.member.nameIC} a fost exclus din SMURD.`
            : `${actionModal.member.nameIC} a fost ${actionModal.type === "promote" ? "avansat" : "retrogradat"} la ${RANK_LABELS[targetRank!]}.`,
        });
        fetchMembers();
        closeActionModal();
      } else {
        setNotification({ type: "error", message: data.error || "A apărut o eroare." });
      }
    } catch (error) {
      setNotification({ type: "error", message: "A apărut o eroare." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecruit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecruitLoading(true);
    try {
      const res = await fetch("/api/admin/recruit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(recruitForm) });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: "success", message: `${recruitForm.nameIC} a fost recrutat cu succes. Indicativ: ${data.callsign}` });
        setRecruitForm({ nameIC: "", cnp: "", discordId: "", phoneNumber: "" });
        fetchMembers();
      } else {
        setNotification({ type: "error", message: data.error || "A apărut o eroare." });
      }
    } catch (error) {
      setNotification({ type: "error", message: "A apărut o eroare." });
    } finally {
      setRecruitLoading(false);
    }
  };

  const closeActionModal = () => {
    setActionModal({ type: null, member: null });
    setActionReason("");
    setTargetRank(null);
  };

  if (!isManagement) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {notification && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl flex items-center gap-3 slide-in ${notification.type === "success" ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}>
            {notification.type === "success" ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className={notification.type === "success" ? "text-green-400" : "text-red-400"}>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 text-[var(--text-muted)] hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="mb-8 slide-in">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="font-display font-bold text-3xl text-white">Management</h1>
          </div>
          <p className="text-[var(--text-secondary)]">Gestionează membrii SMURD</p>
        </div>

        <div className="glass-card p-2 mb-6 inline-flex gap-2 slide-in" style={{ animationDelay: "0.1s" }}>
          <button onClick={() => setActiveTab("members")} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "members" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]"}`}>
            <Users className="w-5 h-5" />Gestionare Membri
          </button>
          <button onClick={() => setActiveTab("recruit")} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "recruit" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]"}`}>
            <UserPlus className="w-5 h-5" />Recrutare
          </button>
        </div>

        {activeTab === "members" && (
          <div className="slide-in" style={{ animationDelay: "0.2s" }}>
            <div className="glass-card p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input type="text" placeholder="Caută..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)]">
                      <th className="text-left p-4 text-[var(--text-muted)] font-semibold">Membru</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-semibold">Grad</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-semibold">Indicativ</th>
                      <th className="text-left p-4 text-[var(--text-muted)] font-semibold">Discord ID</th>
                      <th className="text-right p-4 text-[var(--text-muted)] font-semibold">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--bg-tertiary)]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {member.avatarUrl ? <img src={member.avatarUrl} alt={member.nameIC} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center"><User className="w-5 h-5 text-[var(--text-muted)]" /></div>}
                            <span className="font-semibold text-white">{member.nameIC}</span>
                          </div>
                        </td>
                        <td className="p-4"><span className={`rank-badge text-[10px] ${getRankClass(member.rank)}`}>{RANK_LABELS[member.rank]}</span></td>
                        <td className="p-4"><span className="font-display font-bold text-[var(--accent)]">{member.callsign}</span></td>
                        <td className="p-4"><span className="font-mono text-sm text-[var(--text-secondary)]">{member.discordId}</span></td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            {getAvailablePromotions(member.rank).length > 0 && <button onClick={() => setActionModal({ type: "promote", member })} className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20" title="Avansare"><ChevronUp className="w-5 h-5" /></button>}
                            {getAvailableDemotions(member.rank).length > 0 && <button onClick={() => setActionModal({ type: "demote", member })} className="p-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" title="Retrogradare"><ChevronDown className="w-5 h-5" /></button>}
                            <button onClick={() => setActionModal({ type: "dismiss", member })} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Excludere"><UserX className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredMembers.length === 0 && <div className="text-center py-12"><Users className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" /><p className="text-[var(--text-secondary)]">Nu au fost găsiți membri.</p></div>}
            </div>
          </div>
        )}

        {activeTab === "recruit" && (
          <div className="glass-card p-8 max-w-2xl slide-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-[var(--accent)]/10"><UserPlus className="w-6 h-6 text-[var(--accent)]" /></div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">Formular Recrutare</h2>
                <p className="text-sm text-[var(--text-muted)]">Adaugă un nou membru</p>
              </div>
            </div>
            <form onSubmit={handleRecruit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Nume IC *</label>
                  <input type="text" required value={recruitForm.nameIC} onChange={(e) => setRecruitForm({ ...recruitForm, nameIC: e.target.value })} placeholder="Ion Popescu" className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">CNP *</label>
                  <input type="text" required value={recruitForm.cnp} onChange={(e) => setRecruitForm({ ...recruitForm, cnp: e.target.value })} placeholder="1234567890123" className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Discord ID *</label>
                  <input type="text" required value={recruitForm.discordId} onChange={(e) => setRecruitForm({ ...recruitForm, discordId: e.target.value })} placeholder="123456789012345678" className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Telefon *</label>
                  <input type="text" required value={recruitForm.phoneNumber} onChange={(e) => setRecruitForm({ ...recruitForm, phoneNumber: e.target.value })} placeholder="0712-345-678" className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]" />
                </div>
              </div>
              <div className="p-4 bg-[var(--bg-tertiary)] rounded-xl">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-5 h-5 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm text-white font-semibold">Grad Inițial: Stagiar</p>
                    <p className="text-xs text-[var(--text-muted)]">Indicativ automat: 500-599</p>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={recruitLoading} className="w-full py-4 accent-gradient rounded-xl font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {recruitLoading ? <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Se procesează...</> : <><UserPlus className="w-5 h-5" />Recrutează</>}
              </button>
            </form>
          </div>
        )}

        {actionModal.type && actionModal.member && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeActionModal} />
            <div className="relative glass-card p-6 w-full max-w-md slide-in">
              <button onClick={closeActionModal} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white"><X className="w-5 h-5" /></button>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${actionModal.type === "promote" ? "bg-green-500/10" : actionModal.type === "demote" ? "bg-orange-500/10" : "bg-red-500/10"}`}>
                  {actionModal.type === "promote" ? <ChevronUp className="w-6 h-6 text-green-400" /> : actionModal.type === "demote" ? <ChevronDown className="w-6 h-6 text-orange-400" /> : <UserX className="w-6 h-6 text-red-400" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white">{actionModal.type === "promote" ? "Avansare" : actionModal.type === "demote" ? "Retrogradare" : "Excludere"}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{actionModal.member.nameIC}</p>
                </div>
              </div>
              {actionModal.type !== "dismiss" && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Noul Grad *</label>
                  <select value={targetRank || ""} onChange={(e) => setTargetRank(e.target.value as Rank)} className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-[var(--accent)]">
                    <option value="">Selectează gradul</option>
                    {(actionModal.type === "promote" ? getAvailablePromotions(actionModal.member.rank) : getAvailableDemotions(actionModal.member.rank)).map((rank) => <option key={rank} value={rank}>{RANK_LABELS[rank]}</option>)}
                  </select>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Motivul {actionModal.type === "dismiss" ? "*" : "(opțional)"}</label>
                <textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} required={actionModal.type === "dismiss"} rows={3} placeholder="Introduceți motivul..." className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--glass-border)] rounded-xl text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={closeActionModal} className="flex-1 py-3 bg-[var(--bg-tertiary)] rounded-xl font-semibold text-[var(--text-secondary)] hover:text-white">Anulează</button>
                <button onClick={handleAction} disabled={actionLoading || (actionModal.type !== "dismiss" && !targetRank) || (actionModal.type === "dismiss" && !actionReason)} className={`flex-1 py-3 rounded-xl font-semibold text-white disabled:opacity-50 ${actionModal.type === "dismiss" ? "bg-red-500 hover:bg-red-600" : actionModal.type === "promote" ? "bg-green-500 hover:bg-green-600" : "bg-orange-500 hover:bg-orange-600"}`}>
                  {actionLoading ? "Se procesează..." : "Confirmă"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
