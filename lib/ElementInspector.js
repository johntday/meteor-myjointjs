var ElementInspector = Backbone.View.extend({

    className: 'element-inspector',
    
    template: [
        '<label>Name</label>',
        '<input type="text" class="sketch-state-name"/>',
        '<label>Links</label>',
        '<div id="hrefs"></div>',
        '<button id="resize">resize</button>'
    ].join(''),

    events: {
        //'change textarea': 'updateCell',
        //'change input': 'updateCell',
        'keyup .href-add': 'addHref',
        'click .href-del': 'delHref',
        'keyup .sketch-state-name': 'updateName',
        'click #resize': 'resize'
    },
    
    render: function(cellView) {
        this._cellView = cellView;
        var cell = this._cellView.model;
        if( cell instanceof joint.shapes.sketch.Node === false ) return;

        this.$el.html(_.template(this.template)());

        cell.on('remove', function() {
            this.$el.html('');
        }, this);

        var attrs = cell.get('attrs');
        //
		var name = attrs['.sketch-state-name'].text;
		this.$('.sketch-state-name').val( name || '');

		//
		var hrefs = cell.get('hrefs');
		var hrefs_html = '';
		var i=0;
		for (i=0; i < hrefs.length; i++) {
			hrefs_html += '<input type="text" class="href" value="' + hrefs[i] + '"/>';
			hrefs_html += '<button class="href-del" data-name="' + hrefs[i] + '">-</button>'
		}
		hrefs_html += '<input type="text" class="href-add"/>';
		
		this.$('#hrefs').html( hrefs_html );

		//
		console.log('this._cellView.model: '+JSON.stringify(cell));
    },

    updateCell: function() {
        var cell = this._cellView.model;

		var name = this.$('.sketch-state-name').val();
        cell.attr({ '.sketch-state-name': { text: name } });


		var hrefs = cell.get('hrefs');
		var i=0;
		this.$('.href').each(function(){
			//console.log( 'hrefs['+i+']=' + $(this).val() );
	        hrefs.push( $(this).val() );
		});
    },

    updateName: function(e) {
		if ( e.keyCode !== 13/*enter*/ && e.keyCode !== 27/*esc*/ ) return;
        var cell = this._cellView.model;

		var name = this.$('.sketch-state-name').val();
        cell.attr({ '.sketch-state-name': { text: name } });
    },
    
	addHref: function(e) {
		if ( e.keyCode !== 13/*enter*/ && e.keyCode !== 27/*esc*/ ) return;
        var cell = this._cellView.model;

		var hrefs = cell.get('hrefs');
        hrefs.push( this.$('.href-add').val() );
        
        this.render(this._cellView);
    },

	delHref: function(e) {
        var cell = this._cellView.model;

		var hrefs = cell.get('hrefs');
		//http://www.w3schools.com/jsref/jsref_splice.asp
		var index = hrefs.indexOf( this.$('.href-del').attr('data-name') );
		//console.log( this.$('.href-del').attr('data-name'), index );
		if ( index != -1 ) {
			hrefs.splice( index, 1);
        	this.render(this._cellView);
    	}
    },

	resize: function() {
        var cell = this._cellView.model;
        
        var name_length = this.$('.sketch-state-name').val().length;
        if (name_length < 5) name_length = 5;
		var width = Math.floor( name_length*100/12  ) + 10;
		cell.resize(width, 30);
    },
    
    logKey: function(e) {
    	console.log(e.type, e.keyCode);	
    }
});
