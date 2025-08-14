import Wishlist from "../../../DB/models/wish-list-model.js";

export const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        products: [{ product: productId }],
      });
      return res.status(201).json({ 
        status: "added", 
        message: "Product added to wishlist",
        wishlist 
      });
    }

    const exists = wishlist.products.find(
      (p) => p.product.toString() === productId
    );

    if (exists) {
      wishlist.products = wishlist.products.filter(
        (p) => p.product.toString() !== productId
      );
      await wishlist.save();
      return res.status(200).json({ 
        status: "removed", 
        message: "Product removed from wishlist",
        wishlist 
      });
    }

    if (wishlist.products.length >= 20) {
      return res
        .status(400)
        .json({ 
          status: "error",
          message: "Maximum wishlist limit reached (20 items)" 
        });
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();
    res.status(200).json({ 
      status: "added", 
      message: "Product added to wishlist",
      wishlist 
    });
  } catch (err) {
    next(err);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products.product"
    );

    if (!wishlist) {
      return res.status(200).json({ 
        products: [],
        message: "Wishlist is empty" 
      });
    }

    // Filter out products that might have been deleted
    wishlist.products = wishlist.products.filter((p) => p.product !== null);

    res.status(200).json({
      ...wishlist.toObject(),
      message: "Wishlist retrieved successfully"
    });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({ 
        status: "error",
        message: "Wishlist not found" 
      });
    }

    const productExists = wishlist.products.some(
      (p) => p.product.toString() === productId
    );

    if (!productExists) {
      return res.status(404).json({ 
        status: "error",
        message: "Product not found in wishlist" 
      });
    }

    wishlist.products = wishlist.products.filter(
      (p) => p.product.toString() !== productId
    );
    
    await wishlist.save();

    res.status(200).json({ 
      status: "removed", 
      message: "Product removed from wishlist",
      wishlist 
    });
  } catch (err) {
    next(err);
  }
};