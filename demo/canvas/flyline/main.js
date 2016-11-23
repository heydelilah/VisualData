// 投影函数
var projection = d3.geoEquirectangular()
	.scale(c.map.scale)
    .translate([c.width / 2, c.height / 2]);

// 创建地图
var canvasMap = document.getElementById('map')
canvasMap.height = c.height;
canvasMap.width = c.width;

var map = new Map(canvasMap, projection, c.map);
map.draw(c.url.map);


// 创建飞线
var canvasLine = document.getElementById('flyline');
canvasLine.height = c.height;
canvasLine.width = c.width;

var flylines = new Flyline(canvasLine, projection, c);
flylines.start();