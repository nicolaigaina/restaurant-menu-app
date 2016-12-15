
/*
    Inventory
*/

import React from 'react';
import AddFishForm from './AddFishForm';
import autobind from 'autobind-decorator';
import base from '../config';
import firebase from 'firebase';
firebase.initializeApp(base);


@autobind
class Inventory extends React.Component{

    constructor(props){
        super(props);
        this.authenticate = this.authenticate.bind(this);
        this.state = {
            uid: null,
            owner: null,
            errorMessage: null
        }

    }

 componentWillMount() {
        base.onAuth((user) => {
            if (user) {
                this.authHandler({user});
            }
        });
    }

    authenticate(provider) {
        const auth = base.auth();
        if (provider === 'github') {
            provider = new base.auth.GithubAuthProvider();
        }

        if (provider === 'facebook') {
            provider = new base.auth.FacebookAuthProvider();
        }

         auth.signInWithPopup(provider)
                .then(this.authHandler)
                .catch(this.handleError);

    }

     logout(){
        base.unauth();
        this.setState({
            uid: null
        });
    }


    authHandler(authData) {
        const storeRef = base.database().ref(this.props.storeId);
        storeRef.once('value', (snapshot) => {
            const data = snapshot.val() || {};

            if (!data.owner) {
                storeRef.set({
                    owner: authData.user.uid
                });
            }

            this.setState({
                uid: authData.user.uid,
                owner: data.owner || authData.user.uid
            });
        });
    }



    renderLogin(){
        return(
            <nav className="login">
                <h2>Inventory</h2>
                <p>Sign in to manage your store's inventory</p>
                <button className="facebook" onClick={() => this.authenticate('facebook')}>Log In With Facebook</button>
                <button className="github" onClick={() => this.authenticate('github')}>Log In With Github</button>            </nav>
        )
    }
   
    renderInventory(key){
        var linkState = this.props.linkState;
        return(
            <div className="fish-edit" key={key}>
                <input type="text" valueLink={linkState('fishes.'+key+'.name')}/>
                <input type="text" valueLink={linkState('fishes.'+key+'.price')}/>
                <select valueLink={linkState('fishes.'+key+'.status')}>
                    <option value="unavailable">Sold out!</option>
                     <option value="available">Fresh</option>
                </select>
                <textarea valueLink={linkState('fishes.'+key+'.desc')}></textarea>
                <input type="text" valueLink={linkState('fishes.'+key+'.image')}/>
                <button onClick={this.props.removeFish.bind(null,key)}>Remove Fish</button>
            </div>
        )
    }

    render(){
        let logoutButton = <button onClick={()=>this.logout()}>Log Out!</button>
        if(!this.state.uid){
            return(
                <div>{this.renderLogin()}</div>
            )
        }

        if(this.state.uid !== this.state.owner){
            return (
                <div>
                    <p>Sorry, you are not the owner of this account</p>
                    {logoutButton}
                </div>
            )
        }

        return(
            <div>
                <p>Inventory</p>
                {logoutButton}
                {Object.keys(this.props.fishes).map(this.renderInventory)}
                <AddFishForm {...this.props}/>
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>
        )
    }

    
}

Inventory.propTypes = {
        fishes:React.PropTypes.object.isRequired,
        loadSamples: React.PropTypes.func.isRequired,
        linkState: React.PropTypes.func.isRequired,
        addFish: React.PropTypes.func.isRequired,
        removeFish: React.PropTypes.func.isRequired
}

export default Inventory;