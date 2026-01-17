import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWarehouse extends Document {
    name: string;
    address: string;
    addressComment?: string;
    comment?: string;
    code: string;
    group?: string;
    createdAt: Date;
    updatedAt: Date;
}

const WarehouseSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        addressComment: { type: String },
        comment: { type: String },
        code: { type: String, required: true, unique: true },
        group: { type: String },
    },
    { timestamps: true }
);

// Prevent overwrite on HMR
const Warehouse: Model<IWarehouse> =
    mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);

export default Warehouse;
