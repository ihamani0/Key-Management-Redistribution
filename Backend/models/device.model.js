export default (sequelize, DataTypes) => {
    return sequelize.define("Device", {
        deviceId:
        {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'device_id'
        },
        deviceGuid:
        {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'device_guid'
        },

        deviceName:
        {
            type: DataTypes.STRING(255),
            field: 'device_name'
        },
        // subsetId added via association
        subsetId: {
            type: DataTypes.INTEGER,
            field: 'subset_id',
        }
        ,
        localIdentifierInSubset:
        {
            type: DataTypes.STRING(100),
            field: 'local_identifier_in_subset'
        },

        deviceType:
        {
            type: DataTypes.STRING(100),
            field: 'device_type'
        },
        status:
        {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'unprovisioned'
        },

        // lastSeenByGatewayId added via association (optional for now)
        lastCommunicationAt:
        {
            type: DataTypes.DATE,
            field: 'last_communication_at'
        },
        initialSecretEncrypted:
        {
            type: DataTypes.TEXT,
            field: 'initial_secret_encrypted'
        }, // Server encrypts this
        securityParameterAlpha:
        {
            type: DataTypes.STRING(50),
            field: 'security_parameter_alpha'
        },
        registeredAt:
        {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'registered_at'
        },
    },
        {
            tableName: 'devices',
            timestamps: true,
            createdAt: 'registered_at',
            updatedAt: 'updated_at',
            indexes: [
                {
                    name: "unique_subest_local_id",
                    unique: true,
                    fields: ['subset_id', 'local_identifier_in_subset']
                }
            ]
        });
}