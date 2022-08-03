import { _nameToSlug } from '../util/metadapp'

export function _saveImages(product_name, images) {
    var data = []
    images.forEach(item => {
        data.push(item.image)
    })

    localStorage.setItem(_nameToSlug(product_name), JSON.stringify(data))
}

export function _getImages(product_name) {
    return JSON.parse(localStorage.getItem(_nameToSlug(product_name)) || '[]')
}