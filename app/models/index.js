const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.json'))[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// attach model options builder
sequelize.modelOptsObject = (required, searchable, updateable) => {
  return {
    required,
    searchable,
    updateable,
  };
};

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  const Model = db[modelName];
  if (Model.associate) Model.associate(db);
  Model.addScope('id', (id) => {
    return {
      attributes: { include: ['id'] },
      where: { id },
    };
  });
  if (modelName !== 'User') {
    /**
     * @param {Model} instance
     * @returns {Promise<Model>} a copy of the given instance. If the model has a 'name' field,
     * increments its trailing number by one, or adds a trailing ' 1'. If the model has an 'index'
     * or 'priority' field, sets the value to be the max + 1 over sibling instances.
     */
    Model.clone = async (instance) => {
      delete instance.id;
      // Increment name (e.g. 'goblin' => 'goblin 1' => 'goblin 2')
      if ({}.hasOwnProperty.call(instance.dataValues, 'name')) {
        const { name } = instance.dataValues;
        // If string ends in a number, returns that string and number separated
        // into non-numeric and numeric parts, with the numeric part incremented by one.
        const numSuffix = (string, suffix = '') => {
          const nextToLast = string.length - 1;
          const lastChar = string.charAt(nextToLast);
          if (Number.isNaN(parseInt(lastChar, 10))) {
            return { string, suffix: (parseInt(suffix, 10) || 0) + 1 };
          }
          return numSuffix(string.slice(0, nextToLast), `${lastChar}${suffix}`);
        };

        const { string, suffix } = numSuffix(name);
        instance.name = `${string} ${suffix}`;
      }
      // Increment priority for actionPatterns
      if ({}.hasOwnProperty.call(instance.dataValues, 'priority')) {
        instance.priority = Math.max(...(await Model.findAll({
          where: { creatureTypeId: instance.creatureTypeId },
          attributes: { include: ['priority'] },
        }))
          .map((ap) => ap.priority))
          + 1;
      // Increment index for actions
      } else if ({}.hasOwnProperty.call(instance.dataValues, 'index')) {
        instance.index = Math.max(...(await Model.findAll({
          where: { actionPatternId: instance.actionPatternId },
          attributes: { include: ['index'] },
        }))
          .map((ap) => ap.index))
          + 1;
      }
      // Return a copy of the instance after reloading the original instance in-place
      return Model.scope('defaultScope').create({ ...instance.dataValues })
        .then(async (newInstance) => {
          await instance.reload();
          return newInstance.reload();
        });
    };
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
