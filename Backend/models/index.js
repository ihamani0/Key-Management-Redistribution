
import sequelize from "../config/db.js";

// Import models
import UserModel from "./user.model.js";
import SubsetModel from "./subset.model.js";
import GatewayModel from "./gateway.model.js"
import DeviceModel from "./device.model.js"
import keyRedistributionTaskModel from "./keyRedistributionTask.model.js";

import { Op, Sequelize, DataTypes } from "sequelize";



const db = {
    sequelize,
    Sequelize,
    Op,
    User: UserModel(sequelize, DataTypes),
    Subset: SubsetModel(sequelize, DataTypes),
    Gateway: GatewayModel(sequelize, DataTypes),
    Device: DeviceModel(sequelize, DataTypes),
    KeyTask: keyRedistributionTaskModel(sequelize, DataTypes)
}



// Subset relationships (for linear EVKMS-like structures)
db.Subset.belongsTo(db.Subset,
    {
        as: 'PreviousSubset',
        foreignKey: 'previousSubsetId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });


db.Subset.belongsTo(db.Subset,
    {
        as: 'NextSubset',
        foreignKey: 'nextSubsetId',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });


db.Subset.hasOne(db.Subset,
    {
        as: 'HasPreviousSubset',
        foreignKey: 'nextSubsetId'
    }); // Inverse for querying

db.Subset.hasOne(db.Subset,
    {
        as: 'HasNextSubset',
        foreignKey: 'previousSubsetId'
    }); // Inverse for querying


// Gateway relationships
db.Gateway.belongsTo(db.Subset,
    {
        foreignKey: 'subsetId',
        as: 'subset',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

db.Subset.hasMany(db.Gateway,
    {
        foreignKey: 'subsetId',
        as: "gateways"
    }); // A subset can have multiple gateways


db.Device.belongsTo(db.Subset,
    {
        foreignKey: "subsetId",
        as: 'subset',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    })

db.Subset.hasMany(db.Device,
    {
        foreignKey: 'subsetId',
        as: 'devices'

    });
// Export models for use elsewhere

db.KeyTask.belongsTo(db.User,
    {
        foreignKey: 'initiatedByUserId',
        as: 'user'
    }
);
db.KeyTask.belongsTo(db.Subset,
    {
        foreignKey: 'targetSubsetId',
        as: 'subset'
    }
);
db.KeyTask.belongsTo(db.Gateway,
    {
        foreignKey: 'targetGatewayId',
        as: 'gateway'
    }
);
db.KeyTask.belongsTo(db.Device,
    {
        foreignKey: 'targetDeviceId',
        as: 'device'
    }
);

export default db;



// Key Associations
// Subset ↔ Subset :
// previousSubsetId and nextSubsetId create a linear chain of subsets (like a linked list).
// Gateway ↔ Subset :
// A gateway belongs to one subset; a subset has many gateways.
// Device ↔ Subset :
// A device belongs to one subset; a subset has many devices.
// DeviceKey ↔ Device :
// A device has many keys (as owner) and may link to peer devices/gateways.
// KeyRedistributionTask ↔ Device/Subset/Gateway/User :
// Tasks are tied to specific entities for accountability.