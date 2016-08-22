/**
 * Hashtag model events
 */

'use strict';

import {EventEmitter} from 'events';
import Hashtag from './hashtag.model';
var HashtagEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
HashtagEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Hashtag.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    HashtagEvents.emit(event + ':' + doc._id, doc);
    HashtagEvents.emit(event, doc);
  };
}

export default HashtagEvents;
