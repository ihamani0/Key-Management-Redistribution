export default (sequelize, DataTypes) => {
  return sequelize.define('AuditLog', {
    auditId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'audit_id'
    },
    tableName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'table_name'
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'record_id'
    },
    operation: {
      type: DataTypes.ENUM('INSERT', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    oldData: {
      type: DataTypes.JSONB,
      field: 'old_data'
    },
    newData: {
      type: DataTypes.JSONB,
      field: 'new_data'
    },
    changedAt: {
      type: DataTypes.DATE,
      field: 'changed_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'audit_logs',
    timestamps: false,
    underscored: true
  });
}