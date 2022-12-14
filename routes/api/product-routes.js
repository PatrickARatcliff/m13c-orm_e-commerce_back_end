const router = require('express').Router();
// const { regexp } = require('sequelize/types/lib/operators');
const { Product, Category, Tag, ProductTag } = require('../../models');
const { findAll } = require('../../models/ProductTag');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  try {
    const productData = await Product.findAll({
      // be sure to include its associated Category and Tag data
      include: [{ model: Category }, { model: Tag }]
      // include: [{ model: Category, as: 'product_category' }, { model: Tag, as: 'product_tag' }]
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  try {
    const productData = await Product.findByPk(req.params.id, {
      // be sure to include its associated Category and Tag data
      include: [{ model: Category }, { model: Tag }]
      // include: [{ model: Category, as: 'product_category' }, { model: Tag, as: 'product_tag' }]
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  };
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    const productData = await Product.create(
      {
        product_name: req.body.product_name,
        price: req.body.price,
        stock: req.body.stock,
        category_id: req.body.category_id,
        tag_id: req.body.tag_id
      }
    );
    res.status(200).json(productData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// update product
router.put('/:id', async (req, res) => {
  // update product data
  // try {
    const productData = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    // console.log('productData', productData);
    const productTagData = await ProductTag.findAll({
      where: {
        product_id: req.params.id,
      },
    });
    // console.log('productTagData', productTagData);
    // get list of current tag_ids
    const productTagIds = productTagData.map(({ tag_id }) => tag_id);
    console.log(productTagIds);
    // create filtered list of new tag_ids
    console.log(req.body.tag_id);
    const newProductTags = req.body.tag_id
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      })
      // console.log('newProductTags', newProductTags);
    // figure out which ones to remove
    const productTagsToRemove = productTagData
      .filter(({ tag_id }) => !req.body.tag_id.includes(tag_id))
      .map(({ id }) => id);
      // console.log('productTagsToRemove', productTagsToRemove);
    res.status(200).json(productData);
    // run both actions
    return Promise.all([
      ProductTag.destroy({ where: { id: productTagsToRemove } }),
      ProductTag.bulkCreate(newProductTags),
    ]);
  // } catch (err) {
  //   res.status(500).json(err);
  // }

});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
