const changeCase = require('change-case');
const Post = require('./post.model');
const Tag = require('../tag/tag.model');


/**
 * Pass in tags array object to findorcreate
 */
async function setTags(tags) {
  const tagPromises = [];
  if (tags) {
    tags.map((tag) => {
      const sendTag = tag;
      sendTag.tSlug = changeCase.paramCase(`${tag.tType}-${tag.tName}`);
      const tProm = Tag.findOrCreate(sendTag).then(result => result.doc._id);
      return tagPromises.push(tProm);
    });
  }

  return Promise.all(tagPromises)
    .then(resolved => resolved)
    .catch(err => new Error(err));
}

/**
 * Create new post
 */
async function create(req, res, next) {
  const tags = req.body.pTags;
  const resolvedTags = await setTags(tags);

  if (resolvedTags) {
    const newPost = new Post({
      pTitle: req.body.pTitle,
      pSlug: changeCase.paramCase(`${req.body.pTitle}-${Date.now()}`),
      pType: req.body.pType,
      pDate: req.body.pDate,
      pTags: resolvedTags,
      pText: req.body.pText,
      pAuthor: req.body.pAuthor,
      pImage: req.body.pImage,
      pMedia: req.body.pMedia,
      pStatus: req.body.pStatus,
      pExpiry: req.body.pExpiry,
      pFreq: req.body.pFreq
    });

    newPost.save((err, post) => {
      if (err) {
        return next(err);
      }
      return res.json({ post });
    });
  }
}

/**
 * Get post
 */
function get(req, res, next) {
  Post.findOne({ pSlug: req.params.pSlug })
    .exec((err, post) => {
      if (err) {
        return next(err);
      }
      return res.json({ post });
    });
}

/**
 * Get 50 posts
 */
function getAll(req, res, next) {
  Post.find()
    .limit(50)
    .exec((err, posts) => {
      if (err) {
        return next(err);
      }
      return res.json({ posts });
    });
}

/**
 * Update existing post
 */
async function update(req, res, next) {
  const post = req.body;
  const { pSlug } = req.params;
  const { pTags } = post;

  if (pTags) {
    post.pTags = await setTags(pTags);
  }

  // create a slug from the title to regex
  const slug = changeCase.paramCase(post.pTitle);
  // create a regex from the slug
  const slugString = new RegExp(slug, 'g');
  // compare the passed in title-slug to the existing pSlug
  if (!pSlug.match(slugString)) {
    post.pSlug = `${slug}-${Date.now()}`;
  }

  Post.findOneAndUpdate({ pSlug }, post, { new: true }, ((err, resp) => {
    if (err) {
      return next(err);
    }
    if (!resp) {
      return res.status(200).send({ error: 'No post found.' });
    }
    const show = resp;
    show.pSlug = post.pSlug ? post.pSlug : show.pSlug;
    return res.json({ post: show });
  }));
}

/**
 * Delete post
 */
function remove(req, res, next) {
  const { pSlug } = req.params;

  Post.deleteOne({ pSlug }, ((err, resp) => {
    if (err) {
      return next(err);
    }
    if (resp.n === 0) {
      return res.status(200).send({ error: 'No post found.' });
    }
    if (resp.nModified !== 0) {
      return res.status(200).send({ success: 'Post successfully deleted.' });
    }
    return res.json(resp);
  }));
}

module.exports = {
  get,
  create,
  update,
  getAll,
  remove
};
