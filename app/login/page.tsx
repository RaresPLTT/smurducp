"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, Shield, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "AccessDenied") {
      setError("Acces interzis. Discord ID-ul tău nu este înregistrat în baza de date SMURD.");
    } else if (errorParam) {
      setError("A apărut o eroare la autentificare.");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] grid-bg">
        <div className="w-16 h-16 accent-gradient rounded-2xl flex items-center justify-center pulse-glow">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] grid-bg relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-[var(--accent)] rounded-full filter blur-[150px] opacity-20" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--accent-dark)] rounded-full filter blur-[180px] opacity-15" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto accent-gradient rounded-2xl flex items-center justify-center pulse-glow mb-6">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h1 className="font-display font-bold text-4xl text-gradient mb-2">SMURD UCP</h1>
            <p className="text-[var(--text-secondary)]">Serviciul Mobil de Urgență, Reanimare și Descarcerare</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 slide-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={() => signIn("discord", { callbackUrl: "/dashboard" })}
            className="w-full py-4 px-6 bg-[#5865F2] hover:bg-[#4752C4] rounded-xl font-semibold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Conectare cu Discord
          </button>

          <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
            <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
              <Shield className="w-4 h-4" />
              <p>Doar membrii SMURD cu Discord ID înregistrat pot accesa panoul.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
