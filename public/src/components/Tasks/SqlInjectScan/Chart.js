/**
 * Created by orange on 16/8/29.
 */
import createG2 from 'g2-react';
import {Stat} from 'g2';
import React from 'react';
import reqwest from 'reqwest';


const Pie = createG2(chart => {
    chart.coord('theta', {
        radius: 0.5
    });
    chart.clear();
    chart.legend('right');
    chart.intervalStack().position(Stat.summary.percent('value')).color('name').label('name*..percent', function (name, percent) {
        percent = (percent * 100).toFixed(2) + '%';
        return name + ' ' + percent;
    });
    chart.render();
});


const Chart = React.createClass({

    getInitialState() {
        return {
            loading: false,
            data: [],
            width: 800,
            height: 550,
            plotCfg: {
                margin: [10, 200, 50, 10],
            },
        };
    },

    fetch() {
        this.setState({loading: true});
        reqwest({
            url: this.props.apiurl,
            method: 'get',
            type: 'json',
        }).then(data => {
            console.log(data);
            this.setState({
                data: data,
                loading: false,
            });
        });
    },
    changeHandler() {
        const {chart} = this.refs.myChart;
        chart.clear();
        chart.intervalStack().position(Stat.summary.percent('value')).color('name').label('name*..percent', function (name, percent) {
            percent = (percent * 100).toFixed(2) + '%';
            return name + ' ' + percent;
        });
        chart.render();
    },

    componentWillMount(){
        this.fetch();
    },
    componentDidMount(){
        setTimeout(this.changeHandler,300);
    },
    render() {
        return (
            <div>
                <Pie
                    data={this.state.data}
                    width={this.state.width}
                    height={this.state.height}
                    plotCfg={this.state.plotCfg}
                    ref="myChart"
                />
            </div>
        );
    },
});

export default Chart;