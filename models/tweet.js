const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }], 
}, {timestamps: true});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;
