const moment = require('moment');

const ts = moment().utc().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
  normalizedCR: (crString) => {
    if (crString === '0') return -3;
    if (crString === '1/8') return -2;
    if (crString === '1/4') return -1;
    if (crString === '1/2') return 0;
    return parseInt(crString, 10);
  },
  ranges: {
    fiveFifteen: {
      normalRange: 5,
      longRange: 15,
    },
    twentySixty: {
      normalRange: 20,
      longRange: 60,
    },
    twentyFiveOneHundred: {
      normalRange: 25,
      longRange: 100,
    },
    thirtyOneTwenty: {
      normalRange: 30,
      longRange: 120,
    },
    eightyThreeTwenty: {
      normalRange: 80,
      longRange: 320,
    },
    oneHundredFourHundred: {
      normalRange: 100,
      longRange: 400,
    },
    oneFiftySixHundred: {
      normalRange: 150,
      longRange: 600,
    },
  },
  timeStamps: {
    createdAt: ts,
    updatedAt: ts,
  },
  // Weapon Properties
  wp: {
    // Single
    none: '[]',
    ammunition: '["ammunition"]',
    finesse: '["finesse"]',
    heavy: '["heavy"]',
    loading: '["loading"]',
    light: '["light"]',
    reach: '["reach"]',
    special: '["special"]',
    thrown: '["thrown"]',
    twoHanded: '["two-handed"]',
    versatile: '["versatile"]',
    // Two
    ammunitionTwoHanded: '["ammunition","two-handed"]',
    ammunitionLoading: '["ammunition","loading"]',
    finesseLight: '["finesse","light"]',
    finesseThrown: '["finesse","thrown"]',
    lightThrown: '["light","thrown"]',
    finesseReach: '["finesse","reach"]',
    heavyTwoHanded: '["heavy","two-handed"]',
    reachSpecial: '["reach","special"]',
    specialThrown: '["special","thrown"]',
    thrownVersatile: '["thrown","versatile"]',
    versatileTwoHanded: '["versatile","two-handed"]',
    // Three
    ammunitionLightLoading: '["ammunition","light","loading"]',
    ammunitionLoadingTwoHanded: '["ammunition","loading","two-handed"]',
    finesseLightThrown: '["finesse","light","thrown"]',
    heavyReachTwoHanded: '["heavy","reach","two-handed"]',
    thrownVersatileTwoHanded: '["thrown","versatile","two-handed"]',
    // Four
    ammunitionHeavyLoadingTwoHanded: '["ammunition","heavy","loading","two-handed"]',
  },
  // Weapon Damages
  wd: {
    d0: {
      bludgeoning: '[{"num":1,"die":0,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":1,"die":0,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":1,"die":0,"type":"slashing","bonus":0,"effect":""}]',
    },
    d1: {
      bludgeoning: '[{"num":1,"die":1,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":1,"die":1,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":1,"die":1,"type":"slashing","bonus":0,"effect":""}]',
    },
    d4: {
      bludgeoning: '[{"num":1,"die":4,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":1,"die":4,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":1,"die":4,"type":"slashing","bonus":0,"effect":""}]',
    },
    d6: {
      bludgeoning: '[{"num":1,"die":6,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":1,"die":6,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":1,"die":6,"type":"slashing","bonus":0,"effect":""}]',
    },
    d8: {
      bludgeoning: '[{"num":1,"die":8,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":1,"die":8,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":1,"die":8,"type":"slashing","bonus":0,"effect":""}]',
    },
    d10: {
      bludgeoning: '[{"num":1,"die":10,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":1,"die":10,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":1,"die":10,"type":"slashing","bonus":0,"effect":""}]',
    },
    d12: {
      bludgeoning: '[{"num":1,"die":12,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":1,"die":12,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":1,"die":12,"type":"slashing","bonus":0,"effect":""}]',
    },
    twoD4: {
      bludgeoning: '[{"num":2,"die":4,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":2,"die":4,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":2,"die":4,"type":"slashing","bonus":0,"effect":""}]',
    },
    twoD6: {
      bludgeoning: '[{"num":2,"die":6,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":2,"die":6,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":2,"die":6,"type":"slashing","bonus":0,"effect":""}]',
    },
    twoD8: {
      bludgeoning: '[{"num":2,"die":8,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":2,"die":8,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":2,"die":8,"type":"slashing","bonus":0,"effect":""}]',
    },
    twoD10: {
      bludgeoning: '[{"num":2,"die":10,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":2,"die":10,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":2,"die":10,"type":"slashing","bonus":0,"effect":""}]',
    },
    twoD12: {
      bludgeoning: '[{"num":2,"die":12,"type":"bludgeoning","bonus":0,"effect":""}]',
      piercing: '[{"num":2,"die":12,"type":"piercing","bonus":0,"effect":""}]',
      slashing: '[{"num":2,"die":12,"type":"slashing","bonus":0,"effect":""}]',
    },
  },
  withTs: (array) => {
    return array.map((obj) => {
      return {
        ...obj,
        ...module.exports.timeStamps,
      };
    });
  },
  withIdAndTs: (array) => {
    return module.exports.withTs(array.map((obj, i) => {
      return {
        id: i + 1,
        ...obj,
      };
    }));
  },
};
