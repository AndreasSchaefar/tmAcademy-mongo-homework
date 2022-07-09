const {mapArticle} = require('./util');
const connection = require('./config/connection');
let articlesCollection;

async function runArticles() {
  await connection.connect();
  await connection.get().dropCollection('articles');
  await connection.get().createCollection('articles');

  articlesCollection = connection.get().collection('articles');

  await createArticlesPerType(5);
  await updateTagsForType('a');
  await addTags('a');
  await findArticlesWithTags(['tag2', 'tag1-a']);
  await pullTags(['tag2', 'tag1-a']);
  connection.close();
}

async function createArticlesPerType(numPerType) {
  const types = ['a', 'b', 'c'];
  const articles = types.reduce((acc, type) => {
    for (let i = 0; i < numPerType; i++) {
      acc.push(mapArticle({type: type}));
    }
    return acc;
  }, []);
  try {
    await articlesCollection.insertMany(articles);
    console.log(`Inserted ${numPerType} articles per type`);
  } catch (err) {
    console.error(err);
  }
}

async function updateTagsForType(type) {
  try {
    await articlesCollection.updateMany({type: type}, {$set: {tags: ['tag1-a', 'tag2-a', 'tag3']}});
    console.log(`Updated tag list for articles with type ${type}`);
  } catch (err) {
    console.error(err);
  }
}

async function addTags(exceptType) {
  try {
    await articlesCollection.updateMany(
      {type: {$ne: exceptType}},
      {
        $set: {
          tags: ['tag2', 'tag3', 'super'],
        },
      },
    );
    console.log(`Updated tag list for articles with types except ${exceptType}`);
  } catch (err) {
    console.error(err);
  }
}

async function findArticlesWithTags(tags) {
  try {
    const articles = await articlesCollection.find({tags: {$in: tags}}).toArray();
    console.log(`Found ${articles.length} articles which contain tags ${tags.join(', ')}`);
  } catch (err) {
    console.error(err);
  }
}

async function pullTags(tags) {
  try {
    await articlesCollection.updateMany({}, {$pull: {tags: {$in: tags}}});
    console.log(`Pulled ${tags.join(', ')} from all articles`);
  } catch (err) {
    console.error(err);
  }
}

module.exports = runArticles;
