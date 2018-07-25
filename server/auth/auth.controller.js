const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');

// sample user, used for authentication
const user = {
  userEmail: 'user@email.com',
  password: 'seedmong'
};

/**
 * Returns jwt token if valid userEmail and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  // Ideally you'll fetch this from the db
  // Idea here was to show how jwt works with simplicity
  if (req.body.userEmail === user.userEmail && req.body.password === user.password) {
    const token = jwt.sign({
      userEmail: user.userEmail
    }, config.jwtSecret);
    return res.json({
      token,
      userEmail: user.userEmail
    });
  }

  const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
  return next(err);
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

module.exports = { login, getRandomNumber };
