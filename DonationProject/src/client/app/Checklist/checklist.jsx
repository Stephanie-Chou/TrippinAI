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

module.exports = Checklist;