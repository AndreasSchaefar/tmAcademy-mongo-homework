const connection = require('./config/connection');

const runUsers = require('./task-modules/app.users');
const runArticles = require('./task-modules/app.articles');
const runStudents = require('./task-modules/app.students');

runAll(connection);

async function runAll(connection) {
  await connection.connect();
  await runUsers(connection);
  await runArticles(connection);
  await runStudents(connection);
  connection.close();
}
