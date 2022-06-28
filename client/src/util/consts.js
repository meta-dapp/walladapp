import {
    UserOutlined
} from '@ant-design/icons'


export const Networks = {
    bsct: {
        id: 97,
        rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    }
}

export const InitialState = {
    TheHeader: {
        account: undefined,
        displayAccount: undefined
    },
    Account: {
        account: undefined,
        balance: undefined,
        balance_usd: 0,
        token_price: undefined,
        token_price_usd: 0,
        token_price_change: 0,
        phase: {},
        data: {},
        isModalVisible: false,
        isProductModalVisible: false,
        input_name: '',
        input_icon: <UserOutlined />,
        modalTitle: '',
        modal_section: '',
        totalProducts: 0,
        totalUsers: 0,
        tokensSold: 0,
        totalTokens: 0,
        fileList: [],
        product_section: 'playstation',
        product_desc: '',
        product_name: '',
        product_price: 0,
        product_comission: 1,
        product_confirmed: false,
        allowence: 0,
        token_symbol: ''
    },
    NextGameList: {
        account: undefined,
        section: undefined,
        isModalVisible: false,
        data: [],
        itemToBuy: {},
        allowence: 0,
        itemDetailsContact: undefined
    },
    TokenSale: {
        account: undefined,
        phase: {},
        phases: [],
        percentPhase: 0,
        isModalVisible: false,
        input_token: 0,
        input_bnb: 0
    }
}