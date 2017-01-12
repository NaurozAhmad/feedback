'use strict';

import mongoose from 'mongoose';

var FeedbackSchema = new mongoose.Schema({
  text: String,
  latitude: String,
  longitude: String,
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hashtag'
  },
  submitted: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sentiment: {
    score: Number,
    probability: Number,
  }
});

export default mongoose.model('Feedback', FeedbackSchema);
