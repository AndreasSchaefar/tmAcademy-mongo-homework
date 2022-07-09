const students = require('../students.json');
let studentsCollection;

async function runStudents(connection) {
  await connection.get().dropCollection('students');
  await connection.get().createCollection('students');

  studentsCollection = connection.get().collection('students');

  await importStudents();
  await findWorstHW(30);
  await findWorstHWBestQuiz(80, 30);
  await findBestQuizExam(80);
  await calcAverageFor('homework');
  await deleteStudents(60, 'homework');
  await markStudents(80, 'quiz');
  await groupStudents();
}

async function importStudents() {
  try {
    await studentsCollection.insertMany(students);
    console.log('Imported all data from students.json into student collection');
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {number} scoreForWorst - a score considered to be the worst among students
 */
async function findWorstHW(scoreForWorst) {
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
          $lt: scoreForWorst,
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
        console.log(
          `Found ${docs.length} students with worst score for homework (less than ${scoreForWorst})`,
        ),
      );
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {number} scoreForBest - a score considered to be the worst among students
 * @param {number} scoreForWorst - a score considered to be the best among students
 */
async function findWorstHWBestQuiz(scoreForBest, scoreForWorst) {
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
                  $lt: scoreForWorst,
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
                  $gte: scoreForBest,
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
          `Found ${docs.length} students with worst score for homework (less than ${scoreForWorst}) and best score for quiz (greater than or equal to ${scoreForBest})`,
        ),
      );
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {number} scoreForBest - a score considered to be the best among students
 */
async function findBestQuizExam(scoreForBest) {
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
          $gte: scoreForBest,
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
          `Found ${docs.length} students with best score for quiz and exam (greater than or equal to ${scoreForBest})`,
        ),
      );
  } catch (err) {
    console.error(err);
  }
}

async function calcAverageFor(type) {
  const pipeline = [
    {
      $unwind: {
        path: '$scores',
      },
    },
    {
      $match: {
        'scores.type': type,
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
        console.log(
          `The average score for ${type} for all students = ${Math.floor(result[0].averageScore)}`,
        );
      });
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {number} score - base score to delete student
 * @param {string} type - homework, quiz or exam
 */
async function deleteStudents(score, type) {
  const query = {scores: {$elemMatch: {type: type, score: {$lte: 60}}}};
  try {
    await studentsCollection
      .deleteMany(query)
      .then(() => console.log(`Deleted students that have ${type} score <= ${score}`));
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {number} score - base score to delete student
 * @param {string} type - homework, quiz or exam
 */
async function markStudents(score, type) {
  const query = {scores: {$elemMatch: {type: type, score: {$gte: score}}}};
  try {
    await studentsCollection
      .updateMany(query, {$set: {mark: true}})
      .then(() => console.log(`Marked students that have ${type} score >= ${score}`));
  } catch (err) {
    console.error(err);
  }
}

async function groupStudents() {
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
      .then(() => console.log('Grouped students by 3 categories'));
  } catch (err) {
    console.error(err);
  }
}

module.exports = runStudents;
