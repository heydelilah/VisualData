function Flyline(target, config){

	var c = this.c = this.extend({
		// 飞线间隔（毫秒）
		interval: 200,

		// 飞线飞完后的停留时间
		stayDuration: 1000,

		// 帧增量间隔,数值越大，飞的速度越快
		speed: 20,

		// 是否需要有结尾动效
		hasEnding: true,

		// 飞线样式
		flyline: {
			// 粗细
			lineWidth: 2,
			// 头部
			lineCap: 'round',
			// 颜色（缺省为浅蓝色）
			color: '#00ffe7',
			// 弯曲程度（本质是通过改变二次贝塞尔曲线控制点的高度）
			qHeight: 300
		},
		// 飞线到达后的结束动效：圆圈波浪效果
		flyEnd:{
			lineWidth: 1,
			// 描边颜色
			stroke: 'rgba(255,255,255,0.4)',
			radius: 12
		}
	},config);


	// 创建画布
	var canvas = document.createElement('canvas');
	canvas.width = target.offsetWidth;
	canvas.height = target.offsetHeight;
	target.appendChild(canvas);
	target.style.position = 'relative';
	canvas.style.position = 'absolute';
	canvas.style.top = '0';
	canvas.style.left = '0';

	this.canvas = canvas;

	// 飞线画布
	this.ctx = canvas.getContext('2d');
	// 数据中心
	this.DataPond = [];
	// 飞线池
	this.FlylinePond = [];

	this.isDrawing = false;

	this.qScale = d3.scaleLinear()
		.range([0, canvas.width])
		.domain([1, c.flyline.qHeight]);

	this.start();
}


Flyline.prototype = {

	draw: function(data){
		this.DataPond.push(data);
	},
	start: function(){
		var me = this;

		setInterval(function(){
			if(me.DataPond.length && !document.hidden){

				var d = me.calculate( me.DataPond.pop() );

				if(d){
					me.FlylinePond.push(d);
				}

				if(!me.isDrawing){
					me.animate();
				}
			}

		}, me.c.interval);
	},
	// 计算
	calculate: function(data){
		var me = this;

		var x1   = data.from.x, y1 = data.from.y, // 起点
			x2   = data.to.x, y2 = data.to.y, 		// 终点
			dxy  = me._getDistance(x1,y1,x2,y2);

		if(x1 === x2 && y1 === y2){return;}

		/**
		 *  求控制点坐标
		 *  数学公式：已知等腰三角形两底角坐标（x1,y1）,(x2,y2)和高h,求顶角坐标(x,y)
		 **/
		var h = me.qScale.invert(dxy); // 线性变化：控制点的高度，随着两点距离的变小而变小
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
		var ctx = this.ctx;
		var c = this.c;

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
		grd.addColorStop(0.95,	c.flyline.color);
		grd.addColorStop(1,		"#fff");

		ctx.lineWidth = c.flyline.lineWidth;
		ctx.lineCap = c.flyline.lineCap;

		ctx.strokeStyle = grd;
		ctx.stroke();
	},

	drawEnd: function(x,y,t,percent){
		var ctx = this.ctx;
		var c = this.c;

		ctx.beginPath();
		var r = c.flyEnd.radius;
		ctx.arc(x,y, r*percent, 0, 2*Math.PI);
		ctx.closePath();

		var grd = ctx.createRadialGradient(x,y,3,x,y,10);
		grd.addColorStop(0,		"rgba(255,255,255,0.6)");
		grd.addColorStop(1,		"rgba(255,255,255,0)");
		ctx.fillStyle = grd;

		ctx.strokeStyle = c.flyEnd.stroke;
		ctx.lineWidth = c.flyEnd.lineWidth;

		ctx.fill();
		ctx.stroke();
	},

	animate: function(t){
		var me = this;
		var c = this.c;
		var ctx = this.ctx;

		me.clear();

		var d;
		var current = (new Date()).getTime();

		for (var i = 0; i < me.FlylinePond.length; i++) {
			item = me.FlylinePond[i];

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

				me.drawline(item.x1,item.y1,item.qx,item.qy,item.x2,item.y2, item.time);

				if(current - item.time > (c.stayDuration) ){
					me.FlylinePond.splice(i,1);
					i--;
				}
			}
		}

		isDrawing = false;

		if( me.FlylinePond.length ){
			isDrawing = true;
			requestAnimationFrame(me.animate.bind(me));
		}else{
			this.clear();
		}
	},

	// 清除画布
	clear: function(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	extend: function(target, data){
		for(var elm in data){
			if(typeof target[elm] === 'object'){

			}

			if(typeof data[elm] === 'object' && toString.apply(data[elm]) !== '[object Array]'){
				for( var child in data[elm]){
					target[elm][child] = data[elm][child];
				}
			}else{
				target[elm] = data[elm];
			}
		}

		return target;
	},

	// 根据飞线停留了的时长，获取占默认停留设置值的百分比
	_getPercent: function(t){
		var current = (new Date()).getTime();
		var sum = current - t;

		return sum/(this.c.stayDuration);
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
	}
}