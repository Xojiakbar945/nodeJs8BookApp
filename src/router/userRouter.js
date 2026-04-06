import express from 'express'
import userCtrl from "../controller/userCtrl.js";

const router = express.Router();

router.post('/signup', userCtrl.signUp)
router.post('/login', userCtrl.login)
router.get("/users", userCtrl.getAllUsers)
router.get("/users/:id", userCtrl.getOneUser)
router.delete("/users/:id", userCtrl.deleteUser)
router.put("/users/:id", userCtrl.UpdateUser)
router.get("/users", userCtrl.search)

export default router;