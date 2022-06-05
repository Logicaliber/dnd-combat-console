module.exports = {
  syncModels: async (models) => {
    return models.reduce(async (promise, model) => {
      // wait for the previous model to sync
      await promise;
      // begin syncing the next model
      return model.sync({ force: true });
    // initial value is a resolved promise
    }, Promise.resolve());
  },
};
