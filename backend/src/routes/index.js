const express = require('express');
const cron = require('node-cron');
const router = express.Router();

const sourcesRepo = require('../db/repositories/sources');
const briefingsRepo = require('../db/repositories/briefings');
const { runFullPipeline } = require('../agents/runner');
const { postToTelegram } = require('../agents/poster');

// Health
router.get('/health', (req, res) => {
  const expression = process.env.CRON_SCHEDULE || '0 3 * * *';
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    scheduler: {
      expression,
      enabled: cron.validate(expression),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });
});

// Sources
router.get('/sources', (req, res) => {
  res.json(sourcesRepo.getAll());
});

router.post('/sources', (req, res) => {
  const source = sourcesRepo.create(req.body);
  res.status(201).json(source);
});

router.patch('/sources/:id/toggle', (req, res) => {
  const source = sourcesRepo.toggleActive(req.params.id);
  if (!source) return res.status(404).json({ error: 'Not found' });
  res.json(source);
});

router.delete('/sources/:id', (req, res) => {
  sourcesRepo.remove(req.params.id);
  res.status(204).end();
});

// Briefings
router.get('/briefings', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(briefingsRepo.getLatest(limit));
});

router.get('/briefings/:id', (req, res) => {
  const briefing = briefingsRepo.getById(req.params.id);
  if (!briefing) return res.status(404).json({ error: 'Not found' });
  res.json(briefing);
});

// Run pipeline manually
router.post('/run', async (req, res) => {
  try {
    const result = await runFullPipeline(req.body || {});
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Post existing briefing
router.post('/briefings/:id/post', async (req, res) => {
  try {
    const result = await postToTelegram(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
