import React from 'react'
import 'antd/dist/antd.dark.css';
import { Result, Button } from 'antd';

import './Error404.scss';

function Error404() {
    return (
        <Result
            status="404"
            title="404"
            subTitle="Lo sentimos, esta página no existe"
            extra={<a href="/">
                <Button danger type="danger">Volver</Button></a>}

        />
    )
}

export default Error404