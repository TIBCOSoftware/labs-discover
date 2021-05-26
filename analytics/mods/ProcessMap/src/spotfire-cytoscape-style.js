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
        'label': 'data(label)'
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
      selector: 'node.left',
      style: {
        'background-color': '#4575b4',
        'text-outline-color': '#4575b4',
        'color': '#fff'
      }
    },
    {
      selector: 'node.right',
      style: {
        'background-color': '#d73027',
        'text-outline-color': '#d73027',
        'color': '#fff'
      }
    },
    {
      selector: 'node.both',
      style: {
        'background-color': '#1a9850',
        'text-outline-color': '#1a9850',
        'color': '#fff'
      }
    },
    {
      selector: 'node.start',
      style: {
        'shape': 'ellipse',
        'label': '',
        'width': '25px',
        'height': '25px',
        'background-image': "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3C!DOCTYPE%20svg%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22black%22%20width%3D%2218px%22%20height%3D%2218px%22%3E%3Cpath%20d%3D%22M8%205v14l11-7z%22%2F%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E",
        'background-height': '80%',
        'background-width': '80%',
        'background-color': 'green',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-outline-width': 0,
        'color': '#000',
        'padding': '10px'
      }
    },
    {
      selector: 'node.stop',
      style: {
        'shape': 'ellipse',
        'label': '',
        'width': '25px',
        'height': '25px',
        'background-image': "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%3C!DOCTYPE%20svg%3E%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22black%22%20width%3D%2218px%22%20height%3D%2218px%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M6%206h12v12H6z%22%2F%3E%3C%2Fsvg%3E",
        'background-height': '80%',
        'background-width': '80%',
        'background-color': 'green',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-outline-width': 0,
        'color': '#000',
        'padding': '10px'
      }
    },
    {
      selector: 'edge.left',
      style: {
        'label': '',
        'width': '1px',
        'line-color': '#4575b4',
        'target-arrow-color': '#4575b4'
      }
    },
    {
      selector: 'edge.right',
      style: {
        'label': '',
        'width': '1px',
        'line-color': '#d73027',
        'target-arrow-color': '#d73027'
      }
    },
    {
      selector: 'edge.both',
      style: {
        'label': '',
        'width': '1px',
        'line-color': '#1a9850',
        'target-arrow-color': '#1a9850'
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
