import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons'


class SelectedCoin extends Component {

    render() {
        if (this.props.icon === 'remove') {
            return (
                <div className="selected-coin">
                    <FontAwesomeIcon icon={faMinusCircle} className="fa-2x"/>
                    <h2>{this.props.symbol}</h2>
                </div>
            );
        } else {
            return(
                <div onClick={this.props.openSearch} className="selected-coin add-coin">
                    <FontAwesomeIcon icon={faPlusCircle} className="fa-2x" />
                    <h2>{this.props.symbol}</h2>
                </div>
            );

        }
    }
}

export default SelectedCoin;
