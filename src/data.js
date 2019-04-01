export const functionInfo = {
  gauss1: {
    label: "Gauss",
    mathFunction: (x,parameters) => gauss(x,parameters),
    defaults: {
      variance: 1,
      expected: 5,
      lift: 0
    },
    slider: {
      variance: {
        label: "Variance",
        min: 0.2,
        max: 10,
        step: 0.1
      },
      expected: {
        label: "Expected value",
        min: -5,
        max: 14,
        step: 0.1
      },
      lift: {
        label: "Plot lift",
        min: 0,
        max: 0.9,
        step: 0.01
      }
    },
  },
  staircase: {
    label: "Staircase",
    mathFunction: (x,parameters) => staircase(x,parameters),
    defaults: {
      coefficient: 0.2,
      lift: 0
    },
    slider: {
      coefficient: {
        label: "Step size",
        min: 0.01,
        max: 10,
        step: 0.01
      },
      lift: {
        label: "Plot lift",
        min: 0,
        max: 10,
        step: 0.01
      }
    },
  },
  linear: {
    label: "Linear",
    mathFunction: (x,parameters) => linear(x,parameters),
    defaults: {
      coefficient: 0,
      lift: 1
    },
    slider: {
      coefficient: {
        label: "Coefficient",
        min: -2,
        max: 2,
        step: 0.01
      },
      lift: {
        label: "Plot lift",
        min: -2,
        max: 2,
        step: 0.01
      }
    },
  },
  rational: {
    label: "Rational",
    mathFunction: (x,parameters) => rational(x,parameters),
    defaults: {
      coefficient: 1,
      lift: 0
    },
    slider: {
      coefficient: {
        label: "Coefficient",
        min: 0,
        max: 10,
        step: 0.1
      },
      lift: {
        label: "Plot lift",
        min: -10,
        max: 10,
        step: 0.1
      }
    },
  }
}

export const graphInfo = {
  parameters: {
    numberOfNodes: {
      label: "Node amount",
      defaultValue: 300,
      min: 2,
      step: 1,
    },
    radius: {
      label: "Radius",
      defaultValue: 10,
      min: 0,
      step: "any",
    },
    step: {
      label: "Radius change",
      defaultValue: 2,
      min: 0,
      step: "any"
    },
  },
  config: {
    nodeHighlightBehavior: true,
    staticGraph: true,
    node: {
      color: '#317AB7',
      size: 50,
      highlightStrokeColor: '#317AB7',
      renderLabel: false,
    },
    link: {
      highlightColor: '#317AB7',
      color: "#7C7C7C",
    },
    width: 600,
    height: 600,
  },
}

function gauss(x, parameters) {
  let variance = parameters.variance
  let expected = parameters.expected
  let lift = parameters.lift

  let value = ((1/Math.sqrt(2*Math.PI*variance))*Math.pow(Math.E,(-Math.pow(x-expected,2)/(2*variance))))+lift

  return value
}

function staircase(x, parameters) {
  let coefficient = parameters.coefficient
  let lift = parameters.lift

  let value = 1-Math.floor(x/coefficient)*0.1+lift

  if (value<0) { return 0 }
  else if (value>1) { return 1 }
  else { return value }
 }

function linear(x, parameters) {
  let coefficient = parameters.coefficient
  let lift = parameters.lift

  let value = coefficient*x+lift

  if (value<0) { return 0 }
  else if (value>1) { return 1 }
  else { return value }
}

function rational(x, parameters) {
  let coefficient = parameters.coefficient
  let lift = parameters.lift

  let value = x < coefficient ? coefficient : (coefficient/x)*coefficient+lift;

  if (value<0) { return 0 }
  else if (value>1) { return 1 }
  else { return value }
}
