import React, { Component } from 'react'
import 'antd/dist/antd.dark.css'
import {
    Descriptions,
    Badge,
    Card,
    Button,
    Row,
    Tag,
    Statistic,
    message,
    Modal,
    Input,
    Select,
    Upload,
    Col
} from 'antd'

import {
    ArrowUpOutlined,
    CopyOutlined,
    EditOutlined,
    UserOutlined,
    MailOutlined
} from '@ant-design/icons'

import ImgCrop from 'antd-img-crop'

import './Account.scss'

import { Web3Instance } from '../util/web3Instance'
import MetaDappContract from '../contracts/MetaDapp'
import MetaDappFactory from '../factory/metadappfactory'
import TokenSaleContract from '../contracts/MetaDappTokenSale'
import TokenSaleFactory from '../factory/tokensalefactory'
import TokenContract from '../contracts/MetaDappToken'
import TokenFactory from '../factory/tokenfactory'

import { _sections, _base64, _mapImagesProduct, isConnected, bnbPrice } from '../util/metadapp'
import { _saveImages } from '../util/imagesaver'

import Login from './Login'

import { InitialState } from '../util/consts'
import { _bnbToWei, _toBigNumber } from '../util/units'

export default class Account extends Component {
    constructor(props) {
        super(props)
        this.state = InitialState.Account
    }

    componentWillUnmount() {
        this.resetState()
    }

    disconnect() {
        this._web3Instance.disconnect()
        this.resetState()
    }

    resetState() {
        this.setState(InitialState.Account)
    }

    checkConnection() {
        if (isConnected()) {
            this.load()
        } else this.props.history.push('/login')
    }

    async componentDidMount() {
        this._web3Instance = await new Web3Instance().init()
        this.checkConnection()
    }

    copyAddr() {
        navigator.clipboard.writeText(this.state.account)
        message.success({ content: '¡Cuenta copiada!', key: this.state.account, duration: 3 })
    }

    async load() {
        this.setState({
            account: this._web3Instance.getAccount()
        }, async () => {
            const Metadapp = await MetaDappContract(this._web3Instance.getProvider())
            const TokenSale = await TokenSaleContract(this._web3Instance.getProvider())
            const Token = await TokenContract(this._web3Instance.getProvider())

            this._MetaDappFactory = new MetaDappFactory(Metadapp)
            this._TokenSaleFactory = new TokenSaleFactory(TokenSale)
            this._TokenFactory = new TokenFactory(Token)

            this.setState({
                balance: (await this._TokenSaleFactory._tokens(this.state.account)),
                token_price: (await this._TokenSaleFactory._tokenPrice()),
                token_price_change: (await this._TokenSaleFactory._priceChangePercent()),
                totalProducts: (await this._MetaDappFactory._totalProducts()),
                totalUsers: (await this._MetaDappFactory._totalUsers()),
                data: (await this._MetaDappFactory._getUser(this.state.account)),
                phase: (await this._TokenSaleFactory._currentPhase()),
                tokensSold: (await this._TokenSaleFactory._tokensSold()),
                totalTokens: (await this._TokenSaleFactory._totalTokens()),
                token_symbol: (await this._TokenFactory._symbol()),
                allowance: (await this._TokenFactory._allowance(this.state.account, this._MetaDappFactory._address()))
            }, async () => {
                if (this.state.token_price) {
                    const price = parseFloat((await bnbPrice()))
                    this.setState({
                        balance_usd: parseFloat(this.state.token_price * price * this.state.balance).toFixed(2),
                        token_price_usd: parseFloat(price * this.state.token_price).toFixed(4)
                    })
                }
            })
        })
    }

    updateUser(input_icon, modalTitle, modal_section) {
        this.setState({
            isModalVisible: true,
            input_icon,
            input_name: '',
            modalTitle,
            modal_section
        })
    }

    onChange = e => {
        this.setState({
            input_name: e.target.value
        })
    }

    async __callUpdateUser() {
        var _contact = this.state.modal_section == 'name' ? this.state.contact :
            this.state.input_name

        var _name = this.state.modal_section == 'name' ? this.state.input_name :
            this.state.contact

        if (_name !== '' || _contact !== '') {
            const hideLoad = message.loading(`Actualizando ${this.state.modalTitle}...`, 0)
            if (_name)
                _contact = this.state.data.contact || ''
            else _name = this.state.data.name || ''

            await this._MetaDappFactory._updateUserContact(_contact, _name, this.state.account)

            this.setState({
                isModalVisible: false,
                data: (await this._MetaDappFactory._getUser(this.state.account))
            }, () => {
                hideLoad()
                message.success({
                    content: `${this.state.modalTitle} actualizado!`, key: this.state.account, duration: 2
                })
            })
        } else {
            hideLoad()
            message.error({
                content: `Debes poner un ${this.state.modalTitle}`, key: this.state.account, duration: 2
            })
        }
    }

