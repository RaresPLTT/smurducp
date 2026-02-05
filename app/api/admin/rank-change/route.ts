import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getNextAvailableCallsign, isManagement } from "@/lib/callsign";
import { Rank } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isManagement(session.user.rank as Rank)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { memberId, newRank, reason } = body;

    if (!memberId || !newRank) {
      return NextResponse.json(
        { error: "memberId și newRank sunt obligatorii" },
        { status: 400 }
      );
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membrul nu a fost găsit" },
        { status: 404 }
      );
    }

    const oldRank = member.rank;

    const newCallsign = await getNextAvailableCallsign(newRank as Rank);

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        rank: newRank as Rank,
        callsign: newCallsign,
      },
    });

    await prisma.actionLog.create({
      data: {
        actionType: "RANK_CHANGE",
        targetId: memberId,
        performedBy: session.user.memberId,
        reason,
        oldRank,
        newRank: newRank as Rank,
      },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
      newCallsign,
    });
  } catch (error) {
    console.error("Error changing rank:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la schimbarea gradului" },
      { status: 500 }
    );
  }
}
