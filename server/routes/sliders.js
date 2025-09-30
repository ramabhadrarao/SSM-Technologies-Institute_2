const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');
const {
  getAllSliders,
  getActiveSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
  setDefaultSlider,
  reorderSliders
} = require('../controllers/sliderController');

// Public routes
router.get('/active', getActiveSliders);

// Admin routes (require authentication and admin role)
router.get('/', auth, adminAuth, getAllSliders);
router.get('/:id', auth, adminAuth, getSliderById);
router.post('/', auth, adminAuth, (req, res, next) => {
  console.log('Before multer - Headers:', req.headers);
  console.log('Before multer - Body:', req.body);
  next();
}, uploadConfigs.slider.single('image'), (req, res, next) => {
  console.log('After multer - Body:', req.body);
  console.log('After multer - File:', req.file);
  next();
}, createSlider);
router.put('/:id', auth, adminAuth, uploadConfigs.slider.single('image'), updateSlider);
router.delete('/:id', auth, adminAuth, deleteSlider);
router.patch('/:id/default', auth, adminAuth, setDefaultSlider);
router.patch('/reorder', auth, adminAuth, reorderSliders);

module.exports = router;