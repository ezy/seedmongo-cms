const changeCase = require('change-case');
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
 * Create new post
 */
function create(req, res, next) {
  const post = new Post({
    postTitle: req.body.postTitle,
    postSlug: changeCase.paramCase(`${req.body.postTitle}-${Date.now()}`),
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
 * Get post
 */
function get(req, res) {
  return res.json({ post: req.post });
}

/**
 * Get 50 posts
 */
function getAll(req, res, next) {
  Post.find()
    .limit(50)
    .then(posts => res.json({ posts }))
    .catch(e => next(e));
}

/**
 * Update existing post
 */
function update(req, res, next) {
  const post = req.post[0];
  const { postSlug } = req.params;

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

  const slug = changeCase.paramCase(post.postTitle);
  if (!post.postSlug.includes(slug)) {
    post.postSlug = `${slug}-${Date.now()}`;
  }

  Post.updateOne({ postSlug }, post, ((err, resp) => {
    if (err) {
      next(err);
    }
    const output = resp;
    output.postSlug = post.postSlug;
    return res.json(output);
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
    return res.json(resp);
  }));
}

module.exports = {
  load,
  get,
  create,
  update,
  getAll,
  remove
};
