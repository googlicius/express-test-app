const { Agenda } = require('@hokify/agenda');
const { DB_CONNECTION_STRING } = require('./constants');
const { MongoClient } = require('mongodb');

async function initAgenda() {
  const mongoClient = await MongoClient.connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const agenda = await new Agenda().mongo(mongoClient.db());

  return agenda;
}

const JOBS = {
  runAfter: {
    cron: '2 minutes',
    name: 'runAfter',
  },
  runEvery: {
    cron: '1 minute',
    name: 'runEvery',
  },
};

// EXAMPLES BELOWS

async function test() {
  const agenda = await initAgenda();

  await agenda.cancel({ name: JOBS.runEvery.name });

  agenda.define(JOBS.runEvery.name, async (job) => {
    console.log(`RUN JOB ${JOBS.runEvery.name} ${JOBS.runEvery.cron}`);

    if (!job.attrs.repeatInterval) {
      job.repeatEvery(JOBS.runEvery.cron);
      job.save();
    }
  });

  await agenda.schedule(JOBS.runAfter.cron, [JOBS.runEvery.name]);

  await agenda.start();
}

test();
