import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const Subset = sequelize.define('Subset', {
    subsetName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'subset_name',
    },
    subsetIdentifier: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Assumed unique for the single IoT network
        field: 'subset_identifier',
    },
    description: {
        type: DataTypes.TEXT,
    },
    // previousSubsetId and nextSubsetId will be defined via associations

    // previousSubsetId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    //     field: 'previous_subset_id',
    // },
    // nextSubsetId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    //     field: 'next_subset_id',
    // }


}, {
    tableName: 'subsets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})

export default Subset; 