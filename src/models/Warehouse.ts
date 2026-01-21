import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWarehouse extends Document {
    name: string;
    address: string;
    addressComment?: string;
    comment?: string;
    code: string;
    group?: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const WarehouseSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String, required: true },
        addressComment: { type: String },
        comment: { type: String },
        code: { type: String, required: true },
        group: { type: String },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

// Compound index for unique code per owner
WarehouseSchema.index({ owner: 1, code: 1 }, { unique: true });

// Prevent overwrite on HMR
const Warehouse: Model<IWarehouse> =
    mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);

export default Warehouse;
