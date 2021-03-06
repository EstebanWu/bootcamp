import React from "react";
import CardEditor from "./CardEditor";
import CardViewer from "./CardViewer";
import Homepage from "./Homepage";
import PageRegister from "./PageRegister";
import PageLogin from "./PageLogin";
import PageProfile from "./PageProfile";

import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { isLoaded } from "react-redux-firebase";

const App = props => {
  // Ensure that authentication information
  // has completed loading.
  if (!isLoaded(props.auth, props.profile)) {
    return <div>Authentication loading...</div>;
  }

  return (
    <Switch>
      <Route exact path="/">
        <Homepage></Homepage>
      </Route>
      <Route exact path="/editor">
        <CardEditor />
      </Route>
      <Route exact path="/viewer/:deckId">
        <CardViewer />
      </Route>
      <Route exact path="/register">
        <PageRegister />
      </Route>
      <Route exact path= "/login">
        <PageLogin />
      </Route>
      <Route exact path= "/profile">
        <PageProfile />
      </Route>
      <Route>
        <div>Page not found!</div>
      </Route>
    </Switch>
  );
}

const mapStateToProps = state => {
  return { auth: state.firebase.auth, profile: state.firebase.profile };
}

export default connect(mapStateToProps)(App);
