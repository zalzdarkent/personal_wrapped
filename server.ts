import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const execPromise = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3090;

app.use(express.json());
app.use('/out', express.static(path.resolve(__dirname, 'out')));

// API: Download rendered video
app.get('/api/download-video', (req, res) => {
  const videoPath = path.resolve(__dirname, 'out/personal_wrapped.mp4');
  if (fs.existsSync(videoPath)) {
    return res.download(videoPath, 'personal_wrapped_2026.mp4');
  }
  const testPath = path.resolve(__dirname, 'out/test-full-render.mp4');
  if (fs.existsSync(testPath)) {
    return res.download(testPath, 'personal_wrapped_2026.mp4');
  }
  return res.status(404).json({ error: 'Video not rendered yet.' });
});

// API: Dynamic Remotion Video Render with User-Specific Props
app.post('/api/render-video', async (req, res) => {
  const { data, theme, isPro, narration } = req.body || {};
  if (!data) {
    return res.status(400).json({ error: 'Missing user wrapped data' });
  }

  const outDir = path.resolve(__dirname, 'out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Generate deterministic cache key based on inputs
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify({ data, theme, isPro: Boolean(isPro), narration }))
    .digest('hex')
    .substring(0, 12);

  const cleanHandle = String(data.handle || 'user').replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
  const prefix = isPro ? 'VIP_PRO' : 'WRAP';
  const category = data.category || 'recap';
  const filename = `${prefix}_${cleanHandle}_${category}_wrapped_2026.mp4`;
  const outputFile = path.resolve(outDir, `video_${category}_${hash}.mp4`);

  // If already rendered, return cached video immediately
  if (fs.existsSync(outputFile)) {
    console.log(`[Render] Cache hit for ${data.userName} (${outputFile})`);
    return res.json({
      success: true,
      downloadUrl: `/out/video_${category}_${hash}.mp4`,
      filename,
    });
  }

  const propsFile = path.resolve(outDir, `props_${category}_${hash}.json`);

  try {
    fs.writeFileSync(
      propsFile,
      JSON.stringify({
        data,
        theme,
        isPro: Boolean(isPro),
        narration: narration || null,
      })
    );

    const remotionBin = path.resolve(__dirname, 'node_modules/.bin/remotion');
    console.log(`[Render] Starting personalized ${category} render for ${data.userName} (@${data.handle})...`);

    const cmd = `"${remotionBin}" render src/remotion/index.ts PersonalWrapped "${outputFile}" --props="${propsFile}" --concurrency=8`;
    await execPromise(cmd, { cwd: __dirname });

    console.log(`[Render] Successfully rendered video: ${outputFile}`);

    // Clean up temporary props file
    try {
      fs.unlinkSync(propsFile);
    } catch {}

    return res.json({
      success: true,
      downloadUrl: `/out/video_${category}_${hash}.mp4`,
      filename,
    });
  } catch (err: any) {
    console.error('[Render Error]:', err);
    try {
      if (fs.existsSync(propsFile)) fs.unlinkSync(propsFile);
    } catch {}

    return res.status(500).json({
      error: err.message || 'Failed to render personalized video',
    });
  }
});

// API: Spotify URL & Playlist Parser
app.get('/api/spotify', async (req, res) => {
  try {
    const rawUrl = String(req.query.url || req.query.id || '').trim();
    if (!rawUrl) {
      return res.status(400).json({ error: 'Spotify URL or ID is required.' });
    }

    // Extract type and ID
    let type = 'playlist';
    let id = rawUrl;

    const match = rawUrl.match(/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
    if (match) {
      type = match[1];
      id = match[2];
    } else {
      id = rawUrl.replace(/[^a-zA-Z0-9]/g, '');
    }

    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Spotify returned status ${response.status}. Please ensure the playlist is public.`,
      });
    }

    const html = await response.text();
    const scriptMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

    if (!scriptMatch) {
      return res.status(404).json({ error: 'Could not find metadata in Spotify response.' });
    }

    const nextData = JSON.parse(scriptMatch[1]);
    const entity = nextData.props?.pageProps?.state?.data?.entity;

    if (!entity) {
      return res.status(404).json({ error: 'Could not resolve Spotify playlist or entity data.' });
    }

    const trackList = entity.trackList || [];
    const totalDurationMs = trackList.reduce((acc: number, t: any) => acc + (t.duration || 0), 0);
    const totalMinutes = Math.round(totalDurationMs / 60000);

    // Calculate top artists
    const artistCounts: Record<string, number> = {};
    for (const track of trackList) {
      const artist = track.subtitle || 'Unknown Artist';
      artistCounts[artist] = (artistCounts[artist] || 0) + 1;
    }

    const topArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Format top tracks
    const topTracks = trackList.slice(0, 5).map((track: any, idx: number) => ({
      id: String(idx + 1),
      name: track.title,
      count: `${Math.floor((track.duration || 0) / 60000)}m ${Math.round(((track.duration || 0) % 60000) / 1000)}s`,
      subtitle: track.subtitle || 'Artist',
    }));

    return res.json({
      success: true,
      title: entity.title || entity.name || 'Spotify Playlist',
      subtitle: entity.subtitle || 'Spotify User',
      type: entity.type || type,
      coverArt: entity.coverArt?.sources?.[0]?.url || '',
      totalTracks: trackList.length,
      totalDurationMs,
      totalMinutes,
      topTracks,
      topArtists,
      allTracks: trackList.map((t: any) => ({
        title: t.title,
        artist: t.subtitle,
        duration: t.duration,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching Spotify data:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch Spotify playlist' });
  }
});

// API: GitHub User Data Proxy & Deep Normalization
app.get('/api/github', async (req, res) => {
  try {
    let username = String(req.query.username || '').trim();
    username = username.replace(/^https?:\/\/github\.com\//i, '').replace(/^@/, '').split('/')[0].split('?')[0];

    if (!username) {
      return res.status(400).json({ error: 'GitHub username is required.' });
    }

    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'PersonalYearWrapped-App/1.0',
    };

    // 1. Fetch user
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) {
        return res.status(404).json({ error: `GitHub user @${username} was not found.` });
      }
      return res.status(userRes.status).json({ error: `GitHub API error: status ${userRes.status}` });
    }
    const userData = await userRes.json();

    // 2. Fetch repos
    let repos: any[] = [];
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers }
    );
    if (reposRes.ok) {
      repos = await reposRes.json();
    }

    // 3. Fetch events
    let events: any[] = [];
    const eventsRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events?per_page=100`,
      { headers }
    );
    if (eventsRes.ok) {
      events = await eventsRes.json();
    }

    return res.json({
      success: true,
      userData,
      repos,
      events,
    });
  } catch (error: any) {
    console.error('Error fetching GitHub data:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch GitHub data' });
  }
});

