'use strict';
import React from 'react';
import {render} from 'react-dom';

class Counter extends React.Component {
    constructor (props) {
        super(props);
        
        this.state = {
            count: props.count
        }


    }
    
    onChange(increment) {
        var count = increment ? this.state.count++ : this.state.count--;
        this.setState({
            count: count
        });
    }
    
    render() {
        return (
            <div className="counter">
                {this.props.count}
            </div>
        )
    }
    
}

module.exports = Counter;