function Flyline(canvas, projection, c){

	// 飞线画布
	var ctx = canvas.getContext('2d');
	// 数据中心
	var DataPond = [];
	// 飞线池
	var FlylinePond = [];

	var Cache = {

		// 城市经纬数据
		citys: null
	};

	var isDrawing = false;

	var qScale = d3.scaleLinear()
		.range([0, c.width||1000])
		.domain([1, c.flyline.qHeight||300]);


	return {
		start: function(){
			var me = this;

			me.loadCitys();
			me.polling();
			me.startConveyer();
		},

		startConveyer: function(){
			var me = this;

			setInterval(function(){
				if(DataPond.length && !document.hidden){

					var d = me.calculate( DataPond.pop() );

					if(d){
						FlylinePond.push(d);
					}

					if(!isDrawing){
						me.animate();
					}
				}

			}, c.POP_DATA_INTERVAL||500);
		},

		// 加载城市数据
		loadCitys: function(){
			d3.json(c.url.citys, function(err, data){

				if(err){ throw err; }

				Cache.citys = data;

			});
		},

		// 轮询
		polling: function(){
			// setInterval(function(){
			d3.json(c.url.data, function(err, data){

				if(err){ throw err; }

				DataPond = data.concat(DataPond);
			});
			// }, c.LOAD_DATA_INTERVAL||5000);
		},

		// 计算
		calculate: function(data){
			var me = this;

			var start = projection( me._getGeoCoord( data[c.data.sField] )),
				end   = projection( me._getGeoCoord( data[c.data.eField] )),
				x1    = start[0], y1 = start[1], // 起点
				x2    = end[0], y2 = end[1], // 终点
				dxy   = me._getDistance(x1,y1,x2,y2);

			if(x1 === x2 && y1 === y2){return;}

			/**
			 *  求控制点坐标
			 *  数学公式：已知等腰三角形两底角坐标（x1,y1）,(x2,y2)和高h,求顶角坐标(x,y)
			 **/
			var h = qScale.invert(dxy); // 线性变化：控制点的高度，随着两点距离的变小而变小
			var qx = (x1+x2)/2 + h*Math.abs(y2-y1) / Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
			var qy = (y1+y2)/2 - h*Math.abs(x2-x1) / Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));

			return {
				'data': data,
				'x1':x1,'y1':y1,
				'qx':qx,'qy':qy,
				'x2':x2,'y2':y2,
				'position':0,
				'stop': false
			};
		},

		// 绘制飞线
		drawline: function(x1,y1,qx,qy,x2,y2,t){

			ctx.globalAlpha = 1;

			if(t){
				var percent = this._getPercent(t);
				ctx.globalAlpha = 1 - (percent>1 ? 1 : percent);
			}
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.quadraticCurveTo(qx, qy, x2, y2);

			// 颜色渐变
			var grd = ctx.createLinearGradient(x1,y1,x2,y2);
			grd.addColorStop(0,		"rgba(255,255,255,0)");
			grd.addColorStop(0.5,	"rgba(255,255,255,0)");
			grd.addColorStop(0.95,	c.flyline.color || '#00ffe7');
			grd.addColorStop(1,		"#fff");

			ctx.lineWidth = c.flyline.lineWidth || 2;
			ctx.lineCap = c.flyline.lineCap || 'round';

			ctx.strokeStyle = grd;
			ctx.stroke();
		},

		drawEnd: function(x,y,t,percent){

			ctx.beginPath();
			var r = c.flyEnd.radius || 10;
			ctx.arc(x,y, r*percent, 0, 2*Math.PI);
			ctx.closePath();

			var grd = ctx.createRadialGradient(x,y,3,x,y,10);
			grd.addColorStop(0,		"rgba(255,255,255,0.6)");
			grd.addColorStop(1,		"rgba(255,255,255,0)");
			ctx.fillStyle = grd;

			ctx.strokeStyle = c.flyEnd.stroke || '#fff';
			ctx.lineWidth = c.flyEnd.lineWidth || 1;

			ctx.fill();
			ctx.stroke();
		},

		drawText: function(x,y,t,data){
			ctx.fillStyle = '#fff';
			ctx.font = "16px Georgia";
			ctx.fillText(data[c.data.eField], x-20, y+25);
		},

		animate: function(t){
			var me = this;

			me.clear();

			var item;
			var current = (new Date()).getTime();

			for (var i = 0; i < FlylinePond.length; i++) {
				item = FlylinePond[i];

				if(!item.stop){

					item.position += c.speed;
					var p = item.position/1000;

					var x = Math.pow(1 - p, 2) * item.x1 + 2 * (1 - p) * p * item.qx + Math.pow(p, 2) * item.x2;
					var y = Math.pow(1 - p, 2) * item.y1 + 2 * (1 - p) * p * item.qy + Math.pow(p, 2) * item.y2;

					// 新的控制点
					var nqx = (1-p) * item.x1 + p * item.qx;
					var nqy = (1-p) * item.y1 + p * item.qy;

					if(p < 1){
						me.drawline(item.x1,item.y1,nqx, nqy, x, y);
					}

					// 飞线停留
					if(me._isArrived(x, y, item.x1, item.y1, item.x2, item.y2) ){
						item.stop = true;
						item.time = (new Date()).getTime();
					}

				}else{
					var p = this._getPercent(item.time);
					ctx.globalAlpha = 1 - (p>1 ? 1 : p);

					if(c.hasEnding){
						me.drawEnd(item.x2,item.y2, item.time, p);
					}

					if(c.hasEndText){
						me.drawText(item.x2,item.y2, item.time, item.data);
					}

					me.drawline(item.x1,item.y1,item.qx,item.qy,item.x2,item.y2, item.time);

					if(current - item.time > (c.stayDuration||1000) ){
						FlylinePond.splice(i,1);
						i--;
					}
				}
			}

			isDrawing = false;

			if( FlylinePond.length ){
				isDrawing = true;
				requestAnimationFrame(me.animate.bind(me));
			}else{
				this.clear();
			}
		},


		// 清除画布
		clear: function(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		},

		// 根据飞线停留了的时长，获取占默认停留设置值的百分比
		_getPercent: function(t){
			var current = (new Date()).getTime();
			var sum = current - t;

			return sum/(c.stayDuration||1000);
		},

		// 判断飞线是否达到终点
		_isArrived: function(x, y, x1, y1, x2, y2){

			if( Math.abs(x1-x2) > Math.abs(y1-y2)){

				if(x1>x2 && x<x2){
					return true;
				}
				if(x1<x2 && x>x2){
					return true;
				}
			}else{
				if(y1>y2 && y<y2){
					return true;
				}
				if(y1<y2 && y>y2){
					return true;
				}
			}

			return false;
		},

		// 求两坐标之间的距离
		_getDistance: function(x1,y1,x2,y2){
			return Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
		},

		// 根据城市名，在映射表中获取对应的经纬度
		_getGeoCoord: function(name){
			var d = Cache.citys;
			return [d[name]['lng'], d[name]['lat'] ];
		}
	}
}