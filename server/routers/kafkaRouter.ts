import * as express from 'express';
import kafkaController from '../controllers/kafkaController';
const router = express.Router();
router.use('/createTable', kafkaController.createTable, (req, res) => {
  res.sendStatus(200);
});

router.use(
  '/updateTables',
  kafkaController.updateTables,
  kafkaController.fetchTopics,
  (req, res) => {
    res.status(200).json(res.locals.result);
  }
);

router.use('/fetchTopics', kafkaController.fetchTopics, (req, res) => {
  res.status(200).json(res.locals.result);
});
router.use(
  '/balanceLoad',
  kafkaController.balanceLoad,
  kafkaController.refresh,
  (req, res) => {
    res.status(200).json(res.locals.result);
  }
);

router.use('/fetchTables', kafkaController.fetchTables, (req, res) => {
  res.status(200);
  res.json(res.locals.result);
});

router.use('/fetchConsumers', kafkaController.fetchConsumers, (req, res) => {
  return res.status(200).json([...res.locals.consumerGroups]);
});

router.use('/refresh', kafkaController.refresh, (req, res) => {
  res.status(200).json(res.locals.result);
});

export default router;
