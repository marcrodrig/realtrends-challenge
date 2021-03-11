import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from '../screens/Home';
import Voting from '../screens/Voting';

const Routes: React.FC = () => (
    <Switch>
        <Route path="/" exact render={() => <Home />} />
        <Route path="/votes" render={() => < Voting />} />
    </Switch>
);

export default Routes;