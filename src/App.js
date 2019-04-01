import React, { Component } from 'react';
import './App.css';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import { Button, DropdownButton, MenuItem } from 'react-bootstrap'
import Chart from './chart';
import RandomGeometricGraph from './graph';
import { functionInfo, graphInfo } from './data';

function getGraphDefaults() {
  var defaults = {}
  if ("parameters" in graphInfo) {
    Object.keys(graphInfo.parameters).forEach(function(key){
      defaults[key] = graphInfo.parameters[key].defaultValue
    })
  }
  return defaults
}

function getDefaultSelection() {
  if (functionInfo && Object.keys(functionInfo).length > 0) {
    let name = Object.values(functionInfo)[0].label
    let type = Object.keys(functionInfo)[0]
    return( {name : name, type: type} )
  }
  else { return {} }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
        render: false,
        interval: 2000,
        data: {
          nodes: [{ id: 0 }],
          links: []
        },
        cdf: {},
        isSimulating: false,
        selection: getDefaultSelection(),
        graphParameters: getGraphDefaults(),

        isGraphGenerated: false,
    }
    this.graph = React.createRef();
    this.chart = React.createRef();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  nextIteration() {
    this.graph.current.startSimulation()
  }

  resetGraph() {
    this.graph.current.resetLinks()
  }

  startSimulation() {
    this.setState({isSimulating: true})
    this.graph.current.startSimulation()

    this.interval = setInterval(() => {
      this.graph.current.startSimulation()
    }, this.state.interval);
  }

  stopSimulation() {
    clearInterval(this.interval);
    this.setState({isSimulating: false})
  }

  async onInitGraphEditing() {
    await this.chart.current.sendData(async (data) => {
      await this.setState({cdf: data.cdf})
    })
    this.resetGraph()
    this.setState({isGraphGenerated: false})
  }

  async onInitGenerateGraph() {
    await this.chart.current.sendData(async (data) => {
      await this.setState({cdf: data.cdf})
    })
    this.resetGraph()
    this.graph.current.initializeGraph()
    this.setState({isGraphGenerated: true})
  }

  selectFunctionType(type) {
    this.chart.current.update(type)
    this.setState({selection: {name: functionInfo[type].label, type: type}})
  }

  udpateGraphParameters(key,value) {
    this.setState((prevState) => ({
     graphParameters: { ...prevState.graphParameters, [key]: value}
   }));
  }

  render() {
    return (
      <div className="App"  style={{flex:1}}>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossOrigin="anonymous"/>
        <header className="App-header">
        </header>
        <div style={{display: "flex", height:"100vh", flexDirection: "row"}}>
        <div style={{flex: 1, paddingTop: 20, backgroundColor: "#3C3C3C", height: "100%"}}>

        <div style={{flexDirection: "row", paddingTop: 10, alignItems: "center"}}>
          <FunctionDropdown
            name={this.state.selection.name}
            onSelect={(type) => this.selectFunctionType(type)}
            visible={this.state.isGraphGenerated}
          />
          <Buttons
            isGraphGenerated={this.state.isGraphGenerated}
            isSimulating={this.state.isSimulating}
            stopSimulation={() => this.stopSimulation()}
            startSimulation={() => this.startSimulation()}
            onInitGraphEditing={async () => this.onInitGraphEditing()}
            onInitGenerateGraph={async () => this.onInitGenerateGraph()}
            nextIteration={() => this.nextIteration()}
            resetGraph={() => this.resetGraph()}
          />
        </div>
          <Chart
            amount={100}
            parameters={{a: 1, b:1, c:0}}
            range={{begin: 0, end: 10}}
            width="700"
            type={this.state.selection.type}
            callback={(data) => {this.setState({cdf: data.cdf})}}
            ref={this.chart}
          />
        </div>
        <div style={{flex:1,backgroundColor: "#ECECEC", justifyContent: 'center', alignItems: 'center'}}>
          <div style={{justifyContent: 'center', margin: "auto", alignItems: 'center'}}>
            <GraphParameterFields
              width={50}
              disabled={this.state.isGraphGenerated}
              graphParameters={this.state.graphParameters}
              onChange={(key,value) => this.udpateGraphParameters(key,value)}
            />
            <RandomGeometricGraph
              ref={this.graph}
              width="100%"
              height="80vh"
              workspace={{width: 600, height: 600}}
              initialAmount={!this.state.graphParameters.numberOfNodes ? 2 : this.state.graphParameters.numberOfNodes}
              cdf={this.state.cdf}
              radius={this.state.graphParameters.radius}
              step={this.state.graphParameters.step}
              interval={1000}
            />
          </div>
        </div>
        </div>
      </div>
    );
  }
}

