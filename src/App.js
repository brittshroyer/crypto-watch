import React, { Component } from 'react';
import SearchTable from './components/SearchTable';
import SelectedCoins from './components/SelectedCoins';
import Axis from './components/Axis';
import Chart from './components/Chart';
import Tselect from './components/Tselect';
import axios from 'axios';
import moment from 'moment';
import * as d3 from 'd3';

import './App.css';

// import { library } from '@fortawesome/fontawesome-svg-core';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faStroopwafel } from '@fortawesome/free-solid-svg-icons';
// import logo from './logo.svg'; // add new logo

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedCoins: [],
            yAxisData: [],
            xAxisData: [],
            openSearchTable: false,
            timeSelection: '24h'
        };
    }
    // time_open: "2018-08-24T16:39:02.0000000Z",
    // price_open: 6519.55
    //
    // time_open: "2018-08-24T16:45:01.0000000Z"
    // price_open: 6521.99,

    changeTimeSelection = (selection) => {
        let currentCoins = this.state.selectedCoins.slice();
        let resetPromise = new Promise((resolve, reject) => {
            resolve(this.reset());
        });
        resetPromise.then(() => {
            this.setState({timeSelection: selection});
            this.getCoin(currentCoins);
        });
        // this.reset();
    };

    getTimeConfig = () => {
        let timeSelection = this.state.timeSelection;
        let timeConfig;
        const timeEnd = moment();

        switch(timeSelection) {
            case 'Live':
                timeConfig = {
                    timeStart: timeEnd.subtract(1, 'hour').toISOString(),
                    interval: '1MIN'
                };
                break;
            case '24h':
                timeConfig = {
                    timeStart: timeEnd.subtract(1, 'day').toISOString(),
                    interval: '15MIN'
                };
                break;
            case '1m':
                timeConfig = {
                    timeStart: timeEnd.subtract(1, 'month').toISOString(),
                    interval: '8HRS'
                };
                break;
            case '1y':
                timeConfig = {
                    timeStart: timeEnd.subtract(1, 'year').toISOString(),
                    interval: '5DAY'
                };
                break;
            case 'All':
                timeConfig = {
                    timeStart: timeEnd.subtract(8, 'year').toISOString(),
                    interval: '1MTH'
                };
                break;
            default:
                timeConfig = {
                    timeStart: timeEnd.subtract(1, 'day').toISOString(),
                    interval: '15MIN'
                };
        }
        return timeConfig;
    };

    // addCoin = (coin) => {
    //     const ticker = coin.trim().toUpperCase();
    //     let selectedCoins = this.state.selectedCoins.concat(ticker);
    //     this.setState({selectedCoins});
    //     this.getCoinData()
    // };

    getYAxisData = (apiResponse) => {
        return apiResponse.map(d => {
            let parsed = Date.parse(d.time_open);
            return {
                date: new Date(parsed),
                price: d.price_open
            };
        });
    };

    getXAxisData = (apiResponse) => {
        return apiResponse.map(d => {
            let parsed = Date.parse(d.time_open);
            return {
                date: new Date(parsed),
            };
        });
    };

    reset = () => {
        this.setState({
            yAxisData: [],
            xAxisData: [],
            openSearchTable: false,
            selectedCoins: []
        });
    };

    //separate functions for adding a coin actively and adding already loaded coins (passively) on timeChange since already loaded

    // function addCoin should accept an array as parameter => if array length is one, then setState on dataload, if longer, then
    //make recursive and call itself unitl all data is loading, then set state

    getCoin = (coinSymbols) => {
        console.log('coinSymbols', coinSymbols);
        const config = { headers : { "X-CoinAPI-Key": "40359CB8-D9FD-463C-8537-008C7D755BAA" }};
        let selectedCoins = this.state.selectedCoins.slice();
        let yAxisData = this.state.yAxisData.slice(),
            xAxisData,
            newCoins = selectedCoins.concat(coinSymbols),
            newYData;

        console.log('selectedCoins at start', selectedCoins); // empty array [btc]

        coinSymbols.forEach((coin, index) => {
            const ticker = coin;
            const timeConfig = this.getTimeConfig();
            const timeStart = timeConfig.timeStart;
            const interval = timeConfig.interval;
            const endpoint = `https://rest.coinapi.io/v1/ohlcv/BITSTAMP_SPOT_${ticker}_USD/history?period_id=${interval}&time_start=${timeStart}`;

            axios.get(endpoint, config)
            .then(res => {
                let yData = this.getYAxisData(res.data);
                let coinDataObject = { name: ticker, data: yData };
                yAxisData.push(coinDataObject);
                if (index < 1) { // only need to get time data once because we're only drawing one xaxis
                    xAxisData = this.getXAxisData(res.data);
                    this.setState({ xAxisData });
                }
            })
            .then(() => {
                // console.log('yaxis data in get coin', this.state.yAxisData);
                 //
                // newCoins.push(ticker); //
                // newYData = yAxisData.concat(yAxisData);
                if (index === coinSymbols.length - 1)  {  // if this is last coin
                    this.setState({ selectedCoins: newCoins, yAxisData: yAxisData, openSearchTable: false });
                }
            })
            .catch(err => {
                console.log('err', err);
                return;
                // notification ticker symbol not found
            });
        });
        // console.log('set state runnning, selectedCoins: ', newYdata);
    };

    removeCoin = (coin) => {
        let selectedCoinsCopy = this.state.selectedCoins.slice();
        let yAxisDataCopy = this.state.yAxisData.slice();
        let xAxisData = this.state.xAxisData;
        let coinIndex = selectedCoinsCopy.indexOf(coin);

        selectedCoinsCopy.splice(coinIndex, 1);
        yAxisDataCopy.splice(coinIndex, 1);

        if (this.state.selectedCoins.length === 1) {
            xAxisData = [];
        }
        this.setState({selectedCoins: selectedCoinsCopy, yAxisData: yAxisDataCopy, xAxisData: xAxisData});
    };

    openSearch = () => {
        this.setState({ openSearchTable: true });
    };

    // closeSearch = () => {
    //     this.setState({ openSearchTable: false });
    // };

    setColor = (index) => {
        let color;
        switch(index) {
            case 0:
                color = 'black';
                break;
            case 1:
                color = 'blue';
                break;
            case 2:
                color = 'red';
                break;
            default:
                color = 'black';
        }
        return color;
    };

    getMinPrice = (data) => {
        return d3.min(data, (d) => {
            return d.price;
        });
    };

    getMaxPrice = (data) => {
        return d3.max(data, (d) => {
            return d.price;
        });
    };

    render() {
        let h = 400,//h - margin * 2
            w = 860,// w - margin * 2
            chartComponents = [],
            yAxisComponents = [],
            yAxisTranslateLeft = 0,
            tickWidth = w * -1,
            xScale,
            xAxis;

        let coins = this.state.selectedCoins;
        let xAxisData = this.state.xAxisData;
        let yAxisData = this.state.yAxisData;

        yAxisData.forEach((coin,index) => {
            let strokeColor = this.setColor(index),
                coinData = coin.data,
                minPrice = this.getMinPrice(coinData),
                maxPrice = this.getMaxPrice(coinData),
                yScale = d3.scaleLinear().range([h, 0]).domain([minPrice, maxPrice]),
                yAxis = d3.axisLeft(yScale).tickSize(tickWidth);

            yAxisComponents.push(<Axis axis={ yAxis } axisType="y" key={ index } left= { yAxisTranslateLeft } />);
            chartComponents.push(<Chart data={ coinData } coin={ coin.name } key={ index + 1 } stroke={ strokeColor }/>);

            yAxisTranslateLeft -= 35;
            tickWidth = 0;
        });

        xScale = d3.scaleTime()
        .domain(d3.extent(xAxisData, (d) => {
            return d.date;
        }))
        .range([0, w]);

        xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H"));

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Crypto Watch</h1>
                </header>
                <div className="col-md-9">
                    <Tselect timeSelection={ this.state.timeSelection } changeTimeSelection={ this.changeTimeSelection }/>
                    <svg className="graph-svg">
                        <g transform="translate(50, 50)">
                            { chartComponents }
                            { yAxisComponents }
                            <Axis h={ h } axis={ xAxis } axisType="x"/>
                        </g>
                    </svg>
                </div>
                <div className="col-md-3">
                    <div className="search-table-container">
                        <SelectedCoins coins={ coins } openSearch={ this.openSearch } removeCoin={ this.removeCoin } />
                        { this.state.openSearchTable ? <SearchTable coins={ this.state.selectedCoins } getCoin={ this.getCoin } /> : null }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
