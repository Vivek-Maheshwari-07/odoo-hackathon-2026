const express = require('express');
const router = express.Router();
const { upload, getAssets, getAssetById, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getAssets);
router.get('/:id', authMiddleware, getAssetById);
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), upload.single('image'), createAsset);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), upload.single('image'), updateAsset);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), deleteAsset);

module.exports = router;
