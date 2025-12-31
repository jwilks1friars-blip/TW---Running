// Minimal Strava Token Exchange Server
// Vercel serverless function to exchange Strava OAuth code for access token

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '191041';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '687d19ec3c8800010c1e31a6b44c7df13b64d2d7';

// Vercel serverless function format
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, clientId } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
    }

    try {
        // Exchange code for token
        const response = await fetch('https://www.strava.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: STRAVA_CLIENT_ID,
                client_secret: STRAVA_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({ 
                error: data.message || 'Failed to exchange token',
                details: data.errors 
            });
        }

        // Return token data to frontend
        res.status(200).json({
            access_token: data.access_token,
            expires_in: data.expires_in,
            refresh_token: data.refresh_token,
            athlete: data.athlete
        });
    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

