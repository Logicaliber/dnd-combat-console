module.exports = {
  missingRequiredParams: (inputObject, optionsSchema) => {
    return Object.keys(optionsSchema)
      .filter((key) => optionsSchema[key].required)
      .filter((key) => !Object.prototype.hasOwnProperty.call(inputObject, key));
  },
  nonUpdateableParams: (inputObject, optionsSchema) => {
    return Object.keys(optionsSchema)
      .filter((key) => !optionsSchema[key].updateable)
      .filter((key) => Object.prototype.hasOwnProperty.call(inputObject, key));
  },
};
