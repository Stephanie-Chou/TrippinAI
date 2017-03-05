'use strict';
import React from 'react';
import {render} from 'react-dom';

class DonationCalculator extends React.Component {
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


module.exports = DonationCalculator;