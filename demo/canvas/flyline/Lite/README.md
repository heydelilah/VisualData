说明
==================

此版本为“飞线精简版”。

1. 依赖 d3.js, 官网：https://d3js.org/
2. 飞线由 canvas 绘制

配置项
==================

var config = {

	// 飞线间隔（毫秒）
	interval: 200,

	// 飞线飞完后的停留时间
	stayDuration: 1000,

	// 帧增量间隔,数值越大，飞的速度越快
	speed: 5,

	// 是否需要有结尾动效
	hasEnding: true,

	// 飞线样式
	flyline: {
		// 粗细
		lineWidth: 2,
		// 头部
		lineCap: 'round',
		// 颜色
		color: '#00ffe7', // 浅蓝色
		// 弯曲程度
		qHeight: 300
	},

	// 飞线到达后的结束动效：圆圈波浪效果
	flyEnd:{
		// 描边粗细
		lineWidth: 1,
		// 描边颜色
		stroke: 'rgba(255,255,255,0.4)',
		// 圆圈半径
		radius: 12
	}

};