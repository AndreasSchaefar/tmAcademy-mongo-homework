'use strict';

const {mapUser, mapArticle, getRandomFirstName} = require('./util');
const students = require('./students.json');

// db connection and settings
const connection = require('./config/connection');
let userCollection;
let articleCollection;
let studentsCollection;
run();

async function run() {
  await connection.connect();
  await connection.get().dropCollection('users');
  await connection.get().createCollection('users');

  await connection.get().dropCollection('articles');
  await connection.get().createCollection('articles');

  await connection.get().dropCollection('students');
  await connection.get().createCollection('students');

  userCollection = connection.get().collection('users');

  articleCollection = connection.get().collection('articles');

  studentsCollection = connection.get().collection('students');

  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  await example7();
  await example8();
  await example9();
  await example10();
  await example11();
  await example12();
  await example13();
  await example14();
  await example15();
  await example16();
  await example17();
  connection.close();
}

// #### Users

// - Create 2 users per department (a, b, c)
async function example1() {
  const deparments = ['a', 'b', 'c'];
  const users = deparments
    .map(dep => {
      return [mapUser({department: dep}), mapUser({department: dep})];
    })
    .flat();
  try {
    await userCollection.insertMany(users);
    console.log('Inserted 2 users per department a, b, c');
  } catch (err) {
    console.error(err);
  }
}

// - Delete 1 user from department (a)

async function example2() {
  try {
    await userCollection.deleteOne({
      department: 'a',
    });
    console.log('Deleted 1 user from department a');
  } catch (err) {
    console.error(err);
  }
}

// - Update firstName for users from department (b)

async function example3() {
  try {
    await userCollection.updateMany({department: 'a'}, [
      {
        $set: {
          firstName: getRandomFirstName(),
        },
      },
    ]);

    console.log('Updated first names of users from department a');
  } catch (err) {
    console.error(err);
  }
}

// - Find all users from department (c)
async function example4() {
  try {
    const departmentCUsers = await userCollection.find({department: 'c'}).toArray();
    console.log(`Found ${departmentCUsers.length} users from department c`);
  } catch (err) {
    console.error(err);
  }
}

//Create 5 articles per each type (a, b, c)
async function example5() {
  const types = ['a', 'b', 'c'];
  const articles = types
    .map(type => {
      const typed = [];
      for (let i = 0; i < 5; i++) {
        typed.push(mapArticle({type: type}));
      }
      return typed;
    })
    .flat();
  try {
    await articleCollection.insertMany(articles);
    console.log('Inserted 5 articles per type');
  } catch (err) {
    console.error(err);
  }
}
// Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function example6() {
  try {
    await articleCollection.updateMany({type: 'a'}, {$set: {tags: ['tag1-a', 'tag2-a', 'tag3']}});
    console.log('Updated tag list for articles with type a');
  } catch (err) {
    console.error(err);
  }
}
// Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function example7() {
  try {
    await articleCollection.updateMany(
      {type: {$ne: 'a'}},
      {
        $set: {
          tags: ['tag2', 'tag3', 'super'],
        },
      },
    );
    console.log('Updated tag list for articles with types except a');
  } catch (err) {
    console.error(err);
  }
}
// Find all articles that contains tags [tag2, tag1-a]
async function example8() {
  try {
    await articleCollection.find({tags: {$in: ['tag2', 'tag1-a']}}).toArray();
    console.log('Found all articles which contain tags [tag 2, tag 1-a]');
  } catch (err) {
    console.error(err);
  }
}
// Pull [tag2, tag1-a] from all articles
async function example9() {
  try {
    await articleCollection.updateMany({}, {$pull: {tags: {$in: ['tag2', 'tag1-a']}}});
    console.log('Pulled [tag2, tag1-a] from all articles');
  } catch (err) {
    console.error(err);
  }
}
// Import all data from students.json into student collection
async function example10() {
  try {
    await studentsCollection.insertMany(students);
    console.log('Imported all data from students.json into student collection');
  } catch (err) {
    console.error(err);
  }
}
// Find all students who have the worst score for homework, sort by descent
async function example11() {
  const pipeline = [
    {
      $unwind: {
        path: '$scores',
      },
    },
    {
      $match: {
        'scores.type': 'homework',
        'scores.score': {
          $lt: 30,
        },
      },
    },
    {
      $sort: {
        'scores.score': -1,
      },
    },
    {
      $project: {
        name: 1,
        score: '$scores.score',
      },
    },
  ];

  try {
    await studentsCollection
      .aggregate(pipeline)
      .toArray()
      .then(docs =>
        console.log(`Found ${docs.length} students with worst score for homework (less than 30)`),
      );
  } catch (err) {
    console.error(err);
  }
}

