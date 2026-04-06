import express from 'express'
import commentCtrl from '../controller/commentCtrl.js';

const router = express.Router();

router.post("/comment/:bookId", commentCtrl.addComment);
router.get("/comment/:id", commentCtrl.getComment);
router.delete("/comment/:id", commentCtrl.deleteComment);
router.put("/comment/:id", commentCtrl.UpdateComment);


export default router;