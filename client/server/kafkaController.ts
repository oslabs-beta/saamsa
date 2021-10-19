import * as express from 'express';
import * as kafka from 'kafkajs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
interface controller {
  refresh: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  fetchTables: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  createTable: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  fetchTopics: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  fetchConsumers: (   
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  updateTables: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
}
const controller: controller = {
  updateTables: function (req, res, next) {
    const { bootstrap } = req.body;
    const bootstrapSanitized = bootstrap.replace(':', '_');
    const instance = new kafka.Kafka({
      clientId: 'testing2',
      brokers: [`${bootstrap}`],
    });
    const admin = instance.admin();
    admin.connect();
    admin.listTopics().then((data) => {
      open({ filename: '/tmp/database.db', driver: sqlite3.Database }).then(
        (db) => {
          data.forEach((el) => {
            db.all(
              `SELECT topic FROM ${bootstrapSanitized} WHERE topic='${el}';`
            )
              .then((result) => {
                if (result.length === 0) {
                  admin.fetchTopicOffsets(el).then((response) => {
                    let colString = 'topic, ';
                    let valString = `'${el}', `;
                    response.forEach((partition) => {
                      valString += `${partition.offset},`;
                      colString += `partition_${partition.partition},`;
                    });
                    valString = valString.slice(0, valString.length - 1);
                    colString = colString.slice(0, colString.length - 1);
                    try {
                      console.log('hererafkjalksoddsia08j');
                      db.exec(
                        `INSERT INTO ${bootstrapSanitized} (${colString}) VALUES (${valString});`
                      ).catch(() => {
                        console.log('a testt');
                        db.exec(`DROP TABLE ${bootstrapSanitized}`).then(() => {
                          return res.redirect(
                            307,
                            'http://localhost:3001/kafka/createTable'
                          );
                        });
                      });
                    } catch (error) {
                      return next(error);
                    }
                  });
                }
              })
              .catch(() => {
                console.log('a testt');
                return res.redirect(
                  307,
                  'http://localhost:3001/kafka/createTable'
                );
              });
          });
        }
      );
    });
    admin.disconnect();
    next();
  },
  //fetches all topics for a given broker (taken from frontend broker selection)
  fetchTopics: function (req, res, next) {

    const { bootstrap } = req.body;
    console.log('Bootstrap in FETCH TOPICS', bootstrap);
    //cleaning it up for SQL, which can't have colons
    const bootstrapSanitized = bootstrap.replace(':', '_');
    // console.log('Bootstrap in FETCH TOPICS after sanitization', bootstrapSanitized);
    //opening connection to sqlite db
    try {
      open({
        filename: '/tmp/database.db',
        driver: sqlite3.Database,
      }).then((db) =>
        db
          .all(`SELECT topic FROM ${bootstrapSanitized}`)
          .then((result) => res.json(result))
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  //fetches all tables currently in database, each table corresponds to a broker, each entry in that broker-table is a topic and it's partitions
  fetchTables: function (req, res, next) {
    try {
      //opening db then selecting all table names from master metadata table
      open({ filename: '/tmp/database.db', driver: sqlite3.Database }).then(
        (db) => {
          db.all(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
          ).then((result) => {
            res.json(result);
          });
        }
      );
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  //after verifying broker exists using kafkajs admin, adds each topic and it's partitions and respective offsets to sqlite
  createTable: async function (req, res, next) {
    console.log('in create table');
    try {
      const { bootstrap } = req.body;
      //if there is no server given, we send an error page
      if (!bootstrap.length) res.sendStatus(403);
      //sanitizing for sql
      const bootstrapSanitized = bootstrap.replace(':', '_');
      const instance = new kafka.Kafka({
        clientId: 'testing2',
        brokers: [`${bootstrap}`], //must be unsanitized form
      });
      const admin = instance.admin();
      admin.connect();
      //fetching topics for that broker
      const results = await admin.listTopics();
      //creating an empty object that holds offsets for each topic
      const offsets: {
        [key: string]: (kafka.SeekEntry & { high: string; low: string })[];
      } = {};
      //fetching all offsets for each partition and saving that in the offsets object
      Promise.all(
        results.map((el) => {
          return admin
            .fetchTopicOffsets(el)
            .then((result) => (offsets[el] = result));
        })
      ).then(() => {
        //getting max number of partitions for entire broker (must have for SQL, as table columns cannot be altered after creating)
        //so each topic will have the same number of partitions in SQL db, but null values in sqldb indicate the partition does not exist on that topic in kafka
        // topic1 w/ 3 partitions (max for broker) -> {topic: topic1, partition_0: 5, partition_1: 2, partition_3: 0}
        // topic2 w/ 1 partition (< max for broker) -> {topic: topic2, partition_0: 10, partition_1: null, partition_3: null}
        let maxPartitions = 0;
        Object.keys(offsets).forEach((el) => {
          offsets[el].forEach((el2) => {
            if (el2.partition > maxPartitions) maxPartitions = el2.partition;
          });
        });
        //creating partition string for SQL query, creates partition_X column in db
        let partitionString = '';
        for (let i = 0; i <= maxPartitions; i++) {
          if (i < maxPartitions) partitionString += `partition_${i} int,`;
          //below is for last value, which !!!cannot!!! have comma after it
          else partitionString += `partition_${i} int`;
        }
        open({ filename: '/tmp/database.db', driver: sqlite3.Database })
          .then((db) => {
            db.exec(
              `CREATE TABLE ${bootstrapSanitized} (topic varchar(255), ${partitionString});`
            );
            return db;
          })
          .then((db) => {
            Object.keys(offsets).forEach((el) => {
              //below is for generic column names e.g. topic, partition_0, partition_1...
              let colString = 'topic, ';
              //below is the actual values for those columns above(!!topic must be in quotes!!) e.g. 'intial_report', 10, 7
              let valueString = `'${el}', `;
              offsets[el].forEach((el2) => {
                valueString += `'${el2.offset}',`;
                colString += `partition_${el2.partition},`;
              });
              valueString = valueString.slice(0, valueString.length - 1);
              colString = colString.slice(0, colString.length - 1);
              db.exec(
                `INSERT INTO ${bootstrapSanitized} (${colString}) VALUES (${valueString});`
              );
            });
          })
          .then(() => {
            admin.disconnect();
            next();
          });
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  //grabs data from kafka admin for a specific topic, then updates it in sqldb, then reads sqldb and sends it to frontend
  refresh: function (req, res, next) {
    try {
      const { bootstrap, topic } = req.body;
      const bootstrapSanitized = bootstrap.replace(':', '_');
      const instance = new kafka.Kafka({
        brokers: [`${bootstrap}`],
        clientId: 'testing2', //hardcoded, probably should use username from state
      });
      const admin = instance.admin();
      //below is query string used to update database, does not need to be ordered e.g. (partition_43 = 0, partition_0 = 17...)
      let setString = '';
      admin.connect();
      admin
        .fetchTopicOffsets(topic)
        .then((result) => {
          result.forEach((el) => {
            //adding each partitions value to the set string
            setString += `partition_${el.partition} = ${el.offset},`;
          });
        })
        .then(() => {
          //!!important!! slicing off last comma, which will throw a SQL syntax error
          setString = setString.slice(0, setString.length - 1);
          open({
            filename: '/tmp/database.db',
            driver: sqlite3.Database,
          })
            .then((db) => {
              db.exec(
                `UPDATE ${bootstrapSanitized} SET ${setString} WHERE topic='${topic}';`
              );
              return db;
            })
            //here we grab topic data from sqldb (after updated)
            .then((db) => {
              db.all(
                `SELECT * FROM ${bootstrapSanitized} WHERE topic='${topic}'`
              ).then((result) => {
                //new arr which holds the correctly formated data for d3
                const arr: { time: number; value: number }[] = [];
                Object.keys(result[0]).forEach((el) => {
                  if (el !== 'topic') {
                    arr.push({
                      //slicing off first part of colname and turning into number (for d3) (partition_1 -> 1)
                      time: Number(el.slice(10)),
                      value: result[0][el],
                    });
                  }
                });
                res.json(arr);
              });
            });
        });
    } catch (error) {
      console.log('alsfkjalskfjalsfkj');
      console.log(error);
      next(error);
    }
  },
  fetchConsumers: async (req, res, next)  => {
    const {bootstrap} = req.body;

    console.log('this is bootstrap in fetch consumers', bootstrap);
    //if there is no server, send an error page
    if(!bootstrap.length) res.sendStatus(403);

    //create a new instance of kafka
    const instance = new kafka.Kafka({
      brokers: [`${bootstrap}`],
    });

    //create a new admin instance with the kafka instance
    const admin = instance.admin();
    admin.connect();

    console.log("here..")
    //fetch groups for that broker
    const results = await admin.listGroups();
    console.log("results: ", results);

    //fetch consumer list with the kafka broker given

  },
};

export default controller;
