import ipfs from '../storage/ipfs'

export function hashToURL(hash) {
    return `https://cloudflare-ipfs.com/ipfs/${hash}`
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new window.FileReader()

        reader.onloadend = () => {
            resolve(reader)
        }

        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}

async function getImagesBuffer(images) {
    const imagesBuffer = []
    for (var i = 0; i < images.length; i++) {
        const reader = await readFile(images[i].originFileObj)
        imagesBuffer.push(Buffer.from(reader.result))
    }

    return imagesBuffer
}

export async function saveImages(images) {
    const imagesBuffer = await getImagesBuffer(images)
    const imagesPaths = []

    for (var i = 0; i < imagesBuffer.length; i++) {
        const ipfsRes = await ipfs.add(imagesBuffer[i])
        if (ipfsRes && 'path' in ipfsRes)
            imagesPaths.push(ipfsRes.path)
    }

    return imagesPaths
}