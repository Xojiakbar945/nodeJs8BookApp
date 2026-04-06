import express from 'express'
import categoryCtrl from "../controller/categoryCtrl.js";

const router = express.Router();

router.get("/category", categoryCtrl.getAllCategorys);
router.post("/category", categoryCtrl.addCategory);
router.get("/category/:id", categoryCtrl.getOneCategory);
router.put("/category/:id", categoryCtrl.UpdateCategory);
router.delete("/category/:id", categoryCtrl.deleteCategory);

export default router;