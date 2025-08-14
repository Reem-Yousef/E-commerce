// import Cart from "../../../DB/models/cart-model.js";
// import product from "../../../DB/models/product-model.js";

// export const addToCart = async (req, res, next) => {
//   try {
//     const productId = req.body.id;
//     if (!productId) {
//       return res
//         .status(400)
//         .json({ error: "Product ID is required in request body" });
//     }
//     const addedProduct = await product.findById(productId);
//     if (!addedProduct) {
//       return res.status(404).json({ error: "product not found" });
//     }

//     let userCart = await Cart.findOne({ user: req.user.id });
//     if (!userCart) {
//       userCart = new Cart({ user: req.user.id, items: [] });
//     }

//     const existingItemIndex = userCart.items.findIndex(
//       (item) => item.product.toString() === productId
//     );
//     if (existingItemIndex >= 0) {
//       userCart.items[existingItemIndex].quantity += 1;
//     } else {
//       userCart.items.push({ product: productId, quantity: 1 });
//     }

//     await userCart.save();

//     console.log("Product to add:", addedProduct);
//     res
//       .status(200)
//       .json({ message: "Product added to cart successfully", cart: userCart });
//   } catch (err) {
//     next(err);
//   }
// };

// export const getCart = async (req, res, next) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id }).populate(
//       "items.product"
//     );
//     if (!cart) {
//       return res.status(404).json({ message: "cart not found" });
//     }
//     res.status(200).json(cart);
//   } catch (err) {
//     next(err);
//   }
// };

// export const updateQuantity = async (req, res, next) => {
//   try {
//     const { productId, quantity } = req.body;
//     if (!productId || quantity < 1) {
//       return res
//         .status(404)
//         .json({ message: "Valid product ID and quantity required" });
//     }

//     const cart = await Cart.findOne({ user: req.user.id });
//     if (!cart) {
//       return res.status(404).json({ message: "cart not found" });
//     }

//     const itemIndex = cart.items.findIndex(
//       (item) => item.product.toString() === productId
//     );
//     if (itemIndex === -1) {
//       return res.status(404).json({ message: "no product in cart" });
//     }

//     cart.items[itemIndex].quantity = quantity;
//     await cart.save();
//     res.status(200).json({ message: "Quantity updated: ", cart });
//   } catch (err) {
//     next(err);
//   }
// };

// export const removeFromCart = async (req, res, next) => {
//   try {
//     const { productId } = req.body;
//     const cart = await Cart.findOne({ user: req.user.id });
//     if (!cart) {
//       return res.status(404).json({ message: "cart cot found" });
//     }

//     cart.items = cart.items.filter(
//       (item) => item.product.toString() === productId
//     );

//     await cart.save();
//     res.status(200).json({ message: "product removed : ", cart });
//   } catch (err) {
//     next(err);
//   }
// };

// export const clearCart = async (req, res, next) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id });
//     if (!cart) return res.status(404).json({ message: "Cart not found" });

//     cart.items = [];
//     await cart.save();
//     res.status(200).json({ message: "Cart cleared", cart });
//   } catch (err) {
//     next(err);
//   }
// };

import Cart from "../../../DB/models/cart-model.js";
import product from "../../../DB/models/product-model.js";

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ error: "Product ID is required in request body" });
    }
    const addedProduct = await product.findById(productId);
    if (!addedProduct) {
      return res.status(404).json({ error: "product not found" });
    }

    let userCart = await Cart.findOne({ user: req.user.id });
    if (!userCart) {
      userCart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItemIndex = userCart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (existingItemIndex >= 0) {
      userCart.items[existingItemIndex].quantity += quantity;
    } else {
      userCart.items.push({ product: productId, quantity: quantity });
    }

    await userCart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    console.log("Product added to cart:", addedProduct);
    res.status(200).json({
      message: "Product added to cart successfully",
      cart: populatedCart,
    });
  } catch (err) {
    console.error("Add to cart error:", err);
    next(err);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    if (!cart) {
      return res.status(200).json({
        _id: null,
        user: req.user.id,
        items: [],
        message: "Cart is empty",
      });
    }
    res.status(200).json(cart);
  } catch (err) {
    console.error("Get cart error:", err);
    next(err);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity < 1) {
      return res
        .status(404)
        .json({ message: "Valid product ID and quantity required" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "no product in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Update quantity error:", err);
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "cart cot found" });
    }
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );
    res.status(200).json(populatedCart);
  } catch (err) {
    console.error("Remove from cart error:", err);
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    res.status(200).json({
      _id: cart._id,
      user: cart.user,
      items: [],
      message: "Cart cleared",
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    next(err);
  }
};
