const express = require('express');
const router = express.Router();
const {
  getSessions,
  createSession,
  updateSession,
  toggleRevision,
  deleteSession
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSessions)
  .post(createSession);

router.route('/:id')
  .put(updateSession)
  .delete(deleteSession);

router.patch('/:id/revision', toggleRevision);

module.exports = router;
