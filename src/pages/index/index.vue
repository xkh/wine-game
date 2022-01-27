<template>
	<view class="content">
		<view class="player one">
			<image class="player-img" src="../../static/logo.png"></image>
			<view class="player-touch">测试</view>
		</view>
		<view class="player-stage">
			<view class="player-start" @tap="eventShuffle">{{text}}</view>
		</view>
		<view class="player two">
			<image class="player-img" src="../../static/logo.png"></image>
			<view class="player-touch">测试</view>
		</view>
	</view>
</template>

<script lang="ts">
    import Vue from 'vue';
	export default Vue.extend({
		data() {
			return {
				title: 'Hello',
				poker:{
					'Spade':[1,2,3,4,5,6,7,8,9,10,11,12,13],//黑桃
					'Heart':[1,2,3,4,5,6,7,8,9,10,11,12,13],//红心
					'Club':[1,2,3,4,5,6,7,8,9,10,11,12,13],//梅花
					'Diamond':[1,2,3,4,5,6,7,8,9,10,11,12,13],//方块
					'Joker':[14,15]//大小王
				},
				pokerList:[],
				socketStatus: 0,
				socketMsgQueue: ['hello'],
				text:'aaa',
			}
		},
		computed:{
			initPoker(){
				const newPoker:any = [];
				const poker:any = this.poker;
				for(let p in poker){
					if(poker[p].length){
						poker[p].forEach((num: Number) => {
							newPoker.push({[p]:num})
						});
					}
				}
				return newPoker;
			}
		},
		onLoad() {
			console.log('initPoker...',this.initPoker);
			if(!this.socketStatus){
				this.initSocket();
			}
		},
		methods: {
			//初始化
			initSocket(){
				const that:any = this;
				console.log('iii...')
				//创建连接
				uni.connectSocket({
					url: 'ws://127.0.0.1:2001/game/wss',
				});
				//socket打开后
				uni.onSocketOpen((res)=>{
					this.socketStatus = 1;
					console.log('websocket已连接...',res);
					this.socketMsgQueue.map((msg:string)=>{
						this.sendSocketMessage(msg);
					})
				});
				//监听socket 接受服务器的消息
				uni.onSocketMessage((msg)=>{
					console.log('websocket监听到消息！！！',msg)
					// that.text=msg;
				});
				//socket断开后
				uni.onSocketClose((res)=>{
					this.socketStatus = 0;
					this.closeSocket();
					console.log('websocket已断开...',res);
				})
				//socket异常
				uni.onSocketError(err=>{
					console.log('websocket异常了...',err);
				});
			},
			//关闭socket
			closeSocket(){
				if(this.socketStatus === 1){
					uni.closeSocket({
						success:(res)=>{
							console.log('关闭socket成功...',res)
							this.socketStatus = 0;
						}
					})
				}
			},
			//发送消息
			sendSocketMessage(msg:string){
				console.log('this.socketStatus...',this.socketStatus)
				if(this.socketStatus === 1){
					uni.sendSocketMessage({
						data: msg
					})
				}else{
					this.socketMsgQueue.push(msg);
				}
			},
			//刷新
			eventShuffle(){
				this.pokerList = this.initPoker.sort(()=>{ return Math.random()>.5 ? -1 : 1});
				console.log('pokerList...',JSON.stringify(this.pokerList));
				this.sendSocketMessage('mmmmm')
			}
		}
	});
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}
	.player {
		flex: 0 0 auto;
		display: flex;
		height: 200rpx;
		background: #eeeeee;
		width: 100%;
	}
	.player-stage{
		flex: 1 1 auto;
	}
	.player-img{
		height: 100rpx;
		width: 100rpx;
	}
	.one{
		top: 20rpx;
		left: 20rpx;
	}
	.two{
		bottom: 20rpx;
		left: 20rpx;
	}
	.text-area {
		display: flex;
		justify-content: center;
	}
	
	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
