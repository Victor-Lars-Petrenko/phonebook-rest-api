export const handleSaveError = (error, data, next) => {
  const { message, code } = error;
  error.status =
    error.message === "MongoServerError" && "code" === 11000 ? 409 : 400;
  next();
};

export const setUpdateSettings = function (next) {
  this.options.new = true;
  this.options.runValidators = true;
  next();
};
