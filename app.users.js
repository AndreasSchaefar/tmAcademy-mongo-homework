const {mapUser, getRandomFirstName} = require('./util');
const connection = require('./config/connection');
let userCollection;

async function runUsers() {
  await connection.connect();
  await connection.get().dropCollection('users');
  await connection.get().createCollection('users');

  userCollection = connection.get().collection('users');

  await createUsersPerDep(2);
  await deleteUser('a');
  await updateFirstNames('b');
  await findAllUsers('c');
  connection.close();
}

async function createUsersPerDep(numPerDep) {
  const deparments = ['a', 'b', 'c'];
  const users = deparments.reduce((acc, dep) => {
    for (let i = 0; i < numPerDep; i++) {
      acc.push(mapUser({department: dep}));
    }
    return acc;
  }, []);
  try {
    await userCollection.insertMany(users);
    console.log('Inserted 2 users per department a, b, c');
  } catch (err) {
    console.error(err);
  }
}

async function deleteUser(department) {
  try {
    await userCollection.deleteOne({
      department: department,
    });
    console.log(`Deleted 1 user from department ${department}`);
  } catch (err) {
    console.error(err);
  }
}

async function updateFirstNames(department) {
  try {
    await userCollection.updateMany({department: department}, [
      {
        $set: {
          firstName: getRandomFirstName(),
        },
      },
    ]);

    console.log(`Updated first names of users from department ${department}`);
  } catch (err) {
    console.error(err);
  }
}

async function findAllUsers(department) {
  try {
    const departmentCUsers = await userCollection.find({department: department}).toArray();
    console.log(`Found ${departmentCUsers.length} users from department ${department}`);
  } catch (err) {
    console.error(err);
  }
}

module.exports = runUsers;
