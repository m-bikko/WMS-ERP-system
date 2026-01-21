import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStock extends Document {
    product: mongoose.Types.ObjectId;
    warehouse: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    quantity: number;
    minQuantity: number;
    createdAt: Date;
    updatedAt: Date;
}

const StockSchema: Schema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        quantity: { type: Number, required: true, default: 0 },
        minQuantity: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Compound index to ensure a product only has one stock entry per warehouse
StockSchema.index({ product: 1, warehouse: 1 }, { unique: true });

const Stock: Model<IStock> =
    mongoose.models.Stock || mongoose.model<IStock>('Stock', StockSchema);

export default Stock;
