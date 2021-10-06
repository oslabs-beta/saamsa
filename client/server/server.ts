import express from 'express';
import * as kafka from 'kafkajs';
const app = express();
const instance = new kafka.Kafka({
  clientId: 'testing2',
  brokers: ['adams-mbp:9092'],
});
const consumerCache: { value: number; time: number }[] = [];
const consumer = instance.consumer({ groupId: 'consumerTest' });
consumer
  .connect()
  .then(() => {
    consumer.subscribe({ topic: 'testing-topic', fromBeginning: true });
  })
  .then(() => {
    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const splitArr = message!.value!.toString().split('@');
        if (splitArr.length === 2) {
          const value = Number(splitArr[0]);
          const time = (Number(splitArr[1]) - 1633400000000) / 24 / 60;
          consumerCache.push({ value, time });
        }
      },
    });
  })
  .then(() => {
    consumer.on(consumer.events.REQUEST_QUEUE_SIZE, (e) =>
      console.log('anything')
    );
  });
app.use(
  '/kafka',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json(consumerCache);
  }
);
app.listen(3000, () => console.log('listening on port 3000 :)'));