// API: Gemini AI Video Director & Narrative Screenplay
app.post('/api/gemini/narration', async (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.userName) {
      return res.status(400).json({ error: 'Recap data is required' });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI();
    const prompt = `You are a viral TikTok & Reels Director creating a fast, witty, hype 20-second vertical video script for a 2026 Wrapped Recap.
User: ${data.userName} (${data.handle})
Category: ${data.category}
Headline Metric: ${data.primaryMetric?.value} ${data.primaryMetric?.unit} (${data.primaryMetric?.label})
Global Percentile: Top ${100 - (data.percentileRank || 95)}%
Archetype: ${data.archetype?.title} - "${data.archetype?.tagline}"
Top Obsessions: ${data.topItems?.slice(0, 3).map((t: any) => `${t.name} (${t.count})`).join(', ')}
Peak Moment: ${data.peakMoment?.label} (${data.peakMoment?.date})
Quirk: ${data.failOrQuirk?.label}: ${data.failOrQuirk?.description}

Respond ONLY with valid JSON with this schema:
{
  "title": "Short punchy video title",
  "hook": "First 3 seconds scroll-stopping hook",
  "scenes": [
    {
      "time": "0:00 - 0:05",
      "title": "THE INTRO",
      "voiceover": "Witty narration line",
      "visualDescription": "Visual action"
    },
    {
      "time": "0:05 - 0:10",
      "title": "KEYSTONE STAT",
      "voiceover": "High energy line on the main metric",
      "visualDescription": "Visual action"
    },
    {
      "time": "0:10 - 0:15",
      "title": "TOP OBSESSIONS",
      "voiceover": "Line about top items",
      "visualDescription": "Visual action"
    },
    {
      "time": "0:15 - 0:20",
      "title": "ARCHETYPE CROWN",
      "voiceover": "Punchline crowning the archetype",
      "visualDescription": "Visual action"
    }
  ],
  "punchline": "Final punchline",
  "fullScript": "Complete continuous voiceover script"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, narration: parsed });
  } catch (error: any) {
    console.error('Gemini narration error:', error);
    const d = req.body || {};
    return res.json({
      success: true,
      narration: {
        title: `${d.userName}'s 2026 Wrapped Experience`,
        hook: `Stop scrolling! ${d.userName}'s 2026 Wrapped just dropped.`,
        scenes: [
          {
            time: '0:00 - 0:05',
            title: 'THE INTRO',
            voiceover: `2026 was unprecedented for ${d.userName}. Let's break down the year.`,
            visualDescription: 'Kinetic title card pulse'
          },
          {
            time: '0:05 - 0:10',
            title: 'KEYSTONE STAT',
            voiceover: `Logging ${d.primaryMetric?.value?.toLocaleString() || '100+'} ${d.primaryMetric?.unit || 'milestones'}! Ranked in the Top ${100 - (d.percentileRank || 95)}% globally.`,
            visualDescription: 'Counter count-up'
          },
          {
            time: '0:10 - 0:15',
            title: 'TOP OBSESSIONS',
            voiceover: `Dominating the year: ${d.topItems?.[0]?.name || 'Top Milestones'}.`,
            visualDescription: 'Highlights showcase'
          },
          {
            time: '0:15 - 0:20',
            title: 'ARCHETYPE CROWN',
            voiceover: `Officially certified as ${d.archetype?.title || 'The Visionary'}. See you in 2027!`,
            visualDescription: 'Archetype stamp and final badge'
          }
        ],
        punchline: `Officially certified as ${d.archetype?.title || 'The Mastermind'}.`,
        fullScript: `2026 was unprecedented for ${d.userName}. With ${d.primaryMetric?.value?.toLocaleString()} ${d.primaryMetric?.unit}, officially crowned as ${d.archetype?.title}.`
      }
    });
  }
});

// Mount Vite or serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
