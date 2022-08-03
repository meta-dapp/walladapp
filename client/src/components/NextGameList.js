import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { isConnected, _isPurchased } from '../util/metadapp'
import { InitialState } from '../util/consts'
import { Web3Instance } from '../util/web3Instance'

import MetaDappContract from '../contracts/MetaDapp'
import MetaDappFactory from '../factory/metadappfactory'
import TokenContract from '../contracts/MetaDappToken'
import TokenFactory from '../factory/tokenfactory'
import Login from './Login'

import './NextGameList.scss'
import { Carousel, Row, Card, Popover, Modal, Tag, Button, message } from 'antd'
import { MailOutlined, CopyOutlined } from '@ant-design/icons'
import { _bnbToWei, _toBigNumber, _weiToBNB } from '../util/units'


class NextGamesList extends Component {
    constructor(props) {
        super(props)
        this.state = InitialState.NextGameList
    }

    checkConnection() {
        if (isConnected()) {
            this.setState({
                section: this.getSection()
            })
        } else this.props.history.push('/login')
    }

    async componentDidMount() {
        this._web3Instance = await new Web3Instance().init()
        this.checkConnection()
    }

    getSection() {
        const section = window.location.pathname.replace('/', '').trim().toLowerCase()
        return section === '' ? 'playstation' : section
    }

    async componentDidUpdate() {
        if (isConnected()) {
            if (this.getSection() != this.state.section)
                this.setState({
                    section: this.getSection()
                }, () => {
                    this.load()
                })
        } else this.props.history.push('/login')
    }

    disconnect() {
        this._web3Instance.disconnect()
        this.resetState()
    }

    resetState() {
        this.setState(InitialState.NextGameList)
    }

    async load() {
        this.setState({
            account: this._web3Instance.getAccount()
        }, async () => {
            const Token = await TokenContract(this._web3Instance.getProvider())
            const MetaDapp = await MetaDappContract(this._web3Instance.getProvider())

            this._MetaDappFactory = new MetaDappFactory(MetaDapp)
            this._TokenFactory = new TokenFactory(Token)

            this.setState({
                section: this.getSection(),
                data: (await this._MetaDappFactory._getProducts()),
                token_symbol: (await this._TokenFactory._symbol())
            })
        })
    }

    getCarousel(images) {
        return (
            <Carousel>
                {
                    images.map((image, i) => {
                        return <div key={i}>
                            <img src={image} />
                        </div>
                    })
                }
            </Carousel>
        )
    }

    itemDetailsVisibility = async (visible, account) => {
        if (visible) {
            this.setState({
                itemDetailsContact: (await this._MetaDappFactory._getUser(account)).contact
            })
        } else {
            this.setState({
                itemDetailsContact: undefined
            })
        }
    }

    copyAddr() {
        navigator.clipboard.writeText(this.state.itemDetailsContact)
        message.success({ content: '¡Contacto copiado!', key: this.state.account, duration: 3 })
    }

    popContent(item) {
        return (
            <div className="popover">
                <p>{item.desc}</p>
                <Tag
                    icon={<MailOutlined />}
                    color={this.state.itemDetailsContact ? 'success' : 'error'}>
                    {this.state.itemDetailsContact ? this.state.itemDetailsContact : 'Sin contacto'}
                </Tag>
                {this.state.itemDetailsContact ?
                    <span
                        onClick={() => this.copyAddr()}
                        className="user-account-header__item-contact">
                        <CopyOutlined />
                    </span>
                    : ''}
            </div>
        )
    }

    getOpenPurchaseButton(item) {
        return (
            _isPurchased(item.reserved_by) ?
                <Button danger disabled shape="round">COMPRADO</Button> :
                <Button type="primary" shape="round" onClick={async () => this.selectItem(item)}>
                    {_weiToBNB(item.price)} {this.state.token_symbol}
                </Button>
        )
    }

    async selectItem(item) {
        this.setState({
            allowance: (await this._TokenFactory._allowance(this.state.account, this._MetaDappFactory._address())),
            itemToBuy: item,
            isModalVisible: true
        })
    }

    async approve() {
        const hideLoad = message.loading(`Aprobando ${_weiToBNB(this.state.itemToBuy.price)} ${this.state.token_symbol}...`, 0)
        try {
            await this._TokenFactory._approve(
                this._MetaDappFactory._address(),
                _toBigNumber(this.state.itemToBuy.price), this.state.account
            )

            this.setState({
                allowance: (await this._TokenFactory._allowance(this.state.account, this._MetaDappFactory._address()))
            }, () => {
                hideLoad()
                message.success({ content: `${_weiToBNB(this.state.itemToBuy.price)} ${this.state.token_symbol} aprobados correctamente!`, key: this.state.account, duration: 2 })
            })
        } catch (err) {
            hideLoad()
            message.error({ content: `Ha ocurrido un error`, key: this.state.account, duration: 2 })
        }
    }

    async buyItem() {
        const hideLoad = message.loading(`Comprando ${this.state.itemToBuy.name}...`, 0)

        try {
            await this._MetaDappFactory._buyProduct(this.state.itemToBuy.id, this.state.account)
            this.setState({
                isModalVisible: false,
                data: (await this._MetaDappFactory._getProducts())
            }, () => {
                hideLoad()
                message.success({ content: `${this.state.itemToBuy.name} comprado correctamente!`, key: this.state.account, duration: 2 })
                this.load()
            })
        } catch (err) {
            hideLoad()
            message.error({ content: `Ha ocurrido un error`, key: this.state.account, duration: 2 })
        }
    }

    getApproveButton() {
        return (this.state.itemToBuy.price > this.state.allowance ?
            <Button key="approve" shape="round" type="primary" onClick={() => { this.approve() }}>Aprobar</Button> :
            <Button disabled key="approve" shape="round" type="primary">Aprobar</Button>)
    }

    getPurchaseButton() {
        return (this.state.itemToBuy.price <= this.state.allowance ?
            <Button key="purchase" shape="round" type="primary" onClick={() => { this.buyItem() }}>Comprar</Button> :
            <Button disabled key="purchase" shape="round" type="primary">Comprar</Button>
        )
    }

    render() {
        if (isConnected())
            return <>
                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    {
                        this.state.data.map((pass, index) => {
                            if (this.state.section === pass.section)
                                return (
                                    <Card
                                        key={index}
                                        hoverable
                                        style={{ width: 200, margin: '10px' }}
                                        cover={this.getCarousel(pass.images)}>
                                        <Popover
                                            onVisibleChange={async (visible) => this.itemDetailsVisibility(visible, pass.owner)}
                                            content={this.popContent(pass)}
                                            title={pass.name}
                                            trigger="click">
                                            <Card.Meta title={pass.name}></Card.Meta>
                                        </Popover>
                                        <p></p>
                                        {this.getOpenPurchaseButton(pass)}
                                    </Card>
                                )
                        })
                    }
                </Row>
                <Modal
                    footer={[
                        this.getApproveButton(),
                        this.getPurchaseButton()
                    ]}
                    title={this.state.itemToBuy.name}
                    visible={this.state.isModalVisible}
                    onCancel={() => {
                        this.setState({
                            isModalVisible: false
                        })
                    }}>

                    <Row>
                        <span>
                            {this.state.itemToBuy.desc}
                        </span>
                    </Row>
                </Modal>
            </>
        else return <Login />
    }
}

export default withRouter(NextGamesList)