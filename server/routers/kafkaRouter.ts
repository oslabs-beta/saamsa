import * as express from 'express';
import kafkaController from '../controllers/kafkaController';
const router = express.Router();
//routes from localhost:3001/kafka/...
router.use(
  '/createTable', 
  kafkaController.createTable,
  // kafkaController.fetchTables, 
  (req: express.Request, res: express.Response) => {
    res.sendStatus(200);
  //   res.set({
  //     "Access-Control-Allow-Headers" : "Content-Type",
  //     "Access-Control-Allow-Origin": "https://localhost:3001/",
  //     "Access-Control-Allow-Methods": "OPTIONS, POST,GET"
  // },);
  //   res.json(res.locals.result);
  }
);

router.use(
  '/updateTables',
  kafkaController.updateTables,
  kafkaController.fetchTopics
);

router.use('/fetchTopics', kafkaController.fetchTopics);


router.use('/fetchTables', kafkaController.fetchTables, 
  (req: express.Request, res: express.Response) => {
    res.status(200);
    res.set({
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "https://localhost:3001/",
      "Access-Control-Allow-Methods": "OPTIONS, POST,GET"
  },);
    res.json(res.locals.result);
});


router.use('/fetchConsumers', kafkaController.fetchConsumers, (req, res) => {
  return res.status(200).json([...res.locals.consumerGroups]);
});

router.use('/refresh', kafkaController.refresh);


export default router;
