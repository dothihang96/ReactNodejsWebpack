import { Route, Switch, BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

import SignIn from './SignIn';
import SignUp from './SignUp';

const Auth = ({ refetch }) => (
    <Switch>
      <Route exact path="/signin" render={() => <SignIn refetch={refetch} />} />
      <Route exact path="/signup" render={() => <SignUp refetch={refetch} />} />
      <Route render={() => <SignUp refetch={refetch} />} />
    </Switch>
);

Auth.propTypes = {
  refetch: PropTypes.func.isRequired
};

export default Auth;
