const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'NewsBriefingAgent/1.0 (personal use)',
  },
});

async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item) => ({
      title: item.title || 'No title',
      url: item.link || item.guid || '',
      summary: item.contentSnippet || item.summary || item.content || '',
      published_at: item.isoDate || item.pubDate || null,
      image_url: item.enclosure?.url || null,
    }));
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err.message);
    return [];
  }
}

module.exports = { fetchFeed };
