const Kafka = require('node-rdkafka');
const { KAFKA_URL } = require('./constants');

const TOPIC_NAME = 'express-test-app-topic';

const client = Kafka.AdminClient.create({
  'client.id': 'kafka-admin',
  'metadata.broker.list': KAFKA_URL,
});

client.createTopic(
  {
    topic: TOPIC_NAME,
    num_partitions: 1,
    replication_factor: 1,
  },
  function (err) {
    if (err) {
      console.error(err.message);
    }
    // Done!
  },
);

const writeStream = Kafka.Producer.createWriteStream(
  {
    'metadata.broker.list': KAFKA_URL,
  },
  {},
  {
    topic: TOPIC_NAME,
  },
);

// NOTE: MAKE SURE TO LISTEN TO THIS IF YOU WANT THE STREAM TO BE DURABLE
// Otherwise, any error will bubble up as an uncaught exception.
writeStream.on('error', function (err) {
  // Here's where we'll know if something went wrong sending to Kafka
  console.error('Error in our kafka stream');
  console.error(err);
});

const readStream = Kafka.KafkaConsumer.createReadStream(
  {
    'group.id': 'kafka',
    'metadata.broker.list': KAFKA_URL,
  },
  {},
  {
    topics: [TOPIC_NAME],
  },
);

const readStream2 = Kafka.KafkaConsumer.createReadStream(
  {
    'group.id': 'kafka',
    'metadata.broker.list': KAFKA_URL,
  },
  {},
  {
    topics: [TOPIC_NAME],
  },
);

readStream.on('data', function (message) {
  console.log('Got message');
  console.log(message.value.toString());
});

readStream2.on('data', function (message) {
  console.log('Got message 2');
  console.log(message.value.toString());
});

module.exports = {
  writeStream,
};
