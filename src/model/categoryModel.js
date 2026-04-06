import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 5,
        },
        image: {
            type: String,
            required: true,
        },
        countBook: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,

    }
);


export default mongoose.model("Category", categorySchema);