import Order from "../../../DB/models/checkout-model.js";
import Cart from "../../../DB/models/cart-model.js";

export const placeOrder = async (req, res, next) => {
  try {
    console.log('📝 Place order request from user:', req.user?.id);
    
    // Check if user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { shippingAddress, phoneNumbers } = req.body;

    // Validate required fields
    if (!shippingAddress || !phoneNumbers || phoneNumbers.length === 0) {
      return res.status(400).json({ 
        message: "Missing shipping address or phone numbers",
        required: {
          shippingAddress: "Required fields: address, city, postalCode, country",
          phoneNumbers: "At least one phone number is required"
        }
      });
    }

    // Validate shipping address fields
    const requiredAddressFields = ['address', 'city', 'postalCode', 'country'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res.status(400).json({ 
          message: `Missing required shipping address field: ${field} `
        });
      }
    }

    // Prepare order items
    const items = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Create new order
    const newOrder = new Order({
      user: req.user.id,
      username: req.user.username || '',
      email: req.user.email || '',
      items,
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country
      },
      phoneNumbers,
      totalAmount,
      status: [{ step: "pending", time: new Date() }],
      deliveryStatus: "pending",
    });

    // Save order
    await newOrder.save();
    console.log('💾 Order created:', newOrder._id);

    // Clear user's cart after successful order
    await Cart.findOneAndDelete({ user: req.user.id });
    console.log('🗑 Cart cleared for user:', req.user.id);

    res.status(201).json({ 
      message: "Order created successfully", 
      order: {
        id: newOrder._id,
        totalAmount: newOrder.totalAmount,
        deliveryStatus: newOrder.deliveryStatus,
        orderedAt: newOrder.orderedAt
      }
    });

  } catch (err) {
    console.error('❌ Place order error:', err);
    next(err);
  }
};

export const GetAllOrders = async (req, res, next) => {
  try {
    console.log('📋 Getting orders for user:', req.user?.id);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const orders = await Order.find({ user: req.user.id })
      .sort({ orderedAt: -1 })
      .populate("items.product")
      .select('-__v'); // Exclude version key

    console.log(`📦 Found ${orders.length} orders for user:, req.user.id`);

    res.status(200).json({ 
      success: true,
      count: orders.length,
      orders 
    });

  } catch (err) {
    console.error('❌ Get orders error:', err);
    next(err);
  }
};

// Additional controller functions
export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.id 
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      success: true,
      order 
    });

  } catch (err) {
    console.error('❌ Get order by ID error:', err);
    next(err);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const order = await Order.findOne({ 
      _id: orderId, 
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order can be cancelled
    if (order.deliveryStatus === 'delivered' || order.deliveryStatus === 'cancelled') {
      return res.status(400).json({ 
        message: `Cannot cancel order that is ${order.deliveryStatus}` 
      });
    }

    // Update order status
    order.status.push({ step: "cancelled", time: new Date() });
    order.deliveryStatus = "cancelled";
    
    await order.save();

    res.status(200).json({ 
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        deliveryStatus: order.deliveryStatus
      }
    });

  } catch (err) {
    console.error('❌ Cancel order error:', err);
    next(err);
  }
};