    async addProduct() {
        this.setState({
            isProductModalVisible: true,
            modalTitle: 'Nuevo producto'
        })
    }

    getFooterButtons() {
        if (this.state.product_confirmed) {
            return [
                this.getApproveButton(),
                this.getAddButton()
            ]
        } else
            return [
                <Button key="ok" shape="round" type="default" onClick={async () => { this.confirm() }}>Confirmar</Button>
            ]
    }

    async confirm() {
        if (this.productValid())
            this.setState({
                product_comission: (await this._MetaDappFactory._percentValue(this.state.product_price, this.state.account)),
                product_confirmed: true
            })
        else message.error({ content: `Debes completar todos los campos`, key: this.state.account, duration: 2 })
    }

    getApproveButton() {
        return (this.amountCommision()) > this.state.allowance ?
            <Button key="approve" shape="round" type="primary" onClick={() => { this.__callApprove() }}>Aprobar</Button> :
            <Button disabled key="approve" shape="round" type="primary">Aprobar</Button>
    }

    getAddButton() {
        return (_toBigNumber(this.amountCommision()) <= this.state.allowance ?
            <Button key="add" shape="round" type="primary" onClick={() => { this.__callAddProduct() }}>Agregar</Button> :
            <Button disabled key="add" shape="round" type="primary">Agregar</Button>
        )
    }

    productValid() {
        return this.state.product_name !== ''
            && this.state.product_desc !== ''
            && this.state.product_section !== ''
            && this.state.product_price > 0
            && this.state.fileList.length >= 2
    }

    async __callAddProduct() {
        if (this.productValid()) {
            const hideLoad = message.loading(`Agregando ${this.state.product_name}...`, 0)
            await this._MetaDappFactory._addProduct(
                this.state.product_name,
                this.state.product_desc,
                this.state.product_section,
                this.state.product_price,
                this.state.account
            )

            _saveImages(this.state.product_name, _mapImagesProduct(this.state.fileList))

            this.setState({
                isProductModalVisible: false
            }, () => {
                hideLoad()
                message.success({ content: `Producto agregado correctamente!`, key: this.state.account, duration: 2 })
                this.load()
            })
        } else {
            message.error({ content: `Debes completar todos los campos`, key: this.state.account, duration: 2 })
        }
    }

    amountCommision() {
        return this.state.product_comission
    }

    async __callApprove() {
        const hideLoad = message.loading(`Aprobando ${this.amountCommision()} ${this.state.token_symbol}...`, 0)
        try {
            await this._TokenFactory._approve(
                this._MetaDappFactory._address(),
                _toBigNumber(_bnbToWei(this.amountCommision())),
                this.state.account
            )

            this.setState({
                allowance: (await this._TokenFactory._allowance(this.state.account, this._MetaDappFactory._address()))
            }, () => {
                hideLoad()
                message.success({ content: `${this.amountCommision()} ${this.state.token_symbol} aprobados correctamente!`, key: this.state.account, duration: 2 })
            })
        } catch (err) {
            console.log(err)
            hideLoad()
            message.error({ content: `Ha ocurrido un error`, key: this.state.account, duration: 2 })
        }
    }

    onProductNameChange = e => {
        this.setState({
            product_name: e.target.value,
            product_confirmed: false
        })
    }

    onProductDescChange = e => {
        this.setState({
            product_desc: e.target.value,
            product_confirmed: false
        })
    }

    onPriceChange = e => {
        this.setState({
            product_price: Math.round(e.target.value || 0),
            product_confirmed: false
        })
    }

    onSectionChange = e => {
        this.setState({
            product_section: e,
            product_confirmed: false
        })
    }

    onUploadChange = ({ fileList: newFileList, file: status }) => {
        this.setState({
            fileList: newFileList
        }, () => {
            if (status && status.percent == 100)
                setTimeout(
                    function () {
                        this.setState({
                            product_confirmed: false
                        })
                    }.bind(this), 1000)

        })
    }

    async onPreview(file) {
        let src = file.url
        if (!src) {
            src = await new Promise(resolve => {
                const reader = new FileReader()
                reader.readAsDataURL(file.originFileObj)
                reader.onload = () => resolve(reader.result)
            })
        }
        const image = new Image()
        image.src = src
        const imgWindow = window.open(src)
        imgWindow.document.write(image.outerHTML)
    }

