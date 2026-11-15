const briefingsRepo = require('../db/repositories/briefings');
const postsRepo = require('../db/repositories/posts');
const { sendBriefing } = require('../services/telegram');

async function postToTelegram(briefingId) {
  const briefing = briefingsRepo.getById(briefingId);
  if (!briefing) throw new Error('Briefing not found');

  try {
    const result = await sendBriefing(briefing.content_markdown);

    postsRepo.create({
      briefing_id: briefingId,
      channel: 'telegram',
      status: 'success',
      response: JSON.stringify(result),
    });

    briefingsRepo.updateStatus(briefingId, 'posted', new Date().toISOString());

    return { success: true, channel: 'telegram' };
  } catch (err) {
    postsRepo.create({
      briefing_id: briefingId,
      channel: 'telegram',
      status: 'failed',
      response: err.message,
    });
    throw err;
  }
}

module.exports = { postToTelegram };
