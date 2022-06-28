import axios from "axios";

export function _productsByIds(_ids, _products) {
    var products = [];

    _ids.forEach((id) => {
        if (_products[id]) products.push(_products[id]);
    });

    return products;
}

export function _productIdByItem(_products, item) {
    for (var i = 0; i < _products.length; i++) {
        if (
            _products[i].name == item.name &&
            _products[i].owner == item.owner &&
            _products[i].price == item.price
        )
            return i;
    }
}

export function isConnected() {
    return localStorage.getItem("eth_connected") === "y";
}

export function _isPurchased(reserved_by) {
    return !reserved_by.toLowerCase().startsWith("0x0000");
}

export function _sections() {
    return ["playstation", "xbox", "nintendo", "pc"];
}

export function _base64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

export function _mapImagesProduct(images) {
    return images.map((image, id) => {
        return {
            image: image.thumbUrl,
        };
    });
}

export async function bnbPrice() {
    const res = await axios(
        `https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD`
    );
    return res.data.USD || 0.0;
}

export function _nameToSlug(name) {
    name = name.replace(/^\s+|\s+$/g, "").toLowerCase();

    var from =
        "ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆĞÍÌÎÏİŇÑÓÖÒÔÕØŘŔŠŞŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇğíìîïıňñóöòôõøðřŕšşťúůüùûýÿžþÞĐđßÆa·/_,:;";
    var to =
        "AAAAAACCCDEEEEEEEEGIIIIINNOOOOOORRSSTUUUUUYYZaaaaaacccdeeeeeeeegiiiiinnooooooorrsstuuuuuyyzbBDdBAa------";

    for (var i = 0, l = from.length; i < l; i++) {
        name = name.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    return name
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}