import React, { Component } from 'react'
import 'antd/dist/antd.dark.css'

import {
    Steps,
    Card,
    Button,
    Row,
    Col,
    message,
    Modal,
    Input
} from 'antd'

import { InitialState } from '../util/consts'

import { Web3Instance } from '../util/web3Instance'
import TokenSaleContract from '../contracts/MetaDappTokenSale'
import TokenSaleFactory from '../factory/tokensalefactory'
import TokenContract from '../contracts/MetaDappToken'
import TokenFactory from '../factory/tokenfactory'
import { isConnected } from '../util/metadapp'
import { _bnbToWei, _weiToBNB } from '../util/units'
import Login from '../components/Login'

const { Step } = Steps

export default class TokenSale extends Component {
    constructor(props) {
        super(props)
        this.state = InitialState.TokenSale
    }

    componentWillUnmount() {
        this.resetState()
    }

    disconnect() {
        this._web3Instance.disconnect()
        this.resetState()
    }

    resetState() {
        this.setState(InitialState.TokenSale)
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

    async load() {
        this.setState({
            account: this._web3Instance.getAccount()
        }, async () => {
            const TokenSale = await TokenSaleContract(this._web3Instance.getProvider())
            const Token = await TokenContract(this._web3Instance.getProvider())
            this._TokenSaleFactory = new TokenSaleFactory(TokenSale)
            this._TokenFactory = new TokenFactory(Token)

            this.setState({
                phases: (await this._TokenSaleFactory._phases()),
                phase: (await this._TokenSaleFactory._currentPhase()),
                token_symbol: (await this._TokenFactory._symbol())
            }, () => {
                if (this.state.phase) {
                    this.setState({
                        percentPhase: (this.state.phase.phase - 1) * 10.4
                    })
                }
            })
        })
    }

    getPercentage() {
        return Math.abs((this.state.phase.total / 50000) - 1) * 100
    }

    buyTokens() {
        this.setState({
            isModalVisible: true,
            input_bnb: 0,
            input_token: 0
        })
    }

    async __callBuyTokens() {
        const hideLoad = message.loading(`Comprando ${this.state.input_token} ${this.state.token_symbol}...`, 0)
        if (this.state.input_bnb != 0 && this.state.input_token != 0) {
            try {
                await this._TokenSaleFactory._buy(
                    this.state.account,
                    this.state.input_bnb,
                    this.state.input_token
                )
                this.setState({
                    isModalVisible: false,
                    phases: (await this._TokenSaleFactory._phases()),
                    phase: (await this._TokenSaleFactory._currentPhase())
                }, () => {
                    hideLoad()
                    message.success({ content: `Tokens comprados correctamente!`, key: this.state.account, duration: 2 })
                    this.load()
                })
            } catch (err) {
                hideLoad()
                message.error({ content: `Ha ocurrido un error`, key: this.state.account, duration: 2 })
            }
        } else {
            hideLoad()
            message.error({ content: `Debes poner un valor de compra`, key: this.state.account, duration: 2 })
        }
    }

    onTokenChange = e => {
        this.setState({
            input_token: e.target.value
        }, () => {
            this.setState({
                input_bnb: _weiToBNB(this.state.input_token * this.state.phase.price)
            })
        })
    }

    onBNBChange = e => {
        this.setState({
            input_bnb: e.target.value
        }, () => {
            this.setState({
                input_token: _bnbToWei(this.state.input_bnb) / this.state.phase.price
            })
        })
    }

    render() {
        if (isConnected())
            return (<>
                <Card>
                    <Row>
                        <Col span={12}>
                            <Steps current={this.state.phase.phase - 1} percent={this.getPercentage()} direction="vertical">
                                {this.state.phases.map((phase, i) => {
                                    return <Step key={this.state.phase.phase - 1} title={`FASE ${phase.phase}`}
                                        description={`Tokens restantes: ${phase.total}, precio = inicial x${phase.phase}`}
                                        subTitle={`1 ${this.state.token_symbol} = ${_weiToBNB(phase.price)} BNB`} />
                                })}
                            </Steps>
                        </Col>
                        <Col span={12}>
                            <Row>
                                {this.state.phase.phase == 10 && this.state.phase.total <= 1 ? <Button disabled type="primary" shape="round">NO DISPONIBLE</Button>
                                    : <Button type="primary" shape="round" onClick={() => this.buyTokens()}>COMPRAR TOKENS</Button>}
                            </Row>
                        </Col>
                    </Row>
                </Card>
                <Modal
                    title="Comprar MetaDapp Tokens"
                    visible={this.state.isModalVisible}
                    onOk={async () => this.__callBuyTokens()}
                    onCancel={() => {
                        this.setState({
                            isModalVisible: false
                        })
                    }}>

                    <Row>
                        <Col span={6} style={{ marginRight: '5px' }}>
                            <Input
                                placeholder="Tokens"
                                value={this.state.input_token}
                                onChange={this.onTokenChange}
                                suffix={this.state.token_symbol} />
                        </Col>
                        <Col span={6}>
                            <Input
                                placeholder="BNB"
                                value={this.state.input_bnb}
                                onChange={this.onBNBChange}
                                suffix="BNB" />
                        </Col>

                    </Row>
                </Modal>
            </>)
        else return <Login />
    }
}