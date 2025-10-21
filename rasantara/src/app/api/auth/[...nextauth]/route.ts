import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import UserModel from "@/db/models/UserModel";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Save or update user in MongoDB
          await UserModel.findOrCreateGoogleUser({
            email: user.email,
            name: user.name || "Google User",
            image: user.image || undefined,
          });
          return true;
        } catch (error) {
          console.error("Error saving Google user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user && user.email) {
        // Get user from database to include in token
        const dbUser = await UserModel.findByEmail(user.email);
        if (dbUser) {
          const accessToken = sign(
            { _id: (dbUser as any)._id, email: dbUser.email },
            process.env.SECRET_KEY as string
          );
          token.accessToken = accessToken;
          token.email = user.email;
          token.role = (dbUser as any).role || "user";
          token.userId = (dbUser as any)._id?.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as any).accessToken = token.accessToken as string;
        (session as any).user.role = token.role;
        (session as any).user.id = token.userId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
