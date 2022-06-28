import React, { Component } from 'react'
import 'antd/dist/antd.dark.css';
import { Layout } from 'antd';

import './TheFooter.scss';

const { Footer } = Layout

export default class TheFooter extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Footer style={{ textAlign: 'center' }}><img style={{ width: '30px', height: "auto" }} src="/walldapp_square.png" /> MetaDapp.io ©2022 Powered by @MetaDapp</Footer>
        )
    }
}