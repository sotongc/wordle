!function(exports){
	'use strict'
	/**
	 * @ Wordle.js
	 * 	- Description: Wordle Component
	 * 	- Dependency: d3.js && d3.cloud.layout.js
	 * 	- Author: Guo Chen
	*/

	var _const={
		words:[],
		complete:0,
		keyword:"",
		fontSize:null,
		fetcher:null
	};

	var defaults={
		id:'',
		fill:d3.scale.category20(),
		w:960,
		h:600,
		scale:1,
		max:300,
		maxLength:30,
		fontFamily:"Impact",//字体
		spiral:'archimedean',//or rectangular
		scaleType:'log', // log | sqrt | linear
	};

	/**
	 * @ Class: Wordle
	*/

	class Wordle{
		constructor(param){
			this.config={};
			Object.assign(this.config,defaults,param,_const);
			this.init();
		}
	}

	Object.assign(Wordle.prototype,{
		init:function(){
			let w=this.config.w;
			let h=this.config.h;
			let self=this;

			this.layout=d3.layout.cloud().timeInterval(10).size([w,h]).fontSize(function(t){
				return self.config.fontSize(+t.value);
			}).text(function(t){
				return t.key;
			}).on("word", this.progress).on("end",function(t,e){
				self.draw.apply(self,arguments);
			});

			this.svg=d3.select(this.config.id).append("svg").attr({
				width:w,
				height:h
			});

			this.background=this.svg.append("g");
			this.vis=this.svg.append("g").attr({
				transform:"translate("+[w >> 1, h >> 1]+")",
			});
			return this;
		},
		loadData:function(data){
			this.tags=[]; // [{key:'word',value:10}]
			Object.assign(this.tags,data);
			return this;
		},
		progress:function(t){
			//progressing ...
		},
		draw:function(t,e){
			let w=this.config.w;
			let h=this.config.h;
			let self=this;

			this.config.scale=e?Math.min(w / Math.abs(e[1].x - w / 2), w / Math.abs(e[0].x - w / 2), h / Math.abs(e[1].y - h / 2), h / Math.abs(e[0].y - h / 2)) / 2 : 1;
			this.config.words=t;

			var text=this.vis.selectAll("text").data(this.config.words,function(t){
				return t.text.toLowerCase();
			});

			//变形位移
			text.transition().duration(1e3).attr("transform",function(t){
				return "translate(" + [t.x, t.y] + ")rotate(" + t.rotate + ")";
			}).style("font-size",function(t){
				return t.size+"px";
			});

			text.enter().append("text").on("click",self.onclickText).attr("text-anchor","middle").attr("transform",function(t){
				return "translate("+[t.x,t.y]+")rotate("+t.rotate+")";
			}).style("font-size","1px").transition().duration(1e3).style("font-size",function(t){
				return t.size+"px";
			}).style("cursor","pointer");

			text.style("font-family",function(t){
				return t.font;
			}).style("fill",function(t){
				return self.config.fill(t.text.toLowerCase());
			}).text(function(t){
				return t.text;
			});

			var a=this.background.append("g").attr("transform",this.vis.attr("transform")),
				r=a.node();

			text.exit().each(function(){
				r.appendChild(this);
			});

			a.transition().duration(1e3).style("opacity",1e-6).remove();
			this.vis.transition().delay(1e3).duration(750).attr("transform","translate(" + [w >> 1, h >> 1] + ")scale(" + this.config.scale + ")");
		},
		create:function(){
			let tags=this.tags;

			this.layout.font(this.config.fontFamily).spiral(this.config.spiral);
			this.config.fontSize=d3.scale[this.config.scaleType]().range([10,100]);
			tags.length && this.config.fontSize.domain([+tags[tags.length-1].value || 1,+tags[0].value]);
			this.config.complete=0;
			this.config.words=[];
			this.layout.stop().words(tags.slice(0,this.config.max=Math.min(tags.length,+this.config.max))).start();
			return this;
		},
		onclickText:function(){}
	});

	exports.Wordle=Wordle;
}(window);