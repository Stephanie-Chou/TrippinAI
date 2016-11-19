import React from 'react';
import {render} from 'react-dom';

var NavBar = require('./NavBar/navBar.jsx');
var Checklist = require ('./Checklist/checklist.jsx');
var DonationCalculator = require ('./DonationCalculator.jsx');
var ChecklistUtil = require('./Checklist/checklistUtil')
// run  ./node_modules/.bin/webpack -d

// -------------------------------------
//     Render all views and components
// -------------------------------------
class Main extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            currentView: this.renderLanding()
        };

        this.setView = this.setView.bind(this);
        this.renderLanding = this.renderLanding.bind(this);
        this.renderDonation = this.renderDonation.bind(this);
        this.renderToiletriesList = this.renderToiletriesList.bind(this);
        this.renderKitchenList = this.renderKitchenList.bind(this);
        this.renderCleaningList = this.renderCleaningList.bind(this);
        this.renderHouseList = this.renderHouseList.bind(this);

        this.menuItems = [
            {
                id: "kitchen",
                name: "Kitchen",
                onClickCallback: this.setView.bind(this, "kitchen")
            },
            {
                id: "house",
                name: "House and Linen",
                onClickCallback: this.setView.bind(this, "house")
            },
            {
                id: "cleaning",
                name: "Cleaning Supplies",
                onClickCallback: this.setView.bind(this, "cleaning")
            },
            {
                id: "toiletries",
                name: "Toiletries",
                onClickCallback: this.setView.bind(this, "toiletries")
            },
            {
                id: "donation",
                name: "Calculator",
                onClickCallback: this.setView.bind(this, "donation")
            }
        ];
    }
    
    setView(view) {
        var newView;

        switch(view) {
            case "landing":
                newView = this.renderLanding();
                break;
            case "kitchen":
                newView = this.renderKitchenList();
                break;
            case "toiletries":
                newView = this.renderToiletriesList();
                break;
            case "cleaning":
                newView = this.renderCleaningList();
                break;
            case "house":
                newView = this.renderHouseList();
                break;
            case "donation":
                newView = this.renderDonation();
                break;
        }

        this.setState({
            currentView: newView
        });
    }

    renderLanding() {
        return (
            <div id="landing">
                <h1>Refugee Welcome Box</h1>
                <p> For refugees who have lost everything, the items in a Welcome Box are essential to their successful transition to life in the United Statees. The money used to purchase these items comes from the same small grant amount that is used to pay for their rent and additional expenses. By donating the contents of these boxes, you are giving a refugee a better financial future. These Welcome Boxes will make a refugee's new house a home.</p>

                <p> Take a look at the  Welcome Boxes and see what you can donate.</p>

                <p> The suggested list comes from the International Rescue Committee in Oakland. They are currently accepting donations. Please help them by organizing complete welcome boxes.</p>
            </div>
        );
    }

    renderDonation() {
        return (
            <div id="donation">
                <h1>When the 99% Gives 1%</h1>
                <h4>It doesn't take a lot to give a lot. What can you do?</h4>
                <DonationCalculator/>
            </div>
        );

    }

    renderToiletriesList() {
        return (
            <div>
                <h1>Toiletries Welcome Box </h1>
                <h4> All of these items must be donated new and unopened.</h4>
                <Checklist id="toiletries" list = {ChecklistUtil.toiletriesList}/>

            </div>
        );
    }

    renderKitchenList() {
        return (
            <div>
                <h1>Kitchen Welcome Box </h1>
                <h4> Gently used items are welcome!</h4>
                <Checklist id="kitchen" list = {ChecklistUtil.kitchenList}/>

            </div>
        );
    }

    renderCleaningList() {
        return (
            <div>
                <h1>Cleaning Welcome Box </h1>
                <h4> All of these items must be donated new and unopened.</h4>
                <Checklist id="cleaning" list = {ChecklistUtil.cleaningList}/>

            </div>
        );
    }

    renderHouseList() {
        
        return (
            <div>
                <h1>Linens and Household Welcome Box </h1>
                <h4> All linens must be donated new and unopened.</h4>
                <Checklist id="house" list = {ChecklistUtil.houseList}/>
            </div>
        )
    }

    render() {
        return(
            <div>
                <NavBar menuItems={this.menuItems} count={ChecklistUtil.fullCount()}/>
                <div>{this.state.currentView}</div>
            </div>
        );
    }
}

render(<Main/>, document.getElementById('main'));






