/*
author:1141200341@qq.com
data:2018-11-16
email:
*/
function Wipe(obj){
	// 获取canvas的id名
	this.conID = obj.id;
	// 获取用户选择的填充类型
	this.coverType=obj.coverType;
	// 填充的颜色
	this.color = obj.color ||"#666";
	// 画布的宽
	this._w=obj.width;
	// 画布的高
	this._h=obj.height;
	// 前面覆盖图
	this.imgUrl= obj.imgUrl;
	this.opcity=obj.opcity || 1;
	this.cas = document.getElementById(this.conID);
	// console.log(this.conID)
	// 设置宽高和背景图
	this.cas.width = this._w;
	this.cas.height = this._h;
	this.cas.style.background = "url("+obj.backImgUrl+") center 0 no-repeat";
	this.cas.style.backgroundSize = "cover";
	this.context =this.cas.getContext("2d");
	
	// 涂抹的半径
	this.raduis = obj.raduis; 
	//保存鼠标视口坐标的变量
	this.movex = 0;
	this.movey = 0;
	// 事件的开关
	this.isMouseDown=false;
	// 判断用户用的是什么端的窗口
	this.device = (/android|webos|iPhone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
	// 给canvas蒙上一层画布
	
	this.drawMask();
	// 调用事件
	this.callback = obj.callback;
	this.transpercent = obj.transpercent;
	this.lick();
}
// 给canvas蒙上一层画布
Wipe.prototype.drawMask=function(){
	//判断如果是颜色的话
	if (this.coverType==="color") {
		this.context.fillStyle=this.color;
		this.context.globalAlpha = this.opcity;
	    this.context.fillRect(0,0,375,667);
	    this.context.globalCompositeOperation="destination-out";
	 //判断如果是背景图的话
	}else if(this.coverType==="image"){
		//将imgUrl指定的图片填充画布
		var that = this;
		this.imgs = new Image();
		this.imgs.src = this.imgUrl;
		//图片加载完成再执行	
		this.imgs.onload = function(){
			that.context.drawImage(that.imgs,0,0,imgs.width,imgs.height,0,0,that._w,that._h);
			that.context.globalCompositeOperation="destination-out";
			// context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
			// img	规定要使用的图像、画布或视频。
			// sx	可选。开始剪切的 x 坐标位置。
			// sy	可选。开始剪切的 y 坐标位置。
			// swidth	可选。被剪切图像的宽度。
			// sheight	可选。被剪切图像的高度。
			// x	在画布上放置图像的 x 坐标位置。
			// y	在画布上放置图像的 y 坐标位置。
			// width	可选。要使用的图像的宽度。（伸展或缩小图像）
			// height	可选。要使用的图像的高度。（伸展或缩小图像）
		};
	}
};
// 清除画布
Wipe.prototype.clearRect=function(){
	this.context.clearRect(0,0,this._w,this._h);
};
// 获取canvas到左边的距离
Wipe.prototype.getAllLeft=function(element){
	this.allLeft=0;
	while(element){
		this.allLeft += element.offsetLeft;
		element = element.offsetParent;
	}
	return this.allLeft;
};
// 获取canvas到上边的距离
Wipe.prototype.getAllTop=function(element){
	this.allTop = 0;
	while(element){
		this.allTop += element.offsetTop;
		element=element.offsetParent;
	}
	return this.allTop;
};
//drawT画圆和画线的函数
//参数：如果只有两个参数的话函数功能画圆，x1，y1为圆的中心坐标
//如果有四个参数的话函数功能x1，y1是起始坐标，x2，y2是结束坐标
Wipe.prototype.drawT = function(x1,y1,x2,y2){
	if (arguments.length===2) {
		this.context.save();
		this.context.beginPath();
		this.context.arc(x1,y1,this.raduis,0,2*Math.PI);
		this.context.fillStyle="red";
		this.context.fill();
		this.context.globalAlpha = 1;
		this.context.restore();
	}else if(arguments.length===4){
		this.context.save();
		this.context.beginPath();
		this.context.lineCap="round";
		this.context.lineWidth = this.raduis*2;
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.globalAlpha = 1;
		this.context.stroke();
		this.context.restore();
	}else{
		return false;
	}
};
// 获取透明点占整个画布的百分比
Wipe.prototype.getTransparencyPercent=function(){
	var t = 0;
	var imgData =this.context.getImageData(0,0,this._w,this._h);
	for (var i = 0; i < imgData.data.length; i+=4) {
			var a = imgData.data[i+3];
			if (a===0) {
				t++;
			}
		}
		// console.log("透明点的个数:"+t);
		this.percent=(t/(this._w*this._h))*100;
		// console.log("占总面积"+Math.ceil(this.percent)+"%");
		return Math.round(this.percent);
};
// 增加事件
Wipe.prototype.lick=function(){
	var that = this;
	this.Press = this.device ? 'touchstart':'mousedown';
	this.Move  = this.device ? 'touchmove':'mousemove';
	this.Uplift = this.device ? 'touchend':'mouseup';
	// 在canvas画布上监听自定义事件，mousedown，调用drawPoint图形
	// 按下
	this.cas.addEventListener(this.Press,function(event){
			var evt = event || window.event;
			var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			//获取浏览器左滚动的距离
			var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
			evt.preventDefault(); 
			// 获取鼠标在视口的坐标，传递参数到drawpoint的
			if (that.device) {
				that.movex =  evt.touches[0].clientX-that.getAllLeft(that.cas)+scrollLeft;	
				that.movey =  evt.touches[0].clientY-that.getAllTop(that.cas)+scrollTop;
			}else{
				that.movex = evt.clientX-that.getAllLeft(that.cas)+scrollLeft;
				that.movey = evt.clientY-that.getAllTop(that.cas)+scrollTop;
			}
			that.drawT(that.movex,that.movey);
			that.isMouseDown = true;
	},false);
	// 移动事件
	this.cas.addEventListener(this.Move,function(event){
		if (that.isMouseDown){
			var evt = event || window.event;
			var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			//获取浏览器左滚动的距离
			var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
			evt.preventDefault(); 
			// 获取鼠标在视口的坐标，传递参数到 drawT的
			var mox = that.device ? evt.touches[0].clientX: evt.clientX;
			var moy = that.device ? evt.touches[0].clientY: evt.clientY;
			var moxAll= mox-that.getAllLeft(that.cas)+scrollLeft;
			var moyAll= moy-that.getAllTop(that.cas)+scrollTop;
			that.drawT(that.movex,that.movey);
			that.drawT(that.movex,that.movey,moxAll,moyAll);
			// 把每次结束点变成下一次划线的开始点
			that.movex = moxAll;
		    that.movey = moyAll;
		    var percents = that.getTransparencyPercent();
			//调用同名的全局函数
			that.callback.call(null,percents);
			//当透明面积超过用户指定的透明面积
			if( percents > that.transpercent){
				that.clearRect();
				that.isMouseDown = false;
			}		
		}else{
			return false;
		}
	},false);
	// 松开事件
	this.cas.addEventListener(this.Uplift,function(event){
		that.isMouseDown = false;
	},false);
};