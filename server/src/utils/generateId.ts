import {
  v4 as uuidV4
} from 'uuid';

export default function generateId(): string {
  return uuidV4();
};