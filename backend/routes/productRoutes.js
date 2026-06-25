import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

router.get('/', productController.getProducts);

export default router;
