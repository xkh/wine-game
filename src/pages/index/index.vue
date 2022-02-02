<template>
  <view class="content">
    <view class="player-user one">
      <view class="my-info">
        <image class="player-img" :src="otherUserInfo.avatar"></image>
        <view class="player-name">{{ otherUserInfo.name }}</view>
      </view>
      <view class="player-landing" v-if="!otherId && roomCreated"
        >等待其他玩家进入房间</view
      >
      <!-- <view class="player-away">已逃{{ myAwayTime }}次</view> -->
    </view>
    <view class="player-stage">
      <!-- 未登录遮罩 -->
        <view class="stage-no" v-if="!roomCreated">
          <view class="stage-form">
          <view class="get-room-num">
            <input
              class="room-num"
              type="number"
              maxlength="4"
              placeholder="输入4位房间号创建或加入"
              @blur="eventNumBlur"
              :value="roomNum"
            />
          </view>
          <button class="get-name-btn" @tap="getUserProfile">参与游戏</button>
          </view>
        </view>
      <view class="stage-left">
        <view
          class="player-btn"
          :class="{ begin: isBegin }"
          @tap="eventShuffle"
          >{{ isBegin ? "禁止洗" : isShuffle ? "再洗洗" : "洗一洗" }}</view
        >
        <view class="player-btn" @tap="eventStart">{{
          isBegin ? "已开局" : "开局"
        }}</view>
        <view class="player-btn" @tap="eventWhoFirst">
          {{ isFirstStatus === 0 ? "黑/红" : "" }}
          {{ isFirstStatus === 1 ? "黑" : "" }}
          {{ isFirstStatus === 2 ? "红" : "" }}
        </view>
        <view class="player-btn over" @tap="eventOver">结束</view>
        <view class="player-btn gap" @tap="eventGetCard">摸牌</view>
        <view class="player-btn" @tap="eventOpenCard">开牌</view>
        <view class="player-btn" @tap="eventRunAway">逃跑</view>
        <view class="player-btn" @tap="eventGetCard">1分</view>
        <view class="player-btn" @tap="eventGetCard">2分</view>
        <view class="player-btn" @tap="eventGetCard">3分</view>
      </view>
      <view class="stage-right">
        <!-- 已登录 -->
        <view class="right-other-card" :class="{'not-open':!isOpen}">
          <view class="card-img img-one" v-if="cardOne">
            <image class="card-img-src" :src="cardOneImg" v-show="isOpen"></image>
          </view>
          <view class="card-img img-two" v-if="cardTwo">
            <image class="card-img-src" :src="cardTwoImg" v-show="isOpen"></image>
          </view>
        </view>
        <view class="right-all-card">
          <!-- <view class="player-start-list" v-if="pokerList && pokerList.length">
            <view class="poker-item" v-for="(poker, i) in pokerList" :key="i">
              *{{ poker }}
            </view>
          </view> -->
          <view class="all-cards">
            <image
              class="all-cards-img"
              src="../../static/images/all.jpg"
            ></image>
          </view>
        </view>
        <view class="right-my-card">
          <view class="card-img img-one" v-if="cardOne">
            <image class="card-img-src" :src="cardOneImg"></image>
          </view>
          <view class="card-img img-two" v-if="cardTwo">
            <image class="card-img-src" :src="cardTwoImg"></image>
          </view>
        </view>
      </view>
    </view>
    <view class="player-user two">
      <view class="my-info">
        <image class="player-img" :src="myUserInfo.avatar"></image>
        <view class="player-name">{{ myUserInfo.name }}</view>
      </view>
      <!-- <view class="player-card">{{ cardTwo }}</view> -->
      <view class="player-landing" v-if="!roomCreated">未加入房间</view>
      <!-- <view class="player-away">已逃{{ myAwayTime }}次</view> -->
    </view>
  </view>
</template>

