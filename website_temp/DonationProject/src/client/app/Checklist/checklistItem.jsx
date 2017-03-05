'use strict';
import React from 'react';
import {render} from 'react-dom';
var ChecklistUtil = require('./checklistUtil');
var cx = require('classnames');

// checklist items can be toggled active/inactive
// TODO build out some buttons for searching items on the checklist? add a more obvious check mark... left or right
class ChecklistItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSelected: props.listItem.isSelected,
            isHover: false
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleHover = this.handleHover.bind(this);

    }

    handleClick() {
        // todo change counter state
        var selected = !this.state.isSelected;
        // update the list
        this.props.list.items[this.props.id].isSelected = selected;
        this.setState({
            isSelected: selected
        })
    }

    handleHover() {
        var hover = !this.state.isHover;
        this.setState({
            isHover: hover
        })
    }
    
    render() {
        var classes = cx([
            'checklist-item',
            this.props.listItem.isSelected && 'selected'
        ]);

        var searchClasses = cx([
            'checklist-item-search',
            !this.state.isHover && 'hidden',
            this.state.isHover && 'stretchRight'
        ]);

        var amazon_url = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=" + this.props.listItem.title;

        return (
            <div>
                <div key={this.props.id} className={cx(classes)} onClick={this.handleClick.bind(this)} onMouseEnter={this.handleHover.bind(this)} onMouseLeave={this.handleHover.bind(this)}>
                    <img className="checklist-item-img" src={this.props.listItem.image}/>
                    <div className="checklist-item-title">{this.props.listItem.title}</div>
                    <div className="checklist-item-description">{this.props.listItem.description}</div>

                    <a href={amazon_url} target="_blank"><div className={cx(searchClasses)}> <img src="../../../images/search-13-48.png"/></div></a>
                </div>
            </div>

        )
    }
}

module.exports = ChecklistItem;