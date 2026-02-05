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
    const { nameIC, cnp, discordId, phoneNumber } = body;

    if (!nameIC || !cnp || !discordId || !phoneNumber) {
      return NextResponse.json(
        { error: "Toate câmpurile sunt obligatorii" },
        { status: 400 }
      );
    }

    const existingMember = await prisma.member.findFirst({
      where: {
        OR: [{ cnp }, { discordId }],
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Un membru cu acest CNP sau Discord ID există deja" },
        { status: 400 }
      );
    }

    const callsign = await getNextAvailableCallsign("STAGIAR");

    const newMember = await prisma.member.create({
      data: {
        nameIC,
        cnp,
        discordId,
        phoneNumber,
        rank: "STAGIAR",
        callsign,
      },
    });

    await prisma.actionLog.create({
      data: {
        actionType: "RECRUIT",
        targetId: newMember.id,
        performedBy: session.user.memberId,
        newRank: "STAGIAR",
      },
    });

    return NextResponse.json({
      success: true,
      member: newMember,
      callsign,
    });
  } catch (error) {
    console.error("Error recruiting member:", error);
    return NextResponse.json(
      { error: "A apărut o eroare la recrutare" },
      { status: 500 }
    );
  }
}
