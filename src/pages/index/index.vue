<template>
  <view class="content" :class="{ green: roomCreated }">
    <navBar :title="'喷大气' + (roomNum ? roomNum + '房间' : '')"> </navBar>
    <!-- 未登录遮罩 -->
    <view class="stage-no" v-if="!roomCreated">
      <image
        class="stage-form-back"
        src="../../static/images/create_room_new.png"
      />
      <view class="stage-form">
        <view class="get-room-num">
          <input
            class="room-num"
            type="number"
            maxlength="4"
            placeholder="输入4位房间号创建或加入"
            @input="eventNumBlur"
            :value="roomNum"
          />
        </view>
        <button class="get-name-btn" @tap="getUserProfile">进入房间</button>
      </view>
    </view>
    <view
      class="player-user one"
      v-if="roomCreated"
      :style="{
        'padding-top': navHeight + 'px',
        height: navHeight + 75 + 'px',
      }"
    >
      <view class="my-info">
        <image class="player-img" :src="otherUserInfo.avatar"></image>
        <view class="player-name">{{ otherUserInfo.name }}</view>
      </view>
      <view class="player-landing" v-if="!otherId && roomCreated"
        >等待其他玩家进入房间</view
      >
      <view class="player-landing" v-if="otherClose && roomCreated">{{
        otherId ? "玩家离线请稍后..." : "玩家已下线"
      }}</view>
      <view class="player-landing" v-if="otherFirst && !isOpen && isBegin"
        >先手</view
      >
      <view class="player-landing" v-if="otherScoreNum">
        <text>叫{{ otherScoreNum }}分</text>
        <text class="red" v-if="otherRunAway && otherScoreNum">逃</text>
      </view>
      <view
        class="player-landing win"
        v-if="otherWin && isOpen && pokerList.length"
        >{{ myRunAway ? "避十" : "" }}赢！</view
      >
      <view class="player-away" v-if="otherId && roomCreated"
        >已逃{{ otherAwayTime }}次</view
      >
    </view>
    <view class="player-stage" v-if="roomCreated">
      <view class="stage-left">
        <view class="player-btn over" @tap="eventOverBrfore">结束</view>
        <view
          class="player-btn"
          :class="{ begin: isBegin }"
          @tap="eventShuffle"
          >{{ isBegin ? "禁止洗" : isShuffle ? "再洗洗" : "洗一洗" }}</view
        >
        <view
          class="player-btn"
          :class="{ begin: isBegin }"
          @tap="eventStart"
          >{{ isBegin ? "已开局" : "开局" }}</view
        >
        <view class="player-btn" @tap="eventWhoFirst">
          {{ isFirstStatus === 0 ? "扳花色" : "" }}
          {{ isFirstStatus === 1 ? "黑" : "" }}
          {{ isFirstStatus === 2 ? "红" : "" }}
        </view>

        <view
          class="player-btn gap"
          :class="{ begin: isOpen }"
          @tap="eventGetCard"
          >摸牌</view
        >
        <view
          class="player-btn"
          :class="{ begin: !canOpen }"
          @tap="eventOpenCard"
          >{{ isOpen ? "收牌" : "开牌" }}</view
        >
        <view
          class="player-btn"
          :class="{ begin: !canAddCup }"
          @tap="eventAddCup(1)"
          >一分</view
        >
        <view
          class="player-btn"
          :class="{ begin: !canAddCup }"
          @tap="eventAddCup(2)"
          >二分</view
        >
        <view
          class="player-btn"
          :class="{ begin: !canAddCup }"
          @tap="eventAddCup(3)"
          >三分</view
        >
        <view
          class="player-btn"
          :class="{ begin: !canRunAway }"
          @tap="eventRunAway"
          >逃跑</view
        >
      </view>
      <view class="stage-right">
        <!-- 已登录 -->
        <view class="right-other-card" :class="{ 'not-open': !isOpen }">
          <view class="card-img img-one" v-if="otherCard[0]">
            <image
              class="card-img-src"
              :src="
                isOpen
                  ? getCardImg(otherCard[0])
                  : '../../static/images/card_back.jpg'
              "
            ></image>
          </view>
          <view class="card-img img-two" v-if="otherCard[1]">
            <image
              class="card-img-src"
              :src="
                isOpen
                  ? getCardImg(otherCard[1])
                  : '../../static/images/card_back.jpg'
              "
            ></image>
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
              src="../../static/images/all_jiu.png"
            ></image>
          </view>
        </view>
        <view class="right-my-card">
          <view class="card-img img-one" v-if="myCard[0]">
            <image class="card-img-src" :src="getCardImg(myCard[0])"></image>
          </view>
          <view class="card-img img-two" v-if="myCard[1]">
            <image class="card-img-src" :src="getCardImg(myCard[1])"></image>
          </view>
        </view>
      </view>
    </view>
    <view class="player-user two" v-if="roomCreated">
      <view class="my-info">
        <image class="player-img" :src="myUserInfo.avatar"></image>
        <view class="player-name">{{ myUserInfo.name }}</view>
      </view>
      <view class="player-landing" v-if="!roomCreated">未加入房间</view>
      <view class="player-landing" v-if="myClose && roomCreated"
        >离线请稍后</view
      >
      <view class="player-landing" v-if="myFirst && !isOpen && isBegin"
        >先手</view
      >
      <view class="player-landing" v-if="myScoreNum"
        ><text>叫{{ myScoreNum }}分</text
        ><text class="red" v-if="myRunAway && myScoreNum">逃</text></view
      >
      <view
        class="player-landing win"
        v-if="myWin && isOpen && pokerList.length"
        >{{ otherRunAway ? "避十" : "" }}赢！</view
      >
      <view class="player-away" v-if="otherId && roomCreated"
        >已逃{{ myAwayTime }}次</view
      >
    </view>
  </view>
