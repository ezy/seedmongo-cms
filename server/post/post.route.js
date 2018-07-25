const express = require('express');
const expressJwt = require('express-jwt');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const postCtrl = require('./post.controller');
const config = require('../../config/config');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/posts - Get list of posts */
  .get(postCtrl.list)

  /** POST /api/posts - Create new post */
  .post(expressJwt({ secret: config.jwtSecret }), postCtrl.create);

router.route('/:postSlug')
  /** GET /api/posts/:postSlug - Get post */
  .get(postCtrl.get)

  // /** PUT /api/posts/:postId - Update post */
  // .put(validate(paramValidation.updatePost), postCtrl.update)
  //
  // /** DELETE /api/posts/:postId - Delete post */
  // .delete(postCtrl.remove);

/** Load post when API with postSlug route parameter is hit */
router.param('postSlug', postCtrl.load);

module.exports = router;
