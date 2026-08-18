/**
 * Module 1: The Trend Fetcher (scripts/1-fetch-trends.ts)
 * 
 * Culture-Jacking Logic:
 * Autonomous marketing cannot rely on static ideas. This module captures the real-time
 * emotional zeitgeist ("cultural pulse") by scraping top trending discussions from
 * Gen-Z hubs (r/me_irl for universal relatable humor, r/IndianTeenagers for local college/relationship vibe).
 */

export interface TrendItem {
  subreddit: string;
  title: string;
  selftext?: string;
  score: number;
  url: string;
}

export interface CulturalPulse {
  fetchedAt: string;
  subreddits: string[];
  trends: TrendItem[];
  combinedPulseText: string;
}

const SUBREDDITS = ['me_irl', 'IndianTeenagers'];
const USER_AGENT = 'AutoReel:culture-pulse-tracker:v1.0.0 (by /u/AutoReelBot)';

/**
 * Fetches top 5 daily posts from a specific subreddit
 */
async function fetchSubredditTop(subreddit: string): Promise<TrendItem[]> {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=5`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[WARN] Reddit API returned status ${response.status} for r/${subreddit}`);
      return [];
    }

    const data = (await response.json()) as any;
    const children = data?.data?.children || [];

    return children.map((item: any) => ({
      subreddit: subreddit,
      title: item.data.title || '',
      selftext: item.data.selftext ? item.data.selftext.slice(0, 140) : '',
      score: item.data.score || 0,
      url: `https://reddit.com${item.data.permalink}`,
    }));
  } catch (error: any) {
    console.warn(`[WARN] Failed to fetch r/${subreddit}: ${error.message}`);
    return [];
  }
}

/**
 * Fallback trends to ensure zero-downtime execution in CRON environments
 */
function getFallbackTrends(): TrendItem[] {
  return [
    {
      subreddit: 'me_irl',
      title: 'me at 3 AM contemplating every life decision since 2019',
      score: 14200,
      url: 'https://reddit.com/r/me_irl',
    },
    {
      subreddit: 'IndianTeenagers',
      title: 'Hostel WiFi died during midsem prep and my roommate is having a breakdown',
      score: 850,
      url: 'https://reddit.com/r/IndianTeenagers',
    },
    {
      subreddit: 'IndianTeenagers',
      title: 'Accidentally saw my ex in campus cafeteria and made the weirdest eye contact',
      score: 1200,
      url: 'https://reddit.com/r/IndianTeenagers',
    },
    {
      subreddit: 'me_irl',
      title: 'saying "it is what it is" after experiencing the worst week of my existence',
      score: 9300,
      url: 'https://reddit.com/r/me_irl',
    },
  ];
}

/**
 * Main trend fetching function
 */
export async function fetchDailyTrends(): Promise<CulturalPulse> {
  console.log('[Module 1] Fetching live Reddit trends (cultural pulse)...');

  const results = await Promise.all(SUBREDDITS.map((sub) => fetchSubredditTop(sub)));
  let allTrends = results.flat();

  if (allTrends.length === 0) {
    console.warn('[Module 1] Reddit rate-limited or offline. Utilizing high-retention fallback cultural pulse.');
    allTrends = getFallbackTrends();
  }

  // Format into a clean summary block for the LLM Brain
  const combinedPulseText = allTrends
    .map((t, idx) => `${idx + 1}. [r/${t.subreddit}] "${t.title}" ${t.selftext ? `— ${t.selftext}` : ''}`)
    .join('\n');

  return {
    fetchedAt: new Date().toISOString(),
    subreddits: SUBREDDITS,
    trends: allTrends,
    combinedPulseText,
  };
}

// Standalone execution test
if (require.main === module) {
  fetchDailyTrends().then((pulse) => {
    console.log('\n=== CULTURAL PULSE SUMMARY ===');
    console.log(pulse.combinedPulseText);
  });
}
