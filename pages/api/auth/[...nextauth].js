import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify";

export async function refreshAccessToken(token) {
  try {
    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);

    const { body: refreshToken } = await spotifyApi.refreshAccessToken();
    console.log("REFRESHED TOKEN IS", refreshToken);

    return {
      ...token,
      accessToken: refreshToken.access_token,
      refreshToken: refreshToken.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() * refreshToken.expires_in * 1000,
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_ID,
      clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_SECRET,
      authorization: LOGIN_URL,
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        console.log("EXISTING ACCESS TOKEN IS VALID");
        return token;
      }

      // Access token has expired, we need to update it
      console.log("ACCESS TOKEN HAS EXPIRED, REFRESHING");
      return await refreshAccessToken(token);
    },

    async session({ session, token, user }) {
      session.user.accessToken = token.accessToken;
      session.user.refreshAccessToken = token.refreshToken;
      session.user.username = token.username;
      session.user.expires = token.accessTokenExpires;
      return session;
    },
  },
});
