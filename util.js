const faker = require('faker');

const randInt = Math.floor(Math.random() * 10);

const generateUser = ({
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  department,
  createdAt = new Date(),
} = {}) => ({
  firstName,
  lastName,
  department,
  createdAt,
});

const generateArticle = ({
  name = faker.random.word(2),
  description = faker.random.word(randInt),
  type,
  tags = [],
} = {}) => ({
  name,
  description,
  type,
  tags,
});

module.exports = {
  mapUser: generateUser,
  getRandomFirstName: () => faker.name.firstName(),
  mapArticle: generateArticle,
};
