"use strict";

const { BadRequestError } = require("../core/error.response");
const { product, clothes, electronics, furniture } = require("../models/product.model");
const { findAllDrafts, publishProductByShop, findAllPulishForShop, unPublishProductByShop, searchProduct } = require("../models/repositories/product.repo");

//define Factory class to create product
class ProductFactory {
    /*
        type: 'Clothing'
        payload
    */
   static  productRegisty = {} //key-class

   static registerPrototype (type, classRef) {
        ProductFactory.productRegisty[type] = classRef
   }
    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegisty[type]

        if(!productClass) throw new BadRequestError(`Invalid Product Types ${type}`);
        return new productClass(payload).createProduct();
    }
    //query
    static async findAllDrafts({ product_shop, limit = 50, skip = 0 }) {
        const query = {
            product_shop,
            isDraft: true,
        }
        return await findAllDrafts({ query, limit, skip })
    }

    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
        const query = {
            product_shop,
            isPublished: true,
        }
        return await findAllPulishForShop({ query, limit, skip })
    }

    static async publishProductByShop({ product_shop, product_id }) {
        return await publishProductByShop({ product_shop, product_id })
    }

    static async unPublishProductByShop({ product_shop, product_id }) {
        return await unPublishProductByShop({ product_shop, product_id })
    }

    static async getListSearchProduct({ keySearch }) {
        return await searchProduct({ keySearch })
    }
}

//define base product class
class Product {
    constructor({
        product_name,
        product_thumb,
        product_description,
        product_price,
        product_quantity,
        product_type,
        product_shop,
        product_attributes,
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
    }

    //create new product
    async createProduct(product_id) {
        return await product.create({ ...this, _id: product_id });
    }
}
// define sub-class for different product types Clothes
class Clothing extends Product {
    async createProduct() {
        const newClothing = await clothes.create({ ...this.product_attributes, product_shop: this.product_shop });

        if (!newClothing) throw new BadRequestError("create new Clothing error");

        const newProduct = await super.createProduct(newClothing._id);

        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        const newElectronic = await electronics.create({ ...this.product_attributes, product_shop: this.product_shop });

        if (!newElectronic) throw new BadRequestError("create new Electronics error");

        const newProduct = await super.createProduct(newElectronic._id);

        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

class Furniture extends Product {
    async createProduct() {
        const newFurniture = await furniture.create({ ...this.product_attributes, product_shop: this.product_shop });

        if (!newFurniture) throw new BadRequestError("create new Furniture error");

        const newProduct = await super.createProduct(newFurniture._id);

        if (!newProduct) throw new BadRequestError("create new Product error");

        return newProduct;
    }
}

//register product
ProductFactory.registerPrototype("Clothing", Clothing);
ProductFactory.registerPrototype("Electronics", Electronics);
ProductFactory.registerPrototype("Furniture", Furniture);

module.exports = ProductFactory;
