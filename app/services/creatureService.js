const {
  CreatureType,
  Creature,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

// Declare scoped models
const CreatureTypeId = (id) => CreatureType.scope({ method: ['id', id] });
const CreatureId = (id) => Creature.scope({ method: ['id', id] });
const CreatureName = (name) => Creature.scope({ method: ['name', name] });
const CreatureWithCreatureTypeId = (creatureTypeId) => Creature.scope({ method: ['creatureTypeId', creatureTypeId] });

// Error message building blocks
const CREATE_FAIL = 'Creature creation failed,';
const SPAWN_FAIL = 'Creature spawn failed,';
const UPDATE_FAIL = 'Creature update failed,';
const DELETE_FAIL = 'Creature deletion failed,';
const NAME_EXISTS = 'a creature with the given name already exists';
const NO_CREATURE = 'no creature found for the given ID';
const NO_TYPE = 'no creatureType found for the given ID';

const numSuffix = (name, suffix = '') => {
  if (!name.length) return parseInt(suffix, 10) || 0;
  const lastChar = name.charAt(name.length - 1);
  if (Number.isNaN(parseInt(lastChar, 10))) return (parseInt(suffix, 10) || 0);
  return numSuffix(name.slice(0, name.length - 1), `${suffix}${lastChar}`);
};

module.exports = {
  /**
   * @param {Object} creatureObject
   * @returns {Promise<Creature>} the new creature, with its creatureType,
   * armor, actionPatterns, actions, weapons, and spells
   */
  createCreature: async (creatureObject) => {
    // Filter out disallowed params
    creatureObject = stripInvalidParams(creatureObject, Creature.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(creatureObject, Creature.requiredParams);
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the indicated creatureType exists
    if (!(await CreatureTypeId(creatureObject.creatureTypeId).count())) throw new Error(`${CREATE_FAIL} ${NO_TYPE}`);
    // Check that the provided creature name is unique
    if (await CreatureName(creatureObject.name).count()) throw new Error(`${CREATE_FAIL} ${NAME_EXISTS}`);
    // Create the creature, returning it with its creatureType,
    // armor, actionPatterns, actions, weapons, and spells
    return Creature.create(creatureObject)
      .then((creature) => creature.reload());
  },

  /**
   * @param {Integer} creatureTypeId
   * @returns {Promise<Creature>} a new creature, named with a number
   * suffix 1 + the max of number suffixes over sibling isntances.
   */
  spawnCreature: async (creatureTypeId) => {
    creatureTypeId = parseInt(creatureTypeId, 10);
    if (!creatureTypeId) throw new Error(`${SPAWN_FAIL} ${NO_TYPE}`);
    const creatureType = await CreatureType.unscoped().findByPk(creatureTypeId);
    if (!creatureType) throw new Error(`${SPAWN_FAIL} ${NO_TYPE}`);
    // Give the new creature instance a name with a number suffix 1 + the max of number
    // suffixes over sibling instances. Also give it the default maxHP and currentHP.
    const creatureObject = {
      creatureTypeId,
      name: `${creatureType.name} ${1 + Math.max(0, ...(
        await CreatureWithCreatureTypeId(creatureTypeId).findAll({
          attributes: { include: ['name'] },
        })).map((creature) => numSuffix(creature.name)))}`,
      maxHP: creatureType.maxHP,
      currentHP: creatureType.maxHP,
    };
    // If the creatureType has spells, use its spellSlots array
    // to instantiate the slots of the new creature instance.
    if (creatureType.spellSlots) {
      [
        creatureObject.slotsZeroeth, // Ignored
        creatureObject.slotsFirst,
        creatureObject.slotsSecond,
        creatureObject.slotsThird,
        creatureObject.slotsFourth,
        creatureObject.slotsFifth,
        creatureObject.slotsSixth,
        creatureObject.slotsSeventh,
        creatureObject.slotsEigth,
        creatureObject.slotsNinth,
      ] = [...creatureType.spellSlots];
    }
    // Return the new creature with its creatureType, armor,
    // actionPatterns, actions, weapons, and spells.
    return Creature.create(creatureObject)
      .then((creature) => creature.reload());
  },

  /**
   * @param {Integer} creatureId
   * @returns {Promise<Creature>} the creature, with its creatureType,
   * armor, actionPatterns, actions, weapons, and spells
   */
  getCreature: async (creatureId) => {
    creatureId = parseInt(creatureId, 10);
    if (Number.isNaN(creatureId)) return null;
    return Creature.findByPk(creatureId);
  },

  /**
   * @param {Integer} creatureId
   * @param {Object} updateFields
   * @returns {Creature} the updated creature, with its creatureType,
   * armor, actionPatterns, actions, weapons, and spells
   */
  updateCreature: async (creatureId, updateFields) => {
    creatureId = parseInt(creatureId, 10);
    if (Number.isNaN(creatureId)) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE}`);
    // Filter out disallowed params
    updateFields = stripInvalidParams(updateFields, Creature.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated creature exists
    const creature = await Creature.findByPk(creatureId);
    if (!creature) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE}`);
    // If the name is being updated, check that it is still unique
    const { name } = updateFields;
    if (name !== undefined && name !== creature.name && await CreatureName(name).count()) {
      throw new Error(`${UPDATE_FAIL} ${NAME_EXISTS}`);
    }
    // Update the creature, returning it with its creatureType,
    // armor, actionPatterns, actions, weapons, and spells
    return creature.set(updateFields).save();
  },

  /**
   * @param {Integer} creatureId
   * @returns {Promise<1|0>} if the creature was deleted
   */
  deleteCreature: async (creatureId) => {
    creatureId = parseInt(creatureId, 10);
    if (Number.isNaN(creatureId)) throw new Error(`${DELETE_FAIL} ${NO_CREATURE}`);
    // Check that the indicated creature exists
    const creature = await CreatureId(creatureId).findOne();
    if (!creature) throw new Error(`${DELETE_FAIL} ${NO_CREATURE}`);
    // Delete the creature
    return creature.destroy();
  },
};
