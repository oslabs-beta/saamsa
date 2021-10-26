import * as express from 'express';
import kafkaController from '../controllers/kafkaController';
const router = express.Router();

/********************************************************************************************************/
router.use('/createTable', kafkaController.createTable, (req, res) => {
  return res.sendStatus(200);
});

router.use('/updateTables', kafkaController.updateTables, (req, res) => {
  return res.sendStatus(200);
 }
 );

/********************************************************************************************************/
router.use('/fetchTopics', kafkaController.fetchTopics, (req, res) => {
  return res.status(200).json([...res.locals.allTopics]);
});

router.use('/fetchTables', kafkaController.fetchTables, (req, res) => {
  return res.status(200).json(res.locals.result);
});

router.use('/fetchConsumers', kafkaController.fetchConsumers, (req, res) => {
  return res.status(200).json([...res.locals.consumerGroups]);
});

/********************************************************************************************************/
router.use('/refresh', kafkaController.refresh);


export default router;
