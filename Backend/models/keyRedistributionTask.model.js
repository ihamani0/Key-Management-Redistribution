export default (sequelize, DataTypes) => {
    return sequelize.define("KeyRedistributionTask", {
        taskId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'task_id'
        },
        taskType: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'task_type' //Type of task (e.g.,"provision_device""rotate_key").
        },
        // targetDeviceId,  
        targetDeviceId: {
            type: DataTypes.INTEGER,
            field: 'target_device_id',
            as:'device'
        },
        // targetSubsetId, 
        targetSubsetId: {
            type: DataTypes.INTEGER,
            field: 'target_subset_id',
            as:'subset'
        },
        // targetGatewayId, 
        targetGatewayId: {
            type: DataTypes.INTEGER,
            field: 'target_gateway_id',
            as:'gateway'
        },
        // initiatedByUserId 
        initiatedByUserId: {
            type: DataTypes.INTEGER,
            field: 'initiate_by_user_id',
            as : 'user'
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'pending' //Current status (pending/scheduled/running/completed/failed).
        },
        scheduledAt: {
            type: DataTypes.DATE,
            field: 'scheduled_at' // Timestamp when the task is scheduled to execute.
        },
        payload: {
            type: DataTypes.JSONB // Data required for the task (e.g., secrets, device IDs)
        },
        resultMessage: {
            type: DataTypes.TEXT,
            field: 'result_message' // Result of the task (e.g., success/failure message).
        },
        startedAt: {
            type: DataTypes.DATE,
            field: 'started_at'
        },
        completedAt: {
            type: DataTypes.DATE,
            field: 'completed_at'
        },

    }, {
        tableName: 'key_redistribution_tasks',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    })
}