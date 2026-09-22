import {
  EventEmitter
} from 'node:events';

type EmitterEvent = {
  'user:registered': [{ name: string, email: string }],
};

const emitter = new EventEmitter<EmitterEvent>();
export default emitter;