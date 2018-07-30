const changeCase = require('change-case');
const Post = require('./post.model');

/**
 * Create new post
 */
function create(req, res, next) {
  const newPost = new Post({
    postTitle: req.body.postTitle,
    postSlug: changeCase.paramCase(`${req.body.postTitle}-${Date.now()}`),
    postType: req.body.postType,
    postDate: req.body.postDate,
    postTags: req.body.postTags,
    postContent: req.body.postContent,
    postAuthor: req.body.postAuthor,
    postImage: req.body.postImage,
    postMedia: req.body.postMedia,
    postStatus: req.body.postStatus,
    postExpiry: req.body.postExpiry,
    postFrequency: req.body.postFrequency
  });

  newPost.save((err, post) => {
    if (err) {
      return next(err);
    }
    return res.json({ post });
  });
}

/**
 * Get post
 */
function get(req, res, next) {
  Post.findOne({ postSlug: req.params.postSlug })
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
        next(err);
      }
      return res.json({ posts });
    });
}

/**
 * Update existing post
 */
function update(req, res, next) {
  const post = req.body;
  const { postSlug } = req.params;

  // create a slug from the title to regex
  const slug = changeCase.paramCase(post.postTitle);
  // create a regex from the slug
  const slugString = new RegExp(slug, 'g');
  // compare the passed in title-slug to the existing postSlug
  if (!postSlug.match(slugString)) {
    post.postSlug = `${slug}-${Date.now()}`;
  }

  Post.updateOne({ postSlug }, post, ((err, resp) => {
    if (err) {
      next(err);
    }
    if (resp.n === 0) {
      return res.status(200).send({ error: 'No post found.' });
    }
    if (resp.nModified !== 0) {
      return res.status(200).send({
        success: 'Post successfully updated.',
        postSlug: post.postSlug
      });
    }
    if (resp.nModified === 0) {
      return res.status(200).send({
        success: 'Post found, but no new data was sent.'
      });
    }
    return res.json(resp);
  }));
}

/**
 * Delete post
 */
function remove(req, res, next) {
  const { postSlug } = req.params;

  Post.deleteOne({ postSlug }, ((err, resp) => {
    if (err) {
      next(err);
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
