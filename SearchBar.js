import React, { Component } from 'react';

export default class SearchBar extends Component {
  render() {
    return (
      <div className="searchbar">
        { this.props.children }
      </div>
    )
  }
}
