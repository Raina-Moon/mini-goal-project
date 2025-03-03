import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Goal from './pages/Goal';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/goal/:id" component={Goal} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;