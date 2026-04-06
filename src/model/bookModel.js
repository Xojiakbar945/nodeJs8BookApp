import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 3,
        },
        author: {
            type: String,
            required: true,
            minLength: 3,
        },
        downloadCount: {
            type: Number,
            required: true,
            default: 0,
        },
        like: {
            type: Array,
            default: [],
        },
        dislike: {
            type: Array,
            default: [],
        },
        image: {
            type: String,
            required: true,
        },
        bookFile: {
            type: String,
            required: true,
        },
        ownerId: {
            type: String,
            required: true,
        },
        categoryId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,

    }
);


export default mongoose.model("Book", bookSchema);