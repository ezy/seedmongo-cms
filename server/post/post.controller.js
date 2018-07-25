const Post = require('./post.model');

/**
 * Load post and append to req.
 */
function load(req, res, next, slug) {
  Post.find({
    postSlug: slug
  })
    .then((post) => {
      req.post = post;
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get post
 * @returns {Post}
 */
function get(req, res) {
  return res.json(req.post);
}

/**
 * Create new post
 */
function create(req, res, next) {
  const post = new Post({
    postTitle: req.body.postTitle,
    postType: req.body.postType,
    postDate: req.body.postDate,
    postContent: req.body.postContent,
    postAuthor: req.body.postAuthor,
    postImage: req.body.postImage,
    postMedia: req.body.postMedia,
    postStatus: req.body.postStatus,
    postExpiry: req.body.postExpiry,
    postFrequency: req.body.postFrequency
  });

  post.save()
    .then(savedPost => res.json(savedPost))
    .catch(e => next(e));
}

/**
 * Update existing post
 */
function update(req, res, next) {
  const { post } = req;
  post.postTitle = req.body.postTitle;
  post.postType = req.body.postType;
  post.postDate = req.body.postDate;
  post.postContent = req.body.postContent;
  post.postAuthor = req.body.postAuthor;
  post.postImage = req.body.postImage;
  post.postMedia = req.body.postMedia;
  post.postStatus = req.body.postStatus;
  post.postExpiry = req.body.postExpiry;
  post.postFrequency = req.body.postFrequency;

  post.save()
    .then(newPost => res.json({ post: newPost }))
    .catch(e => next(e));
}

/**
 * Get post list.
 * @property {number} req.query.skip - Number of posts to be skipped.
 * @property {number} req.query.limit - Limit number of posts to be returned.
 * @returns {Post[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Post.list({ limit, skip })
    .then(posts => res.json(posts))
    .catch(e => next(e));
}

/**
 * Delete post.
 * @returns {Post}
 */
function remove(req, res, next) {
  const { post } = req;
  post.remove()
    .then(deletedPost => res.json(deletedPost))
    .catch(e => next(e));
}

module.exports = {
  load,
  get,
  create,
  update,
  list,
  remove
};
