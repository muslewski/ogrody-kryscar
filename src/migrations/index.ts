import * as migration_20260604_121046 from './20260604_121046';

export const migrations = [
  {
    up: migration_20260604_121046.up,
    down: migration_20260604_121046.down,
    name: '20260604_121046'
  },
];
