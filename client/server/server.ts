import express from 'express';
import * as kafka from 'kafkajs';
const app = express();

app.use(
  '/kafka',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const instance = new kafka.Kafka({
      clientId: 'testing :)',
      brokers: ['adams-mbp:9092'],
    });
    const consumer = instance.consumer({ groupId: 'consumerTest' });
    consumer
      .connect()
      .then(() => {
        consumer.subscribe({ topic: 'testing-topic', fromBeginning: true });
      })
      .then(() => {
        consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            console.log({
              value: message!.value!.toString(),
            });
          },
        });
      });
    res.sendStatus(200);
  }
);
app.listen(3000, () => console.log('listening on port 3000 :)'));
