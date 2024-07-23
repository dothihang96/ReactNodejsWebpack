import { Route, Switch } from 'react-router-dom';
import React from 'react';

import { PERMISSION ,NEWS} from '../config/menu';
import Default from './components/Default';
import MainLayout from './layouts/MainLayout';
import NotFound from './pages/NotFound';
import News from './pages/News';


const App = () => (
  <MainLayout>
    <Switch>
      <Route exact path="/" component={Default} />
      <Route exact path={PERMISSION.URL} component={Default} />
      <Route exact path={NEWS.URL} component={News} />
      <Route component={NotFound} />
    </Switch>
  </MainLayout>
);

export default App;
