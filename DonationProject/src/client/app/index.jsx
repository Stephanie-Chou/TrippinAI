import React from 'react';
import {render} from 'react-dom';

var NavBar = require('./NavBar/navBar.jsx');
var Checklist = require ('./Checklist/checklist.jsx');
var DonationCalculator = require ('./DonationCalculator.jsx');
var ChecklistUtil = require ('./Checklist/checklistUtil.js');
// run  ./node_modules/.bin/webpack -d

var TOILETRIES_IMAGE_PATH = "../../../images/welcomeKit/toiletries/";
var CLEANING_IMAGE_PATH = "../../../images/welcomeKit/cleaning/";
var KITCHEN_IMAGE_PATH = "../../../images/welcomeKit/kitchen/";
var HOUSE_IMAGE_PATH = "../../../images/welcomeKit/house/";

var toiletriesList = [
    {
        description: "",
        title: "Diapers",
        image: TOILETRIES_IMAGE_PATH + "diaper-FelipeAlvarado.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Toilet Paper",
        image: TOILETRIES_IMAGE_PATH + "toiletPaper-PatrickTrouve.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Shampoo",
        image: TOILETRIES_IMAGE_PATH + "shampoo-paperclip.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Soap",
        image: TOILETRIES_IMAGE_PATH + "soap-StanislavLevin.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Hand Soap",
        image: TOILETRIES_IMAGE_PATH + "handsoap-JurajSedlak.svg",
        newOnly: true
    },
    {
        description: "1 per person",
        title: "Toothbrush",
        image: TOILETRIES_IMAGE_PATH + "toothbrush-HeaPohLin.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Toothpaste",
        image: TOILETRIES_IMAGE_PATH + "toothpaste-AshleyFiveash.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Lotion",
        image: TOILETRIES_IMAGE_PATH + "lotion-OliviuStoian.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Feminine Hygiene Products",
        image: TOILETRIES_IMAGE_PATH + "feminine-iconsphere.svg",
        newOnly: true
    },
    {
        description: "Bandages, Neosporin, Q-tips",
        title: "First Aid Supplies",
        image: TOILETRIES_IMAGE_PATH + "firstaid-ProSymbols.svg",
        newOnly: true
    },

];

var cleaningList = [
    {
        description: "",
        title: "dish soap",
        image: CLEANING_IMAGE_PATH + "dishSoap.svg",
        newOnly: true
    },
    {
        description: "Bathroom and Kitchen",
        title: "Cleansers",
        image: CLEANING_IMAGE_PATH + "LaundryDetergent.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Sponges and Cleaning rags",
        image: CLEANING_IMAGE_PATH + "sponge.svg",
        newOnly: true
    },
    {
        description: "8 pack or more",
        title: "Paper Towels",
        image: CLEANING_IMAGE_PATH + "paperTowels.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Laundry Detergent",
        image: CLEANING_IMAGE_PATH + "laundryDetergent.svg",
        newOnly: true
    },
    {
        description: "Two would be best",
        title: "Waste Baskets",
        image: CLEANING_IMAGE_PATH + "wastebasket.svg",
        newOnly: false
    },
    {
        description: "",
        title: "Mop",
        image: CLEANING_IMAGE_PATH + "sweep.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Broom and Dustpan",
        image: CLEANING_IMAGE_PATH + "sweep.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Trash bags",
        image: CLEANING_IMAGE_PATH + "wastebasket.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Toilet Brush and Plunger",
        image: CLEANING_IMAGE_PATH + "laundryDetergent.svg",
        newOnly: true
    },

];

var houseList = [
    {
        description: "At least 4, 30\" x54\" ",
        title: "Bath Towels",
        image: HOUSE_IMAGE_PATH + "towels_.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Queen Sheets and Comforter",
        image: HOUSE_IMAGE_PATH + "bed_anbileruAdaleru.svg",
        newOnly: true
    },
    {
        description: "2",
        title: "Plush Blankets",
        image: HOUSE_IMAGE_PATH + ".svg",
        newOnly: true
    },
    {
        description: "4",
        title: "Pillows",
        image: HOUSE_IMAGE_PATH + "pillow.svg",
        newOnly: true
    },
    {
        description: "",
        title: "Alarm Clock",
        image: HOUSE_IMAGE_PATH + "alarmclock.svg",
        newOnly: false
    },
    {
        description: "Paper, pens, pencils",
        title: "Writing Utensils",
        image: HOUSE_IMAGE_PATH + "writing.svg",
        newOnly: false
    },
    {
        description: "",
        title: "Lightbulbs",
        image: HOUSE_IMAGE_PATH + "lightbulb.svg",
        newOnly: false
    },
    {
        description: "",
        title: "3-Drawered Storage Bins",
        image: HOUSE_IMAGE_PATH + "drawers_proSymbols.svg",
        newOnly: false
    }
];

