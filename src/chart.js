import React from 'react';
import './App.css';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import Slider from 'rc-slider';
import Plot from 'react-plotly.js';
import { plotStyle, textStyle, sliderStyle } from './chartStyle';
import { functionInfo } from './data';

function getParameters(type) {
  if (type in functionInfo && "defaults" in functionInfo[type]) {
    return functionInfo[type].defaults
  }
  else { return {} }
}

function getFunctionEvaluated(type,data) {
  if (type in functionInfo && "mathFunction" in functionInfo[type]) {
    let parameters = data.parameters
    let amount = data.amount+1
    let range = data.range
    let mathFunction = functionInfo[type].mathFunction
    return evaluateFunctionInRange(parameters,amount,range,mathFunction)
  }
  else { return {} }
}

function evaluateFunctionInRange(parameters, amount, range, mathFunction) {
  var x = []
  var y = []
  for (var i=0; i<amount; i++) {
    if (i===0) {
      x[i] = range.begin
    }
    else {
      x[i] = x[i-1]+((range.end-range.begin)/amount)
    }
    let functionValue = mathFunction(x[i],parameters)
    if (functionValue<0) {
      y[i] = 0
    }
    if (functionValue>1) {
      y[i] = 1
    }
    else {
      y[i] = functionValue
    }
  }
  return {x: x, y: y}
}

function evaluateCDFInRange(data,amount,range) {
  var x = []
  var y = []
  const step = (range.end-range.begin)/amount

  for (var i=0; i<amount; i++) {
    if (i===0) { x[i] = range.begin }
    else { x[i] = x[i-1]+step }

    if (!y.length) {
      y[i] = (data.y[i]+data.y[i+1])*step/2
    }
    else { y[i] = y[i-1]+(data.y[i]+data.y[i+1])*step/2 }
  }
  return {x: x, y: y}
}

function resizeFunction(data, coefficient) {
  var x = data.x
  var y = []
  for (var i=0; i<data.y.length; i++) {
    y[i] = data.y[i]*coefficient
  }
  return {x: x, y: y}
}

export default class Chart extends React.Component {
  constructor(props) {
    super(props)
    let initialData = getFunctionEvaluated(this.props.type,{
        parameters: getParameters(this.props.type),
        amount: this.props.amount,
        range: this.props.range
    })
    let initialCDF = evaluateCDFInRange(initialData, this.props.amount, this.props.range)
    let initialParameters = getParameters(this.props.type)

    this.state = {
      data: initialData,
      cdf: initialCDF,
      parameters: initialParameters,
      range: this.props.range,
      amount: this.props.amount,
      width: this.props.width,
    }
  }

  updateParameters(key : StateKeys, value) {
    this.setState((prevState) => ({
      parameters: { ...prevState.parameters, [key]: value}
    }));
    this.updateFunctions(this.props.type)
  }

  sendData() {
    this.props.callback({function: this.state.data, cdf: this.state.cdf})
  }

  update(type) {
    this.setState({parameters: getParameters(type) })
    this.updateFunctions(type)
  }

  async updateFunctions(type) {
    await this.setState({
      data: getFunctionEvaluated(type,{
        parameters: this.state.parameters,
        amount: this.state.amount,
        range: this.state.range
      })
    })
    this.setState({
      cdf: evaluateCDFInRange(this.state.data, this.state.amount, this.state.range)
    })

    let lastCDFElement = this.state.cdf.y[this.state.cdf.y.length-1]

    if (lastCDFElement < 0.95 || lastCDFElement > 1.05) {
      await this.setState({
        data: resizeFunction(this.state.data, 1/lastCDFElement)
      })
      this.setState({
        cdf: evaluateCDFInRange(this.state.data, this.state.amount, this.state.range)
      })
    }
  }

  render() {
    let parameters = this.state.parameters

    return(
      <div style={{width: this.state.width}}>
      <div style={{display: "flex"}}>
      <div style={{flex: 1, flexDirection: "row"}}>
        <FunctionPlot data={this.state.data} plotType="function" title="Probability plot" width={this.state.width}/>
        <FunctionPlot data={this.state.cdf} plotType="cdf" title="CDF plot" width={this.state.width}/>
      </div>
      </div>
        <div style={{margin: "auto", width: "50%"}}>
          <Sliders type={this.props.type} parameters={parameters} onChange={(dest,val) => this.updateParameters(dest,val)}  />
        </div>
      </div>
    )
  }
}

const Sliders = (props) => {
  let type = props.type
  if (type in functionInfo && "slider" in functionInfo[type]) {
    var sliders = []

    Object.keys(functionInfo[type].slider).forEach(function(key){
      let sliderData = functionInfo[type].slider[key]

      sliders.push(
        <div>
          <p style={{color: textStyle.color, fontSize: 15}}>
            {sliderData.label}
          </p>
          <Slider
            min={sliderData.min}
            max={sliderData.max}
            step={sliderData.step}
            handleStyle={{borderColor: sliderStyle.sliderMainColor}}
            railStyle={{backgroundColor: sliderStyle.sliderRailColor}}
            trackStyle={{backgroundColor: sliderStyle.sliderMainColor}}
            value={props.parameters[key]}
            onChange={(val) => props.onChange(key,val)}
          />
         </div>
      )
    })
    return (
      <div>{
        sliders.map(function(slider, index){
          return <div key={index}>{slider}</div>;
        })
      }</div>
    )
  }
  else {
    return (<div></div>)
  }
}

const FunctionPlot = (props) => {
  return (
    <Plot
      data={[
        {
          x: props.data.x,
          y: props.data.y,
          line: {
            simplify: false,
            color: plotStyle.plotColor,
          },
        },
      ]}
      layout={{
        width: props.width/2,
        height: props.width/2,
        title: props.title,
        xaxis: {
          gridcolor: plotStyle.gridColor,
          color: plotStyle.axesColor,
        },
        yaxis: {
          gridcolor: plotStyle.gridColor,
          range: [0,1.01],
          color: plotStyle.axesColor,
        },
        font: {
          color: plotStyle.plotTitleColor,
        },
        paper_bgcolor: plotStyle.plotBackground,
        plot_bgcolor: plotStyle.plotBackground
      }}
      yaxis={{
        autorange: false,
        range: [0,1.2]
      }}
      config={{staticPlot: true}}
    />
  )
}
