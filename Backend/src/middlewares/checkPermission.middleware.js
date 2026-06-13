// checkPermission.middleware.js

// Wrapper function that accepts your custom arguments
const checkPermission = (permissions) => {
  // Returns the actual Express middleware function
  return async (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("Required Permissions:", permissions);

    // Your logic to check if the user has the right permissions goes here
    // const hasPermission = ... 
    
    // if (!hasPermission) {
    //   return res.status(403).json({ message: "Forbidden" });
    // }

    // Always remember to call next() to pass control to the next middleware/controller
    next(); 
  };
};

module.exports = { checkPermission };