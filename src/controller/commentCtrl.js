import JWT from 'jsonwebtoken'
import { v4 } from 'uuid';

import Comment from "../model/commentModel.js";
import Book from "../model/bookModel.js";
import User from "../model/userModel.js";


const commentCtrl = {
    addComment: async (req, res) => {
        try {
            const { token } = req.headers;
            const { content } = req.body;
            const { bookId } = req.params;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)

            if (req.body && req.body.content != undefined) {

                const book = await Book.findById(bookId);

                if (!book) {
                    return res.status(404).send({ message: "Book not found" })
                }
                req.body.bookId = bookId;
                req.body.userId = currentUser._id;
                console.log(req.body);
                const comment = await Comment.create(req.body)
                return res.status(200).send({ message: "comment created successfully", comment })
            } else {
                return res.status(403).send({ message: "Please all fields are required" })
            }

        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message })
        }
    },
    getComment: async (req, res) => {
        try {
            const { id } = req.params;
            const comment = await Comment.findById(id)
            if (!comment) {
                return res.status(404).send({ message: "Comment not found" })
            }
            const author = await User.findById(comment.userId)
            delete author._doc.password
            delete author._doc.role
            comment._doc.author = author
            res.status(200).send({ message: "Comment found", comment })
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    UpdateComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)

            if (currentUser.role == "admin") {
                return res.status(405).send({ message: "Not allowed" })
            }

            let comment = await Comment.findById(id)
            if (!comment) {
                return res.status(404).send({ message: "Comment not found" })
            }


            const updatedComment = await Comment.findByIdAndUpdate(id, req.body, { new: true });
            return res.status(200).send({ message: "Comment updated successfully", comment: updatedComment });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message })
        }
    },
     deleteComment: async (req, res) => {
            try {
                const { id } = req.params;
                const { token } = req.headers;

                if (!token) return res.status(401).send({ message: "Token is required" })

                const currentUser = JWT.decode(token)

                if (currentUser.role !== "admin" || currentUser._id !== id) {

                    const comment = await Comment.findByIdAndDelete(id);
                    if (!comment) {
                        return res.status(404).send({ message: "Comment not found" })
                    }
                    return res.status(200).send({ message: "Comment deleted successfully", comment })
                }

                res.status(405).send({ message: "Not allowed" })
            } catch (error) {
                console.log(error);
                res.status(503).send({ message: error.message })
            }
        }
}

export default commentCtrl;