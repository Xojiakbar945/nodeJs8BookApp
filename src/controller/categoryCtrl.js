import JWT from 'jsonwebtoken'
import { v4 } from 'uuid';

import fs from 'fs';
import path from 'path';

import Category from "../model/categoryModel.js";
import Book from "../model/bookModel.js";


const categoryCtrl = {
    addCategory: async (req, res) => {
        try {
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)

            if (currentUser.role == "admin") {
                if (req.files && req.body && req.body.title) {
                    const { image } = req.files;
                    const { title } = req.body;

                    const oldCategory = await Category.findOne({ title });

                    if (oldCategory) {
                        return res.status(400).send({ message: "This is category already exists" })
                    }

                    const format = image.mimetype.split('/')[1]
                    if (format != "png" && format != "jpeg") {
                        return res.status(403).send({ message: "file format is wrong" })
                    }

                    const nameImg = v4() + '.' + format;
                    image.mv(path.join("src", "files", nameImg), (err) => {
                        if (err) {
                            throw err
                        }
                    })
                    req.body.image = nameImg;

                    const category = await Category.create(req.body)


                    return res.status(200).send({ message: "category created successfully", category })
                }
            }

            res.status(405).send({ message: "Not allowed" })
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message })
        }
    },
    getAllCategorys: async (req, res) => {
        try {
            const categorys = await Category.find()
            if (!categorys.length) {
                return res.status(404).send({ message: "No categories found", categorys: [] })
            }
            res.status(200).send({ message: "All categories", categorys })
        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    getOneCategory: async (req, res) => {
        try {
            const { id } = req.params;
            let category = await Category.findById(id)

            if (category) {
                const books = await Book.find({ categoryId: id })
                category._doc.books = books
                return res.status(200).send({ message: "category found", category });

            } else {
                res.status(404).send({ message: "category not found" })
            }


        } catch (error) {
            res.status(503).send({ message: error.message })
        }
    },
    UpdateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { token } = req.headers;

            if (!token) return res.status(401).send({ message: "Token is required" })

            const currentUser = JWT.decode(token)

            if (currentUser.role !== "admin") {
                return res.status(405).send({ message: "Not allowed" })
            }

            let category = await Category.findById(id)
            if (!category) {
                return res.status(404).send({ message: "Category not found" })
            }

            if (req.files && req.files.image) {
                const { image } = req.files;
                const format = image.mimetype.split('/')[1];
                if (format !== "png" && format !== "jpeg") {
                    return res.status(403).send({ message: "file format is wrong" })
                }

                const nameImg = v4() + '.' + format;
                image.mv(path.join("src", "files", nameImg), (err) => {
                    if (err) throw err;
                });

                if (category.image) {
                    fs.unlink(path.join('src', 'files', category.image), (err) => {
                        if (err) console.log(err);
                    });
                }
                req.body.image = nameImg;
            }


            const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
            return res.status(200).send({ message: "Category updated successfully", category: updatedCategory });
        } catch (error) {
            console.log(error);
            res.status(503).send({ message: error.message })
        }
    },
     deleteCategory: async (req, res) => {
            try {
                const { id } = req.params;
                const { token } = req.headers;
    
                if (!token) return res.status(401).send({ message: "Token is required" })
    
                const currentUser = JWT.decode(token)
    
                if (currentUser.role == "admin") {
    
                    const category = await Category.findByIdAndDelete(id);
                    if (!category) {
                        return res.status(404).send({ message: "Category not found" })
                    }
                    if (category.avatar) {
                        await fs.unlink(path.join('src', 'files', category.avatar), (err) => {
                            if (err) throw err;
                            console.log('avatar was deleted');
                        })
                    }
    
    
                    return res.status(200).send({ message: "Category deleted successfully", category })
                }
    
                res.status(405).send({ message: "Not allowed" })
            } catch (error) {
                console.log(error);
                res.status(503).send({ message: error.message })
            }
        }
}

export default categoryCtrl;