

export default (sequelize, DataTypes) => {

  return  sequelize.define(
    "User",
    {
      // Auto-generated "id" field is created by Sequelize by default (primary key)
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'admin',
      },
      last_login_at: {
        type: DataTypes.DATE, // Sequelize handles TIMESTAMP WITH TIME ZONE as DATE
      },

    }, //finish defining coulumn
    {
      tableName: 'users',
      timestamps: true, // Enables createdAt and updatedAt
      createdAt: 'created_at', // Map to snake_case
      updatedAt: 'updated_at', // Map to snake_case
    }
  );
}


