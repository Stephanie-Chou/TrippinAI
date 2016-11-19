'use strict';
import React from 'react';
import {render} from 'react-dom';
var cx = require('classnames');

class MenuItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.menuItem.name
        };

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.onClick();
        this.props.menuItem.onClickCallback();
    }


    render() {
        

        return (
            <div id={this.props.i} className={cx(this.props.classes)} onClick={this.handleClick.bind(this)}><a>{this.state.name}</a></div>
        )
    }
}

module.exports = MenuItem;