    render() {
        if (isConnected())
            return <>
                <Row>
                    <Card style={{ width: '80%' }}>
                        <h2>{this.state.account}
                            {this.state.account ?
                                <span
                                    onClick={() => this.copyAddr()}
                                    className="user-account-header">
                                    <CopyOutlined />
                                </span>
                                : ''}
                        </h2>
                        <Descriptions title="" bordered>
                            <Descriptions.Item label="Usuario">
                                {this.state.data.name} <EditOutlined onClick={() => { this.updateUser(<UserOutlined />, 'Nombre de usuario', 'name') }} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Contacto">
                                {this.state.data.contact} <EditOutlined onClick={() => { this.updateUser(<MailOutlined />, 'Contacto', 'contact') }} />
                            </Descriptions.Item>
                            <Descriptions.Item label="Balance">
                                <span><strong>{this.state.balance ? this.state.balance.toLocaleString('es') : 0} {this.state.token_symbol}</strong></span><br></br>
                                <span style={{ color: 'gray' }}>{this.state.balance ? parseFloat(this.state.balance * this.state.token_price).toFixed(4) : 0} BNB</span><br></br>
                                <span style={{ color: 'gray' }}>{`$${this.state.balance_usd}`}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Token Sale" span={3}>
                                <Tag color="green"><Badge status="processing" text={`FASE ${this.state.phase.name || ''}`} /></Tag>
                                <a href="/token-sale"><Button shape="round" style={{ margin: '10px' }} type="default">COMPRAR</Button></a>
                            </Descriptions.Item>
                            <Descriptions.Item label="Precio del Token">
                                {this.state.token_price} BNB<Statistic
                                    title={`$${this.state.token_price_usd}`}
                                    value={this.state.token_price_change}
                                    precision={2}
                                    valueStyle={{ color: '#3f8600' }}
                                    prefix={<ArrowUpOutlined />}
                                    suffix="%"
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Tokens vendidos">{this.state.tokensSold.toLocaleString('es')} {this.state.token_symbol}</Descriptions.Item>
                            <Descriptions.Item label="Tokens totales">{this.state.totalTokens.toLocaleString('es')} {this.state.token_symbol}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Row>
                <Row>
                    <Card>
                        <Descriptions title="MetaDapp" bordered>
                            <Descriptions.Item label="Usuarios totales">
                                {this.state.totalUsers}
                            </Descriptions.Item>
                            <Descriptions.Item label="Productos totales">
                                {this.state.totalProducts} <Button onClick={async () => this.addProduct()} shape="round" style={{ margin: '10px' }} type="default">AGREGAR PRODUCTO</Button>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Row>
                <Modal
                    title={this.state.modalTitle}
                    visible={this.state.isModalVisible}
                    onOk={async () => this.__callUpdateUser()}
                    onCancel={() => {
                        this.setState({
                            isModalVisible: false
                        })
                    }}>
                    <Input
                        value={this.state.input_name}
                        onChange={this.onChange}
                        size="large"
                        placeholder={this.state.modalTitle}
                        prefix={this.state.input_icon} />
                </Modal>
                <Modal
                    footer={this.getFooterButtons()}
                    title={this.state.modalTitle}
                    visible={this.state.isProductModalVisible}
                    onCancel={() => {
                        this.setState({
                            isProductModalVisible: false
                        })
                    }}>
                    <Row style={{ margin: '10px' }}>
                        <Input
                            value={this.state.product_name}
                            onChange={this.onProductNameChange}
                            size="large"
                            placeholder="Nombre" />
                    </Row>

                    <Row style={{ margin: '10px' }}>
                        <Input.TextArea
                            value={this.state.product_desc}
                            onChange={this.onProductDescChange}
                            size="large"
                            placeholder="Descripción" />
                    </Row>

                    <Row style={{ margin: '10px', width: '100%' }}>
                        <Col span={6} style={{ margin: '10px', width: '100%' }}>
                            <Select defaultValue={this.state.product_section} onChange={this.onSectionChange}>
                                {
                                    _sections().map((section, i) => {
                                        return <Select.Option key={i} value={section}>{section.toUpperCase()}</Select.Option>
                                    })
                                }
                            </Select>
                        </Col>
                        <Col span={6} style={{ margin: '10px', width: '100%' }}>
                            <Input
                                placeholder="Precio"
                                type="number"
                                suffix={this.state.token_symbol}
                                value={this.state.product_price}
                                onChange={this.onPriceChange}
                            />
                        </Col>
                    </Row>
                    <Row style={{ margin: '10px' }}>
                        <ImgCrop rotate>
                            <Upload
                                maxCount="5"
                                listType="picture-card"
                                fileList={this.state.fileList}
                                onChange={this.onUploadChange}
                                onPreview={this.onPreview}
                            >
                                {this.state.fileList.length < 5 && '+ Subir'}
                            </Upload>
                        </ImgCrop>
                    </Row>
                    <Row style={{ margin: '10px' }}>
                        {' '} Comisión 5% {this.productValid() && this.state.product_comission > 1 ? '= ' + (this.state.product_comission) + ' ' + this.state.token_symbol : ''}
                    </Row>
                </Modal>
            </>
        else return <Login />
    }
}