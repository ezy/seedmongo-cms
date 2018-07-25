const Joi = require('joi');

module.exports = {
  // POST /api/users
  createUser: {
    body: {
      userEmail: Joi.string().required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      userEmail: Joi.string().required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      userEmail: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
