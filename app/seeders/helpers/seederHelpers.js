const moment = require('moment');

const ts = moment().utc().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
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
      bludgeoning: '[{"num":1,"die":0,"type":"bludgeoning"}]',
      piercing: '[{"num":1,"die":0,"type":"piercing"}]',
      slashing: '[{"num":1,"die":0,"type":"slashing"}]',
    },
    d1: {
      bludgeoning: '[{"num":1,"die":1,"type":"bludgeoning"}]',
      piercing: '[{"num":1,"die":1,"type":"piercing"}]',
      slashing: '[{"num":1,"die":1,"type":"slashing"}]',
    },
    d4: {
      bludgeoning: '[{"num":1,"die":4,"type":"bludgeoning"}]',
      piercing: '[{"num":1,"die":4,"type":"piercing"}]',
      slashing: '[{"num":1,"die":4,"type":"slashing"}]',
    },
    d6: {
      bludgeoning: '[{"num":1,"die":6,"type":"bludgeoning"}]',
      piercing: '[{"num":1,"die":6,"type":"piercing"}]',
      slashing: '[{"num":1,"die":6,"type":"slashing"}]',
    },
    d8: {
      bludgeoning: '[{"num":1,"die":8,"type":"bludgeoning"}]',
      piercing: '[{"num":1,"die":8,"type":"piercing"}]',
      slashing: '[{"num":1,"die":8,"type":"slashing"}]',
    },
    d10: {
      bludgeoning: '[{"num":1,"die":10,"type":"bludgeoning"}]',
      piercing: '[{"num":1,"die":10,"type":"piercing"}]',
      slashing: '[{"num":1,"die":10,"type":"slashing"}]',
    },
    d12: {
      bludgeoning: '[{"num":1,"die":12,"type":"bludgeoning"}]',
      piercing: '[{"num":1,"die":12,"type":"piercing"}]',
      slashing: '[{"num":1,"die":12,"type":"slashing"}]',
    },
    twoD4: {
      bludgeoning: '[{"num":2,"die":4,"type":"bludgeoning"}]',
      piercing: '[{"num":2,"die":4,"type":"piercing"}]',
      slashing: '[{"num":2,"die":4,"type":"slashing"}]',
    },
    twoD6: {
      bludgeoning: '[{"num":2,"die":6,"type":"bludgeoning"}]',
      piercing: '[{"num":2,"die":6,"type":"piercing"}]',
      slashing: '[{"num":2,"die":6,"type":"slashing"}]',
    },
    twoD8: {
      bludgeoning: '[{"num":2,"die":8,"type":"bludgeoning"}]',
      piercing: '[{"num":2,"die":8,"type":"piercing"}]',
      slashing: '[{"num":2,"die":8,"type":"slashing"}]',
    },
    twoD10: {
      bludgeoning: '[{"num":2,"die":10,"type":"bludgeoning"}]',
      piercing: '[{"num":2,"die":10,"type":"piercing"}]',
      slashing: '[{"num":2,"die":10,"type":"slashing"}]',
    },
    twoD12: {
      bludgeoning: '[{"num":2,"die":12,"type":"bludgeoning"}]',
      piercing: '[{"num":2,"die":12,"type":"piercing"}]',
      slashing: '[{"num":2,"die":12,"type":"slashing"}]',
    },
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
}
