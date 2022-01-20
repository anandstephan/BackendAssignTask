const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");

//For Creating the Post of the User
router.post("/posts", requireLogin, (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  req.user.password = undefined;
  req.user.__v = undefined;
  const post = new Post({
    title,
    description,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      result.likes = undefined;
      result.postedBy = undefined;
      result.comments = undefined;
      result.__v = undefined;
      res.json({ post: result });
      // console.log(req.user)
    })
    .catch((err) => {
      console.log(err);
    });
});

//For Deleting the Post of the User
router.delete("/posts/:postId", requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id name")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            // console.log(result)
            res.json({ result });
          })
          .catch((error) => console.log(error));
      }
    });
});

//For Like the Post of the User
router.post("/like/:postId", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.params.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      // console.log(result)
      result.comments = undefined;
      result.__v = undefined;
      return res.json({ result });
    }
  });
});

//For Unlike the Post of the User
router.post("/unlike/:postId", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.params.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      // console.log(result)
      result.comments = undefined;
      result.__v = undefined;
      return res.json({ result });
    }
  });
});

//For Comment on the Post of the User
router.post("/comment/:postId", requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.params.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      result.created_at = undefined;
      result._id = undefined;
      result.title = undefined;
      result.description = undefined;
      result.postedBy = undefined;
      result.likes = undefined;
      result.__v = undefined;
      let newresult = [];
      result.comments.map((res) => newresult.push(res._id));
      return res.json(newresult);
    }
  });
});

//For getting a Single Post
router.get("/posts/:postId", requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .then((posts) => {
      posts.created_at = undefined;
      posts_id = undefined;
      posts.title = undefined;
      posts.description = undefined;
      posts.postedBy = undefined;
      posts.__v = undefined;
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

//For getting all the Posts
router.get("/all_posts", requireLogin, (req, res) => {
  Post.find()
    .sort({ created_at: "Asc" })
    .then((posts) => {
      posts.__v = undefined;
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

//For getting the Subpost
router.get("/getsubpost", requireLogin, (req, res) => {
  Post.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

//For getting the post of a current user
router.post("/mypost", requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((mypost) => {
      // console.log(mypost)
      res.json({ mypost });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