const FunctionDropdown = (props) => {
  if (props.visible) {
    return(<div></div>)
  }
  else {
    let menuItems = []
    Object.keys(functionInfo).forEach(function(key) {
      const item = (props) => {
        return (
          <MenuItem eventKey={key} onSelect={() => {props.onSelect(key)}}>
            {functionInfo[key].label}
          </MenuItem>
        )
      }
      menuItems.push(item)
    })
    return (
      <DropdownButton id="functionType" bsStyle="default" title={props.name} key={1}>
        {menuItems.map(function(Slider, index){
          return <Slider key={index} onSelect={props.onSelect}/>
        })}
      </DropdownButton>
    )
  }
}

const Buttons = (props) => {
  const FirstRow = (props) => {
    if (props.isGraphGenerated) {
      return (
        <div>
          <Button style={{marginRight: 10}} bsStyle="default" onClick={async () => props.onInitGraphEditing() }>
            Edit graph
          </Button>
        </div>
      )
    }
    else {
      return (
        <div style={{margin:10}}>
          <Button style={{marginRight: 10}} bsStyle="primary" onClick={async () => props.onInitGenerateGraph()}>
            Generate graph
          </Button>
        </div>
      )
    }
  }
  const SecondRow = (props) => {
    if (!props.isGraphGenerated) { return (<div></div>) }
    else {
      const SimulationButton = (props) => {
        if (props.isSimulating) {
          return (
            <Button style={{marginLeft: 10}} bsStyle="primary" onClick={() => props.stopSimulation()}>
              Finish
            </Button>
          )
        }
        else {
          return (
            <Button disabled={false} style={{marginLeft: 10, marginRight: 10}} bsStyle="primary" onClick={async () => props.startSimulation()}>
              Simulation
            </Button>
          )
        }
      }
      return (
        <div style={{margin:10}}>
          <SimulationButton isSimulating={props.isSimulating} stopSimulation={props.stopSimulation} startSimulation={props.startSimulation}/>
          <Button style={{marginLeft: 10, marginRight: 10}} bsStyle="primary" onClick={() => props.nextIteration()}>
            Next iteration
          </Button>
          <Button style={{marginLeft: 10}} bsStyle="primary" onClick={() => props.resetGraph()}>
            Reset graph
          </Button>
        </div>
      )
    }
  }

  return (
    <div>
      <FirstRow
        isGraphGenerated={props.isGraphGenerated}
        onInitGraphEditing={props.onInitGraphEditing}
        onInitGenerateGraph={props.onInitGenerateGraph}
      />
      <SecondRow
        isGraphGenerated={props.isGraphGenerated}
        isSimulating={props.isSimulating}
        stopSimulation={props.stopSimulation}
        startSimulation={props.startSimulation}
        nextIteration={props.nextIteration}
        resetGraph={props.resetGraph}
      />
    </div>
  )
}

const GraphParameterFields = (props) => {
  var fields = []
  Object.keys(graphInfo.parameters).forEach(function(key) {
    let parameters = graphInfo.parameters[key]
    const item = (props) => {
      return (
        <div style={{flex: 1,paddingTop:20, paddingBottom:20}}>
          <p>{parameters.label}</p>
          <input
            min={parameters.min}
            step={parameters.step}
            disabled={props.disabled ? "disabled" : ""}
            type="number"
            style={{width: props.width}}
            value={props.graphParameters[key]}
            onChange={(event) => props.onChange(key,event.target.value)}
          />
        </div>
      )
    }
    fields.push(
      item
    )
  })
  return (
    <div style={{display:"flex", flexDirection: "row"}}>
      { fields.map(function(Field, index){ return (
        <Field
          key={index}
          disabled={props.disabled}
          width={props.width}
          graphParameters={props.graphParameters}
          onChange={props.onChange} />
        ) }
      )
    }
    </div>
  )
}

export default App;