var kitchenList = [
    {
        description: "4 of each fork, knife, spoon",
        title: "Tableware",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        newOnly: false
    },
    {
        description: "4 of each plate, bowl, cup",
        title: "Dishes",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        newOnly: false
    },
    {
        description: "sauce, frying, large cooking (stainless steel)",
        title: "Pots and Pans",
        image: KITCHEN_IMAGE_PATH + "cookingPot.svg",
        newOnly: false
    },
    {
        description: "",
        title: "Baking tray",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        newOnly: false
    },
    {
        description: "like a lasagna dish",
        title: "Glass Dishes",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        newOnly: false
    },
    {
        description: "",
        title: "Mixing and Serving Bowls",
        image: KITCHEN_IMAGE_PATH + "bowl_xihnStudio.svg",
        newOnly: false
    },
    {
        description: "Ladles, large spoons and forks, spatulas etc",
        title: "Kitchen Utensils",
        image: KITCHEN_IMAGE_PATH + "eating_doubco.svg",
        newOnly: false
    },
    {
        description: "",
        title: "Can Opener",
        image: KITCHEN_IMAGE_PATH + "canOpener.svg",
        newOnly: false
    },
    {
        description: "",
        title: "Knife and Scissors",
        image: KITCHEN_IMAGE_PATH + "knife_myly.svg",
        newOnly: false
    },
    {
        description: "",
        title: "Cutting Board",
        image: KITCHEN_IMAGE_PATH + "cuttingBoard_GregorySujkowski.svg",
        newOnly: false
    }
];

// -------------------------------------
//     Render all views and components
// -------------------------------------


class Main extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            currentView: ''
        };

        this.setView = this.setView.bind(this);
        this.renderDonation = this.renderDonation.bind(this);
        this.renderToiletriesList = this.renderToiletriesList.bind(this);
        this.renderKitchenList = this.renderKitchenList.bind(this);
        this.renderCleaningList = this.renderCleaningList.bind(this);
        this.renderHouseList = this.renderHouseList.bind(this);

        this.menuItems = [
            {
                id: "kitchen",
                name: "Kitchen",
                renderFunction: this.renderKitchenList.bind(this)
            },
            {
                id: "house",
                name: "House and Linen",
                renderFunction: this.renderHouseList.bind(this)
            },
            {
                id: "cleaning",
                name: "Cleaning Supplies",
                renderFunction: this.renderCleaningList.bind(this)
            },
            {
                id: "toiletries",
                name: "Toiletries",
                renderFunction: this.renderToiletriesList.bind(this)
            },
            {
                id: "donation",
                name: "Donation",
                renderFunction: this.renderDonation.bind(this)
            }
        ];
    }

    setView(view) {
        this.setState({
            currentView: view
        });
    }

    renderDonation() {
        var view = (
            <div id="donation">
                <h1>When the 99% Gives 1%</h1>
                <h4>It doesn't take a lot to give a lot. What can you do?</h4>
                <DonationCalculator/>
            </div>
        );

        this.setView(view);
    }

    renderToiletriesList() {
        var view = (
            <div>
                <h1>Toiletries Checklist</h1>
                <h4> All of these items must be donated new and unopened.</h4>
                <Checklist id="toiletries" list = {toiletriesList}/>

            </div>
        );

        this.setView(view);
    }

    renderKitchenList() {
        var view = (
            <div>
                <h1>Kitchen Checklist</h1>
                <h4> Gently used items are welcome!</h4>
                <Checklist id="kitchen" list = {kitchenList}/>

            </div>
        );

        this.setView(view);
    }

    renderCleaningList() {
        var view = (
            <div>
                <h1>Cleaning Checklist</h1>
                <h4> All of these items must be donated new and unopened.</h4>
                <Checklist id="cleaning" list = {cleaningList}/>

            </div>
        );

        this.setView(view);
    }

    renderHouseList() {
        var view = (
            <div>
                <h1>Linens and Household Checklist</h1>
                <h4> All linens must be donated new and unopened.</h4>
                <Checklist id="house" list = {houseList}/>
            </div>
        )

        this.setView(view);
    }

    render() {
        return(
            <div>
                <NavBar menuItems={this.menuItems}/>
                <div>{this.state.currentView}</div>
            </div>
        );
    }
}



render(<Main/>, document.getElementById('main'));






