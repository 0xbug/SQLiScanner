/**
 * Created by orange on 16/8/29.
 */
import createG2 from 'g2-react';
import {Stat} from 'g2';
import React from 'react';
import ReactDOM from 'react-dom';
import reqwest from 'reqwest';
import Result from './Result';


const Pie = createG2(chart => {
    chart.coord('theta', {
        radius: 0.6
    });
    chart.legend({
        position: 'bottom',
        itemWrap: true,
        spacingX: 20
    });
});


class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.changeHandler = this.changeHandler.bind(this);
        this.state = {
            loading: false,
            forceFit: true,
            data: [],
            width: 800,
            height: 500,
            plotCfg: {},
            target: this.props.filter,
        }
    }

    fetch() {
        this.setState({loading: true});
        reqwest({
            url: this.props.apiurl,
            method: 'get',
            type: 'json',
        }).then(data => {
            this.setState({
                data: data,
                loading: false,
            });
        });
    }

    changeHandler() {
        const {chart} = this.refs.myChart;
        chart.clear();
        chart.intervalStack().position(Stat.summary.percent('value')).color('name').label('name*..percent', function (name, percent) {
            percent = (percent * 100).toFixed(2) + '%';
            return name + ' ' + percent;
        });
        chart.render();

        chart.on('plotclick', ev=> {
            this.setState({loading: true});
            let point = ev.data;
            if (point) {
                let scale = chart.getScale('name');
                let host = scale.values[point.name];
                this.setState({
                    target: this.props.filter + host,
                    loading: false
                });
                ReactDOM.unmountComponentAtNode(document.getElementById('filterResult'));
                ReactDOM.render(<Result apiurl={this.state.target}/>, document.getElementById('filterResult'));
            }
        });
    }

    componentWillMount() {
        this.fetch();
    }

    componentDidMount() {
        setTimeout(this.changeHandler, 800);
    }

    render() {
        return (
            <div>
                <Pie
                    data={this.state.data}
                    forceFit={this.state.forceFit}
                    width={this.state.width}
                    height={this.state.height}
                    plotCfg={this.state.plotCfg}
                    ref="myChart"
                />
                <div id="filterResult">
                </div>

            </div>
        );
    }
}

export default Chart;