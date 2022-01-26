<template>
	<view class="content">
		<view class="player one">
			<image class="player-img" src="../../static/logo.png"></image>
			<button class="player-touch">抓<button>
		</view>
		<view class="player-stage">
			<button class="player-start" @tap="eventShuffle">开始<button>
		<view>
		<view class="player two">
			<image class="player-img" src="../../static/logo.png"></image>
			<button class="player-touch">抓<button>
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
				pokerList:[]
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
		},
		methods: {
			eventShuffle(){
				this.pokerList = this.initPoker.sort(()=>{ return Math.random()>.5 ? -1 : 1});
				console.log('pokerList...',JSON.stringify(this.pokerList));
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
	}

	.player {
		display: flex;
		height: 100rpx;
		width: 100%;
	}
	.player-img{
		height: 100rpx;
		width: 100rpx;
	}
	.one{
		position: fixed;
		top: 20rpx;
		left: 20rpx;
	}
	.two{
		position: fixed;
		bottom: 20rpx;
		left: 20rpx;
	}
	.text-area {
		display: flex;
		justify-content: center;
	}
	.player-stage{
		position: fixed;
		top: 50%;
		margin-top: -20rpx;
	}
	.player-touch{}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
