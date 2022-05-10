const {
  ranges, // Normal and Long Ranges
  wd, // Weapon Damages
  wp, // Weapon Properties
  withTs, // With Timestamps
} = require('./helpers/seederHelpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const weapons = withTs([{
      name: 'club',
      damages: wd.d4.bludgeoning,
      properties: wp.light,
    }, {
      name: 'dagger',
      damages: wd.d4.piercing,
      properties: wp.finesseLightThrown,
      ...ranges.twentySixty,
    }, {
      name: 'greatclub',
      damages: wd.d8.bludgeoning,
      properties: wp.twoHanded,
    }, {
      name: 'handaxe',
      damages: wd.d6.slashing,
      properties: wp.finesseLightThrown,
      ...ranges.twentySixty,
    }, {
      name: 'javelin',
      damages: wd.d6.piercing,
      properties: wp.thrown,
      ...ranges.thirtyOneTwenty,
    }, {
      name: 'light hammer',
      damages: wd.d4.bludgeoning,
      properties: wp.lightThrown,
      ...ranges.twentySixty,
    }, {
      name: 'mace',
      damages: wd.d6.bludgeoning,
      properties: wp.none,
    }, {
      name: 'quarterstaff 1h',
      damages: wd.d6.bludgeoning,
      properties: wp.versatile,
    }, {
      name: 'quarterstaff 2h',
      damages: wd.d8.bludgeoning,
      properties: wp.versatileTwoHanded,
    }, {
      damages: wd.d6.slashing,
      name: 'sickle',
      properties: wp.light,
    }, {
      name: 'spear 1h',
      damages: wd.d6.piercing,
      properties: wp.thrownVersatile,
      ...ranges.twentySixty,
    }, {
      name: 'spear 2h',
      damages: wd.d6.piercing,
      properties: wp.thrownVersatileTwoHanded,
      ...ranges.twentySixty,
    }, {
      name: 'light crossbow',
      damages: wd.d8.piercing,
      properties: wp.ammunitionHeavyLoadingTwoHanded,
      ...ranges.eightyThreeTwenty,
    }, {
      name: 'dart',
      damages: wd.d4.piercing,
      properties: wp.finesseThrown,
      ...ranges.twentySixty,
    }, {
      name: 'shortbow',
      damages: wd.d6.piercing,
      properties: wp.ammunitionTwoHanded,
      ...ranges.eightyThreeTwenty,
    }, {
      name: 'sling',
      damages: wd.d4.bludgeoning,
      properties: wp.ammunition,
      ...ranges.thirtyOneTwenty,
    }, {
      name: 'battleaxe 1h',
      damages: wd.d8.slashing,
      properties: wp.versatile,
    }, {
      name: 'battleaxe 2h',
      damages: wd.d10.slashing,
      properties: wp.versatileTwoHanded,
    }, {
      name: 'flail',
      damages: wd.d8.bludgeoning,
      properties: wp.none,
    }, {
      name: 'glaive',
      damages: wd.d10.slashing,
      properties: wp.heavyReachTwoHanded,
    }, {
      name: 'greataxe',
      damages: wd.d12.slashing,
      properties: wp.heavyTwoHanded,
    }, {
      name: 'greatsword',
      damages: wd.twoD6.slashing,
      properties: wp.heavyTwoHanded,
    }, {
      name: 'halberd',
      damages: wd.d10.slashing,
      properties: wp.heavyReachTwoHanded,
    }, {
      name: 'lance',
      damages: wd.d12.piercing,
      properties: wp.reachSpecial,
    }, {
      name: 'longsword 1h',
      damages: wd.d8.slashing,
      properties: wp.versatile,
    }, {
      name: 'longsword 2h',
      damages: wd.d10.slashing,
      properties: wp.versatileTwoHanded,
    }, {
      name: 'maul',
      damages: wd.twoD6.bludgeoning,
      properties: wp.heavyTwoHanded,
    }, {
      name: 'morningstar',
      damages: wd.d8.piercing,
      properties: wp.none,
    }, {
      name: 'pike',
      damages: wd.d10.piercing,
      properties: wp.heavyReachTwoHanded,
    }, {
      name: 'rapier',
      damages: wd.d8.piercing,
      properties: wp.finesse,
    }, {
      name: 'scimitar',
      damages: wd.d6.slashing,
      properties: wp.finesseLight,
    }, {
      name: 'shortsword',
      damages: wd.d6.slashing,
      properties: wp.finesseLight,
    }, {
      name: 'trident 1h',
      damages: wd.d6.piercing,
      properties: wp.thrownVersatile,
      ...ranges.twentySixty,
    }, {
      name: 'trident 2h',
      damages: wd.d8.piercing,
      properties: wp.thrownVersatileTwoHanded,
      ...ranges.twentySixty,
    }, {
      name: 'war pick',
      damages: wd.d8.piercing,
      properties: wp.none,
    }, {
      name: 'warhammer 1h',
      damages: wd.d8.bludgeoning,
      properties: wp.versatile,
    }, {
      name: 'warhammer 2h',
      damages: wd.d10.bludgeoning,
      properties: wp.versatileTwoHanded,
    }, {
      name: 'whip',
      damages: wd.d4.slashing,
      properties: wp.finesseReach,
    }, {
      name: 'blowgun',
      damages: wd.d1.piercing,
      properties: wp.ammunitionLoading,
      ...ranges.twentyFiveOneHundred,
    }, {
      name: 'hand crossbow',
      damages: wd.d6.piercing,
      properties: wp.ammunitionLightLoading,
      ...ranges.thirtyOneTwenty,
    }, {
      name: 'heavy crossbow',
      damages: wd.d10.piercing,
      properties: wp.ammunitionHeavyLoadingTwoHanded,
      ...ranges.oneHundredFourHundred,
    }, {
      name: 'longbow',
      damages: wd.d12.piercing,
      properties: wp.ammunitionHeavyTwoHanded,
      ...ranges.oneFiftySixHundred,
    }, {
      name: 'net',
      damages: wd.d12.piercing,
      properties: wp.specialThrown,
      ...ranges.fiveFifteen,
    }]);
    await queryInterface.bulkInsert('Weapons', weapons);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Weapons', null, {});
  },
};
