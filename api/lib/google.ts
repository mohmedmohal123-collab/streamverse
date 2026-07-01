import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID;

let googleClient: OAuth2Client | null = null;

if (googleClientId) {
  googleClient = new OAuth2Client(googleClientId);
}

/**
 * Verify a Google ID token and return the payload
 */
export async function verifyGoogleIdToken(idToken: string): Promise<any> {
  if (!googleClient) {
    throw new Error('Google OAuth client not configured');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: googleClientId,
  });

  return ticket.getPayload();
}
