/**
 * Created by orange on 16/8/26.
 */
import {Router, Route, hashHistory} from 'react-router';
import React, { PropTypes } from 'react';
import SQLiScan from '../components/Tasks/SqlInjectScan/Index';


const Routes = ({history}) => <Router history={hashHistory}>
    <Route path="/tasks/sqli" component={SQLiScan}/>
    <Route path="/" component={SQLiScan}/>
</Router>;

Routes.propTypes = {
  history: PropTypes.any,
};

export default Routes;