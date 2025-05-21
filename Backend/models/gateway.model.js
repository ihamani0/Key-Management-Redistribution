
export default (sequelize, DataTypes) => {
    return sequelize.define('Gateway', {

        //global uid
        gatewayGuid: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'gateway_guid',
        },
        gatewayName: {
            type: DataTypes.STRING(255),
            field: 'gateway_name',
        },
        // subsetId will be defined via association
        subsetId: {
            type: DataTypes.INTEGER,
            field: 'subset_id',
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            field: 'ip_address',
        },
        macAddress: {
            type: DataTypes.STRING(17),
            unique: true,
            field: 'mac_address',
        },
        firmwareVersion: {
            type: DataTypes.STRING(50),
            field: 'firmware_version',
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'offline', // e.g., 'online', 'offline', 'needs_attention'
        },
        lastSeenAt: {
            type: DataTypes.DATE,
            field: 'last_seen_at',
        },
        authenticationKeyPublic: {
            type: DataTypes.TEXT, // For public key
            field: 'authentication_key_public',
        },
        authenticationKeySecretEncrypted: {
            type: DataTypes.TEXT, // For encrypted secret key
            field: 'authentication_key_secret_encrypted',
        },


    }, {
        tableName: 'gateways',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    })
}


