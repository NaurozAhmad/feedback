/**
 * Tweet model events
 */

'use strict';

import {EventEmitter} from 'events';
import Tweet from './tweet.model';
var TweetEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
TweetEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Tweet.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    TweetEvents.emit(event + ':' + doc._id, doc);
    TweetEvents.emit(event, doc);
  };
}

export default TweetEvents;
