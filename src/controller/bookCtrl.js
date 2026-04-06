import JWT from 'jsonwebtoken'
import { v4 } from 'uuid'
import Book from "../model/bookModel.js";
import Comment from "../model/commentModel.js";

import fs from 'fs';
import path from 'path';


const bookCtrl = {
    addBook: async (req, res) => {
        try {
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)

            if (req.files && req.body.author && req.body.categoryId && req.body.title != undefined) {
                const { image, file } = req.files;
                const { title, author } = req.body;
                req.body.ownerId = currentUser._id;

                const format = image.mimetype.split('/')[1]
                if (format != "png" && format != "jpeg") {
                    return res.status(403).send({ message: "image file format is wrong" })
                }

                const nameImg = v4() + '.' + format;
                image.mv(path.join("src", "files", nameImg), (err) => {
                    if (err) {
                        throw err
                    }
                })
                req.body.image = nameImg;

                // book file

                const formatFile = file.mimetype.split('/')[0]

                if (formatFile != "pdf" && formatFile != "text") {
                    return res.status(403).send({ message: "file format is wrong pdf or text" })
                }

                const nameFile = v4() + '.' + formatFile;
                file.mv(path.join("src", "files", nameFile), (err) => {
                    if (err) {
                        throw err
                    }
                })
                req.body.bookFile = nameFile;

                const book = await Book.create(req.body)
                return res.status(200).send({ message: "book created successfully", book })
            }

        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message })
        }
    },
    download: async (req, res) => {
        try {
            const { id } = req.params;
            const book = await Book.findById(id)
            if (!book) {
                return res.status(404).send({ message: "Book not found" })
            }

            await Book.updateOne({ $inc: { downloadCount: 1 } })

            res.status(200).download(path.join("src", "files", book.bookFile))
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    getBook: async (req, res) => {
        try {
            const { id } = req.params;
            const book = await Book.findById(id)
            if (!book) {
                return res.status(404).send({ message: "Book not found" })
            }
            const comments = await Comment.find({ bookId: id })
            book._doc.comments = comments
            res.status(200).send({ message: "Book found", book })
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    UpdateBook: async (req, res) => {
        try {
            const { id } = req.params;
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)

            req.body.ownerId = currentUser._id;

            let book = await Book.findById(id)
            if (!book) {
                return res.status(404).send({ message: "Book not found" })
            }

            if (req.files && req.files.image) {
                const { image, file } = req.files;
                const format = image.mimetype.split('/')[1];
                if (format !== "png" && format !== "jpeg") {
                    return res.status(403).send({ message: "file format is wrong" })
                }

                const nameImg = v4() + '.' + format;
                image.mv(path.join("src", "files", nameImg), (err) => {
                    if (err) throw err;
                });

                //book file
                const formatFile = file.mimetype.split('/')[1];
                if (formatFile !== "pdf" && formatFile !== "doc") {
                    return res.status(403).send({ message: "file format is wrong" })
                }

                const nameFile = v4() + '.' + formatFile;
                file.mv(path.join("src", "files", nameFile), (err) => {
                    if (err) throw err;
                });

                if (book.image) {
                    fs.unlink(path.join('src', 'files', book.image), (err) => {
                        if (err) console.log(err);
                    });
                }
                req.body.image = nameImg;
            }


            const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true });
            return res.status(200).send({ message: "Book updated successfully", book: updatedBook });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message })
        }
    },
    deleteBook: async (req, res) => {
        try {
            const { id } = req.params;
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)

            if (currentUser.role !== "admin" || currentUser._id !== id) {
                const book = await Book.findByIdAndDelete(id);

                if (!book) {
                    return res.status(404).send({ message: "Book not found" })
                }
                const bookComments = await Comment.find({ bookId: id })

                bookComments.forEach(async (comment) => {
                    await Comment.findByIdAndDelete(comment._id)
                })

                if (book.image) {
                    await fs.unlink(path.join('src', 'files', book.image), (err) => {
                        if (err) throw err;
                        console.log('avatar was deleted');
                    })
                }

                // book file
                if (book.bookFile) {
                    await fs.unlink(path.join('src', 'files', book.bookFile), (err) => {
                        if (err) throw err;
                        console.log('book file was deleted');
                    })
                }
                return res.status(200).send({ message: "Book deleted successfully", book })
            }

        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message })
        }
    },
    like: async (req, res) => {
        try {
            const { bookId } = req.params;
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)
            const userId = currentUser._id;

            const book = await Book.findById(bookId);
            if (!book) {
                return res.status(404).send({ message: "Book not found" })
            }

            if (book.like.includes(userId)) {
                await Book.updateOne({ $pull: { like: userId } })
                return res.status(200).send({ message: "Like unliked successfully" })
            } else {
                if (book.dislike.includes(userId)) {
                    await Book.updateOne({ $pull: { dislike: userId } })
                }
                await Book.updateOne({ $push: { like: userId } })
                return res.status(200).send({ message: "Like added successfully" })
            }
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    dislike: async (req, res) => {
        try {
            const { bookId } = req.params;
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)
            const userId = currentUser._id;

            const book = await Book.findById(bookId);
            if (!book) {
                return res.status(404).send({ message: "Book not found" })
            }

            if (book.dislike.includes(userId)) {
                await Book.updateOne({ $pull: { dislike: userId } })
                return res.status(200).send({ message: "Dislike removed successfully" })
            } else {
                if (book.like.includes(userId)) {
                    await Book.updateOne({ $pull: { like: userId } })
                }
                await Book.updateOne({ $push: { dislike: userId } })
                return res.status(200).send({ message: "Dislike added successfully" })
            }
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    search: async (req, res) => {
        try {
            const { searchTermin } = req.query;

            const key = new RegExp(searchTermin, 'i');

            const searchResult = await Book.find({ $or: [{ title: { $regex: key } }, { author: { $regex: key } }] }).populate("categoryId", "name");
            res.status(200).send({ message: "Search results", data: searchResult })
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },

}

export default bookCtrl;