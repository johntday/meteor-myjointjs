var graph = new joint.dia.Graph;

// Create a paper and wrap it in a PaperScroller.
// ----------------------------------------------

var paperScroller = new joint.ui.PaperScroller({
    autoResizePaper: true
});

var paper = new joint.dia.Paper({
    el: paperScroller.el,
    width: 1000,
    height: 1000,
    gridSize: 10,
    perpendicularLinks: true,
    model: graph
});
paperScroller.options.paper = paper;

$('#paper').append(paperScroller.render().el);

paperScroller.center();

// Create and populate stencil.
// ----------------------------

var stencil = new joint.ui.Stencil({ 
	graph: graph
	,paper: paper
	,width: 200
	,height: 450
	,groups: {
		simple: { label: 'Simple', index: 1, closed: false }
		,custom: { label: 'Custom', index: 2, closed: true }
	}
});
$('#stencil').append(stencil.render().el);


var r = new joint.shapes.basic.Rect({
    position: { x: 60, y: 20 },
    size: { width: 100, height: 60 },
    attrs: {
        rect: { rx: 2, ry: 2, width: 50, height: 30, fill: '#27AE60' },
        text: { text: 'rect', fill: 'white', 'font-size': 10 }
    }
});
var c = new joint.shapes.basic.Circle({
    position: { x: 60, y: 100 },
    size: { width: 100, height: 60 },
    attrs: {
        circle: { width: 50, height: 30, fill: '#E74C3C' },
        text: { text: 'ellipse', fill: 'white', 'font-size': 10 }
    }
});
var m = new joint.shapes.devs.Model({
    position: { x: 75, y: 180 },
    size: { width: 80, height: 90 },
    inPorts: ['in1','in2'],
    outPorts: ['out'],
    attrs: {
	rect: { fill: '#8e44ad', rx: 2, ry: 2 },
        '.label': { text: 'model', fill: 'white', 'font-size': 10 },
	'.inPorts circle, .outPorts circle': { fill: '#f1c40f', opacity: 0.9 },
	'.inPorts text, .outPorts text': { 'font-size': 9 },
    }
});
var clazz = new joint.shapes.uml.Class({
    position: { x:60  , y: 140 },
    size: { width: 100, height: 60 },
    name: 'Clazz',
    attributes: [],
    methods: []
});

stencil.load([c, r], 'simple');
stencil.load([clazz], 'custom');

// Selection.
// ----------

var selection = new Backbone.Collection;

var selectionView = new joint.ui.SelectionView({
    paper: paper,
    graph: graph,
    model: selection
});


// Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
// Otherwise, initiate paper pan.
paper.on('blank:pointerdown', function(evt, x, y) {

    if (_.contains(KeyboardJS.activeKeys(), 'shift')) {
        selectionView.startSelecting(evt, x, y);
    } else {
        paperScroller.startPanning(evt, x, y);
    }
});

paper.on('cell:pointerdown', function(cellView, evt) {
    // Select an element if CTRL/Meta key is pressed while the element is clicked.
    if ((evt.ctrlKey || evt.metaKey) && !(cellView.model instanceof joint.dia.Link)) {
        selectionView.createSelectionBox(cellView);
        selection.add(cellView.model);
    }
});

selectionView.on('selection-box:pointerdown', function(evt) {
    // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
    if (evt.ctrlKey || evt.metaKey) {
        var cell = selection.get($(evt.target).data('model'));
        selectionView.destroySelectionBox(paper.findViewByModel(cell));
        selection.reset(selection.without(cell));
    }
});

// Disable context menu inside the paper.
// This prevents from context menu being shown when selecting individual elements with Ctrl in OS X.
paper.el.oncontextmenu = function(evt) { evt.preventDefault(); };

// enable link inspector
paper.on('link:options', function(evt, cellView, x, y) {
    // Here you can create an inspector for the link the same way as it is done for normal elements.
    console.log('link inspector');
});

// An example of a simple element editor.
// --------------------------------------

var inspector;

function createInspector(cellView) {
    
    // No need to re-render inspector if the cellView didn't change.
    if (!inspector || inspector.options.cellView !== cellView) {
        
        if (inspector) {
            // Clean up the old inspector if there was one.
            inspector.remove();
        }

        inspector = new joint.ui.Inspector({
            inputs: {
                myproperty: { type: 'number', defaultValue: 5, group: 'mydata', index: 1 },
                attrs: {
                    text: { 
                        text: { type: 'textarea', group: 'text', label: 'Text', index: 1 },
                        'font-size': { type: 'range', min: 5, max: 30, group: 'text', label: 'Font size', index: 2 }
                    }
                },
                position: {
                    x: { type: 'number', index: 1, group: 'position' },
                    y: { type: 'number', index: 2, group: 'position' }
                }
            },
            groups: {
                mydata: { label: 'My Data', index: 1 },
                text: { label: 'Text', index: 2 },
                position: { label: 'Position', index: 3 }
            },
            cellView: cellView
        });
        $('#inspector-holder-create').html(inspector.render().el);
    }
}

//var elementInspector = new ElementInspector();
//$('.inspector').append(elementInspector.el);

// Halo - element tools.
// ---------------------

paper.on('cell:pointerup', function(cellView, evt) {

    if (cellView.model instanceof joint.dia.Link || selection.contains(cellView.model)) return;
    
    var halo = new joint.ui.Halo({
        graph: graph,
        paper: paper,
        cellView: cellView,
        linkAttributes: {
            '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z', transform: 'scale(0.001)' },
	    // @TODO: scale(0) fails in Firefox
            '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
        }
    });

    halo.render();
	//createInspector(cellView);
});


// Command Manager - undo/redo.
// ----------------------------

var commandManager = new joint.dia.CommandManager({ graph: graph });

// Validator
// ---------
// nothing

// Hook on toolbar buttons.
// ------------------------

$('#btn-undo').on('click', _.bind(commandManager.undo, commandManager));
$('#btn-redo').on('click', _.bind(commandManager.redo, commandManager));
$('#btn-clear').on('click', _.bind(graph.clear, graph));
$('#btn-svg').on('click', function() {
    paper.openAsSVG();
    console.log(paper.toSVG()); // An exmaple of retriving the paper SVG as a string.
});
$('#btn-find-element, #btn-layout, #btn-group, #btn-ungroup').on('click', function() {
    alert('not ready yet');
});
$('#btn-center-content').click(function(){
	paperScroller.centerContent();
});

var zoomLevel = 1;

function zoom(paper, newZoomLevel) {

    if (newZoomLevel > 0.2 && newZoomLevel < 20) {

	var ox = (paper.el.scrollLeft + paper.el.clientWidth / 2) / zoomLevel;
	var oy = (paper.el.scrollTop + paper.el.clientHeight / 2) / zoomLevel;

	paper.scale(newZoomLevel, newZoomLevel, ox, oy);

	zoomLevel = newZoomLevel;
    }
}

$('#btn-zoom-in').on('click', function() { zoom(paper, zoomLevel + 0.2); });
$('#btn-zoom-out').on('click', function() { zoom(paper, zoomLevel - 0.2); });

