'use strict';

import mongoose from 'mongoose';

var HashtagSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

export default mongoose.model('Hashtag', HashtagSchema);
