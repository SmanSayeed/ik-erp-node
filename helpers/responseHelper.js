// Common helper to format success and error responses
exports.sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
      success,
      message,
      data
    });
  };
  