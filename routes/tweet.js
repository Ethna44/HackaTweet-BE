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
    newTweet.save().then(() => {
      res.json({ result: true});
    });
  });
});

router.get("/", (req, res) => {
  Tweet.find({ content: req.body.content }).populate('user').then((data) => {
    res.json({ tweet: data });
  });
});

router.delete("/tweet", (req, res) => {
  Tweet.deleteOne({}).then((data) => {
    
  });
  res.json({});
});

module.exports = router;
