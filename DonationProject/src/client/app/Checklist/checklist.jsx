'use strict';
import React from 'react';
import {render} from 'react-dom';

var ChecklistItem = require('./checklistItem.jsx');

// checklists can be shared and sent.
class Checklist extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        var list = this.props.list
        return (
            <div>
                <ul>
                    {this.props.list.items.map(function(listItem, i){
                        return <ChecklistItem listItem={listItem} id={i} key={i} list={list}/>;
                    })}
                </ul>
            </div>
        )
    }
}

module.exports = Checklist;