<script lang="ts">
import Vue from "vue";
const baseUrl = "http://192.168.31.16:2001/game/";
// const baseUrl = "https://api.xonepage.com/game/";
export default Vue.extend({
  data() {
    return {
      poker: {
        spade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //黑桃
        heart: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //红心
        club: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //梅花
        diamond: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //方块
        joker: [3, 6], //大小王
      },
      pokerList: [],
      socketStatus: 0,
      isShuffle: false, //是否已刷牌
      isBegin: false, //是否开局
      isOpen: false, //是否开牌
      isFirstStatus: 0, //是黑还是红
      cardOne: "",
      cardTwo: "",
      myUserInfo: {
        name: "",
        avatar: "../../static/images/default.jpg",
      },
      otherUserInfo: {
        name: "",
        avatar: "../../static/images/default.jpg",
      },
      myAwayTime: 0, //我逃跑的次数
      otherAwayTime: 0, //他人跑的次数
      id: "", //用户id
      otherId: "", //其他玩家id
      roomNum: "",
      roomCreated: false,
    };
  },
  watch:{
    otherId:{
      handler(val){
        if(val){
          console.log('有玩家进入了!!!',val);
          this.getOtherInfo(val)
        }
      },
      immediate: true,
    }
  },
  computed: {
    initPoker() {
      const newPoker: any = [];
      const poker: any = this.poker;
      for (let p in poker) {
        if (poker[p].length) {
          poker[p].forEach((num: Number) => {
            const pk = `${p}_${num}`;
            newPoker.push(pk);
          });
        }
      }
      return newPoker;
    },
    cardOneImg() {
      const name: string = this.cardOne;
      return name ? `../../static/images/${name}.jpg` : "";
    },
    cardTwoImg() {
      const name: string = this.cardTwo;
      return name ? `../../static/images/${name}.jpg` : "";
    },
  },
  onLoad() {
    console.log("initPoker...", this.initPoker);
    this.autoLogin().then((res) => {
      const { code, data } = res as any;
      if (code === 0) {
        const { id, name, avatar } = data;
        this.id = id;
        if (name || avatar) {
          this.myUserInfo = data;
        }
      }
    });
  },
  methods: {
    getOtherInfo(otherId=''){
      const that = this;
      // getUser
      uni.request({
        url: baseUrl + "getUser",
        method: "POST",
        data: { id: otherId },
        success(res: any) {
          const {success, data} = res.data;
          if(success){
            that.otherUserInfo = data;
          }
          console.log('ooo...',res)
        },
      });
    },
    getUserProfile() {
      const that = this;
      const roomNum = this.roomNum;
      if (!roomNum) {
        this.toast("请输入正确房间号");
        return;
      }
      const {
        id = "",
        name = "",
        avatar = "",
      } = (getApp() as any).globalData.userInfo;
      if (!id) {
        this.autoLogin().then((res) => {
          const { code } = res as any;
          if (code === 0) {
            this.getUserProfile();
          }
        });
      } else if (!name && !avatar) {
        uni.getUserProfile({
          desc: "获取您的昵称用于链接其他玩家",
          success(res) {
            console.log("用户信息获取成功...", res, that.socketStatus);
            const { userInfo = {} } = res || {};
            const { nickName, avatarUrl } = userInfo as any;
            const userData = { id, name: nickName, avatar: avatarUrl };
            that.myUserInfo = userData;
            uni.request({
              url: baseUrl + "updateUser",
              method: "POST",
              data: userData,
            });
          },
          fail() {
            that.toast("请授权头像、昵称参与游戏~");
          },
          complete() {
            if (!id) {
              that.toast("获取用户信息失败,请稍后重试");
              that.autoLogin();
            } else {
              //addROOM
              that.postAddRoom(id, roomNum);
            }
          },
        });
      } else if (name || avatar) {
        that.postAddRoom(id, roomNum);
      }
    },
    postAddRoom(id = "", room_num = "") {
      const that: any = this;
      uni.request({
        url: baseUrl + "addRoom",
        method: "POST",
        data: { id, room_num },
        success(res: any) {
          console.log("c_addRoom", res.data, that.socketStatus);
          const { msg, success, data } = res.data;
          if (success) {
            const { player_one_id, player_two_id } = data;
            const otherId =
              id === player_one_id ? player_two_id : player_one_id;
            if(otherId){
              //todo 加入成功
              that.otherId = otherId;
            }
            uni.setNavigationBarTitle({
              title: `喷大气${room_num}室`,
            });
            that.roomCreated = true;
            if (!that.socketStatus) {
              that.initSocket(id);
            }
          }
          if (msg) {
            that.toast(msg);
          }
        },
      });
    },
    //初始化
    initSocket(id = "") {
      if (!id) {
        return;
      }
      //创建连接
      uni.connectSocket({
        // url: "wss:api.xonepage.com/game/wss/" + id,
        url: "ws://192.168.31.16:2001/game/wss/" + id,
      });
      //socket打开后
      uni.onSocketOpen((res) => {
        this.socketStatus = 1;
        console.log("websocket已连接...", res);
        this.sendSocketMessage();
      });
      //监听socket 接受服务器的消息
      uni.onSocketMessage((e: object) => {
        const { data } = e as any;
        const { fromId, msg } = JSON.parse(data);
        if(fromId){
          this.otherId = fromId;
        }
        const {isBegin, isShuffle, list} = JSON.parse(msg);
        if (list && list.length) {
          this.pokerList = list;
          this.isShuffle = isShuffle;
          this.isBegin = isBegin;
        }
        if (isBegin) {
          this.startSaveLocal(JSON.parse(data));
        }
        console.log("websocket监听到消息！！！fromId", fromId, JSON.parse(msg));
      });
      //socket断开后
      uni.onSocketClose((res) => {
        this.socketStatus = 0;
        this.closeSocket();
        console.log("websocket已断开...", res);
      });
      //socket异常
      uni.onSocketError((err) => {
        console.log("websocket异常了...", err);
      });
    },
    //关闭socket
    closeSocket() {
      if (this.socketStatus === 1) {
        uni.closeSocket({
          success: (res) => {
            console.log("关闭socket成功...", res);
            this.socketStatus = 0;
          },
        });
      }
    },
    //发送消息
    sendSocketMessage(msg = {}) {
      const params = {
        isBegin: this.isBegin,
        isShuffle: this.isShuffle,
        list: this.initPoker,
        ...msg,
      };
      console.log("this.socketStatus...", this.socketStatus, params);
      const { isBegin } = params;
      if (isBegin) {
        this.startSaveLocal(params);
      }
      if (this.socketStatus === 1) {
        uni.sendSocketMessage({
          data: JSON.stringify({
            roomNum: this.roomNum,
            otherId: this.otherId,
            msg: JSON.stringify(params),
          }) as any,
        });
      } else {
        console.log("未连接");
      }
    },
    //刷新
    eventShuffle() {
      if (this.isBegin) return;
      const pokerList = this.initPoker.sort(() => {
        return Math.random() > 0.5 ? -1 : 1;
      });
      this.pokerList = pokerList;
      this.isShuffle = true;
      console.log("pokerList...", JSON.stringify(this.pokerList));
      this.sendSocketMessage({ isShuffle: true, list: pokerList });
    },
    //开局禁止刷新
    eventStart() {
      if (!this.isShuffle) {
        this.toast("洗一洗更健康");
        return;
      } else if (!this.isBegin) {
        this.isBegin = true;
        this.sendSocketMessage({ isBegin: true });
      }
    },
    //结束游戏
    eventOver() {
      this.isShuffle = false;
      this.isBegin = false;
      this.isFirstStatus = 0;
      this.cardOne = "";
      this.cardTwo = "";
      this.sendSocketMessage({ isBegin: false, isShuffle: false });
      uni.setStorage({
        key: "WS_MESSAGE",
        data: null,
        success: function () {
          console.log("清除本地存储");
        },
      });
    },
    //本地存储
    startSaveLocal(param = {}) {
      uni.setStorage({
        key: "WS_MESSAGE",
        data: param,
        success: function () {
          console.log("保存本地存储success");
        },
      });
    },
    eventGetCard() {
      if (!this.isBegin) {
        this.toast("请点击开局");
        return;
      }
      if (this.cardOne && this.cardTwo) {
        this.cardOne = "";
        this.cardTwo = "";
        return;
      }
      const pokerList = this.pokerList;
      const card = pokerList[0];
      if (!this.cardOne) {
        this.cardOne = card;
      } else if (!this.cardTwo) {
        this.cardTwo = card;
      }
      const newList = pokerList.slice(1, 55);
      this.pokerList = newList;
      this.sendSocketMessage({ list: newList });
      console.log("card...", card, newList);
    },
    //黑红
    eventWhoFirst() {
      if (this.isFirstStatus) {
        this.isFirstStatus = 0;
      } else {
        this.isFirstStatus = Math.random() > 0.5 ? 1 : 2;
      }
    },
    //run away
    eventRunAway() {
      if (this.cardOne && this.cardTwo) {
        this.cardOne = "";
        this.cardTwo = "";
        this.myAwayTime++;
      }
    },
    //open card
    eventOpenCard() {
      this.isOpen = true;
    },
    toast(title = "", time=2000) {
      if (title) {
        uni.showToast({ title, icon: "none", duration:time});
      }
    },
    autoLogin() {
      const that = this;
      return new Promise((resolve) => {
        uni.login({
          async success(res: any) {
            const { code } = res;
            if (code) {
              uni.request({
                url: baseUrl + "auth",
                method: "POST",
                data: { code },
                success(r) {
                  const { data } = r as any;
                  console.log("用户静默授权...", data);
                  if (data.code === 0) {
                    (getApp() as any).globalData.userInfo = data.data;
                    uni.setStorage({
                      key: "USER_INFO",
                      data: data.data,
                    });
                    resolve(data);
                  } else {
                    resolve(data);
                  }
                },
                fail() {
                  resolve({ code: -1 });
                },
              });
            }
          },
          fail() {
            resolve({ error: true });
          },
        } as any);
      });
    },
    eventNumBlur(e: any) {
      const { value, cursor } = e.detail;
      if (cursor === 4) {
        this.roomNum = value;
      }
    },
  },
});
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
}
.player-user {
  flex: 0 0 auto;
  display: flex;
  height: 150rpx;
  background: #eeeeee;
  width: 100%;
  align-items: center;
}
.player-stage {
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  width: 750rpx;
}
.player-btn {
  height: 70rpx;
  width: 120rpx;
  line-height: 70rpx;
  background: #2fb157;
  border-radius: 10rpx;
  margin: 15rpx 0 0 15rpx;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 30rpx;
}

