const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.ensureAuthenticated = function(req, res, next) {
  let Usertoken;
  const UserauthHeader = req.headers.authorization;

  if (!UserauthHeader) {
    return res.json({ errMsg: 'Unauthorized Access.' });
  }

  // Remove quotes from the token
  Usertoken = UserauthHeader.replace(/['"]+/g, '').split(' ')[1];

  try {
    const decoded =  jwt.verify(Usertoken, process.env.JWT_SECRET);

    if (decoded.role !== 'user') {
      return res.json({ errMsg: 'Unauthorized Access.' });
    } else {
      // Access the user ID or any other information stored in the token
      const userId = decoded.UserId;

      // Pass the user ID or other information to the next middleware or route handler
      req.id = userId;

      // Call the next middleware or route handler
      next();
    }
  } catch (error) {
    console.log(error);
  }
};
