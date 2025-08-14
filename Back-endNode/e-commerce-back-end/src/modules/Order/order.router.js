import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../../../DB/models/checkout-model.js";
import { createOrderBodySchema, createCheckoutSessionSchema } from "./order.validation.js";
import { placeOrder, GetAllOrders } from "../../modules/Order/order-controller.js";
import { isAuth } from "../../middleware/isauthMiddleware.js";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const allowedStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "completed",
];

router.get("/orders", isAuth, GetAllOrders);

router.post("/", async (req, res, next) => {
  try {
    const { error } = createOrderBodySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { user, items, shippingAddress, phoneNumbers, totalAmount } = req.body;

    const newOrder = new Order({
      user,
      items,
      shippingAddress,
      phoneNumbers,
      totalAmount,
      status: [{ step: "pending", time: new Date() }],
      deliveryStatus: "pending",
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully!",
      orderId: newOrder._id,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/checkout", isAuth, placeOrder);

router.post("/create-checkout-session", isAuth, async (req, res, next) => {
  try {
    console.log("📝 Received payload:", req.body);
    console.log("👤 User ID:", req.user?.id);

    const { error } = createCheckoutSessionSchema.validate(req.body);
    if (error) {
      console.error("❌ Validation error:", error.details);
      return res.status(400).json({ 
        error: error.details[0].message,
        details: error.details 
      });
    }

    const { items, shippingAddress, phoneNumbers, totalAmount } = req.body;

    const newOrder = new Order({
      user: req.user.id,
      username: req.user.username || '',
      email: req.user.email || '',
      items,
      shippingAddress,
      phoneNumbers,
      totalAmount,
      status: [{ step: "pending", time: new Date() }],
      deliveryStatus: "pending",
    });

    await newOrder.save();
    console.log("💾 Order saved:", newOrder._id);

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Product ${item.product}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:`${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: req.user.id,
      },
      customer_email: req.user.email,
    });

    console.log("✅ Stripe session created:", session.id);

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
      orderId: newOrder._id,
    });

  } catch (error) {
    console.error("❌ Stripe session error:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Session ID is required" 
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const orderId = session.metadata.orderId;

      await Order.findByIdAndUpdate(orderId, { 
        deliveryStatus: "completed",
        stripeSessionId: sessionId,
        paidAt: new Date(),
      });

      res.json({
        success: true,
        message: "Payment verified successfully",
        session: {
          id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
        payment_status: session.payment_status,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
});

export default router;