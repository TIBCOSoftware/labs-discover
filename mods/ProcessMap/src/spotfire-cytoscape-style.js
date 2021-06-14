/*
* Copyright © 2020. TIBCO Software Inc.
* This file is subject to the license terms contained
* in the license file that is distributed with this file.
*/

function getTextColor(bgColor) {
  var darkColor = '#000';
  var lightColor = '#fff';

  var r, g, b;
  var result = hexToRGB(bgColor);
  if (result) {
    r = parseInt(result[1], 16);
    g = parseInt(result[2], 16);
    b = parseInt(result[3], 16);
  } else {
    // format = rgb(r, g ,b)
    result = /^rgb\((\d+),\s?(\d+),\s?(\d+)\)$/i.exec(bgColor);
    r = parseInt(result[1]);
    g = parseInt(result[2]);
    b = parseInt(result[3]);
  }

  if (r && g && b) {
    var colors = [r / 255, g / 255, b / 255];
    var c = colors.map((color) => {
      if (color <= 0.03928) {
        return color / 12.92;
      }
      return Math.pow((color + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? darkColor : lightColor;
  }

  return darkColor;
}

function hexToRGB(hex) {
  var regex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(regex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function mapColor(value, min, max, minColorHex, maxColorHex) {
  var percent = (value - min) / (max - min);

  if (percent < 0) {
    percent = 0;
  } else if (percent > 1) {
    percent = 1;
  }

  var minColor = hexToRGB(minColorHex);
  var maxColor = hexToRGB(maxColorHex);

  var color = [
    Math.round(minColor.r + (maxColor.r - minColor.r) * percent),
    Math.round(minColor.g + (maxColor.g - minColor.g) * percent),
    Math.round(minColor.b + (maxColor.b - minColor.b) * percent)
  ];

  return 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
}

function normalizeNumber(value, min, max) {
  value = Number(value);
  if (isNaN(value)) {
    // TODO : log warning?
    return 0;
  }

  var result = 0;
  if (min === max) {
    result = 0.5;
  } else {
    result = (value - min) / (max - min);
  }

  if (result < 0) {
    result = 0;
  } else if (result > 1) {
    result = 1;
  }

  return result;
}

function normalizeAndScale(value, min, max, scaleMin, scaleMax) {
  var normValue = normalizeNumber(value, min, max);
  var result = (scaleMin + (scaleMax - scaleMin) * normValue);
  return result;
}

function getCytoscapeStyle(nodeShape = "round-rectangle") {

  let width = "150px";
  let height = undefined;
  if (nodeShape === "ellipse") {
    width = "50px";
    height = "50px";
  }

  return [
    {
      selector: 'node',
      style: {
        'text-wrap': 'wrap',
        'text-max-width': width,
        'shape': nodeShape,
        'width': width,
        'height': height,
        'text-valign': 'center',
        'text-halign': 'center',
        'font-size': '12px',
        'padding': '12px'
      }
    },
    {
      selector: 'node[label]',
      style: {
        'label': 'data(label)'
      }
    },
    {
      selector: 'node[color]',
      style:{
        'background-color': 'data(color)',
        'text-outline-color': function (ele) { return ele.style('background-color'); },
        'color': function (ele) { return getTextColor(ele.style('background-color')); },
      }
    },
    {
      selector: ':parent',
      style: {
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#f4f4f4'//'#f3f4fb'
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'control-point-step-size': '75px',
        'loop-direction': '67deg',
        'loop-sweep': '-45deg',
        'target-arrow-shape': 'triangle',
        'text-wrap': 'wrap',
        'text-border-color': '#000',
        'text-border-width': 1,
        'text-border-opacity': 1,
        'text-background-color': '#f8ed7b',
        'text-background-opacity': 1,
        'text-background-padding': '2px',
        //'text-margin-x': 10,
        'font-size': '10px',
        'line-color': 'data(color)',
        'target-arrow-color': 'data(color)',
        'width': 'mapData(sizeBy, 0, 1, 2, 10)'
        // 'width' : function(ele){           
        //   let value = ele.data("sizeBy");
        //   return normalizeAndScale(value, 0, 1, 2, 10);
        // } 
      }
    },
    {
      selector: 'edge[label]',
      style: {
        'label': 'data(label)',
        'text-background-color': '#f4f4f4',
        'text-border-opacity': 0,
        'text-background-shape': 'round-rectangle',
        'color': '#212121',
        // 'font-family': "Source Sans Pro",
        // 'font-size': '10px',
        'letter-spacing': 0,
        // 'line-height': '13px',
        'font-weight': 400
      }
    },
    // {
    //   selector: 'edge[sizeBy]',
    //   style: {
    //     'width' : function(ele){           
    //       var value = ele.data("sizeBy");
    //       return normalizeAndScale(value, 0, 1, 1, 10);
    //     }
    //   }
    // },
    {
      selector: 'edge.virtual',
      style: {
        'line-style': 'dashed'
      }
    },
    {
      selector: 'node.left', // Model only
      style: {
        'background-color': '#259bc2',
        'text-outline-color': '#259bc2',
        'color': '#fff'
      }
    },
    {
      selector: 'node.right', // Non compliant
      style: {
        'background-color': '#f86a7d',
        'text-outline-color': '#f86a7d',
        'color': '#fff'
      }
    },
    {
      selector: 'node.both', // Compliant
      style: {
        'background-color': '#7dc95e', 
        'text-outline-color': '#7dc95e',
        'color': '#fff'
      }
    },
    // {
    //   selector: 'node.start',
    //   style: {
    //     'shape': 'ellipse',
    //     'label': '',
    //     'width': '25px',
    //     'height': '25px',
    //     'background-image': "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3C!DOCTYPE%20svg%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22black%22%20width%3D%2218px%22%20height%3D%2218px%22%3E%3Cpath%20d%3D%22M8%205v14l11-7z%22%2F%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E",
    //     'background-height': '80%',
    //     'background-width': '80%',
    //     'background-color': 'green',
    //     'text-valign': 'center',
    //     'text-halign': 'center',
    //     'text-outline-width': 0,
    //     'color': '#000',
    //     'padding': '10px'
    //   }
    // },
    {
      selector: 'node.start',
      style: {
        'shape': 'ellipse',
        'label': '',
        'width': '24px',
        'height': '24px',
        'background-image': "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2040%2040%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cg%20stroke%3D%22none%22%20stroke-width%3D%221%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20transform%3D%22translate(-34.000000%2C%20-170.000000)%22%20fill%3D%22%23727272%22%3E%3Cg%20transform%3D%22translate(34.000000%2C%20170.000000)%22%3E%3Cpath%20d%3D%22M20%2C38.3333333%20C14.375%2C34.6666667%205%2C24.5833333%205%2C16.3333333%20C5%2C8.08333333%2011.7157287%2C1.66666667%2020%2C1.66666667%20C28.2842713%2C1.66666667%2035%2C8.08333333%2035%2C16.3333333%20C35%2C24.5833333%2024.6875%2C34.6666667%2020%2C38.3333333%20Z%20M20%2C4.92592593%20C26.4433221%2C4.92592593%2031.6666667%2C10.0331962%2031.6666667%2C16.3333333%20C31.6666667%2C22.6334705%2026.4433221%2C27.7407407%2020%2C27.7407407%20C13.5566779%2C27.7407407%208.33333333%2C22.6334705%208.33333333%2C16.3333333%20C8.33333333%2C10.0331962%2013.5566779%2C4.92592593%2020%2C4.92592593%20Z%20M16.1300115%2C11.0403256%20C15.8998929%2C11.0403256%2015.7133448%2C11.2268736%2015.7133448%2C11.4569923%20L15.7133448%2C11.4569923%20L15.7133448%2C21.2096744%20C15.7133448%2C21.2808166%2015.7315604%2C21.3507739%2015.7662563%2C21.4128819%20C15.8784847%2C21.6137784%2016.1323226%2C21.685658%2016.333219%2C21.5734296%20L16.333219%2C21.5734296%20L25.0621985%2C16.6970885%20C25.1295446%2C16.6594664%2025.1851241%2C16.6038869%2025.2227462%2C16.5365408%20C25.3349746%2C16.3356444%2025.263095%2C16.0818066%2025.0621985%2C15.9695782%20L25.0621985%2C15.9695782%20L16.333219%2C11.0932371%20C16.271111%2C11.0585412%2016.2011537%2C11.0403256%2016.1300115%2C11.0403256%20Z%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E",
        'background-color': '#fff',
        // 'padding' : '10px'
      }
    },
    {
      selector: 'node.stop',
      style: {
        'shape': 'ellipse',
        'label': '',
        'width': '24px',
        'height': '24px',
        'background-image': "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3Csvg%20width%3D%2240px%22%20height%3D%2240px%22%20viewBox%3D%220%200%2040%2040%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cg%20stroke%3D%22none%22%20stroke-width%3D%221%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20transform%3D%22translate(-98.000000%2C%20-170.000000)%22%20fill%3D%22%23727272%22%3E%3Cg%20transform%3D%22translate(98.000000%2C%20170.000000)%22%3E%3Cpath%20d%3D%22M20%2C38.3333333%20C14.375%2C34.6666667%205%2C24.5833333%205%2C16.3333333%20C5%2C8.08333333%2011.7157287%2C1.66666667%2020%2C1.66666667%20C28.2842713%2C1.66666667%2035%2C8.08333333%2035%2C16.3333333%20C35%2C24.5833333%2024.6875%2C34.6666667%2020%2C38.3333333%20Z%20M20%2C4.92592593%20C26.4433221%2C4.92592593%2031.6666667%2C10.0331962%2031.6666667%2C16.3333333%20C31.6666667%2C22.6334705%2026.4433221%2C27.7407407%2020%2C27.7407407%20C13.5566779%2C27.7407407%208.33333333%2C22.6334705%208.33333333%2C16.3333333%20C8.33333333%2C10.0331962%2013.5566779%2C4.92592593%2020%2C4.92592593%20Z%20M25%2C11.4444444%20L15%2C11.4444444%20L15%2C21.2222222%20L25%2C21.2222222%20L25%2C11.4444444%20Z%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E",
        'background-color': '#fff'
      }
    },
    // {
    //   selector: 'node.stop',
    //   style: {
    //     'shape': 'ellipse',
    //     'label': '',
    //     'width': '25px',
    //     'height': '25px',
    //     'background-image': "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3C!DOCTYPE%20svg%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22black%22%20width%3D%2218px%22%20height%3D%2218px%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M6%206h12v12H6z%22%2F%3E%3C%2Fsvg%3E",
    //     'background-height': '80%',
    //     'background-width': '80%',
    //     'background-color': 'green',
    //     'text-valign': 'center',
    //     'text-halign': 'center',
    //     'text-outline-width': 0,
    //     'color': '#000',
    //     'padding': '10px'
    //   }
    // },
    {
      selector: 'edge.left', // Model only
      style: {
        'label': '',
        'width': '1px',
        'line-color': '#259bc2',
        'target-arrow-color': '#259bc2'
      }
    },
    {
      selector: 'edge.right', // Non compliant
      style: {
        'label': '',
        'width': '1px',
        'line-color': '#f86a7d',
        'target-arrow-color': '#f86a7d'
      }
    },
    {
      selector: 'edge.both', // Compliant
      style: {
        'label': '',
        'width': '1px',
        'line-color': '#7dc95e',
        'target-arrow-color': '#7dc95e'
      }
    }/*,
      {
        selector: 'node:selected',
        style: {
          'background-color' : '#B73EAB',
          'text-outline-color' : '#B73EAB'
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': '#B73EAB',
          'target-arrow-color': '#B73EAB'
        }
      }*/

  ];
}
