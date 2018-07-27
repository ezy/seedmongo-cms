const express = require('express');
const expressJwt = require('express-jwt');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const postCtrl = require('./post.controller');
const config = require('../../config/config');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(postCtrl.getAll)
  .post(expressJwt({ secret: config.jwtSecret }), postCtrl.create);

router.route('/:postSlug')
  .get(postCtrl.get)
  .put(
    validate(paramValidation.updatePost),
    expressJwt({ secret: config.jwtSecret }),
    postCtrl.update
  )
  .delete(expressJwt({ secret: config.jwtSecret }), postCtrl.remove);

module.exports = router;
