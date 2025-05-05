var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweet");
const User = require("../models/users");

router.post("/", (req, res) => {
  User.findOne({ token: req.body.token }).then((data) => {
    console.log(data);
    const newTweet = new Tweet({
      content: req.body.content,
      user: data._id,
    });
    newTweet.save().then((savedTweet) => {
      Tweet.findById(savedTweet._id)
        .populate("user")
        .then((populatedTweet) => {
          res.json({ result: true, tweet: populatedTweet });
        });
    });
  });
});

router.get("/:token?", (req, res) => {
  console.log(req.params.token);
  User.findOne({ token: req.params.token })
    .lean()
    .then((user) => {
      Tweet.find()
        .sort({ createdAt: -1 })
        .populate("user")
        .lean()
        .then((data) => {
          if (data.length === 0) {
            res.json({ tweet: [] });
          } else {
            res.json({
              tweet: data.map((e) => {
                return {
                  ...e,
                  hasLiked: user
                    ? e.likes.some((f) => f.toString() === user?._id.toString())
                    : false,
                };
              }),
            });
          }
        });
    });
});

router.put("/like/:id", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.json({ result: false, message: "Not allowed" });
  }

  User.findOne({ token })
    .lean()
    .then((user) => {
      if (!user) {
        return res.json({ result: false, message: "User not found" });
      }

      Tweet.findById(req.params.id)
        .lean()
        .then((tweet) => {
          if (!tweet) {
            return res.json({ result: false, message: "Tweet not found" });
          }

          const likes = tweet.likes.map((userId) => userId.toString());

          if (likes.includes(user._id.toString())) {
            Tweet.updateOne(
              { _id: tweet._id },
              { $pull: { likes: user._id } }
            ).then(() => {
              Tweet.findById(tweet._id).then(() =>
                res.json({ result: true, message: "Like supprimé !" })
              );
            });
          } else {
            Tweet.updateOne(
              { _id: tweet._id },
              { $push: { likes: user._id } }
            ).then(() => {
              Tweet.findById(tweet._id).then(() =>
                res.json({ result: true, message: "Like ajouté !" })
              );
            });
          }
        });
    });
});

router.delete("/:id", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  console.log("Token reçu :", token);

  User.findOne({ token }).then((user) => {
    if (!user) {
      console.log("Utilisateur introuvable avec ce token");
      return res.json({ error: "User not auth" });
    }
    console.log("Utilisateur trouvé:", user.username);
    Tweet.findById(req.params.id).then((tweet) => {
      console.log("Tweet trouvé :", tweet);
      console.log("Auteur du tweet :", tweet.user);
      if (!tweet) {
        console.log("Tweet non trouvé");
        return res.json({ error: "Tweet not found" });
      }
      console.log("Tweet trouvé. Auteur:", tweet.user);
      if (tweet.user.toString() !== user._id.toString()) {
        console.log("User non autorisé à supprimer ce tweet");
        return res.json({ error: "This tweet does not belong to you" });
      }
      Tweet.deleteOne({ _id: tweet._id }).then(() => {
        console.log("Tweet supprimé avec succès");
        res.json({ result: true });
      });
    });
  });
});

module.exports = router;
