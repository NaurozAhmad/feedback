'use strict';

import mongoose from 'mongoose';

var HashtagSchema = new mongoose.Schema({
  name: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

export default mongoose.model('Hashtag', HashtagSchema);
