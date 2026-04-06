import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            minLength: 2,
        },
        userId: {
            type: String,
            required: true,
        },
        bookId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,

    }
);


export default mongoose.model("Comment", commentSchema);