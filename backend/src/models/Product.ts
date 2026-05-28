import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string[];
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

export interface IProductModel extends Model<IProductDocument> {
  findByCategory(category: string): Promise<IProductDocument[]>;
}

const productSchema = new mongoose.Schema<IProductDocument, IProductModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    image: [{ type: String }],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ name: "text", description: "text" });

productSchema.statics.findByCategory = async function (
  category: string,
): Promise<IProductDocument[]> {
  return this.find({ category, isActive: true });
};

const Product = mongoose.model<IProductDocument, IProductModel>(
  "Product",
  productSchema,
);

export default Product;
