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

router.put("/like/:id", (req, res) => {
  const userId = req.body.userId;
  Tweet.findById(req.params.id).then(tweet => {
    if (!tweet) return res.status(404).json({ result: false, message: "Tweet not found" });

    if (tweet.likes.includes(userId)) {
      tweet.likes.pull(userId); // déjà liké, donc on retire
    } else {
      tweet.likes.push(userId); // sinon on ajoute
    }

    tweet.save().then(updatedTweet => {
      res.json({ result: true, tweet: updatedTweet });
    });
  });
});

router.delete("/:id", (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  console.log('Token reçu :', token);

  User.findOne({ token }).then(user => {
    if (!user) {
      console.log('Utilisateur introuvable avec ce token');
      return res.json({ error: 'User not auth' });
    }
    console.log('Utilisateur trouvé:', user.username);
    Tweet.findById(req.params.id).then(tweet => {
      console.log('Tweet trouvé :', tweet);
      console.log('Auteur du tweet :', tweet.user);
      if (!tweet) {
        console.log('Tweet non trouvé');
        return res.json({ error: 'Tweet not found' });
      }
      console.log('Tweet trouvé. Auteur:', tweet.user);
      if (tweet.user.toString() !== user._id.toString()) {
        console.log('User non autorisé à supprimer ce tweet');
        return res.json({ error: 'This tweet does not belong to you' });
      }
      Tweet.deleteOne({ _id: tweet._id }).then(() => {
        console.log('Tweet supprimé avec succès');
        res.json({ result: true });
      });
    });
  })
});

module.exports = router;