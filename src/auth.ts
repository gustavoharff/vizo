import NextAuth, { NextAuthConfig } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";

export const config = {
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET!,
  providers: [
    FacebookProvider({
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
      authorization: {
        params: {
          auth_type: "rerequest",
          scope: "public_profile",
        },
      },
      profile(profile, tokens) {
        return {
          ...profile,
          id: profile.sub,
          idToken: tokens.id_token,
          accessToken: tokens.access_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.accessToken) {
        token.accessToken = user.accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        accessToken: token.accessToken,
      };

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);