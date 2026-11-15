const { collectAll } = require('./collector');
const { postToTelegram } = require('./poster');
const articlesRepo = require('../db/repositories/articles');
const briefingsRepo = require('../db/repositories/briefings');

const AI_LAYER_URL = process.env.AI_LAYER_URL || 'http://localhost:8001';

/**
 * Call the Python FastAPI AI layer via HTTP.
 */
async function callAILayer(articles, options = {}) {
  const response = await fetch(`${AI_LAYER_URL}/briefing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles, options }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI Layer error (${response.status}): ${text}`);
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
}

async function runFullPipeline(options = {}) {
  const start = Date.now();
  console.log('🚀 Starting full briefing pipeline...');

  // 1. Collect
  const collectResult = await collectAll();
  console.log(`Collected from ${collectResult.sources} sources`);

  // 2. Get recent articles
  const articles = articlesRepo.getRecent(36);
  console.log(`Using ${articles.length} recent articles for AI`);

  if (articles.length === 0) {
    return { success: false, message: 'No articles available' };
  }

  // 3. AI Layer (Python FastAPI)
  const provider = options.provider || process.env.AI_PROVIDER || 'anthropic';
  console.log(`Calling AI Layer (${provider}) at ${AI_LAYER_URL}...`);

  const aiResult = await callAILayer(articles, {
    provider,
    maxStories: options.maxStories || 12,
    style: options.style || 'concise',
  });

  // 4. Map selected indexes back to article IDs
  const selectedIds = (aiResult.selected_indexes || [])
    .map((idx) => articles[idx - 1]?.id)
    .filter(Boolean);

  // 5. Save briefing
  const today = new Date().toISOString().slice(0, 10);
  const briefing = briefingsRepo.create({
    date: today,
    title: aiResult.title,
    content_markdown: aiResult.markdown,
    content_json: JSON.stringify(aiResult),
    ai_provider: aiResult.provider || provider,
    articleIds: selectedIds,
  });

  console.log(`Briefing saved: ${briefing.id}`);

  // 6. Optional auto-post
  let postResult = null;
  if (options.autoPost !== false && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      postResult = await postToTelegram(briefing.id);
      console.log('Posted to Telegram');
    } catch (err) {
      console.error('Telegram post failed:', err.message);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✅ Pipeline finished in ${duration}s`);

  return {
    success: true,
    briefingId: briefing.id,
    articlesUsed: articles.length,
    postResult,
    duration,
  };
}

module.exports = { runFullPipeline };
