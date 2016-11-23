canvas 学习笔记
=======================

### 概述

- canvas 是一个 html 标签;
- canvas 元素本身是没有绘图能力的，使用 Javascript 绘制；
- 通过 getContext("2d") 得到的对象是内置 HTML5 对象，拥有多种画图 API；
- 逐像素点渲染；移除元素就是重新绘制。
- 坐标：以左上角为原点

### 路径

- 使用 beginPath() 创建新路径；
- 一条路径内，样式统一，如 fillStyle 等；
- closePath() 是闭合路径，如果不闭合直接填充，默认也是会自动闭合的。但这个的闭合只是填充闭合。

### save 和 restore 

- save()	保存当前环境的状态
- restore()	返回之前保存过的路径状态和属性
### 路径填充逻辑 

判断一个点在多边形的内部还是外部，采用的是 non-zero 规则。

1. 奇偶规则 Odd-even Rule
    - 从任意位置p作一条射线，若与该射线相交的多边形边的数目为奇数，则p是多边形内部点，否则是外部点。

2. 非零环绕 Non-zero Rule
	- 首先使多边形的边变为矢量,即有方向。
    - 从任意位置p作一条射线。当多边形的边从右到左穿过射线时，环绕数加1，从左到右时，环绕数减1。
    - 若环绕数为非零，则p为内部点，否则，p是外部点。

例子：

### 贝塞尔曲线

1. quadraticCurveTo(cpx,cpy,x,y)	二次贝塞尔曲线
	- 一个控制点

2. bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y)	三次方贝塞尔曲线
	- 二个控制点

我的理解，以二次贝塞尔为例：
	1. 三个点：始点、终点、控制点；
	2. 两条线，产生第三条线
	3. 以其中一个点为移动点，每轮做两轮取点操作。
	4. 每条线都按照 **相同的比例** 找出的点的集合，构成贝塞尔曲线。

[直观动画- wiki：贝赛尔曲线](https://zh.wikipedia.org/wiki/%E8%B2%9D%E8%8C%B2%E6%9B%B2%E7%B7%9A)

### 三个 demo

### 附－常用函数

- rect(x,y,width,height)	创建矩形
- arc(x,y,r,sAngle,eAngle,counterclockwise);	创建弧/曲线（用于创建圆形或部分圆）
- clearRect(x,y,width,height)	在给定的矩形内清除指定的像素
- [Canvas 参考手册－w3school](http://www.w3school.com.cn/tags/html_ref_canvas.asp)


