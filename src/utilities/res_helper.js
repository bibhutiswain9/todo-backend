exports.onSucess = (message, result, res) => {
  res.status(200).json({
    Message: message,
    Data: result,
    Status: 200,
    Issucess: true,
  });
  res.end();
};
exports.onError = (error, res) => {
  res.status(500).json({
    Message: error,
    Data: 0,
    Status: 500,
    Issucess: false,
  });
  res.end();
};
exports.onWarning = (message, result, res) => {
  res.status(200).json({
    Message: message,
    Data: result,
    Status: 199,
    Issucess: true,
  });
  res.end();
};
