import React from 'react';
import {render} from 'react-dom';
var cx = require('classnames');

// run  ./node_modules/.bin/webpack -d

var TOILETRIES_IMAGE_PATH = "../../../images/welcomeKit/toiletries/";
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


// ---------------------------
//     Nav Bar
// ---------------------------

class MenuItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSelected: false,
            name: props.menuItem.name,
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState({
            isSelected: true,
        });

        this.props.menuItem.renderFunction();
    }


    render() {
        var classes = cx([
            'menu-item',
            this.state.isSelected && 'selected'
        ]);

        return (
            <div id={this.props.i} className={cx(classes)} onClick={this.handleClick.bind(this)}><a>{this.state.name}</a></div>
        )
    }
}

class NavBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <nav>
                {this.props.menuItems.map(function(menuItem, i){
                    return <MenuItem menuItem={menuItem} key={i}/>;
                })}
            </nav>
        )
    }
}

function renderNavBar() {
    var menuItems = [
        {
            id: "toiletries",
            name: "Toiletries",
            renderFunction: renderToiletriesList.bind(this)
        },
        {
            id: "donation",
            name: "Donation",
            renderFunction: renderDonation.bind(this)
        }
    ]

    render(<NavBar menuItems={menuItems}/>, document.getElementById('nav'));
}

function renderDonation() {
    render(
        <div id="donation">
            <h1>When the 99% Gives 1%</h1>
            <h4>It doesn't take a lot to give a lot. What can you do?</h4>
            <Form/>
        </div>,
        document.getElementById('main')
    )
}

function renderToiletriesList() {
    var list = toiletriesList;
    render (
        <div>
            <h1>Toiletries Checklist</h1>
            <h4> All of these items must be donated new and unopened.</h4>
            <Checklist list = {list}/>

        </div>,
        document.getElementById('main')
    )
}

renderNavBar();

// ---------------------------
//     Donation Checklist
// ---------------------------


// checklists can be shared and sent.
class Checklist extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <ul>
                    {this.props.list.map(function(listItem, i){
                        return <ChecklistItem listItem={listItem} key={i}/>;
                    })}
                </ul>
            </div>
        )
    }
}

// {
//     description: "",
//     title: "",
//     image:"",
//     newOnly: true
// },


// checklist items can be toggled active/inactive
class ChecklistItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            description : props.listItem.description,
            title :  props.listItem.title,
            image :  props.listItem.image,
            isSelected : false
        };

        this.handleClick = this.handleClick.bind(this);

    }

    handleClick() {
        var selected = !this.state.isSelected;
        this.setState({
            isSelected: selected
        })
    }

    render() {
        var classes = cx([
            'checklist-item',
            this.state.isSelected && 'selected'
        ]);

        return (
            <div className={cx(classes)} onClick={this.handleClick.bind(this)}>
                <img className="checklist-item-img" src={this.state.image}/>
                <div className="checklist-item-title">{this.state.title}</div>
                <div className="checklist-item-description">{this.state.description}</div>
            </div>
        )
    }
}


// ---------------------------
//     Donation Calculator
// ---------------------------

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.state.annualIncome = {value: 10000};
        this.state.percentage = {value: 1.0};

        this.handleIncomeChange = this.handleIncomeChange.bind(this);
        this.handlePercentageChange = this.handlePercentageChange.bind(this);

        this.calculateAnnualDonation = this.calculateAnnualDonation.bind(this);
        this.calculateMonthlyDonation = this.calculateMonthlyDonation.bind(this);

    }

    handleIncomeChange(event) {
        this.setState({annualIncome: {value: event.target.value.replace(/,/g, '')}});
    }

    handlePercentageChange(event) {
        this.setState({percentage: {value: event.target.value}});
    }

    calculateAnnualDonation() {
        return (this.state.annualIncome.value * this.state.percentage.value / 100).toFixed(2);
    }

    calculateMonthlyDonation() {
        return (this.calculateAnnualDonation()/12).toFixed(2);
    }

    render() {
        return (
            <div>
                <form>
                    <p> I earn <span className="number">$<NumberInput value={this.state.annualIncome.value} onChange={this.handleIncomeChange} width="160"/> </span> annually </p>
                    <p> I can donate <span className="number"><NumberInput value={this.state.percentage.value} onChange={this.handlePercentageChange} width="60"/>% </span>annually </p>
                </form>

                <Result annualDonation={this.calculateAnnualDonation()}
                        monthlyDonation={this.calculateMonthlyDonation()}/>
            </div>

        );
    }
}

class Result extends React.Component {
    constructor(props) {
        super(props);
        this.TITLE = "I Will Donate";
        this.URL = "http://stephaniechou.com/DonationProject/src/client/index.html";
    }

    getTwitterShareUrl() {
        return "http://twitter.com/intent/tweet?status=" + this.TITLE + "+" + this.URL;
    }

    getFacebookShareUrl() {
        return "http://www.facebook.com/sharer/sharer.php?u=" + this.URL + "&title=" + this.TITLE;
    }

    render() {
        return (
            <div className="results">
                <p>I will donate <span className="number">${this.props.annualDonation} </span> per year</p>
                <p>That's just <span className="number">${this.props.monthlyDonation} </span> every month</p>

                <div>
                    <a className="button" target="_blank" href={this.getTwitterShareUrl()}><img src="../../../images/twitter-4-64.png"/></a>
                    <a className="button" target="_blank" href={this.getFacebookShareUrl()}><img src="../../../images/facebook-4-64.png"/></a>
                </div>
            </div>
        )
    }
}


class NumberInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.style = {
            width: props.width + "px"
        };

        this.handleChange = this.handleChange.bind(this);

    }

    handleChange(e) {

        if (this.isValidInput(e)) {
            this.setState({value: e.target.value});
            this.props.onChange(e);
        }

    }

    isValidInput(e) {
        // is it a number? ignore commas because we'll fix that in the render
        var regex = new RegExp('^\\d*\\.?\\d*$');
        return e.target.value.replace(/,/g, '').match(regex);
    }

    renderValue() {
        // put in commas if left of decimal is greater than 4 digits
        var regex = new RegExp('^\\d*');
        var integers = this.state.value.toString().replace(/,/g, '').match(regex)[0];

        if (integers.length > 4) {
            return integers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else {
            return this.state.value;
        }

    }

    render() {
        return (
            <input className="number" style={this.style} type="text" value={this.renderValue()} placeholder={this.state.value} onChange={this.handleChange}/>
        )
    }
}


