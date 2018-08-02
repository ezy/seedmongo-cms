const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Post Schema
 */
const PostSchema = new Schema({
  pTitle: {
    type: String,
    required: [true, 'pSlug is a required field']
  },
  pSlug: {
    type: String,
    required: [true, 'pSlug is a required field'],
    unique: true
  },
  pType: {
    type: String,
    default: 'post',
    required: [true, 'pType is a required field'],
  },
  pDate: {
    type: Date,
    default: Date.now,
    required: [true, 'pDate is a required field'],
  },
  pText: String,
  pAuthor: String,
  pImage: String,
  pMedia: String,
  pStatus: String,
  pExpiry: Date,
  pFreq: String,
  // hasMany
  pTags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);
