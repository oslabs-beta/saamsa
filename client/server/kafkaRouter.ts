import * as express from 'express';
import kafkaController from './kafkaController';
const router = express.Router();
//routes from localhost:3001/kafka/...
router.use(
  '/createTable', () => console.log('made it here'),
  kafkaController.createTable,
  kafkaController.fetchTables, 
  (req: express.Request, res: express.Response) => {
    res.status(200);
    res.set({
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "https://localhost:3001/",
      "Access-Control-Allow-Methods": "OPTIONS, POST,GET"
  },);
    res.json(res.locals.result);
  }
);
router.use(
  '/updateTables',
  kafkaController.updateTables,
  kafkaController.fetchTopics
);
router.use('/fetchTopics', kafkaController.fetchTopics);
router.use('/fetchTables', kafkaController.fetchTables);
router.use('/createTable', kafkaController.createTable);
router.use('/refresh', kafkaController.refresh);
export default router;
