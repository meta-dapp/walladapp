import React from 'react'
import 'antd/dist/antd.dark.css'
import { Result, Button } from 'antd'

function Login() {
    return (
        <Result
            status="403"
            title="Conéctate a Metasmask"
            subTitle="Debes conectarte a Metamask o Walletconnect para continuar"
            extra={<a href="/login"><Button danger type="danger">Volver</Button></a>}
        />
    )
}

export default Login