import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import 'antd/dist/antd.dark.css'
import { Layout, Button, message } from 'antd'

import '../App.scss'

import {
    LogoutOutlined,
} from '@ant-design/icons'

import { isConnected } from '../util/metadapp'
import { Web3Instance } from '../util/web3Instance'
import { InitialState } from '../util/consts'

const { Header } = Layout

class TheHeader extends Component {
    constructor(props) {
        super(props)
        this.state = InitialState.TheHeader
    }

    displayedAccount() {
        const account = this.state.account
        return `${account.slice(0, 4)}...${account.slice(-4)}`
    }

    resetState() {
        this.setState(InitialState.TheHeader)
    }

    componentWillUnmount() {
        this.resetState()
    }

    disconnect() {
        this._web3Instance.disconnect()
        this.resetState()
        this.props.history.push('/login')
    }

    async connect() {
        await this._web3Instance.connect()
        this.checkConnection(false)
    }

    async checkConnection(connect) {
        if (isConnected()) {
            if (connect)
                await this._web3Instance.connect()
            this.load()
        } else this.props.history.push('/login')
    }

    async componentDidMount() {
        this._web3Instance = await new Web3Instance().init()
        this.checkConnection(true)
    }

    async load() {
        this.setState({
            account: this._web3Instance.getAccount()
        }, () => {
            this.setState({
                displayAccount: this.displayedAccount()
            }, () => {
                this.props.history.push('/playstation')
            })
        })
    }

    copyAddr() {
        navigator.clipboard.writeText(this.state.account)
        message.success({ content: '¡Cuenta copiada!', key: this.state.account, duration: 3 })
    }

    render() {
        return (
            <Header className="site-layout-background" style={{ position: 'fixed', zIndex: 1, width: '100%' }} >
                <Button type="primary" shape="round"
                    onClick={async () => isConnected() ? this.disconnect() : this.connect()}>
                    {this.state.displayAccount || 'Conectarse'}
                    {this.state.displayAccount ? <LogoutOutlined /> : <></>}
                </Button>
            </Header>
        )
    }
}

export default withRouter(TheHeader)