const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const { Schema } = mongoose;

const TagSchema = new Schema({
  tName: {
    type: String,
    required: [true, 'tName is a required field'],
  },
  tType: {
    type: String,
    required: [true, 'tType is a required field'],
  },
  tSlug: {
    type: String,
    required: [true, 'tSlug is a required field'],
    unique: true
  }
});

TagSchema.plugin(findOrCreate);

module.exports = mongoose.model('Tag', TagSchema);
