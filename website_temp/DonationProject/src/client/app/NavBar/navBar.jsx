'use strict';
import React from 'react';
import {render} from 'react-dom';
import Counter from '../Components/counter';
var cx = require('classnames');

var MenuItem = require('./../Components/menuItem.jsx');

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            isSelected : null
        }
    }

    handleClick(index) {
        this.setState({
            isSelected: index
        });
    }

    onDonate() {
        // show a modal
        alert("Let me know what you can donate. I'll arrange the drop off of items.");
    }
    
    render() {
        var self = this;
        return (
            <nav>
                {this.props.menuItems.map(function(menuItem, i){

                    var classes;
                    
                    if(self.state.isSelected == i){
                        classes = cx([
                            'menu-item',
                            'selected'
                        ]);
                    } else {
                        classes = cx([
                            'menu-item'
                        ]);
                    }

                    return <MenuItem menuItem={menuItem} classes={classes} key={i}  onClick={self.handleClick.bind(self, i)}/>;
                })}

                <button className="callToAction" type="button" onClick={this.onDonate.bind(this)}>
                    <span>Donate</span>
                </button>
            </nav>
        )
    }
}

// <Counter count={this.props.count}/>


module.exports = NavBar;