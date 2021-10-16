import * as express from 'express';
import kafkaController from './kafkaController';
const router = express.Router();
//routes from localhost:3001/kafka/...
router.use(
  '/createTable',
  kafkaController.createTable,
  kafkaController.fetchTables
);
router.use('/fetchTopics', kafkaController.fetchTopics);
router.use('/fetchTables', kafkaController.fetchTables);
router.use('/createTable', kafkaController.createTable);
router.use('/refresh', kafkaController.refresh);
export default router;
