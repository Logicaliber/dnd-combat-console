module.exports = {
  /**
   * actionPatterns: [
   *   [{
   *     other: string,        // If not '', an action other than a weapon or spell attack
   *     restrictions: string, // Any restrictions the action has
   *     spellId: [0-inf],     // id of a spell
   *     times: [1-9],         // number of times to attack with the weapon
   *     weaponId: [0-inf],    // id of a weapon
   *                           // Disallow non-zero spellId and non-zero weaponId
   *                           // If spellId is non-zero, times should be 1.
   *   }],
   * ]
   * @param {Array} array
   * @throws
   */
  isArrayOfActionPatterns(array) {
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    if (!array.isArray()) throw new Error('action patterns array must be an array');
    if (array.length <= 0) throw new Error('action patterns array should not be length 0');
    array.forEach((actionPattern) => {
      if (typeof actionPattern !== 'object' || !actionPattern.isArray()) throw new Error('action patterns array must contain arrays');
      actionPattern.forEach((object) => {
        if (typeof object !== 'object') throw new Error('action pattern must be an array of action objects');
        const objectKeys = Object.keys(object);
        if (
          objectKeys.length !== 5
          || !objectKeys.includes('other')
          || !objectKeys.includes('restrictions')
          || !objectKeys.includes('spellId')
          || !objectKeys.includes('times')
          || !objectKeys.includes('weaponId')
          || typeof object.other !== 'string'
          || typeof object.restrictions !== 'string'
          || typeof object.spellId !== 'number'
          || typeof object.times !== 'number'
          || typeof object.weaponId !== 'number'
        ) {
          throw new Error('action object must have keys other, restrictions, spellId, times, and weaponId');
        }
        if (object.other.length === 0 && object.spellId === 0 && object.weaponId === 0) {
          throw new Error('action must be one of other, spell, or weapon attack');
        }
        if (object.spellId !== 0 && object.weaponId !== 0) {
          throw new Error('action cannot be both a spell and a weapon attack');
        }
        if (object.other.length > 0 && (object.spellId !== 0 || object.weaponId !== 0)) {
          throw new Error('action cannot be both other and a spell or weapon attack');
        }
        if (object.spellId !== 0 && object.times !== 1) {
          throw new Error('spell actions cannot be used multiple times');
        }
      });
    });
  },
  isArrayOfAlignmentStrings(array) {
    module.exports.isArrayOfStrings(array);
    if (typeof array === 'string') array = JSON.parse(array);
    if (array.length !== 2) throw new Error('alignment array must be length two');
    if (!(array[0] === 'chaotic' || array[0] === 'neutral' || array[0] === 'lawful')
      || !(array[1] === 'evil' || array[1] === 'neutral' || array[1] === 'good')
    ) {
      throw new Error('first alignment must be on ethical axis, second alignment on moral axis');
    }
  },
  /**
   *  damage {
   *    num: [0,i],                 // if 0, damage is 0.
   *    die: [1,2,...,12],          // Size of dice to roll
   *    bonus: [0,3],               // Any bonus to the damage.
   *    type: string,               // if '', damage is 0.
   *    effect: string,             // 'stunned for 1 round'.
   *      --  below are optional --
   *    damageRequirement: string,  // any requirements for the damage.
   *    requirement: string,        // any requirements for the effect.
   *    save: [0,10,11,...,30],     // The save DC the target need to pass to prevent the effect.
   *    saveType: string,           // One of 'str', 'dex', ... , 'cha'.
   *    saveStillHalf: false,       // Local override if negation of Weapon.saveStillHalf
   *  }
   */
  isArrayOfDamageObjects(damages) {
    if (damages === null) return;
    if (typeof damages === 'string') {
      damages = JSON.parse(damages);
    }
    if (!damages.isArray()) throw new Error('damages must be an array');
    damages.forEach((damage) => {
      if (typeof damage !== 'object') throw new Error('damages must be an array of objects');
      Object.values(damage).forEach((value) => {
        if (!(typeof value === 'boolean' && typeof value === 'string' && typeof value === 'number')) {
          throw new Error('damage objects must contain only booleans, strings, or numbers');
        }
      });
    });
  },
  /**
   * for example ['ammunition','heavy','loading','two-handed']
   */
  isArrayOfAlphabeticalStrings(array) {
    if (array === null) return;
    module.exports.isArrayOfStrings(array, true);
  },
  /**
   * abilities: {
   *   label: string,
   *   description: string
   * }
   * @param {Array} array
   * @throws
   */
  isArrayOfLabeledDescriptions(array) {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    if (!array.isArray()) throw new Error('array must be an array');
    if (array.length <= 0) throw new Error('array should not be length 0');
    array.forEach((object) => {
      if (typeof object !== 'object') throw new Error('array must contain objects');
      const objectKeys = Object.keys(object);
      if (
        objectKeys.length !== 2
        || !objectKeys.includes('title')
        || !objectKeys.includes('description')
      ) throw new Error('array object must contain a title, description pair');
      if (typeof object.title !== 'string' || typeof object.description !== 'string') throw new Error('title and description must be strings');
    });
  },
  isArrayOfSkillObjects(array) {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    if (!array.isArray()) throw new Error('skill array must be an array');
    if (array.length <= 0) throw new Error('skill array should not be length 0');
    array.forEach((object) => {
      if (typeof object !== 'object') throw new Error('skill array must contain objects');
      const objectKeys = Object.keys(object);
      if (
        objectKeys.length !== 2
        || !objectKeys.includes('skill')
        || !objectKeys.includes('value')
        || typeof object.skill !== 'string'
        || typeof object.value !== 'number'
      ) throw new Error('skill array object must contain a skill, value pair');
    });
  },
  isArrayOfStrings(array, alphabetical = false) {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    let prevLetter = 'a';
    if (!array.isArray()) throw new Error('array must be an array');
    if (array.length <= 0) throw new Error('array should not be length 0');
    array.forEach((element) => {
      if (typeof element !== 'string' || !/^ [a_z]$ /.test(element)) throw new Error('array elements must be strings of lowercase letters');
      if (alphabetical) {
        if (element.charAt(0) < prevLetter) throw new Error('array must be in alphabetical order');
        prevLetter = element.charAt(0);
      }
    });
  },
  isValidResistancesObject(object) {
    if (object === null) return;
    if (typeof object === 'string') {
      object = JSON.parse(object);
    }
    const objectKeys = Object.keys(object);
    if (objectKeys.length !== 6
      || !objectKeys.includes('resistant')
      || !objectKeys.includes('vulnerable')
      || !objectKeys.includes('immune')
    ) throw new Error('resistances object must have resistant, vulnerable, and immune as keys');
    module.exports.isArrayOfStrings(object.resistant);
    module.exports.isArrayOfStrings(object.vulnerable);
    module.exports.isArrayOfStrings(object.immune);
  },
  isValidSavingThrowsObject(object) {
    if (object === null) return;
    if (typeof object === 'string') {
      object = JSON.parse(object);
    }
    const objectKeys = Object.keys(object);
    if (objectKeys.length !== 6
      || !objectKeys.includes('str')
      || !objectKeys.includes('dex')
      || !objectKeys.includes('str')
      || !objectKeys.includes('int')
      || !objectKeys.includes('wis')
      || !objectKeys.includes('cha')
      || object.str < 0 || object.str > 30
      || object.dex < 0 || object.dex > 30
      || object.con < 0 || object.con > 30
      || object.int < 0 || object.int > 30
      || object.wis < 0 || object.wis > 30
      || object.cha < 0 || object.cha > 30
    ) throw new Error('saving throws object must contain each ability as a key');
  },
  /**
   * for example [0,5,2,0,0,0,0,0,0,0]
   * @param {Array} array
   * @throws
   */
  isValidSpellSlotArray(array) {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    if (!array.isArray()) throw new Error('spell slot array must be an array');
    if (array.length !== 10) throw new Error('spell slot array should be length 10');
    if (array[0] !== 0) throw new Error('index 0 of spell slot array should be 0');
    array.forEach((number) => {
      if (typeof number !== 'number' || number < 0 || number > 10) {
        throw new Error('spell slot array must contain only numbers between 0 and 10');
      }
    });
  },
  /**
   * innateSpell: {
   *   spellId: integer,
   *   perDay: [0-9],
   *   restrictions: string,
   * }
   * @param {Array} array
   * @throws
   */
  isValidInnateSpellArray(array) {
    if (array === null) return;
    if (typeof array === 'string') {
      array = JSON.parse(array);
    }
    if (!array.isArray()) throw new Error('innate spell array must be an array');
    array.forEach((innateSpell) => {
      if (typeof innateSpell !== 'object') throw new Error('innate spell array must be an array of objects');
      const objectKeys = Object.keys(innateSpell);
      if (
        objectKeys.length !== 3
        || !objectKeys.includes('spellId')
        || !objectKeys.includes('perDay')
        || !objectKeys.includes('restrictions')
        || typeof innateSpell.spellId !== 'number'
        || typeof innateSpell.perDay !== 'number'
        || typeof innateSpell.restrictions !== 'string'
      ) throw new Error('innate spell object must contain a spellId, a perDay, and a restrictions');
    });
  },
  isValidStat(num) {
    if (typeof num !== 'number') throw new Error('stats must be numbers');
    if (num < 0 || num > 30) throw new Error('stats must be greater than 0 and no greater than 30');
  },
};
