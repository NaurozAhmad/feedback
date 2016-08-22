'use strict';

import mongoose from 'mongoose';

var HashtagSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('Hashtag', HashtagSchema);
