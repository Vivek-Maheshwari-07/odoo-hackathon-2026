const express = require('express');
const router = express.Router();
const { upload, getAssets, getAssetById, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAssets);
router.get('/:id', authMiddleware, getAssetById);
router.post('/', authMiddleware, upload.single('image'), createAsset);
router.put('/:id', authMiddleware, upload.single('image'), updateAsset);
router.delete('/:id', authMiddleware, deleteAsset);

module.exports = router;
