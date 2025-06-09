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

        deviceId:
        {
            type: DataTypes.INTEGER,
            field: 'device_id',
            as: 'device', // Alias for association
        },

        peerDeviceId:
        {
            type: DataTypes.INTEGER,
            field: 'peer_device_id',
            as: 'peerDevice',
        },

        //    peerDeviceId || INTEGER (FOREIGN KEY) || Links to a peer device (for pairwise keys).
        // peerGatewayId  || INTEGER (FOREIGN KEY)  || Links to a gateway (for groupwise keys).


        keyHash: {
            type: DataTypes.TEXT,
            field: 'key_encrypted'  //Encrypted value of the key (stored securely).
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
        
    } ,  {
            tableName: 'device_keys',
        })
}