import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isManagement } from "@/lib/callsign";
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
    const { memberId, reason } = body;

    if (!memberId || !reason) {
      return NextResponse.json(
        { error: "memberId și reason sunt obligatorii" },
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

    await prisma.actionLog.create({
      data: {
        actionType: "DISMISS",
        targetId: memberId,
        performedBy: session.user.memberId,
        reason,
        oldRank: member.rank,
      },
    });

    await prisma.member.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: "Membrul a fost exclus",
    });
  } catch (error) {
    console.error("Error dismissing member:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la excluderea membrului" },
      { status: 500 }
    );
  }
}