async function example12() {
  const pipeline = [
    {
      $unwind: {
        path: '$scores',
      },
    },
    {
      $match: {
        'scores.type': {
          $in: ['homework', 'quiz'],
        },
        $or: [
          {
            $and: [
              {
                'scores.type': {
                  $eq: 'homework',
                },
              },
              {
                'scores.score': {
                  $lt: 30,
                },
              },
            ],
          },
          {
            $and: [
              {
                'scores.type': {
                  $eq: 'quiz',
                },
              },
              {
                'scores.score': {
                  $gte: 80,
                },
              },
            ],
          },
        ],
      },
    },
    {
      $group: {
        _id: '$name',
        scores: {
          $addToSet: {
            type: '$scores.type',
            score: '$scores.score',
          },
        },
      },
    },
    {
      $match: {
        scores: {
          $size: 2,
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        scores: 1,
      },
    },
    {
      $sort: {
        name: -1,
      },
    },
  ];

  try {
    await studentsCollection
      .aggregate(pipeline)
      .toArray()
      .then(docs =>
        console.log(
          `Found ${docs.length} students with worst score for homework (less than 30) and best score for quiz (greater than or equal to 80)`,
        ),
      );
  } catch (err) {
    console.error(err);
  }
}

async function example13() {
  const pipeline = [
    {
      $unwind: {
        path: '$scores',
      },
    },
    {
      $match: {
        'scores.type': {
          $in: ['exam', 'quiz'],
        },
        'scores.score': {
          $gte: 80,
        },
      },
    },
    {
      $group: {
        _id: '$name',
        scores: {
          $addToSet: {
            type: '$scores.type',
            score: '$scores.score',
          },
        },
      },
    },
    {
      $match: {
        scores: {
          $size: 2,
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        scores: 1,
      },
    },
  ];

  try {
    await studentsCollection
      .aggregate(pipeline)
      .toArray()
      .then(docs =>
        console.log(
          `Found ${docs.length} students with best score for quiz and exam (greater than or equal to 80)`,
        ),
      );
  } catch (err) {
    console.error(err);
  }
}

async function example14() {
  const pipeline = [
    {
      $unwind: {
        path: '$scores',
      },
    },
    {
      $match: {
        'scores.type': 'homework',
      },
    },
    {
      $group: {
        _id: null,
        averageScore: {
          $avg: '$scores.score',
        },
      },
    },
    {
      $project: {
        _id: 0,
        averageScore: 1,
      },
    },
  ];

  try {
    await studentsCollection
      .aggregate(pipeline)
      .toArray()
      .then(result => {
        console.log(`The average score for homework for all students = ${result[0].averageScore}`);
      });
  } catch (err) {
    console.error(err);
  }
}

async function example15() {
  const query = {scores: {$elemMatch: {type: 'homework', score: {$lte: 60}}}};
  try {
    await studentsCollection
      .deleteMany(query)
      .then(() => console.log('Deleted students that have homework score <= 60'));
  } catch (err) {
    console.error(err);
  }
}

async function example16() {
  const query = {scores: {$elemMatch: {type: 'quiz', score: {$gte: 60}}}};
  try {
    await studentsCollection
      .updateMany(query, {$set: {mark: true}})
      .then(() => console.log('Marked students that have quiz score >= 80'));
  } catch (err) {
    console.error(err);
  }
}

async function example17() {
  const pipeline = [
    {
      $unwind: {
        path: '$scores',
      },
    },
    {
      $group: {
        _id: '$name',
        averageScore: {
          $avg: '$scores.score',
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        category: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [
                    {
                      $gte: ['$averageScore', 0],
                    },
                    {
                      $lt: ['$averageScore', 40],
                    },
                  ],
                },
                then: 'a',
              },
              {
                case: {
                  $and: [
                    {
                      $gte: ['$averageScore', 40],
                    },
                    {
                      $lt: ['$averageScore', 60],
                    },
                  ],
                },
                then: 'b',
              },
              {
                case: {
                  $and: [
                    {
                      $gte: ['$averageScore', 60],
                    },
                    {
                      $lte: ['$averageScore', 100],
                    },
                  ],
                },
                then: 'c',
              },
            ],
            default: 'No scores found.',
          },
        },
      },
    },
  ];
  try {
    await studentsCollection
      .aggregate(pipeline)
      .toArray()
      .then(() => console.log('Grouped students by categories'));
  } catch (err) {
    console.error(err);
  }
}