.player-btn.begin {
  background: #999999;
}
.player-btn.over {
  background: #f54551;
}
.player-btn.gap {
  margin-top: 80rpx;
}
.stage-left {
  font-size: 26rpx;
  width: 150rpx;
  border: 2rpx solid #f5f5f5;
  flex-shrink: 0;
}
.stage-right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
}
.stage-no {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.44);
  z-index: 9;
}
.stage-form{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.get-room-num {
  height: 80rpx;
  width: 420rpx;
  margin: 0 auto;
  border: #2fb157 2rpx solid;
  background: #ffffff;
  border-radius: 10rpx;
}
.room-num {
  height: 60rpx;
  line-height: 60rpx;
  margin-top: 10rpx;
  width: 380rpx;
  margin-left: 20rpx;
  border: 0;
}
.player-start-list {
  overflow: scroll;
  flex-shrink: 0;
}
.right-all-card {
  flex: 1;
}
.all-cards {
  width: 600rpx;
  height: 470rpx;
}
.all-cards-img {
  width: 600rpx;
  height: 470rpx;
}
.right-other-card {
  flex: 1;
  background: #f5f5f5;
  position: relative;
}
.right-other-card .card-img{
  border: 2rpx solid #ffffff;
}
.right-my-card {
  flex: 1;
  background: #f5f5f5;
  position: relative;
}
.card-img{
  position: absolute;
  height: 300rpx;
  width: 210rpx;
}
.right-my-card .card-img{
  bottom: 0;
}
.card-img .card-img-src{
  height: 300rpx;
  width: 210rpx;
}
.not-open .card-img{
  background: #999999;
}
.card-img.img-one,
.card-img.img-two {
  height: 300rpx;
  width: 210rpx;
}
.card-img.img-one {
  left: 50rpx;
  z-index: 1;
}
.card-img.img-two {
  left: 130rpx;
  z-index: 2;
}
.poker-item {
  background: seagreen;
  float: left;
}
.player-img {
  height: 100rpx;
  width: 100rpx;
  border-radius: 100rpx;
}
.one {
  top: 20rpx;
  left: 20rpx;
}
.two {
  bottom: 20rpx;
  left: 20rpx;
}
.my-info {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.player-name {
  height: 40rpx;
  line-height: 40rpx;
  width: 120rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.text-area {
  display: flex;
  justify-content: center;
}

.get-name-btn {
  height: 80rpx;
  line-height: 80rpx;
  width: 420rpx;
  background: #2fb157;
  border-radius: 10rpx;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 30rpx;
  margin-top: 40rpx;
}
</style>
