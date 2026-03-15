export const PostImageModel = (sequelize: any, DataTypes: any) => {
    const PostImages = sequelize.define(
        'PostImages',
        {
            number: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            userid: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            path: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: false,
        }
    );
    return PostImages;
};
