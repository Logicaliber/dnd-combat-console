const {
  Armor,
  CreatureType,
  Creature,
  ActionPattern,
  Action,
} = require('../models');
const { stripInvalidParams, missingRequiredParams } = require('./validationHelpers');

// Declare scoped models
const ArmorId = Armor.scope('idOnly');
const CreatureTypeId = CreatureType.scope('idOnly');
const CreatureTypeActionPatternIds = CreatureTypeId.scope('actionPatternIds');

const CreatureTypeName = (name) => {
  return CreatureType.scope({ method: ['nameOnly', name] });
};
const ActionPatternWithCreatureTypeId = (creatureTypeId) => {
  return ActionPattern.scope({ method: ['withCreatureTypeId', creatureTypeId] });
};
const ActionWithActionPatternIds = (actionPatternIds) => {
  return Action.scope({ method: ['withActionPatternIds', actionPatternIds] });
};
const CreatureWithTypeId = (creatureTypeId) => {
  return Creature.scope({ method: ['withTypeId', creatureTypeId] });
};

// Error message building blocks
const CREATE_FAIL = 'CreatureType creation failed,';
const UPDATE_FAIL = 'CreatureType update failed,';
const DELETE_FAIL = 'CreatureType deletion failed,';
const NAME_EXISTS = 'a creatureType with the given name already exists';
const NO_ARMOR = 'no armor found for the given ID';
const NO_CREATURE_TYPE = 'no creatureType found for the given ID';

module.exports = {
  /**
   * @param {Object} creatureTypeObject
   * @returns {Promise<CreatureType>} the new creatureType, with its armor included
   */
  createCreatureType: async (creatureTypeObject) => {
    // Filter out disallowed params
    creatureTypeObject = stripInvalidParams(creatureTypeObject, CreatureType.allowedParams);
    // Check for missing required params
    const missingParams = missingRequiredParams(creatureTypeObject, CreatureType.requiredParams);
    if (missingParams.length) throw new Error(`${CREATE_FAIL} fields missing: ${missingParams.join()}`);
    // Check that the provided creatureType name is unique
    if (await CreatureTypeName(creatureTypeObject.name).count()) {
      throw new Error(`${CREATE_FAIL} ${NAME_EXISTS}`);
    }
    // Check that the indicated Armor exists
    if (creatureTypeObject.armorId
      && !(await ArmorId.count({ where: { id: creatureTypeObject.armorId } }))) {
      throw new Error(`${CREATE_FAIL} ${NO_ARMOR}`);
    }
    // Create the creatureType, returning it with its armor
    return CreatureType.create(creatureTypeObject)
      .then((creatureType) => creatureType.reload());
  },

  /**
   * @param {Integer} creatureTypeId
   * @returns {Promise<CreatureType>} the creatureType with its armor
   */
  getCreatureType: async (creatureTypeId) => {
    creatureTypeId = parseInt(creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId)) return null;
    return CreatureType.findByPk(creatureTypeId);
  },

  /**
   * @param {Integer} creatureTypeId
   * @param {Object} updateFields
   * @returns {Promise<CreatureType>} the updated creatureType with its armor
   */
  updateCreatureType: async (creatureTypeId, updateFields) => {
    creatureTypeId = parseInt(creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId)) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE_TYPE}`);
    // Remove non-updateable params
    updateFields = stripInvalidParams(updateFields, CreatureType.updateableParams);
    if (!Object.keys(updateFields).length) throw new Error(`${UPDATE_FAIL} no valid update fields found`);
    // Check that the indicated creatureType exists
    const creatureType = await CreatureType.findByPk(creatureTypeId);
    if (!creatureType) throw new Error(`${UPDATE_FAIL} ${NO_CREATURE_TYPE}`);
    // If the armorId is being updated, check that the new indicated armor exists
    const { armorId, name } = updateFields;
    if (armorId !== undefined && armorId !== null
      && (Number.isNaN(parseInt(armorId, 10))
        || !(await ArmorId.count({ where: { id: armorId } })))) {
      throw new Error(`${UPDATE_FAIL} ${NO_ARMOR}`);
    }
    // If the name is being updated, check that it is still unique
    if (name !== undefined && name !== creatureType.name
      && await CreatureTypeName(name).count()) {
      throw new Error(`${UPDATE_FAIL} ${NAME_EXISTS}`);
    }
    // Update the creatureType
    return creatureType.set(updateFields).save();
  },

  /**
   * @param {Integer}
   * @returns {Promise<0 | 1>} 1 if the creatureType was deleted
   */
  deleteCreatureType: async (creatureTypeId) => {
    creatureTypeId = parseInt(creatureTypeId, 10);
    if (Number.isNaN(creatureTypeId)) throw new Error(`${DELETE_FAIL} ${NO_CREATURE_TYPE}`);
    // Check that the indicated creatureType exists
    const creatureType = await CreatureTypeActionPatternIds.findByPk(creatureTypeId);
    if (!creatureType) throw new Error(`${DELETE_FAIL} ${NO_CREATURE_TYPE}`);
    // Delete all associated Actions
    await ActionWithActionPatternIds(creatureType.actionPatterns
      .map((ap) => ap.id)).destroy();
    // Delete all associated ActionPatterns
    await ActionPatternWithCreatureTypeId(creatureTypeId).destroy();
    // Delete all associated Creatures
    await CreatureWithTypeId(creatureTypeId).destroy();
    // Delete the CreatureType
    return creatureType.destroy();
  },
};
