var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweet");
const User = require("../models/users");

router.post("/", (req, res) => {

  User.findOne({ token: req.body.token }).then((data) => {
    console.log(data);
    const newTweet = new Tweet({
      content:req.body.content,
      user:data._id
    });
    newTweet.save().then((savedTweet) => {
      Tweet.findById(savedTweet._id)
        .populate('user')
        .then((populatedTweet) => {
          res.json({ result: true, tweet: populatedTweet });
        });
    });
  });
});

router.get("/", (req, res) => {
  Tweet.find()
  .sort({createdAt: -1})
  .populate('user')
  .then((data) => {
    res.json({ tweet: data });
  });
});

router.delete("/tweet", (req, res) => {
  Tweet.deleteOne({_id: req.body.tweetId}).then((data) => {
    
  });
  res.json({});
});

module.exports = router;
