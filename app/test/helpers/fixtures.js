module.exports = {
  acidSplash: {
    description: 'You hurl a bubble of acid. Choose one creature you can see within range, or choose two creatures you can see within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or take 1d6 acid damage.\n\nAt Higher Levels. This spell\'s damage increases by 1d6 when you reach 5th level (2d6), 11th level (3d6), and 17th level (4d6)',
    damages: JSON.stringify([
      [{
        caster: 0,
        damage: {
          num: 1, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }], [{
        caster: 5,
        damage: {
          num: 2, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }], [{
        caster: 11,
        damage: {
          num: 3, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }], [{
        caster: 17,
        damage: {
          num: 4, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }]]),
  },

  waterSplash: {
    description: 'You hurl a bubble of water. Choose one creature you can see within range, or choose two creatures you can see within range that are within 5 feet of each other. A target must succeed on a Dexterity saving throw or become wet.',
    damages: JSON.stringify([
      [{
        caster: 0,
        damage: {
          num: 0, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }], [{
        caster: 5,
        damage: {
          num: 0, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }], [{
        caster: 11,
        damage: {
          num: 0, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }], [{
        caster: 17,
        damage: {
          num: 0, die: 6, type: 'acid', bonus: 0, effect: '',
        },
        effect: '',
        slot: 0,
      }]]),
  },
};
