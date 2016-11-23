var c = {

	url: {
		// 世界地图
		map: './data/world-2.5-topo.json',
		// 城市经纬坐标
		citys: './data/world-citys.json',
		// 交易数据
		data: './data/world-lines.json'
	},

	// 画布大小
	width: document.getElementById('main').clientWidth,
	height: 762,


	// 从服务器请求数据的间隔（毫秒）
	LOAD_DATA_INTERVAL: 5000,
	// 飞线间隔（毫秒）
	POP_DATA_INTERVAL: 200,

	// 飞线飞完后的停留时间
	stayDuration: 1000,

	// 帧增量间隔,数值越大，速度越快
	speed: 20,

	// 有结尾动画: 飞线到达后的波浪效果
	hasEnding: true,

	// 有结束城市
	hasEndText: true,

	// 飞线
	flyline: {
		lineWidth: 2,
		lineCap: 'round',
		color: '#00ffe7', // 浅蓝

		// 飞线控制点 高度
		qHeight: 300
	},

	flyEnd:{
		lineWidth: 1,
		// 描边颜色
		stroke: 'rgba(255,255,255,0.4)',

		radius: 12
	},

	// 地图
	map: {
		// 缩放
		scale: 215,
		style: {
			'fill': 'rgba(34, 51, 136, 0.5)', // 深蓝
			'stroke': 'rgba(250,250,250, 0.5)'
		}
	},

	data: {
		// 字段名－起点城市
		sField: 'SELLER_CITY',
		// 字段名－终点城市
		eField: 'BUYER_CITY'
	}



















};