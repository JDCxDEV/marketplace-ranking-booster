import express from 'express';
import { getRequestTriggerBooster, getTriggerDownloadProxies, getSystemInfo, getProducts } from '../controllers/boosterController.js';

const router = express.Router();

// Define your routes
router.post('/run-function', getRequestTriggerBooster);
router.post('/refresh-proxies', getTriggerDownloadProxies);
router.post('/get-system-info', getSystemInfo);
router.post('/get-products', getProducts);

export default router;