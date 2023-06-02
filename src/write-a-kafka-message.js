const { writeStream } = require('./kafka');

function main() {
  const queuedSuccess = writeStream.write(
    Buffer.from(`New message ${new Date().toISOString()}`),
  );

  if (queuedSuccess) {
    console.log('We queued our message!');
  } else {
    // Note that this only tells us if the stream's queue is full,
    // it does NOT tell us if the message got to Kafka!  See below...
    console.log('Too many messages in our queue already');
  }

  writeStream.on('close', () => {
    console.log('Write stream closed');
  });

  writeStream.on('drain', () => {
    console.log('Write stream closed');
  });

  // process.exit(0);
}

main();
