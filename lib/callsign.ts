import { Rank } from "@prisma/client";
import { prisma } from "./db";

export const RANK_RANGES: Record<Rank, { min: number; max: number }> = {
  DIRECTOR_GENERAL: { min: 1, max: 2 },
  DIRECTOR_ADJUNCT: { min: 3, max: 5 },
  MEDIC_PRIMAR: { min: 6, max: 99 },
  MEDIC_CHIRURG: { min: 100, max: 199 },
  MEDIC_REZIDENT: { min: 200, max: 299 },
  ASISTENT: { min: 300, max: 399 },
  PARAMEDIC: { min: 400, max: 499 },
  STAGIAR: { min: 500, max: 599 },
};

export const RANK_LABELS: Record<Rank, string> = {
  DIRECTOR_GENERAL: "Director General",
  DIRECTOR_ADJUNCT: "Director Adjunct",
  MEDIC_PRIMAR: "Medic Primar",
  MEDIC_CHIRURG: "Medic Chirurg",
  MEDIC_REZIDENT: "Medic Rezident",
  ASISTENT: "Asistent",
  PARAMEDIC: "Paramedic",
  STAGIAR: "Stagiar",
};

export const RANK_ORDER: Rank[] = [
  "DIRECTOR_GENERAL",
  "DIRECTOR_ADJUNCT",
  "MEDIC_PRIMAR",
  "MEDIC_CHIRURG",
  "MEDIC_REZIDENT",
  "ASISTENT",
  "PARAMEDIC",
  "STAGIAR",
];

export function formatCallsign(num: number): string {
  return num.toString().padStart(3, "0");
}

export function parseCallsign(callsign: string): number {
  return parseInt(callsign, 10);
}

export async function getNextAvailableCallsign(rank: Rank): Promise<string> {
  const range = RANK_RANGES[rank];

  const existingMembers = await prisma.member.findMany({
    where: {
      rank: rank,
    },
    select: {
      callsign: true,
    },
  });

  const usedCallsigns = new Set(
    existingMembers.map((m) => parseCallsign(m.callsign))
  );

  for (let i = range.min; i <= range.max; i++) {
    if (!usedCallsigns.has(i)) {
      return formatCallsign(i);
    }
  }

  throw new Error(`No available callsigns for rank ${RANK_LABELS[rank]}`);
}

export function isManagement(rank: Rank): boolean {
  return rank === "DIRECTOR_GENERAL" || rank === "DIRECTOR_ADJUNCT";
}

export function canPromoteTo(currentRank: Rank, targetRank: Rank): boolean {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  const targetIndex = RANK_ORDER.indexOf(targetRank);
  return targetIndex < currentIndex;
}

export function canDemoteTo(currentRank: Rank, targetRank: Rank): boolean {
  const currentIndex = RANK_ORDER.indexOf(currentRank);
  const targetIndex = RANK_ORDER.indexOf(targetRank);
  return targetIndex > currentIndex;
}
