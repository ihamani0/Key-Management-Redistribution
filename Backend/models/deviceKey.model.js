export default (sequelize, DataTypes) => {

    return sequelize.define("DeviceKey", {
        keyId: {

            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'key_id'
        },
        // deviceId added via association
        keyType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'key_type' // 'pairwise', 'groupwise'
        },

        //deviceId || INTEGER (FOREIGN KEY, NOT NULL) || Links to the device that owns this key.


        //    peerDeviceId || INTEGER (FOREIGN KEY) || Links to a peer device (for pairwise keys).
        // peerGatewayId  || INTEGER (FOREIGN KEY)  || Links to a gateway (for groupwise keys).


        keyValueEncrypted: {
            type: DataTypes.TEXT,
            field: 'key_value_encrypted'  //Encrypted value of the key (stored securely).
        },
        keyVersion: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            field: 'key_version' // Version number for key rotation.
        },
        keyStatus: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'active', //Status of the key (active/expired/revoked).
            field: 'key_status'
        },
        validFrom: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'valid_from'  //Timestamp when the key becomes valid.
        },
        validUntil: {
            type: DataTypes.DATE,
            field: 'valid_until' //Timestamp when the key expires.
        },

        // Add unique indexes later if needed for composite keys
    })
}