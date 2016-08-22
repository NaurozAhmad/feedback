'use strict';

import mongoose from 'mongoose';

var KeywordSchema = new mongoose.Schema({
	relevance: String,
	text: String
});

export default mongoose.model('Keyword', KeywordSchema);
