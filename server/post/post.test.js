const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const faker = require('faker');
const changeCase = require('change-case');
const app = require('../../index');

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('[POST] /api/posts Testing', () => {
  let resPostSlug = '';
  let resToken = '';
  const title = faker.lorem.sentence(5);
  const postKeys = [
    '_id',
    'pTitle',
    'pSlug',
    'pType',
    'pDate',
    'pText',
    'pAuthor',
    'pImage',
    'pMedia',
    'pStatus',
    'pExpiry',
    'pFreq',
    'pTags',
    'createdAt',
    'updatedAt',
    '__v'
  ];
  const postRequest = {
    pTitle: title,
    pType: faker.random.arrayElement(['post', 'page']),
    pDate: new Date(),
    pText: faker.lorem.sentences(3, 3),
    pAuthor: faker.name.findName(),
    pImage: faker.image.imageUrl(),
    pMedia: faker.image.imageUrl(),
    pStatus: faker.random.arrayElement(['published', 'draft']),
    pExpiry: faker.date.future(),
    pFreq: faker.random.arrayElement([null, 'day', 'week', 'fortnight', 'month']),
    pTags: [{
      tType: 'tag',
      tName: 'fws'
    }, {
      tType: 'tag',
      tName: 'Ho'
    }, {
      tType: 'category',
      tName: 'Ho'
    }]
  };
  const validUserCredentials = {
    userEmail: 'user@email.com',
    password: 'seedmong'
  };

  it('should be able to set login token', (done) => {
    request(app)
      .post('/api/auth/login')
      .send(validUserCredentials)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK)
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        resToken = res.body.token;
        done();
      });
  });

  it('should be able to create a post if logged in', (done) => {
    request(app)
      .post('/api/posts')
      .send(postRequest)
      .set('Authorization', `Bearer ${resToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK)
      .end((err, res) => {
        resPostSlug = res.body.post.pSlug;
        expect(res.body.post).to.be.an('object');
        expect(res.body.post).to.have.all.keys(postKeys);
        done();
      });
  });

  it('should be able to update a post if logged in', (done) => {
    const updatedPost = postRequest;
    const newTitle = faker.lorem.sentence(1);
    updatedPost.pTitle = newTitle;
    request(app)
      .put(`/api/posts/${resPostSlug}`)
      .send(updatedPost)
      .set('Authorization', `Bearer ${resToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK)
      .end((err, res) => {
        resPostSlug = res.body.post.pSlug;
        expect(res.body.post).to.be.an('object');
        expect(res.body.post).to.have.all.keys(postKeys);
        expect(res.body.post.pSlug).to.include(changeCase.paramCase(newTitle));
        done();
      });
  });

  it('update should error with wrong post slug', (done) => {
    request(app)
      .put('/api/posts/no-post-here')
      .send(postRequest)
      .set('Authorization', `Bearer ${resToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK)
      .end((err, res) => {
        expect(res.body).to.have.property('error');
        expect(res.body).to.have.deep.property('error', 'No post found.');
        done();
      });
  });

  it('should be able to get a list of all seeded posts', (done) => {
    request(app)
      .get('/api/posts')
      .expect(httpStatus.OK)
      .end((err, res) => {
        expect(res.body.posts).to.be.an('array');
        expect(res.body.posts[0]).to.have.all.keys(postKeys);
        // set post id for next test
        resPostSlug = res.body.posts[0].pSlug;
        done();
      });
  });

  it('should be able to get a single post', (done) => {
    request(app)
      .get(`/api/posts/${resPostSlug}`)
      .expect(httpStatus.OK)
      .end((err, res) => {
        expect(res.body.post).to.be.an('object');
        expect(res.body.post).to.have.all.keys(postKeys);
        done();
      });
  });

  it('should error with wrong post slug', (done) => {
    request(app)
      .get('/api/posts/no-post-here')
      .expect(400)
      .end((err, res) => {
        expect(res.body).to.have.property('post');
        expect(res.body).to.have.deep.property('post', null);
        done();
      });
  });

  it('it should reject post with no title', (done) => {
    request(app)
      .post('/api/posts')
      .send({})
      .set('Authorization', `Bearer ${resToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.deep.property('message', 'Internal Server Error');
        done();
      });
  });

  it('it should reject post with no term name', (done) => {
    const noTermName = postRequest;
    noTermName.pTags = [{
      tType: 'tag',
      tName: 'fws'
    }, {
      tType: 'tag'
    }, {
      tType: 'category',
      tName: 'Ho'
    }];
    request(app)
      .post('/api/posts')
      .send(noTermName)
      .set('Authorization', `Bearer ${resToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND)
      .end((err, res) => {
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.deep.property('message', 'Internal Server Error');
        done();
      });
  });

  it('should be able to delete a post if logged in', (done) => {
    request(app)
      .delete(`/api/posts/${resPostSlug}`)
      .set('Authorization', `Bearer ${resToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK)
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('success');
        expect(res.body).to.have.deep.property('success', 'Post successfully deleted.');
        done();
      });
  });

  it('should error with wrong delete post slug', (done) => {
    request(app)
      .delete(`/api/posts/${resPostSlug}`)
      .set('Authorization', `Bearer ${resToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK)
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        expect(res.body).to.have.deep.property('error', 'No post found.');
        done();
      });
  });
});
