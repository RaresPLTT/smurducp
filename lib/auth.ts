import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      discordId: string;
      memberId: number;
      rank: string;
      callsign: string;
      nameIC: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId: string;
    memberId: number;
    rank: string;
    callsign: string;
    nameIC: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "discord") {
        const discordId = account.providerAccountId;

        const member = await prisma.member.findUnique({
          where: { discordId },
        });

        if (!member) {
          return false;
        }

        if (user.image && member.avatarUrl !== user.image) {
          await prisma.member.update({
            where: { discordId },
            data: { avatarUrl: user.image },
          });
        }

        return true;
      }
      return false;
    },
    async jwt({ token, account }) {
      if (account?.provider === "discord") {
        const discordId = account.providerAccountId;

        const member = await prisma.member.findUnique({
          where: { discordId },
        });

        if (member) {
          token.discordId = discordId;
          token.memberId = member.id;
          token.rank = member.rank;
          token.callsign = member.callsign;
          token.nameIC = member.nameIC;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.discordId = token.discordId;
        session.user.memberId = token.memberId;
        session.user.rank = token.rank;
        session.user.callsign = token.callsign;
        session.user.nameIC = token.nameIC;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
