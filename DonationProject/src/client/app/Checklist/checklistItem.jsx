'use strict';
import React from 'react';
import {render} from 'react-dom';
var cx = require('classnames');

// checklist items can be toggled active/inactive
// TODO build out some buttons for searching items on the checklist? add a more obvious check mark... left or right
class ChecklistItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSelected: false
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
            <div key={this.props.i} className={cx(classes)} onClick={this.handleClick.bind(this)}>
                <img className="checklist-item-img" src={this.props.listItem.image}/>
                <div className="checklist-item-title">{this.props.listItem.title}</div>
                <div className="checklist-item-description">{this.props.listItem.description}</div>
            </div>
        )
    }
}

module.exports = ChecklistItem;