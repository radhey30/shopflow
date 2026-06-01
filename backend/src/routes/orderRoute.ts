import { Router } from "express";
import { protect, restrict } from "../middleware/auth";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/orderController";

const router = Router();

router.use(protect);

router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrder);

router.get("/", protect, restrict("admin"), getAllOrders);
router.put("/:id/status", restrict("admin"), updateOrderStatus);

export default router;
