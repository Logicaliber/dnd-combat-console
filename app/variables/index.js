const MAX_ARRAY_LENGTH = 10;
const MIN_DICE = 0;
const MAX_DICE = 50;
const MIN_HIT_DIE_SIZE = 4;
const MIN_DIE_SIZE = 0;
const MAX_DIE_SIZE = 12;
const MIN_INFORMATION = 4;
const MAX_INFORMATION = 50;
const MIN_DESCRIPTION = 8;
const MAX_DESCRIPTION = 500;
const MAX_LEGENDARY_RESISTANCES = 4;
const MAX_SPELL_SLOTS = 4;
const VALID_DIE_SIZES = [
  ...Array(MAX_DIE_SIZE + 1)
    .filter((i) => !(i % 2) // exclude odd numbers
      && i >= MIN_DIE_SIZE
      && i <= MAX_DIE_SIZE)
    .keys(),
];
const VALID_HIT_DIE_SIZES = [
  ...Array(MAX_DIE_SIZE + 1)
    .filter((i) => !(i % 2) // exclude odd numbers
      && i >= MIN_HIT_DIE_SIZE
      && i <= MAX_DIE_SIZE)
    .keys(),
];

module.exports = {
  MAX_ARRAY_LENGTH,
  MIN_DICE,
  MAX_DICE,
  MIN_HIT_DIE_SIZE,
  MIN_DIE_SIZE,
  MAX_DIE_SIZE,
  MIN_INFORMATION,
  MAX_INFORMATION,
  MIN_DESCRIPTION,
  MAX_DESCRIPTION,
  MAX_LEGENDARY_RESISTANCES,
  MAX_SPELL_SLOTS,
  VALID_DIE_SIZES,
  VALID_HIT_DIE_SIZES,
};
