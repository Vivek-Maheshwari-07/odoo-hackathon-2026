const prisma = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const cats = await prisma.assetCategory.findMany();
    const result = cats.map(c => ({
      id: `CAT${String(c.id).padStart(3, '0')}`,
      dbId: c.id,
      name: c.category_name,
      description: c.description,
      warrantyPeriod: c.warranty_period ?? '',
      depreciationYears: c.depreciation_years ?? '',
      status: c.status
    }));
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ message: 'Error retrieving asset categories.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, warrantyPeriod, depreciationYears, status } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Category name and description are required.' });
    }

    const existing = await prisma.assetCategory.findUnique({
      where: { category_name: name.trim() }
    });
    if (existing) {
      return res.status(400).json({ message: 'An asset category with this name already exists.' });
    }

    const newCat = await prisma.assetCategory.create({
      data: {
        category_name: name.trim(),
        description: description.trim(),
        warranty_period: warrantyPeriod !== undefined && warrantyPeriod !== '' ? parseInt(warrantyPeriod, 10) : null,
        depreciation_years: depreciationYears !== undefined && depreciationYears !== '' ? parseInt(depreciationYears, 10) : null,
        status: status || 'Active'
      }
    });

    return res.status(201).json({
      message: 'Asset Category created successfully.',
      category: newCat
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ message: 'Error creating asset category.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, warrantyPeriod, depreciationYears, status } = req.body;

    const parsedId = parseInt(String(id).replace('CAT', ''), 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }

    const existing = await prisma.assetCategory.findUnique({
      where: { id: parsedId }
    });
    if (!existing) {
      return res.status(404).json({ message: 'Asset Category not found.' });
    }

    if (name && name.trim() !== existing.category_name) {
      const duplicate = await prisma.assetCategory.findUnique({
        where: { category_name: name.trim() }
      });
      if (duplicate) {
        return res.status(400).json({ message: 'An asset category with this name already exists.' });
      }
    }

    const updated = await prisma.assetCategory.update({
      where: { id: parsedId },
      data: {
        category_name: name ? name.trim() : existing.category_name,
        description: description !== undefined ? description.trim() : existing.description,
        warranty_period: warrantyPeriod !== undefined && warrantyPeriod !== '' ? parseInt(warrantyPeriod, 10) : null,
        depreciation_years: depreciationYears !== undefined && depreciationYears !== '' ? parseInt(depreciationYears, 10) : null,
        status: status || existing.status
      }
    });

    return res.status(200).json({
      message: 'Asset Category updated successfully.',
      category: updated
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ message: 'Error updating asset category.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(String(id).replace('CAT', ''), 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid category ID.' });
    }

    const existing = await prisma.assetCategory.findUnique({
      where: { id: parsedId }
    });
    if (!existing) {
      return res.status(404).json({ message: 'Asset Category not found.' });
    }

    await prisma.assetCategory.delete({
      where: { id: parsedId }
    });

    return res.status(200).json({ message: 'Asset Category deleted successfully.' });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ message: 'Error deleting asset category.' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
