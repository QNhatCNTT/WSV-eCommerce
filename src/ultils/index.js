"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields)
};

//['a', 'b'] => {a: 1, b: 1}
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 1]))
}
const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el, 0]))
}

const removeUnderfinedObject = obj => {
    Object.keys(obj).forEach(key => {
        if(obj[key] === undefined || obj[key] === null) delete obj[key]
    })

    return obj
}

const updateNestedObject = obj => {
    const final = {};
    Object.keys(obj).forEach(key => {
        if(typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const response = updateNestedObject(obj[key]);
            Object.keys(response).forEach(a => {
                final[`${key}.${a}`] = response[a];
            })
        } else {
            final[key] = obj[key];
        }
    })
    return final;
}
module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUnderfinedObject,
    updateNestedObject,
}