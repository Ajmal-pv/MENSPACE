function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: err.stack });
  }
  
  module.exports = errorHandler;