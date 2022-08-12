import { create } from 'ipfs-http-client'

const projectId = ''
const projectSecret = ''

const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    timeout: 8000,
    headers: {
        authorization: auth
    }
})

export default ipfs