import React from 'react';
import './App.css';
import 'rc-tooltip/assets/bootstrap.css';
import { Graph } from 'react-d3-graph';
import { graphInfo } from './data';


export default class RandomGeometricGraph extends React.Component {
  constructor(props) {
    super(props)
    this.canvas = React.createRef()
    this.state = {
      interval: this.props.interval,
      data: this.initGraph(this.props.initialAmount, {x: this.props.workspace.width, y: this.props.workspace.height}),
      cdf: this.props.cdf,
      radius: this.props.radius,
      step: this.props.step,
      isGraphDataInitialized: true,
      isSimulating: false,
    }
  }

  componentDidMount() {
    this.setState({width: this.canvas.current.offsetWidth})
  }

  addNewLink(source, target) {
    this.setState(({ data: { nodes, links } }) => {
      return {
        data: {
          nodes: nodes,
          links: [...links, { source: source, target: target}]
        }
      };
    })
  }

  initGraph(amount, canvas) {
    var nodes = []
    var links = []

    for (var i=0; i<amount; i++) {
      var x = Math.floor(Math.random()*(canvas.x-20))+10;
      var y = Math.floor(Math.random()*(canvas.y-20))+10;
      nodes[i] = {
        id: String(i+1),
        x : x,
        y: y,
      }
    }
    return ({
      nodes: nodes,
      links: links,
    })
  }

  static nodesAreLinked(links, nodeA, nodeB) {
    for (var i=0; i<links.length; i++) {
      if (links[i].source === nodeA.id && links[i].target === nodeB.id) {
        return true
      }
      if (links[i].target === nodeA.id && links[i].source === nodeB.id) {
        return true
      }
    }
    return false
  }

  static distanceBetweenNodes(nodeA, nodeB) {
    return Math.sqrt(Math.pow(nodeA.x-nodeB.x,2)+Math.pow(nodeA.y-nodeB.y,2))
  }

  addAttractiveness(cdf) {
    let nodes = this.state.data.nodes
    let links = this.state.data.links
    var newNodes = []
    for (var i=0; i<nodes.length; i++) {
      newNodes[i] = {
        ...nodes[i], attractiveness: this.generateAttractiveness(cdf)
      }
    }
    this.setState({data: {
      links: links,
      nodes: newNodes,
    }})
  }

  generateAttractiveness(cdf) {
    if (Object.keys(cdf).length === 0 && cdf.constructor === Object) {
      return 0
    }
    var random = Math.random()

    for (var i=0; i<cdf.y.length; i++) {
      if (random<cdf.y[i]) {
        return Math.round(cdf.x[i]*100)/100
      }
    }
    return 1
  }

  getPotentialNeighbours(node,radius) {
    let nodes = this.state.data.nodes
    let links = this.state.data.links
    let nodesAreLinked = RandomGeometricGraph.nodesAreLinked
    let distanceBetweenNodes = RandomGeometricGraph.distanceBetweenNodes

    if (nodes === null || (Object.keys(nodes).length === 0 && nodes === Object)) {
      return []
    }
    var neighbours = []

    for (var i=0; i<nodes.length; i++) {

      if (node.id !== nodes[i].id) {
        let distance = distanceBetweenNodes(node,nodes[i])
        if (distance <= radius) {
          if (!nodesAreLinked(links, node, nodes[i])) {
            neighbours.push(nodes[i])
          }
        }
      }
    }
    return neighbours
  }

  updateRadius() {
    this.setState({radius: this.state.radius+this.state.step})
  }

  graphGeneration(radius) {
    let nodes = this.state.data.nodes
    for (var i=0; i<nodes.length; i++) {
      var neighbours = this.getPotentialNeighbours(nodes[i],radius)
      let unlikeness = Math.random()*10
      for (var j=0; j<neighbours.length; j++) {
        if (nodes[j].attractiveness > unlikeness && neighbours[j].attractiveness > unlikeness) {
          this.addNewLink(nodes[i].id, neighbours[j].id)
        }
      }
    }
  }

  resetLinks() {
    this.setState(({ data: { nodes, links } }) => {
      return { data: { nodes: nodes, links: [] } };
    })

    this.setState({radius: this.props.radius})
  }

  startSimulation = () => {
    this.graphGeneration(this.state.radius)
    this.updateRadius()
  }

  stopSimulation = () => {
    this.setState({isSimulating: false})
  }

  initializeGraph() {
    this.setState({isGraphDataInitialized: false})
    this.setState({data: this.initGraph(this.props.initialAmount, {x: this.props.workspace.width, y: this.props.workspace.height})})
    this.addAttractiveness(this.props.cdf)
    this.setState({isGraphDataInitialized: true})
  }

  onMouseOverNode(nodeID,nodes) {
    for (var i=0; i<nodes.length; i++) {
      if (nodes[i].id === nodeID) {
        // TODO
      }
    }
  }

  render() {
    return (
      <div style={{padding: 20, maxWidth: this.state.width, width: this.props.width, height: this.props.height}}>
        <div ref={this.canvas}>
        { this.state.isGraphDataInitialized ?
          <Graph
            id="social network graph"
            onMouseOverNode={(id) => this.onMouseOverNode(id,this.state.data.nodes)}
            data={this.state.data}
            config={graphInfo.config}
          />
          :
          <div></div>
        }
        </div>
      </div>
    )
  }
}
