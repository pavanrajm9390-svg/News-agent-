const cron = require('node-cron');
const { runFullPipeline } = require('../agents/runner');

function startScheduler() {
  const schedule = process.env.CRON_SCHEDULE || '0 3 * * *'; // 3 AM daily

  if (!cron.validate(schedule)) {
    console.warn('Invalid CRON_SCHEDULE, scheduler disabled');
    return;
  }

  cron.schedule(schedule, async () => {
    console.log(`[Scheduler] Running overnight briefing at ${new Date().toISOString()}`);
    try {
      await runFullPipeline({ autoPost: true });
    } catch (err) {
      console.error('[Scheduler] Pipeline failed:', err);
    }
  });

  console.log(`⏰ Scheduler started (${schedule})`);
}

module.exports = { startScheduler };
