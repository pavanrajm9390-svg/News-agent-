const sourcesRepo = require('../db/repositories/sources');
const articlesRepo = require('../db/repositories/articles');
const { fetchFeed } = require('../services/rss');

async function collectAll() {
  const sources = sourcesRepo.getActive();
  console.log(`Collecting from ${sources.length} active sources...`);

  let totalNew = 0;

  for (const source of sources) {
    const items = await fetchFeed(source.url);
    let newCount = 0;

    for (const item of items) {
      if (!item.url || !item.title) continue;

      const id = articlesRepo.upsert({
        source_id: source.id,
        title: item.title,
        url: item.url,
        summary: item.summary,
        published_at: item.published_at,
        image_url: item.image_url,
      });

      if (id) newCount++;
    }

    sourcesRepo.update(source.id, {
      last_fetched_at: new Date().toISOString(),
    });

    totalNew += newCount;
    console.log(`  ${source.name}: ${items.length} items (${newCount} new)`);
  }

  // Clean old articles
  const cleaned = articlesRepo.cleanOld(14);
  if (cleaned > 0) console.log(`Cleaned ${cleaned} old articles`);

  return { sources: sources.length, newArticles: totalNew };
}

module.exports = { collectAll };
