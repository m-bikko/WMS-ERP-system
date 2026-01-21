import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBarcode {
    type: 'EAN8' | 'EAN13' | 'Code128' | 'GTIN' | 'UPC';
    value: string;
}

export interface IProduct extends Document {
    category: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId;
    name: string;
    photos: string[]; // URLs
    description?: string;
    article?: string;
    code?: string;
    externalCode?: string;
    price: number;
    discountPrice?: number;
    isDiscountActive: boolean;
    characteristics: Record<string, string>;
    country: string;
    unit: string;
    barcodes: IBarcode[];
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
    {
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        photos: {
            type: [String],
            validate: [arrayLimit, '{PATH} exceeds the limit of 10']
        },
        description: { type: String, maxlength: 5000 },
        article: { type: String },
        code: { type: String },
        externalCode: { type: String },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        isDiscountActive: { type: Boolean, default: false },
        characteristics: { type: Map, of: String },
        country: { type: String, required: true },
        unit: { type: String, required: true },
        barcodes: [
            {
                type: {
                    type: String,
                    enum: ['EAN8', 'EAN13', 'Code128', 'GTIN', 'UPC'],
                    required: true
                },
                value: { type: String, required: true }
            }
        ]
    },
    { timestamps: true }
);

function arrayLimit(val: string[]) {
    return val.length <= 10;
}

const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
