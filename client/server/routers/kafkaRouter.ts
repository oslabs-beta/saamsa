import * as express from 'express';
import kafkaController from '../controllers/kafkaController';
const router = express.Router();
//routes from localhost:3001/kafka/...
router.use(
  '/createTable',
  kafkaController.createTable,
  kafkaController.fetchTables
);
router.use(
  '/updateTables',
  kafkaController.updateTables,
  kafkaController.fetchTopics
);
router.use('/fetchTopics', kafkaController.fetchTopics);
router.use('/fetchTables', kafkaController.fetchTables);
router.use('/createTable', kafkaController.createTable);
router.use('/fetchConsumers', kafkaController.fetchConsumers, (req, res) => {
  return res.status(200).json([...res.locals.consumerGroups]);
});
router.use('/refresh', kafkaController.refresh);
export default router;
