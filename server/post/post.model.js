const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');

const { Schema } = mongoose;

const TagSchema = new Schema({
  tagName: {
    type: String,
    required: true
  },
  tagType: {
    type: String,
    required: true
  }
});

/**
 * Post Schema
 */
const PostSchema = new Schema({
  postTitle: {
    type: String,
    required: true
  },
  postSlug: {
    type: String,
    required: true,
    unique: true
  },
  postType: {
    type: String,
    default: 'post',
    required: true
  },
  postDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  postContent: String,
  postAuthor: String,
  postImage: String,
  postMedia: String,
  postStatus: String,
  postExpiry: Date,
  postFrequency: String,
  // hasMany
  postTags: [TagSchema]
}, {
  timestamps: true
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
PostSchema.method({
});

/**
 * Statics
 */
PostSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<Post, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such post exists', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<Post[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Post
 */
module.exports = mongoose.model('Post', PostSchema);
