'use strict';
import React from 'react';
import {render} from 'react-dom';
var cx = require('classnames');

var MenuItem = require('./../Components/menuItem.jsx');

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            isSelected : 0
        }
    }

    handleClick(index) {
        this.setState({
            isSelected: index
        });
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
            </nav>
        )
    }
}

module.exports = NavBar;