import { StorySlide, ThemeConfig, WrappedData } from '../types';
import JSZip from 'jszip';

/**
 * Intelligent multiline word-wrapping helper for HTML5 Canvas.
 * Breaks on word boundaries, never cuts words in half, and returns the next Y position.
 */
function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 4
): number {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      if (linesDrawn + 1 >= maxLines) {
        ctx.fillText(line.trim() + '...', x, currentY);
        return currentY + lineHeight;
      }
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      linesDrawn++;
    } else {
      line = testLine;
    }
  }

  if (line.trim().length > 0 && linesDrawn < maxLines) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

/**
 * High-definition 9:16 canvas story renderer (1080x1920)
 * Produces crisp, balanced social cards for Instagram Stories, TikTok, Twitter/X, and WhatsApp Status.
 */
export const renderSlideToCanvas = async (
  slide: StorySlide,
  data: WrappedData,
  theme: ThemeConfig,
  removeWatermark: boolean = false
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // Background
  ctx.fillStyle = theme.cardBg;
  ctx.fillRect(0, 0, 1080, 1920);

  // Outer Neo-Brutalist Frame
  const margin = 48;
  const frameW = 1080 - margin * 2;
  const frameH = 1920 - margin * 2;

  // Hard offset shadow for main container
  ctx.fillStyle = '#000000';
  ctx.fillRect(margin + 16, margin + 16, frameW, frameH);

  // Inner card background
  ctx.fillStyle = theme.cardBg;
  ctx.fillRect(margin, margin, frameW, frameH);

  // Main thick border
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000000';
  ctx.strokeRect(margin, margin, frameW, frameH);

  // Header Bar (Solid Black Banner)
  ctx.fillStyle = '#000000';
  ctx.fillRect(margin, margin, frameW, 130);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`★ PERSONAL YEAR WRAPPED`, margin + 40, margin + 80);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFE500';
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.fillText(`${data.year}`, margin + frameW - 40, margin + 80);

  // User pill / kicker
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 30px "JetBrains Mono", monospace';
  ctx.fillText(`RECIP: ${data.userName.toUpperCase()} (${data.handle})`, margin + 40, margin + 200);

  // Category Tag Box
  const catText = `DOMAIN: ${data.category.toUpperCase()} · ${slide.type.toUpperCase()}`;
  ctx.fillStyle = '#000000';
  ctx.fillRect(margin + 40, margin + 230, 520, 54);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px "Space Grotesk", sans-serif';
  ctx.fillText(catText, margin + 60, margin + 268);

  // ==========================================
  // SLIDE 1: INTRO
  // ==========================================
  if (slide.type === 'intro') {
    // Big Headline
    ctx.fillStyle = '#000000';
    ctx.font = '900 82px "Space Grotesk", sans-serif';
    ctx.fillText('2026 WAS', margin + 40, margin + 410);
    ctx.fillText('AN ABSOLUTE', margin + 40, margin + 500);

    // Accent box for MASTERCLASS
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 530, 680, 100);
    ctx.fillStyle = '#D2FF3A';
    ctx.fillText('MASTERCLASS', margin + 60, margin + 610);

    // Giant central graphic box
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 680, frameW - 80, 540);

    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText('KEYSTONE PERFORMANCE METRIC', margin + 70, margin + 760);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 120px "Space Grotesk", sans-serif';
    ctx.fillText(`${data.primaryMetric.value.toLocaleString()}`, margin + 70, margin + 900);

    ctx.fillStyle = '#D2FF3A';
    ctx.font = 'bold 44px "Space Grotesk", sans-serif';
    ctx.fillText(`${data.primaryMetric.unit.toUpperCase()}`, margin + 70, margin + 980);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(
      ctx,
      data.primaryMetric.label || 'Calculated across 365 days of dedication.',
      margin + 70,
      margin + 1060,
      frameW - 140,
      40,
      2
    );

    // Archetype Preview Card (Fills mid-bottom)
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 1260, frameW - 80, 200);
    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText('VERIFIED ARCHETYPE:', margin + 70, margin + 1320);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 46px "Space Grotesk", sans-serif';
    ctx.fillText(data.archetype.title, margin + 70, margin + 1380);

    ctx.fillStyle = '#FFE500';
    ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(data.archetype.tagline, margin + 70, margin + 1425);

    // Bottom consistency badge
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + 40, margin + 1490, frameW - 80, 130);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(margin + 40, margin + 1490, frameW - 80, 130);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText(`UNBROKEN STREAK: ${data.streak.days} DAYS`, margin + 70, margin + 1545);
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#555555';
    ctx.fillText(data.streak.description, margin + 70, margin + 1585);
  }

  // ==========================================
  // SLIDE 2: PRIMARY METRIC
  // ==========================================
  else if (slide.type === 'primary_metric') {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.fillText('[ 01 // THE HEADLINE NUMBER ]', margin + 40, margin + 350);

    // Primary Metric Box
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 390, frameW - 80, 420);

    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    drawWrappedText(ctx, data.primaryMetric.label.toUpperCase(), margin + 70, margin + 460, frameW - 140, 38, 2);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 130px "Space Grotesk", sans-serif';
    ctx.fillText(`${data.primaryMetric.value.toLocaleString()}`, margin + 70, margin + 640);

    ctx.fillStyle = '#D2FF3A';
    ctx.font = '900 40px "Space Grotesk", sans-serif';
    ctx.fillText(`${data.primaryMetric.unit.toUpperCase()} · TOP ${100 - data.percentileRank}% GLOBALLY`, margin + 70, margin + 730);

    // Secondary 4-Card Grid
    const secBoxW = (frameW - 100) / 2;
    data.secondaryMetrics.slice(0, 4).forEach((sec, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = margin + 40 + col * (secBoxW + 20);
      const y = margin + 850 + row * 260;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, secBoxW, 230);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(x, y, secBoxW, 230);

      ctx.fillStyle = '#000000';
      ctx.font = '900 64px "Space Grotesk", sans-serif';
      ctx.fillText(`${sec.value}`, x + 28, y + 90);

      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#444444';
      drawWrappedText(ctx, sec.label.toUpperCase(), x + 28, y + 150, secBoxW - 56, 32, 2);
    });

    // Milestone Highlight Strip at bottom
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 1400, frameW - 80, 210);

    ctx.fillStyle = '#D2FF3A';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText(`STANDOUT PEAK DATE · ${data.peakMoment.date}`, margin + 70, margin + 1460);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText(data.peakMoment.label, margin + 70, margin + 1520);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, data.peakMoment.detail, margin + 70, margin + 1565, frameW - 140, 32, 1);
  }

  // ==========================================
  // SLIDE 3: TOP LIST (SONGS / REPOS)
  // ==========================================
  else if (slide.type === 'top_list') {
    ctx.fillStyle = '#000000';
    ctx.font = '900 64px "Space Grotesk", sans-serif';
    ctx.fillText('TOP 5 OBSESSIONS', margin + 40, margin + 350);

    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillStyle = '#444444';
    ctx.fillText(data.category === 'spotify' ? 'YOUR HEAVY ROTATION TRACKS' : 'PRIMARY FOCUS PROJECTS', margin + 40, margin + 400);

    // Draw the 5 items with multi-line wrap protection
    data.topItems.slice(0, 5).forEach((item, idx) => {
      const y = margin + 450 + idx * 220;

      // Card shadow
      ctx.fillStyle = '#000000';
      ctx.fillRect(margin + 48, y + 8, frameW - 80, 195);

      // Card surface
      ctx.fillStyle = idx === 0 ? '#FFE500' : '#FFFFFF';
      ctx.fillRect(margin + 40, y, frameW - 80, 195);

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin + 40, y, frameW - 80, 195);

      // Rank Badge
      ctx.fillStyle = '#000000';
      ctx.fillRect(margin + 60, y + 25, 80, 80);
      ctx.fillStyle = idx === 0 ? '#FFE500' : '#FFFFFF';
      ctx.font = '900 42px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`0${idx + 1}`, margin + 100, y + 80);
      ctx.textAlign = 'left';

      // Title (Wrapped up to 2 lines)
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      const nextY = drawWrappedText(ctx, item.name, margin + 160, y + 68, frameW - 380, 42, 2);

      // Subtitle (Artist or language)
      ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#444444';
      drawWrappedText(ctx, item.subtitle || '', margin + 160, Math.max(nextY, y + 115), frameW - 380, 32, 2);

      // Duration or Count badge on right
      ctx.fillStyle = '#000000';
      ctx.fillRect(margin + frameW - 200, y + 30, 140, 50);
      ctx.fillStyle = '#D2FF3A';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.count || '').slice(0, 10), margin + frameW - 130, y + 63);
      ctx.textAlign = 'left';
    });

    // Bottom summary banner
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 1580, frameW - 80, 70);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`VERIFIED ROTATION RANKING · 2026 DOSSIER`, margin + 70, margin + 1625);
  }

  // ==========================================
  // SLIDE 4: PEAK MOMENT & STREAK
  // ==========================================
  else if (slide.type === 'peak_moment') {
    ctx.fillStyle = '#000000';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.fillText('THE PEAK & STREAK', margin + 40, margin + 350);

    // Peak Card (Tall & Balanced)
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 410, frameW - 80, 520);

    ctx.fillStyle = '#FF5A36';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText(`STANDOUT PEAK · ${data.peakMoment.date}`, margin + 80, margin + 490);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px "Space Grotesk", sans-serif';
    const peakTitleY = drawWrappedText(ctx, data.peakMoment.label, margin + 80, margin + 580, frameW - 160, 64, 3);

    ctx.fillStyle = '#DDDDDD';
    ctx.font = '500 32px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, data.peakMoment.detail, margin + 80, peakTitleY + 30, frameW - 160, 44, 4);

    // Streak Card (Solid Lime)
    ctx.fillStyle = '#D2FF3A';
    ctx.fillRect(margin + 40, margin + 970, frameW - 80, 400);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(margin + 40, margin + 970, frameW - 80, 400);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText('MAXIMUM UNBROKEN STREAK', margin + 80, margin + 1050);

    ctx.font = '900 130px "Space Grotesk", sans-serif';
    ctx.fillText(`${data.streak.days} DAYS`, margin + 80, margin + 1200);

    ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, data.streak.description, margin + 80, margin + 1270, frameW - 160, 42, 2);

    // Quirk highlight card at bottom
    if (data.failOrQuirk) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(margin + 40, margin + 1410, frameW - 80, 220);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin + 40, margin + 1410, frameW - 80, 220);

      ctx.fillStyle = '#FF5A36';
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillText(data.failOrQuirk.label.toUpperCase(), margin + 70, margin + 1470);

      ctx.fillStyle = '#000000';
      ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
      drawWrappedText(ctx, data.failOrQuirk.description, margin + 70, margin + 1520, frameW - 140, 40, 2);
    }
  }

  // ==========================================
  // SLIDE 5: ARCHETYPE (FIXED NO MORE EMPTY VOID!)
  // ==========================================
  else if (slide.type === 'archetype') {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.fillText('[ 04 // 2026 IDENTITY ARCHETYPE ]', margin + 40, margin + 350);

    // Main Archetype Box (Fills generously from 390 to 1180)
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 390, frameW - 80, 780);

    // Badge label
    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText(`★ ${data.archetype.badgeLabel}`, margin + 80, margin + 470);

    // Title (Large, wrapped up to 2 lines)
    ctx.fillStyle = '#D2FF3A';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    const titleEndY = drawWrappedText(ctx, data.archetype.title, margin + 80, margin + 560, frameW - 160, 76, 2);

    // Tagline (Italic/quotes, wrapped)
    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 32px "JetBrains Mono", monospace';
    const tagEndY = drawWrappedText(ctx, `"${data.archetype.tagline}"`, margin + 80, titleEndY + 20, frameW - 160, 42, 2);

    // Description (Clean multiline wrapped text with zero cut-off!)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 34px "Plus Jakarta Sans", sans-serif';
    drawWrappedText(ctx, data.archetype.description, margin + 80, tagEndY + 35, frameW - 160, 50, 6);

    // Quirk Box (Fills 1200 to 1420)
    if (data.failOrQuirk) {
      ctx.fillStyle = '#FF5A36';
      ctx.fillRect(margin + 40, margin + 1210, frameW - 80, 200);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin + 40, margin + 1210, frameW - 80, 200);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillText(data.failOrQuirk.label.toUpperCase(), margin + 70, margin + 1270);

      ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
      drawWrappedText(ctx, data.failOrQuirk.description, margin + 70, margin + 1320, frameW - 140, 38, 2);
    }

    // Bottom Dossier Summary Box (Fills 1440 to 1640 so bottom is never empty!)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + 40, margin + 1440, frameW - 80, 190);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(margin + 40, margin + 1440, frameW - 80, 190);

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px "Space Grotesk", sans-serif';
    ctx.fillText(`${data.primaryMetric.value.toLocaleString()} ${data.primaryMetric.unit.toUpperCase()}`, margin + 70, margin + 1515);

    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillStyle = '#333333';
    ctx.fillText(`VERIFIED IN TOP ${100 - data.percentileRank}% COHORT GLOBALLY`, margin + 70, margin + 1575);
  }

  // ==========================================
  // SLIDE 6: DEEP STATS (PREMIUM TELEMETRY)
  // ==========================================
  else if (slide.type === 'deep_stats') {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.fillText('[ PRO // ADVANCED TELEMETRY ]', margin + 40, margin + 350);

    ctx.font = '900 64px "Space Grotesk", sans-serif';
    ctx.fillText('DEEP DIVE METRICS', margin + 40, margin + 420);

    // 4 Generous Stacked Cards
    data.secondaryMetrics.slice(0, 4).forEach((sec, idx) => {
      const y = margin + 480 + idx * 240;

      ctx.fillStyle = '#000000';
      ctx.fillRect(margin + 48, y + 8, frameW - 80, 205);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(margin + 40, y, frameW - 80, 205);

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin + 40, y, frameW - 80, 205);

      ctx.fillStyle = '#777777';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.fillText(`METRIC 0${idx + 1} //`, margin + 70, y + 60);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      drawWrappedText(ctx, sec.label.toUpperCase(), margin + 70, y + 115, frameW - 360, 40, 2);

      ctx.fillStyle = '#000000';
      ctx.font = '900 72px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(sec.value), margin + frameW - 80, y + 130);
      ctx.textAlign = 'left';
    });

    // Bottom verification strip
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 1480, frameW - 80, 160);

    ctx.fillStyle = '#D2FF3A';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText(`VERIFIED COHORT BENCHMARK`, margin + 70, margin + 1545);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Space Grotesk", sans-serif';
    ctx.fillText(`Top ${100 - data.percentileRank}% in ${data.category.toUpperCase()} category`, margin + 70, margin + 1600);
  }

  // ==========================================
  // SLIDE 7: MONTHLY CHART (REAL 12-MONTH HISTOGRAM)
  // ==========================================
  else if (slide.type === 'monthly_chart') {
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 34px "JetBrains Mono", monospace';
    ctx.fillText('[ PRO // 12-MONTH MOMENTUM ]', margin + 40, margin + 350);

    ctx.font = '900 64px "Space Grotesk", sans-serif';
    ctx.fillText('MONTHLY CADENCE', margin + 40, margin + 420);

    // Big Chart Canvas Box
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 470, frameW - 80, 800);

    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText('MONTHLY OUTPUT DISTRIBUTION', margin + 70, margin + 540);

    // Draw 12 Bars
    const breakdown = data.monthlyBreakdown || [];
    const maxVal = Math.max(...breakdown.map((x) => x.score), 1);
    const chartW = frameW - 160;
    const barW = Math.floor(chartW / 12) - 10;
    const chartBottomY = margin + 1150;
    const maxBarH = 480;

    breakdown.forEach((m, idx) => {
      const barH = Math.max(30, Math.round((m.score / maxVal) * maxBarH));
      const x = margin + 80 + idx * (barW + 10);
      const y = chartBottomY - barH;
      const isPeak = m.score === maxVal;

      ctx.fillStyle = isPeak ? '#FFE500' : '#D2FF3A';
      ctx.fillRect(x, y, barW, barH);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(x, y, barW, barH);

      // Month label
      ctx.fillStyle = isPeak ? '#FFE500' : '#888888';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(m.month[0], x + barW / 2, chartBottomY + 35);
      ctx.textAlign = 'left';
    });

    // Chart footer
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(`JANUARY`, margin + 80, chartBottomY + 75);
    ctx.textAlign = 'right';
    ctx.fillText(`DECEMBER`, margin + frameW - 80, chartBottomY + 75);
    ctx.textAlign = 'left';

    // Quote Box
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(margin + 40, margin + 1320, frameW - 80, 300);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(margin + 40, margin + 1320, frameW - 80, 300);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText('ANNUAL RETROSPECTIVE QUOTE', margin + 70, margin + 1380);

    ctx.font = 'italic 34px "Space Grotesk", sans-serif';
    drawWrappedText(
      ctx,
      `"${data.customQuote || 'The best work is the work you ship consistently.'}"`,
      margin + 70,
      margin + 1440,
      frameW - 140,
      46,
      3
    );
  }

  // ==========================================
  // SLIDE 8: FINAL SUMMARY DOSSIER
  // ==========================================
  else {
    ctx.fillStyle = '#000000';
    ctx.font = '900 76px "Space Grotesk", sans-serif';
    ctx.fillText('2026 DOSSIER', margin + 40, margin + 350);

    // Header Card
    ctx.fillStyle = '#000000';
    ctx.fillRect(margin + 40, margin + 400, frameW - 80, 420);

    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText(`OFFICIAL ANNUAL RECAP · ${data.category.toUpperCase()}`, margin + 80, margin + 470);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.fillText(data.userName, margin + 80, margin + 560);

    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 32px "JetBrains Mono", monospace';
    ctx.fillText(`${data.handle}`, margin + 80, margin + 620);

    // Primary & Rank row
    ctx.fillStyle = '#D2FF3A';
    ctx.font = '900 52px "Space Grotesk", sans-serif';
    ctx.fillText(`${data.primaryMetric.value.toLocaleString()} ${data.primaryMetric.unit.toUpperCase()}`, margin + 80, margin + 710);

    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillText(`TOP ${100 - data.percentileRank}% COHORT`, margin + 80, margin + 760);

    // Archetype Card
    ctx.fillStyle = '#D2FF3A';
    ctx.fillRect(margin + 40, margin + 850, frameW - 80, 240);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(margin + 40, margin + 850, frameW - 80, 240);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.fillText('ASSIGNED ARCHETYPE:', margin + 70, margin + 910);

    ctx.font = '900 52px "Space Grotesk", sans-serif';
    ctx.fillText(data.archetype.title, margin + 70, margin + 980);

    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`"${data.archetype.tagline}"`, margin + 70, margin + 1035);

    // 3 Highlights Stack
    data.topItems.slice(0, 3).forEach((item, idx) => {
      const y = margin + 1120 + idx * 165;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(margin + 40, y, frameW - 80, 140);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(margin + 40, y, frameW - 80, 140);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px "Space Grotesk", sans-serif';
      drawWrappedText(ctx, `#0${idx + 1} ${item.name}`, margin + 70, y + 60, frameW - 320, 36, 1);

      ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#555555';
      drawWrappedText(ctx, `${item.count} · ${item.subtitle || ''}`, margin + 70, y + 100, frameW - 320, 28, 1);

      ctx.fillStyle = '#000000';
      ctx.font = '900 32px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(String(item.count || '').slice(0, 10), margin + frameW - 80, y + 80);
      ctx.textAlign = 'left';
    });
  }

  // ==========================================
  // FOOTER ATTRIBUTION (PINNED TO BOTTOM)
  // ==========================================
  const footerY = margin + frameH - 120;
  ctx.fillStyle = '#000000';
  ctx.fillRect(margin, footerY, frameW, 120);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(removeWatermark ? data.userName.toUpperCase() : 'PERSONAL YEAR WRAPPED', margin + 40, footerY + 70);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFE500';
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillText(removeWatermark ? `VERIFIED · ${data.year}` : 'personalwrapped.app', margin + frameW - 40, footerY + 70);

  return canvas;
};

export const downloadSlidePNG = async (
  slide: StorySlide,
  data: WrappedData,
  theme: ThemeConfig,
  removeWatermark: boolean = false
) => {
  const canvas = await renderSlideToCanvas(slide, data, theme, removeWatermark);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${data.handle.replace('@', '') || 'my'}_${data.category}_wrapped_2026_${slide.type}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

/**
 * Packages all 9:16 story cards into a single clean ZIP archive with numbered files
 */
export const downloadAllSlidesAsZip = async (
  slides: StorySlide[],
  data: WrappedData,
  theme: ThemeConfig,
  removeWatermark: boolean = false,
  onProgress?: (current: number, total: number) => void
) => {
  const zip = new JSZip();
  const folderName = `${data.handle.replace('@', '') || 'user'}_${data.category}_wrapped_${data.year}`;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    onProgress?.(i + 1, slides.length);

    const canvas = await renderSlideToCanvas(slide, data, theme, removeWatermark);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      const filename = `${String(i + 1).padStart(2, '0')}_${slide.type}.png`;
      zip.file(filename, blob);
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${folderName}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

