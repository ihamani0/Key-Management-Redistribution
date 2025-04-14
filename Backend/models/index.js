import sequelize from "../config/db.js";

// Import models
import USER from "./User.js";


// Optionally, set up associations here
// For example, if one User has many Products:
// User.hasMany(Product);
// Product.belongsTo(User);



// Export models for use elsewhere

export { sequelize, USER };
