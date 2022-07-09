# mongo-practice/homework

### Installation

1. Clone repo

2. Open project directory

3. run `npm install` command

4. run `node app.js` command

### Data sample

User document sample:

```
{
firstName: 'Andrew',
lastName: 'Rayan',
department: 'a',
createdAt: new Date()
}
```

Article document sample:

```
{
name: 'Mongodb - introduction',
description: 'Mongodb - text',
type: 'a',
tags: []
}
```

### Tasks

#### Users

- [x] Create 2 users per department (a, b, c)

- [x] Delete 1 user from department (a)

- [x] Update firstName for users from department (b)

- [x] Find all users from department (c)

#### Articles

- [x] Create 5 articles per each type (a, b, c)

- [x] Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]

- [x] Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a

- [x] Find all articles that contains tags 'tag2' or 'tag1-a'

- [x] Pull [tag2, tag1-a] from all articles

#### Students Data

- [x] Import all data from students.json into student collection

#### Students Statistic

- [x] Find all students who have the worst score for homework, sort by descent
- [x] Find all students who have the best score for quiz and the worst for homework, sort by ascending
- [x] Find all students who have best scope for quiz and exam
- [x] Calculate the average score for homework for all students
- [x] Delete all students that have homework score <= 60
- [x] Mark students that have quiz score => 80
- [x] Write a query that group students by 3 categories (calculate the average grade for three subjects)
  - a => (between 0 and 40)
  - b => (between 40 and 60)
  - c => (between 60 and 100)
