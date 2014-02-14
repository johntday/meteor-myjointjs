// This is an example of inheriting from joint.dia.LinkView in order to create a much lightweight
// view for links. This is then used in the Force-directed layout window in the Kitchen Sink app.

var LightLinkView = joint.dia.LinkView.extend({

    node: V('<line stroke="gray" fill="none" />'),

    initialize: function() {
        
        joint.dia.CellView.prototype.initialize.apply(this, arguments);
        
        V(this.el).attr({ 'class': 'link', 'model-id': this.model.id });
    },
    
    render: function() {

        var node = this.node.clone();

        this._sourceModel = this.paper.getModelById(this.model.get('source').id);
        this._targetModel = this.paper.getModelById(this.model.get('target').id);
        
        this._lineNode = V(node.node);

        var attrs = this.model.get('attrs');
        if (attrs && attrs.line)
            this._lineNode.attr(attrs.line);
        
        this._sourceModel.on('change:position', this.update);
        this._targetModel.on('change:position', this.update);
        
        this.update();

        V(this.el).append(node);
    },

    update: function() {

        var sourcePosition = this._sourceModel.get('position');
        var targetPosition = this._targetModel.get('position');
        var sourceSize = this._sourceModel.get('size');
        var targetSize = this._targetModel.get('size');

        if (sourcePosition && targetPosition) {

            this._lineNode.node.setAttribute('x1', sourcePosition.x + sourceSize.width/2);
            this._lineNode.node.setAttribute('y1', sourcePosition.y + sourceSize.height/2);
            this._lineNode.node.setAttribute('x2', targetPosition.x + targetSize.width/2);
            this._lineNode.node.setAttribute('y2', targetPosition.y + targetSize.height/2);
        }
    }
});

