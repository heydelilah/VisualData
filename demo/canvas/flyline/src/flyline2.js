function Flyline(canvas, projection, c){

	var Data = {
		// 城市经纬数据
		cityData: null,

		// 数据中心
		dataPond: []
	};

	// 飞线画布
	var ctx = canvas.getContext('2d');
	ctx.lineWidth = 2;
	ctx.lineCap = "round";

	ctx.globalAlpha = 0.85;
	ctx.strokeStyle = c.flyline.color;
	ctx.fillStyle = c.flyline.color;


	// 飞线池
	var FlylinePond = [];


	var qScale = d3.scaleLinear()
		.range([0, c.width||1000])
		.domain([1, c.flyline.qHeight||300]);

	// 临时画布
	var canvasTmp = document.createElement('canvas'),
	    ctxTmp = canvasTmp.getContext('2d');
	canvasTmp.width = canvas.width;
	canvasTmp.height = canvas.height;
	document.body.appendChild(canvasTmp);

	/**
	 * 存在问题：
	 * 1. 画完的飞线无法做停留；
	 * 2. 尾的长度难以控制；
	 */

	var isAnimate = false;

	return {
		start: function(){
			var me = this;

			me.loadCityData();
			me.polling();

			me.startConveyer();

		},

		startConveyer: function(){
			var me = this;

			setInterval(function(){
				if(Data.dataPond.length){


					me.calculate( );

					if(!isAnimate){
						me.animate();
					}
				}

			}, c.POP_DATA_INTERVAL)
		},

		loadCityData: function(){
			d3.json(c.url.citys, function(err, data){

				if(err){ throw err; }

				Data.cityData = data;

			});
		},

		polling: function(){
			// setInterval(function(){
			d3.json(c.url.data, function(err, data){

				if(err){ throw err; }

				Data.dataPond = data.concat(Data.dataPond);
			});
			// }, c.LOAD_DATA_INTERVAL);
		},

		calculate: function(){
			var me = this;

			var data  = Data.dataPond.pop(),
				start = projection( me._getGeoCoord( data[c.data.sField] )),
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

			console.log(h)


			FlylinePond.push({
				'x1':x1,'y1':y1,
				'qx':qx,'qy':qy,
				'x2':x2,'y2':y2,
				'position':0,
				'stop': false
			});

		},

		// 绘制飞线
		drawline: function(x2,y2){
			ctx.beginPath();
			ctx.arc(x2,y2,2,0,2*Math.PI,true);
			ctx.closePath();
			ctx.fill();
		},

		animate: function(t){
			var me = this;

			ctxTmp.globalCompositeOperation = 'copy';
			ctxTmp.drawImage(canvas, 0, 0, canvas.width, canvas.height);

			if(FlylinePond.length){
				this.clear();
			}

			var current = (new Date()).getTime();

			var item;
			for (var i = 0; i < FlylinePond.length; i++) {
				item = FlylinePond[i];



			    if(!item.stop){
					item.position += 0.9||c.speed;
					var percent = item.position/100;

					var x = Math.pow(1 - percent, 2) * item.x1 + 2 * (1 - percent) * percent * item.qx + Math.pow(percent, 2) * item.x2;
					var y = Math.pow(1 - percent, 2) * item.y1 + 2 * (1 - percent) * percent * item.qy + Math.pow(percent, 2) * item.y2;

					// 飞线停留
					if(me._isArrived(x, y, item.x1, item.y1, item.x2, item.y2) ){
						item.time = (new Date()).getTime();
						item.stop = true;

					}
					me.drawline(x, y);
			    }else{

					// 删除飞线
					if(current-item.time > c.duration){
						FlylinePond.splice(i,1);
						i--;
					}
			    }
			}

			ctx.drawImage(canvasTmp, 0, 0, canvas.width, canvas.height );

			isAnimate = false;
			if(FlylinePond.length ){
				isAnimate = true;
				requestAnimationFrame(me.animate.bind(me));
			}
		},

		// 清除画布
		clear: function(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
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
			var d = Data.cityData;
			return [d[name]['lng'], d[name]['lat'] ];
		}
	}
}