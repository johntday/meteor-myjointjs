/*! JointJS+ - Set of JointJS compatible plugins

Copyright (c) 2013 client IO

 2014-01-22 


This Source Code Form is subject to the terms of the JointJS+ License
, v. 1.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at http://jointjs.com/license/jointjs_plus_v1.txt
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


joint.format.gexf = {};

joint.format.gexf.toCellsArray = function(xmlString, makeElement, makeLink) {

    // Parse the `xmlString` into a DOM tree.
    var parser = new DOMParser();
    var dom = parser.parseFromString(xmlString, 'text/xml');
    if (dom.documentElement.nodeName == "parsererror") {
        throw new Error('Error while parsing GEXF file.');
    }

    // Get all nodes and edges.
    var nodes = dom.documentElement.querySelectorAll('node');
    var edges = dom.documentElement.querySelectorAll('edge');

    // Return value.
    var cells = [];

    _.each(nodes, function(node) {

        var size = parseFloat(node.querySelector('size').getAttribute('value'));
        
        var element = makeElement({
            id: node.getAttribute('id'),
            width: size,
            height: size,
            label: node.getAttribute('label')
        });
        
        cells.push(element);
    });

    _.each(edges, function(edge) {

        var link = makeLink({ source: edge.getAttribute('source'), target: edge.getAttribute('target') });
        cells.unshift(link);
    });

    return cells;
};
