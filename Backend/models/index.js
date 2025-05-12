import sequelize from "../config/db.js";

// Import models
import USER from "./user.model.js";
import Subset from "./subset.model.js";
import Gateway from "./gateway.model.js"





// // Subset relationships (for linear EVKMS-like structures)
// Subset.belongsTo(Subset, { as: 'PreviousSubset', foreignKey: 'previousSubsetId', targetKey: 'id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// Subset.belongsTo(Subset, { as: 'NextSubset', foreignKey: 'nextSubsetId', targetKey: 'id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
// Subset.hasOne(Subset, { as: 'HasPreviousSubset', foreignKey: 'nextSubsetId', sourceKey: 'id' }); // Inverse for querying
// Subset.hasOne(Subset, { as: 'HasNextSubset', foreignKey: 'previousSubsetId', sourceKey: 'id' }); // Inverse for querying


// Gateway relationships
Gateway.belongsTo(Subset, { foreignKey: 'subsetId', targetKey: 'id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Subset.hasMany(Gateway, { foreignKey: 'subsetId', sourceKey: 'id' }); // A subset can have multiple gateways



// Export models for use elsewhere

export { sequelize, USER, Subset, Gateway };
