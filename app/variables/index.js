const validDieSizes = () => {
  return [
    ...Array(this.MAX_DIE_SIZE + 1)
      .filter((i) => !(i % 2) // exclude odd numbers
        && i >= this.MIN_DIE_SIZE
        && i <= this.MAX_DIE_SIZE)
      .keys(),
  ];
};

const validHitDieSizes = () => {
  return [
    ...Array(this.MAX_DIE_SIZE + 1)
      .filter((i) => !(i % 2) // exclude odd numbers
        && i >= this.MIN_HIT_DIE_SIZE
        && i <= this.MAX_DIE_SIZE)
      .keys(),
  ];
};

module.exports = {
  MAX_ARRAY_LENGTH: 10,
  MIN_DICE: 0,
  MAX_DICE: 50,
  MIN_HIT_DIE_SIZE: 4,
  MIN_DIE_SIZE: 0,
  MAX_DIE_SIZE: 12,
  MIN_INFORMATION: 4,
  MAX_INFORMATION: 50,
  MIN_DESCRIPTION: 8,
  MAX_DESCRIPTION: 500,
  MAX_LEGENDARY_RESISTANCES: 4,
  MAX_SPELL_SLOTS: 4,
  VALID_DIE_SIZES: validDieSizes(),
  VALID_HIT_DIE_SIZES: validHitDieSizes(),
};
