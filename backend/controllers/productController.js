import * as productModel from '../models/productModel.js';

export const getProducts = async (req, res) => {
  try {
    const { category, cursor, limit } = req.query;
    const result = await productModel.getProducts({ category, cursor, limit });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
