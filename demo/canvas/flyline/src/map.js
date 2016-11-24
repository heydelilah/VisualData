function Map(canvas, projection, c){

	var ctx = canvas.getContext('2d');

    return {
    	load: function(url){
    		var me = this;
    		d3.json(url, function(err, data){

				if(err){ throw err; }

				var topo = topojson.topology(data, data.objects['world']);

				// @todo 地图画不出来，不知道是 topojson 版本问题，还是d3的版本问题。待排查
				console.log(topo)

				me.draw(topo);

			});
    	},
    	draw: function(data){

    		if(typeof data === 'string'){
    			this.load(data);
    			return;
    		}

    		// 地理路径生成器
			var path = d3.geoPath()
				.projection(projection);

			var spath;
			for (var i = 0; i < data.length; i++) {
				spath = path(data[i]);

				var p = new Path2D(spath);
				ctx.fillStyle = c.style.fill|| 'rgba(34, 51, 136, 0.5)';
				ctx.strokeStyle = c.style.stroke||'#FFF';
				ctx.stroke(p);
				ctx.fill(p);
			}
    	}
    }

}