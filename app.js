const connection = require('./config/connection');

const runUsers = require('./app.users');
const runArticles = require('./app.articles');
const runStudents = require('./app.students');

runAll(connection);

async function runAll(connection) {
  await connection.connect();
  await runUsers(connection);
  await runArticles(connection);
  await runStudents(connection);
  connection.close();
}
