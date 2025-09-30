const Slider = require('../models/Slider');

// Get all sliders (admin)
const getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    console.error('Error fetching sliders:', error);
    res.status(500).json({ message: 'Error fetching sliders', error: error.message });
  }
};

// Get active sliders (public)
const getActiveSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    console.error('Error fetching active sliders:', error);
    res.status(500).json({ message: 'Error fetching active sliders', error: error.message });
  }
};

// Get slider by ID
const getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    res.json(slider);
  } catch (error) {
    console.error('Error fetching slider:', error);
    res.status(500).json({ message: 'Error fetching slider', error: error.message });
  }
};

// Create new slider
const createSlider = async (req, res) => {
  try {
    console.log('=== SLIDER CREATION DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    console.log('req.headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('=== END DEBUG ===');

    const { title, description, buttonText, buttonLink, order, isActive, isDefault } = req.body;
    
    const sliderData = {
      title,
      description,
      buttonText: buttonText || 'Learn More',
      buttonLink: buttonLink || '#',
      order: parseInt(order) || 0,
      isActive: isActive === 'true' || isActive === true,
      isDefault: isDefault === 'true' || isDefault === true
    };

    // Only include imageUrl if file was uploaded
    if (req.file) {
      sliderData.imageUrl = `/uploads/sliders/${req.file.filename}`;
    }

    console.log('Final sliderData:', sliderData);

    const slider = new Slider(sliderData);
    await slider.save();

    res.status(201).json({
      success: true,
      data: slider
    });
  } catch (error) {
    console.error('Error creating slider:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating slider',
      error: error.message
    });
  }
};

// Update slider
const updateSlider = async (req, res) => {
  try {
    const { title, description, buttonText, buttonLink, order, isActive, isDefault } = req.body;
    
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    // If this is set as default, remove default from other sliders
    if (isDefault === 'true' || isDefault === true) {
      await Slider.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }

    // Update image if new file uploaded
    if (req.file) {
      // Delete old image file if it exists
      if (slider.imageUrl && slider.imageUrl.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', slider.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      slider.imageUrl = `/uploads/sliders/${req.file.filename}`;
    }

    // Update other fields
    slider.title = title || slider.title;
    slider.description = description || slider.description;
    slider.buttonText = buttonText || slider.buttonText;
    slider.buttonLink = buttonLink || slider.buttonLink;
    slider.order = order !== undefined ? parseInt(order) : slider.order;
    slider.isActive = isActive !== undefined ? isActive !== 'false' : slider.isActive;
    slider.isDefault = isDefault !== undefined ? (isDefault === 'true' || isDefault === true) : slider.isDefault;

    const updatedSlider = await slider.save();
    res.json(updatedSlider);
  } catch (error) {
    console.error('Error updating slider:', error);
    res.status(500).json({ message: 'Error updating slider', error: error.message });
  }
};

// Delete slider
const deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    // Delete image file if it exists
    if (slider.imageUrl && slider.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', slider.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Slider.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    console.error('Error deleting slider:', error);
    res.status(500).json({ message: 'Error deleting slider', error: error.message });
  }
};

// Set default slider
const setDefaultSlider = async (req, res) => {
  try {
    // Remove default from all sliders
    await Slider.updateMany({}, { isDefault: false });
    
    // Set the specified slider as default
    const slider = await Slider.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    );

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.json({ message: 'Default slider updated successfully', slider });
  } catch (error) {
    console.error('Error setting default slider:', error);
    res.status(500).json({ message: 'Error setting default slider', error: error.message });
  }
};

// Reorder sliders
const reorderSliders = async (req, res) => {
  try {
    const { sliders } = req.body; // Array of { id, order }
    
    const updatePromises = sliders.map(({ id, order }) =>
      Slider.findByIdAndUpdate(id, { order }, { new: true })
    );

    await Promise.all(updatePromises);
    
    const updatedSliders = await Slider.find().sort({ order: 1 });
    res.json(updatedSliders);
  } catch (error) {
    console.error('Error reordering sliders:', error);
    res.status(500).json({ message: 'Error reordering sliders', error: error.message });
  }
};

module.exports = {
  getAllSliders,
  getActiveSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
  setDefaultSlider,
  reorderSliders
};