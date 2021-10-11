import * as express from 'express';
import * as kafka from 'kafkajs';
interface controller {
  refresh: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  getInitial: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
}
//holds messages from kafka consumer, currently globally scoped so refresh route has access to all consumercache
//TODO finagle this so that its not a dirty global
const consumerCache: { value: number; time: number }[] = [
  { value: 0, time: 0 }, //need to store consumer cache indexed as topic to be able to show different topics...
];
for (let i = 0; i < 100; i++) {
  consumerCache.push({ value: 0, time: i + 1 });
}

const controller: controller = {
  getInitial: function (req, res) {
    const { topic, bootstrap } = req.body;
    console.log(topic);
    const instance = new kafka.Kafka({
      // ssl: true,
      clientId: 'testing2',
      brokers: [`${bootstrap}`], //need to change this if you want to get kafka functionality
    });
    //creates new consumer then connects it then runs from last held offset, processes message and saves them in consumer cache
    const consumer = instance.consumer({ groupId: topic });
    consumer
      .connect()
      .then(() => {
        //consumer remembers offset because of consumer groupId, so this fromBeginning not working perfectly, need to manually add offset = 0 if we want to access beginning
        //want to figure out a way to get all topics from localhost
        //maybe connect to broker?? then that will give you topics? can kafkajs describe do that?
        consumer.subscribe({ topic: topic, fromBeginning: true });
      })
      .then(() => {
        consumer.run({
          eachMessage: async (e) => {
            //e has partition on it!!!!!
            // const { message } = e;
            // const splitArr = message!.value!.toString().split('@');
            // if (splitArr.length === 2) {
            //   const value = Number(splitArr[0]);
            //   const time = Number(splitArr[1]) - 163300000;
            //   consumerCache.push({ value, time });
            //   //just for this implementation of line graph, not needed for count-based-figures/maps
            //   consumerCache.sort(
            //     (a: { time: number }, b: { time: number }) => a.time - b.time
            //   );
            // }
            //just looking at partition, we see a small amount of preference for initial 2-3 partitions then it evens out, reassigning partitions  in the middle of a producer stream greatly throws off load balance though
            consumerCache[e.partition + 1].value = Math.max(
              Number(e.message.offset),
              consumerCache[e.partition + 1].value
            );
          },
        });
      })
      .then(() => {
        res.status(200).json(consumerCache);
      });
  },
  refresh: function (req, res) {
    res.status(200).json(consumerCache);
  },
};

export default controller;