</template>

<script lang="ts">
import Vue from "vue";
import heartCheck from "./heartCheck";
import navBar from "../../components/navBar.vue";
// const baseUrl = "http://192.168.31.18:2001/game/";
const baseUrl = "https://api.xonepage.com/game/";
export default Vue.extend({
  components: { navBar },
  data() {
    return {
      poker: {
        spade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //黑桃
        heart: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //红心
        club: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //梅花
        diamond: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //方块
        // spade: [1], //黑桃
        // heart: [1], //红心
        // club: [1], //梅花
        // diamond: [1], //方块
        joker: [3, 6], //大小王
      },
      pokerList: [],
      socketStatus: 0,
      isShuffle: false, //是否已刷牌
      isBegin: false, //是否开局
      isOpen: false, //是否开牌
      isFirstStatus: 0, //是黑还是红
      myFirst: false, //先手
      otherFirst: false, //先手
      myCard: [], //我摸的
      otherCard: [], //他摸的
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
      myWin: false,
      otherWin: false,
      lockReconnect: false,
      reConnectTimer: null,
      reConnectLimit: 0,
      myScoreNum: 0,
      otherScoreNum: 0,
      myRunAway: false,
      otherRunAway: false,
      myClose: false,
      otherClose: false,
      navHeight: 0,
    };
  },
  watch: {
    otherId: {
      handler(val) {
        if (val) {
          console.log("有玩家进入了!!!", val);
          this.getOtherInfo(val);
        }
      },
      immediate: true,
    },
    isOpen(val) {
      if (val === false) {
        this.myCard = [];
        this.otherCard = [];
      }
      this.myFirst = !this.otherFirst;
    },
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
    canAddCup() {
      const { myCard, otherCard, isOpen, myFirst, myScoreNum, otherScoreNum } =
        this as any;
      const isCan = myCard.length === 2 && otherCard.length === 2 && !isOpen;
      if (myFirst && myScoreNum === 0) {
        return isCan;
      } else {
        return (
          isCan &&
          otherScoreNum > myScoreNum &&
          myScoreNum < 3 &&
          otherScoreNum < 3
        );
      }
    },
    canRunAway() {
      const { myCard, otherCard, isOpen } = this as any;
      return myCard.length === 2 && otherCard.length === 2 && !isOpen;
    },
    canOpen() {
      const { myCard, otherCard, pokerList } = this as any;
      return (
        (myCard.length === 2 && otherCard.length === 2) ||
        (myCard.length === 1 &&
          otherCard.length === 1 &&
          pokerList.length === 0)
      );
    },
  },
  onLoad() {
    console.log("initPoker...", this.initPoker);
    // this.checkMyWin();
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
    this.$nextTick(() => {
      const { statusBarHeight, titleBarHeight } = getApp().globalData as any;
      console.log("titleBarHeight...", titleBarHeight);
      this.navHeight = statusBarHeight + titleBarHeight;
    });
  },
  onUnload() {
    this.closeSocket();
  },
  onShareAppMessage() {
    const { roomNum } = this as any;
    return {
      title: "快来和我一起喷大气！",
      path: `/pages/index/index?roomNum=${roomNum}`,
    };
  },
  methods: {
    getCardImg(cardName = "") {
      return cardName ? `../../static/images/${cardName}.jpg` : "";
    },
    getOtherInfo(otherId = "") {
      const that = this;
      // getUser
      uni.request({
        url: baseUrl + "getUser",
        method: "POST",
        data: { id: otherId },
        success(res: any) {
          const { success, data } = res.data;
          if (success) {
            that.otherUserInfo = data;
          }
          console.log("ooo...", res);
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
            that.getUserProfile();
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
            if (otherId) {
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
      const that = this;
      uni.showLoading({
        title: "连接中...",
      });
      if (!id) {
        return;
      }
      //创建连接
      uni.connectSocket({
        url: `wss://api.xonepage.com/game/wss?id=${id}&room_num=${this.roomNum}`,
        // url: `ws://192.168.31.16:2001/game/wss?id=${id}&room_num=${this.roomNum}`,
        complete() {
          uni.hideLoading();
        },
      });
      //socket打开后
      uni.onSocketOpen((res) => {
        this.socketStatus = 1;
        this.myClose = false;
        console.log("websocket已连接...", res);
        heartCheck.reset().start();
        if (this.otherId) {
          this.sendSocketMessage();
        }
        // setTimeout(()=>{
        //   this.closeSocket();
        // },6000)
      });
      //监听socket 接受服务器的消息
      uni.onSocketMessage((e: object) => {
        const { data } = e as any;
        if (data === "pong") {
          heartCheck.reset().start();
          return;
        }
        const { fromId, msg } = JSON.parse(data);
        console.log("websocket监听到消息！！！fromId", fromId, msg);
        if (msg === "out" || msg === "off") {
          this.otherClose = true;
          this.otherId = "";
          this.eventOver();
          return;
        }

        if (fromId) {
          this.otherId = fromId;
          this.otherClose = false;
        }

        const {
          isBegin,
          isShuffle,
          isFirstStatus,
          list,
          myCard: otherCard,
          isOpen,
          myFirst: otherFirst,
          myWin: otherWin,
          myScoreNum: otherScoreNum,
          myRunAway: otherRunAway,
          myAwayTime: otherAwayTime,
        } = JSON.parse(msg);
        if (list) {
          this.pokerList = list;
          this.isShuffle = isShuffle;
          this.isBegin = isBegin;
          this.otherCard = otherCard;
          this.otherFirst = otherFirst;
          if (otherFirst) {
            this.myFirst = false;
          }
          if (otherWin) {
            this.myWin = false;
          }
          this.otherWin = otherWin;
          // this.myWin = !otherWin;
          // this.myFirst = !otherFirst;
          this.isOpen = isOpen;
          this.isFirstStatus = isFirstStatus;
          this.otherScoreNum = otherScoreNum;
          this.otherRunAway = otherRunAway;
          this.otherAwayTime = otherAwayTime;
        }
        if (isBegin) {
          this.startSaveLocal(JSON.parse(data));
        } else if (this.myCard.length || this.otherCard.length) {
          this.eventOver();
        }
        if (isOpen) {
          this.myWin = !otherWin;
        } else {
          if (otherRunAway) {
            this.myCard = [];
            this.myRunAway = false;
          }
        }
        if (isOpen && list.length === 0) {
          uni.showModal({
            title: "提示",
            content: "本局游戏已结束",
            success: function (res) {
              if (res.confirm) {
                that.eventOver();
              } else if (res.cancel) {
                console.log("用户点击取消");
              }
            },
          });
        }
      });
      //socket断开后
      uni.onSocketClose((res) => {
        this.socketStatus = 0;
        console.log("websocket已断开...", res);
        const { code, reason } = res as any;
        if (code == 1000 && reason == "normal closure") {
          this.myClose = true;
          //主动关闭的
        } else {
          this.reConnect(id);
        }
      });
      //socket异常
      uni.onSocketError((err) => {
        console.log("websocket异常了...", err);
        this.reConnect(id);
      });
    },
    //重连
    reConnect(id = "") {
      if (this.lockReconnect) return;
      this.lockReconnect = true;
      if ((this as any).reConnectTimer) {
        clearTimeout((this as any).reConnectTimer);
      }
      if (this.reConnectLimit < 5) {
        (this as any).reConnectTimer = setTimeout(() => {
          this.initSocket(id);
          this.lockReconnect = false;
        }, 2000);
        this.reConnectLimit++;
      }
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
        isOpen: this.isOpen,
        myCard: this.myCard,
        myFirst: this.myFirst,
        myWin: this.myWin,
        isFirstStatus: this.isFirstStatus,
        myScoreNum: this.myScoreNum,
        myRunAway: this.myRunAway,
        myAwayTime: this.myAwayTime,
        list: this.isShuffle && !this.isBegin ? this.initPoker : this.pokerList,
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
    eventOverBrfore() {
      const lingth = this.pokerList.length;
      const that = this;
      if (lingth) {
        uni.showModal({
          title: "提示！",
          content: "本局还有" + lingth + "张牌未摸，确定要结束吗？",
          success: function (res) {
            if (res.confirm) {
              that.eventOver();
            } else if (res.cancel) {
              console.log("用户点击取消");
            }
          },
        });
      }
    },
    eventOver() {
      this.isShuffle = false;
      this.isBegin = false;
      this.isFirstStatus = 0;
      this.myCard = [];
      this.isOpen = false;
      this.isFirstStatus = 0;
      this.myScoreNum = 0;
      this.otherScoreNum = 0;
      this.myRunAway = false;
      this.otherRunAway = false;
      this.myFirst = false;
      this.otherFirst = false;
      this.sendSocketMessage();
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
      if (this.isOpen) {
        return;
      }
      if (!this.myCard.length && !this.otherCard.length) {
        if (this.otherFirst) {
          this.toast("对方先摸");
          return;
        }
        if (!this.myFirst && !this.otherFirst) {
          this.myFirst = true;
          //先手
        }
      }

      if (!this.canOpen) {
        if (this.myFirst) {
          //先手逻辑
          if (this.myCard.length > this.otherCard.length) {
            this.toast("等对方摸牌");
            return;
          }
        } else {
          //后手逻辑
          if (
            this.myCard.length === this.otherCard.length &&
            this.myCard.length !== 2
          ) {
            this.toast("等对方摸牌");
            return;
          }
        }
      } else if (!this.isOpen) {
        if(this.myCard.length===1){
          this.toast("最后一张，请先送牌！");
        }else{
          this.toast("牌齐，请上分或开牌！");
        }
        return;
      }

      this.myScoreNum = 0;
      this.myRunAway = false;
      this.otherScoreNum = 0;
      const pokerList = this.pokerList;
      const card = pokerList[0];
      this.myCard.push(card);
      const newList = pokerList.slice(1, 55);
      this.pokerList = newList;
      this.sendSocketMessage({
        list: newList,
      });
    },
    //黑红
    eventWhoFirst() {
      if (this.isFirstStatus) {
        this.isFirstStatus = 0;
      } else {
        this.isFirstStatus = Math.random() > 0.5 ? 1 : 2;
      }
      this.sendSocketMessage();
    },
    //run away
    eventAddCup(num: any) {
      if ((this as any).canAddCup) {
        if (num <= this.otherScoreNum) {
          this.toast("请加码");
          return;
        }
        this.myScoreNum = num;
        this.sendSocketMessage();
      }
    },
    eventRunAway() {
      if ((this as any).canRunAway) {
        if (!this.myFirst && !this.myScoreNum && !this.otherScoreNum) {
          this.toast("等待对方叫分");
          return;
        }
        if (this.myFirst && !this.myScoreNum) {
          if (this.myAwayTime === 3) {
            this.myAwayTime = 0;
          }
          this.myCard = [];
          this.otherCard = [];
          this.myFirst = true;
          this.otherFirst = false;
          this.myRunAway = true;
          this.myAwayTime++;
          this.sendSocketMessage();
          return;
        }
        if (this.otherScoreNum) {
          const o1: any = (this.otherCard[0] as string).split("_");
          const o2: any = (this.otherCard[1] as string).split("_");
          const otherCardInfo = this.getCardValue(o1, o2);
          let { realNum } = otherCardInfo;
          if (realNum === 0) {
            //对方必十
            this.isOpen = true;
            this.myWin = false;
            this.otherWin = true;
            this.myRunAway = true;
          } else if (this.myScoreNum) {
            this.myCard = [];
            this.otherCard = [];
            this.myFirst = true;
            this.otherFirst = false;
            this.myRunAway = true;
            this.toast(`逃跑喝已上的${this.myScoreNum}分酒`, 2000);
          } else {
            if (this.myAwayTime === 3) {
              this.myAwayTime = 0;
            }
            this.myCard = [];
            this.otherCard = [];
            this.myFirst = true;
            this.otherFirst = false;
            this.myRunAway = true;
            this.myAwayTime++;
          }
          this.sendSocketMessage();
        }
      }
    },
    //open card
    eventOpenCard() {
      const that = this;
      if (!this.canOpen) return;
      if (this.isOpen) {
        this.myCard = [];
        this.otherCard = [];
        this.isOpen = false;
        this.myFirst = !this.myWin;
        this.otherFirst = !!this.myWin;
        this.sendSocketMessage();
        return;
      }
      if (this.canOpen) {
        this.isOpen = true;
        if (this.pokerList.length) {
          const myWin: any = this.checkMyWin();
          this.myWin = myWin;
          this.otherWin = !myWin;
          this.myFirst = !myWin;
          this.otherFirst = myWin;
        } else {
          uni.showModal({
            title: "提示",
            content: "本局游戏已结束",
            success: function (res) {
              if (res.confirm) {
                that.eventOver();
              } else if (res.cancel) {
                console.log("用户点击取消");
              }
            },
          });
        }
        this.sendSocketMessage();
      } else {
        this.toast("未达到开牌条件");
      }
    },
    checkMyWin() {
      //  {
      //   spade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //黑桃
      //   heart: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //红心
      //   club: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //梅花
      //   diamond: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //方块
      // },
      // this.myCard = ["heart_11", "diamond_3"] as any;
      // this.otherCard = ["spade_2", "diamond_2"] as any;
      // this.isOpen = true;
      const m1: any = (this.myCard[0] as string).split("_");
      const m2: any = (this.myCard[1] as string).split("_");
      const o1: any = (this.otherCard[0] as string).split("_");
      const o2: any = (this.otherCard[1] as string).split("_");
      const myCardInfo = this.getCardValue(m1, m2);
      const otherCardInfo = this.getCardValue(o1, o2);
      if (myCardInfo.isPair || otherCardInfo.isPair) {
        if (myCardInfo.isPair && otherCardInfo.isPair) {
          //都是对
          if (myCardInfo.realNum === otherCardInfo.realNum) {
            if (myCardInfo.maxNum === otherCardInfo.maxNum) {
              return myCardInfo.maxNumColor === "spade";
            } else {
              return myCardInfo.maxNum > otherCardInfo.maxNum;
            }
          } else {
            return myCardInfo.realNum > otherCardInfo.realNum;
          }
        } else if (myCardInfo.isPair) {
          //我的是对
          return otherCardInfo.realNum !== 0;
        } else if (otherCardInfo.isPair) {
          //他的是对
          return myCardInfo.realNum === 0;
        }
      } else {
        //无对情况
        if (myCardInfo.realNum === otherCardInfo.realNum) {
          if (myCardInfo.maxNum === otherCardInfo.maxNum) {
            return myCardInfo.maxNumColor === "spade";
          } else {
            return myCardInfo.maxNum > otherCardInfo.maxNum;
          }
        } else {
          return myCardInfo.realNum > otherCardInfo.realNum;
        }
      }
    },
    getCardValue(v1 = [], v2 = []) {
      let sumNum = 0;
      let realNum = 0;
      let maxNum = 0;
      let maxNumColor = "";
      let isPair = false;
      const color1 = v1[0];
      const color2 = v2[0];
      const num1 = Number(v1[1]);
      const num2 = Number(v2[1]);
      if (color1 === "joker" || color2 === "joker") {
        maxNumColor = "joker";
        if (color1 === "joker" && color2 === "joker") {
          //两张都是王
          maxNum = 16;
          sumNum = num1 + num2;
        } else if (color1 === "joker") {
          //第一张是王
          if (num1 === 3) {
            maxNum = 14;
            if (color2 === "spade" || color2 === "club") {
              sumNum = num2;
              isPair = true;
            } else {
              sumNum = num1 + num2;
            }
          }
          if (num1 === 6) {
            maxNum = 15;
            if (color2 === "heart" || color2 === "diamond") {
              sumNum = num2;
              isPair = true;
            } else {
              sumNum = num1 + num2;
            }
          }
        } else if (color2 === "joker") {
          //第二张是王
          if (num2 === 3) {
            maxNum = 14;
            if (color1 === "spade" || color1 === "club") {
              sumNum = num1;
              isPair = true;
            } else {
              sumNum = num1 + num2;
            }
          }
          if (num2 === 6) {
            maxNum = 15;
            if (color1 === "heart" || color1 === "diamond") {
              sumNum = num1;
              isPair = true;
            } else {
              sumNum = num1 + num2;
            }
          }
        }
      } else {
        //没大小王
        if (([color1, color2] as any).includes("spade")) {
          maxNumColor = "spade";
        } else if (([color1, color2] as any).includes("heart")) {
          maxNumColor = "heart";
        } else if (([color1, color2] as any).includes("club")) {
          maxNumColor = "club";
        } else {
          maxNumColor = "diamond";
        }
        maxNum = Math.max(num1, num2);
        if (
          num1 === num2 &&
          ((["spade", "club"].includes(color1) &&
            ["spade", "club"].includes(color2)) ||
            (["heart", "diamond"].includes(color1) &&
              ["heart", "diamond"].includes(color2)))
        ) {
          //对子
          sumNum = num1;
          isPair = true;
        } else {
          sumNum = num1 + num2;
        }
      }
      realNum = isPair ? sumNum : sumNum % 10;
      return { isPair, realNum, maxNum, maxNumColor, sumNum };
    },
    openCardModal(win: Boolean) {
      const that = this;
      uni.showModal({
        title: "已开牌" + (win ? "我方" : "对方") + "赢",
        showCancel: false,
        confirmText: "下一把",
        success() {
          if (that.isOpen) {
            that.myCard = [];
            that.otherCard = [];
            that.isOpen = false;
            that.myFirst = !win;
            that.otherFirst = !!win;
            that.sendSocketMessage();
          }
        },
      });
    },
    toast(title = "", time = 2000) {
      if (title) {
        uni.showToast({ title, icon: "none", duration: time });
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
.content-title {
  text-align: center;
}
.content.green {
  background:#444444;
}
.player-user {
  flex: 0 0 auto;
  display: flex;
  height: 150rpx;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  box-sizing: border-box;
  color: #ffffff;
}
.player-user.one {
}
.player-user.two {
  box-sizing: border-box;
  height: calc(150rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}
.player-stage {
  height: 100%;
  flex: 1 1 auto;
  display: flex;
  display: -webkit-flex;
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
  /* margin-top: 80rpx; */
}
.stage-left {
  font-size: 26rpx;
  width: 150rpx;
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
  /* background: rgba(255, 255, 255, 0.44); */
  z-index: 9;
  /* background: '../../static/images/create_room.jpg'; */
}
.stage-form-back {
  width: 100%;
  height: 100%;
  /* -webkit-filter: blur(5px); */
/* filter: blur(5px); */
}
.stage-form {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, -40%);
}
.get-room-num {
  height: 80rpx;
  width: 420rpx;
  margin: 0 auto;
  border: #333333 2rpx solid;
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
  height: 320rpx;
}
.all-cards-img {
  width: 600rpx;
  height: 320rpx;
}
.right-other-card {
  flex: 1;
  position: relative;
}
.right-other-card .card-img {
  border: 2rpx solid #ffffff;
}
.right-my-card {
  flex: 1;
  position: relative;
}
.card-img {
  position: absolute;
  height: 300rpx;
  width: 210rpx;
}
.right-my-card .card-img {
  bottom: 0;
}
.card-img .card-img-src {
  height: 300rpx;
  width: 210rpx;
}
.not-open .card-img {
  background: #999999;
  border-radius: 10rpx;
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
  background: #444;
  border-radius: 10rpx;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 30rpx;
  margin-top: 20rpx;
}

.player-landing.win {
  color: #f54551;
}
.player-landing .red {
  color: #f54551;
}
</style>
