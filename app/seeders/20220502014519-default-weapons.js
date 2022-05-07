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
      damage: wd.d4.bludgeoning,
      properties: wp.light,
    }, {
      name: 'dagger',
      damage: wd.d4.piercing,
      properties: wp.finesseLightThrown,
      ...ranges.twentySixty,
    }, {
      name: 'greatclub',
      damage: wd.d8.bludgeoning,
      properties: wp.twoHanded,
    }, {
      name: 'handaxe',
      damage: wd.d6.slashing,
      properties: wp.finesseLightThrown,
      ...ranges.twentySixty,
    }, {
      name: 'javelin',
      damage: wd.d6.piercing,
      properties: wp.thrown,
      ...ranges.thirtyOneTwenty,
    }, {
      name: 'light hammer',
      damage: wd.d4.bludgeoning,
      properties: wp.lightThrown,
      ...ranges.twentySixty,
    }, {
      name: 'mace',
      damage: wd.d6.bludgeoning,
      properties: wp.none,
    }, {
      name: 'quarterstaff 1h',
      damage: wd.d6.bludgeoning,
      properties: wp.versatile,
    }, {
      name: 'quarterstaff 2h',
      damage: wd.d8.bludgeoning,
      properties: wp.versatileTwoHanded,
    }, {
      damage: wd.d6.slashing,
      name: 'sickle',
      properties: wp.light,
    }, {
      name: 'spear 1h',
      damage: wd.d6.piercing,
      properties: wp.thrownVersatile,
      ...ranges.twentySixty,
    }, {
      name: 'spear 2h',
      damage: wd.d6.piercing,
      properties: wp.thrownVersatileTwoHanded,
      ...ranges.twentySixty,
    }, {
      name: 'light crossbow',
      damage: wd.d8.piercing,
      properties: wp.ammunitionHeavyLoadingTwoHanded,
      ...ranges.eightyThreeTwenty,
    }, {
      name: 'dart',
      damage: wd.d4.piercing,
      properties: wp.finesseThrown,
      ...ranges.twentySixty,
    }, {
      name: 'shortbow',
      damage: wd.d6.piercing,
      properties: wp.ammunitionTwoHanded,
      ...ranges.eightyThreeTwenty,
    }, {
      name: 'sling',
      damage: wd.d4.bludgeoning,
      properties: wp.ammunition,
      ...ranges.thirtyOneTwenty,
    }, {
      name: 'battleaxe 1h',
      damage: wd.d8.slashing,
      properties: wp.versatile,
    }, {
      name: 'battleaxe 2h',
      damage: wd.d10.slashing,
      properties: wp.versatileTwoHanded,
    }, {
      name: 'flail',
      damage: wd.d8.bludgeoning,
      properties: wp.none,
    }, {
      name: 'glaive',
      damage: wd.d10.slashing,
      properties: wp.heavyReachTwoHanded,
    }, {
      name: 'greataxe',
      damage: wd.d12.slashing,
      properties: wp.heavyTwoHanded,
    }, {
      name: 'greatsword',
      damage: wd.twoD6.slashing,
      properties: wp.heavyTwoHanded,
    }, {
      name: 'halberd',
      damage: wd.d10.slashing,
      properties: wp.heavyReachTwoHanded,
    }, {
      name: 'lance',
      damage: wd.d12.piercing,
      properties: wp.reachSpecial,
    }, {
      name: 'longsword 1h',
      damage: wd.d8.slashing,
      properties: wp.versatile,
    }, {
      name: 'longsword 2h',
      damage: wd.d10.slashing,
      properties: wp.versatileTwoHanded,
    }, {
      name: 'maul',
      damage: wd.twoD6.bludgeoning,
      properties: wp.heavyTwoHanded,
    }, {
      name: 'morningstar',
      damage: wd.d8.piercing,
      properties: wp.none,
    }, {
      name: 'pike',
      damage: wd.d10.piercing,
      properties: wp.heavyReachTwoHanded,
    }, {
      name: 'rapier',
      damage: wd.d8.piercing,
      properties: wp.finesse,
    }, {
      name: 'scimitar',
      damage: wd.d6.slashing,
      properties: wp.finesseLight,
    }, {
      name: 'shortsword',
      damage: wd.d6.slashing,
      properties: wp.finesseLight,
    }, {
      name: 'trident 1h',
      damage: wd.d6.piercing,
      properties: wp.thrownVersatile,
      ...ranges.twentySixty,
    }, {
      name: 'trident 2h',
      damage: wd.d8.piercing,
      properties: wp.thrownVersatileTwoHanded,
      ...ranges.twentySixty,
    }, {
      name: 'war pick',
      damage: wd.d8.piercing,
      properties: wp.none,
    }, {
      name: 'warhammer 1h',
      damage: wd.d8.bludgeoning,
      properties: wp.versatile,
    }, {
      name: 'warhammer 2h',
      damage: wd.d10.bludgeoning,
      properties: wp.versatileTwoHanded,
    }, {
      name: 'whip',
      damage: wd.d4.slashing,
      properties: wp.finesseReach,
    }, {
      name: 'blowgun',
      damage: wd.d1.piercing,
      properties: wp.ammunitionLoading,
      ...ranges.twentyFiveOneHundred,
    }, {
      name: 'hand crossbow',
      damage: wd.d6.piercing,
      properties: wp.ammunitionLightLoading,
      ...ranges.thirtyOneTwenty,
    }, {
      name: 'heavy crossbow',
      damage: wd.d10.piercing,
      properties: wp.ammunitionHeavyLoadingTwoHanded,
      ...ranges.oneHundredFourHundred,
    }, {
      name: 'longbow',
      damage: wd.d12.piercing,
      properties: wp.ammunitionHeavyTwoHanded,
      ...ranges.oneFiftySixHundred,
    }, {
      name: 'net',
      damage: wd.d12.piercing,
      properties: wp.specialThrown,
      ...ranges.fiveFifteen,
    }]);
    await queryInterface.bulkInsert('Weapons', weapons);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Weapons', null, {});
  },
};
