function Rays(c, id){

	var canvas = document.getElementById(id);
	canvas.height = c.height;
	canvas.width = c.width;
	var ctx = canvas.getContext('2d');
	ctx.translate(c.width/2, c.height/2);


	ctx.lineWidth = 2;
	ctx.lineCap = "round";

	ctx.globalAlpha = 0.85;

	// 飞线池
	var FlylinePond = [];


	// 临时画布
	var canvasTmp = document.createElement('canvas'),
	    ctxTmp = canvasTmp.getContext('2d');
	canvasTmp.width = canvas.width;
	canvasTmp.height = canvas.height;
	ctxTmp.translate(c.width/2, c.height/2);
	document.body.appendChild(canvasTmp);

	var isAnimate = false;



	return {

		run: function(){
			var x    = Math.floor((Math.random()*1000) * (Math.random()<0.5 ? -1 : 1));
			var y    = -Math.floor(Math.random()*1000); // 终点

			if(x === 0 && y === 0){return;}

			var colors =[
				'#962822', // red
				'#a111a4', // red ZIHONG
				'#0820a9', // blue
				'#a111a4'
			];

			FlylinePond.push({
				'x':x,
				'y':y,
				'color': colors[Math.floor(Math.random()*3)],
				'position':0
			});

			requestAnimationFrame(this.run.bind(this));

		},

		// 绘制飞线
		drawline: function(x2,y2, color){
			ctx.beginPath();
			ctx.arc(x2,y2,2,0,2*Math.PI,true);
			ctx.closePath();
			ctx.fillStyle = color;
			ctx.fill();
		},

		animate: function(t){
			var me = this;

			ctxTmp.globalCompositeOperation = 'copy';
			ctxTmp.drawImage(canvas, -c.width/2, -c.height/2, canvas.width, canvas.height);

			if(FlylinePond.length){
				this.clear();
			}

			var item;
			for (var i = 0; i < FlylinePond.length; i++) {
				item = FlylinePond[i];

				item.position += 0.9||c.speed;

				var percent = item.position/100;

				var x = (percent) * item.x;
				var y = (percent) * item.y;

				if(percent>= 1){
					FlylinePond.splice(i,1);
				}

				me.drawline(x, y, item.color);

			}

			ctx.drawImage(canvasTmp, -c.width/2, -c.height/2, canvas.width, canvas.height );

			isAnimate = false;
			if(FlylinePond.length ){
				isAnimate = true;
				requestAnimationFrame(me.animate.bind(me));
			}
		},

		// 清除画布
		clear: function(){
			ctx.clearRect(-c.width/2, -c.height/2, canvas.width, canvas.height);
		}
	}
}