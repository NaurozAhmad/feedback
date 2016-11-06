'use strict';

import mongoose from 'mongoose';

var TweetSchema = new mongoose.Schema({
  created_at: String,
  date: {
    type: Date,
    default: new Date()
  },
  id: Number,
  id_str: String,
  text: String,
  source: String,
  truncated: Boolean,
  user: {
    id: Number,
    name: String,
    screen_name: String,
    location: String
  },
  place: {
    place_type: String,
    name: String,
    full_name: String,
    country_code: String,
    country: String
  },
  entities: {
    hashtags: []
  },
  lang: String,
  sentiment: {
    score: Number,
    positive: [String],
    negative: [String]
  }
});

export default mongoose.model('Tweet', TweetSchema);
