import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "antd/dist/antd.dark.css";
import { Layout } from "antd";
import { Content } from "antd/lib/layout/layout";

import NavItems from "./components/NavItems";
import TheHeader from "./components/TheHeader";
import NextGameList from "./components/NextGameList";
import Account from "./components/Account";
import TokenSale from "./components/TokenSale";
import Error404 from "./components/Error404";
import TheFooter from "./components/TheFooter";
import Login from "./components/Login";

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Layout style={{ minHeight: "100vh" }}>
          <NavItems />
          <Layout className="site-layout">
            <TheHeader />
            <Content>
              <Switch>
                <Route exact path="/login" component={Login} />
                <Route exact path="/" component={NextGameList} />
                <Route exact path="/playstation" component={NextGameList} />
                <Route exact path="/xbox" component={NextGameList} />
                <Route exact path="/nintendo" component={NextGameList} />
                <Route exact path="/pc" component={NextGameList} />
                <Route exact path="/my-account" component={Account} />
                <Route exact path="/token-sale" component={TokenSale} />
                <Route component={Error404} />
              </Switch>
            </Content>
            <TheFooter />
          </Layout>
        </Layout>
      </Router>
    )
  }
}
