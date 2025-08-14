import products from "../../../DB/models/product-model.js";

export const createProduct = async (req, res, next) => {
  try {
    const { title, brand } = req.body;
    const existingProduct = await products.findOne({ title, brand });
    if (existingProduct) {
      const error = new Error("Product with this title and brand already exists.");
      error.statusCode = 400;
      return next(error);
    }

    const newProduct = await products.create(req.body);
    res.status(201).json({ 
      message: "Product created successfully", 
      product: newProduct 
    });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    let filter = {};
    let sort = { createdAt: -1 }; 
    
    const {
      title,
      brand,
      minPrice,
      maxPrice,
      inStock,
      minRating,
      maxRating,
      sortBy,
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    if (brand) filter.brand = { $regex: brand, $options: "i" };
    if (title) filter.title = { $regex: title, $options: "i" };
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") filter.stock = { $gt: 0 };
    else if (inStock === "false") filter.stock = 0;

    if (minRating || maxRating) {
      filter["ratings.average"] = {};
      if (minRating) filter["ratings.average"].$gte = Number(minRating);
      if (maxRating) filter["ratings.average"].$lte = Number(maxRating);
    }

    if (sortBy) {
      sort = {};
      sort[sortBy] = order === "asc" ? 1 : -1;
    }

    const skip = (page - 1) * limit;
    const allProducts = await products.find(filter)
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit));
    
    const total = await products.countDocuments(filter);

    res.status(200).json({
      message: "Products fetched successfully",
      total,
      page: Number(page),
      results: allProducts.length,
      allProducts,
    });
  } catch (err) {
    next(err);
  }
};

export const searchProducts = async (req, res, next) => {
  try {    
    const {
      q,
      brand,
      minPrice,
      maxPrice,
      inStock,
      minRating,
      sortBy = "relevance",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    let filter = {};
    let sort = {};

    if (q?.trim()) {
      filter.$or = [
        { title: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { brand: { $regex: q.trim(), $options: "i" } }
      ];
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    } else if (inStock === "false") {
      filter.stock = 0;
    }
    
    if (minRating && !isNaN(Number(minRating))) {
      filter["ratings.average"] = { $gte: Number(minRating) };
    }

    switch (sortBy) {
      case "price":
        sort = { price: order === "asc" ? 1 : -1 };
        break;
      case "rating":
        sort = { "ratings.average": order === "asc" ? 1 : -1 };
        break;
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "name":
        sort = { title: order === "asc" ? 1 : -1 };
        break;
      default: 
        sort = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const searchResults = await products.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await products.countDocuments(filter);

    const availableBrands = await products.distinct("brand");
    
    const priceAggregation = await products.aggregate([
      { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } }
    ]);
    const priceRange = priceAggregation.length > 0 
      ? { min: priceAggregation[0].minPrice, max: priceAggregation[0].maxPrice }
      : { min: 0, max: 1000 };

    res.status(200).json({
      message: "Search completed successfully",
      query: q || "",
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      results: searchResults.length,
      products: searchResults,
      suggestions: [],
      filters: { 
        brands: availableBrands, 
        priceRange: priceRange, 
        maxRating: 5 
      }
    });
  } catch (err) {
    console.error("Search error:", err);
    next(err);
  }
};

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    const results = await products.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: "^" + q.trim(), $options: "i" } },
            { brand: { $regex: "^" + q.trim(), $options: "i" } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: "$title" },
          brands: { $addToSet: "$brand" }
        }
      },
      {
        $project: {
          suggestions: {
            $slice: [
              { $setUnion: ["$titles", "$brands"] },
              8
            ]
          }
        }
      }
    ]);

    res.status(200).json({ 
      suggestions: results.length > 0 ? results[0].suggestions : [] 
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const productById = await products.findById(req.params.id);
    if (!productById) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(productById);
  } catch (err) {
    next(err);
  }
};

export const editProductById = async (req, res, next) => {
  try {
    const editProduct = await products.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!editProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(editProduct);
  } catch (err) {
    next(err);
  }
};

export const deletetProductById = async (req, res, next) => {  
  try {
    const deleteProduct = await products.findByIdAndDelete(req.params.id);
    if (!deleteProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(deleteProduct);
  } catch (err) {
    next(err);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const currentProduct = await products.findById(req.params.id);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const relatedProducts = await products.find({
      brand: currentProduct.brand,
      _id: { $ne: req.params.id },
    }).limit(3);

    res.status(200).json(relatedProducts);
  } catch (err) {
    next(err);
  }
};

