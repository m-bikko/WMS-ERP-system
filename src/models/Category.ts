import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    parent?: mongoose.Types.ObjectId; // null if root
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    },
    { timestamps: true }
);

const Category: Model<ICategory> =
    mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
