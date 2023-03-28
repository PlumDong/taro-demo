/* eslint-disable import/first */
import Taro, { UserInfo } from "@tarojs/taro";
import { View } from "@tarojs/components";

import { Header, Footer } from "../../components";
import "./mine.scss";
import { useEffect, useState } from "react";

export default function Mine() {
  const [nickName, setNickName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isOpened, setIsOpened] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  // 双取反来构造字符串对应的布尔值，用于标志此时是否用户已经登录
  const isLogged = !!nickName;

  useEffect(() => {
    async function getStorage() {
      try {
        const { data } = await Taro.getStorage({ key: "userInfo" });

        // eslint-disable-next-line @typescript-eslint/no-shadow
        const { nickName, avatar } = data;
        setAvatar(avatar);
        setNickName(nickName);
      } catch (err) {
        console.log("getStorage ERR: ", err);
      }
    }
    console.log("初始化");

    Taro.login()
      .then((response) => {
        let js_code = response.code;
        console.log("微信code = " + js_code);
        return Taro.request({
          url: `http://127.0.0.1:8080/crm/weChatAuth/getCustomerByOpenid`,
          data: {
            code: js_code,
          },
          method: "POST",
        }).then((res) => {
          if (res.statusCode === 200) {
            let data = res.data;
            if (data.code == 0) {
              Taro.showToast({
                title: "登陆成功",
                icon: "none",
              });
            } else {
              console.log(`openid登陆失败:${data.message}`);
            }
          } else if (res.statusCode !== 200) {
            Taro.showToast({
              title: "发生错误，请重试！",
              icon: "none",
            });
          }
        });
      })
      .catch((err) => {
        console.log(err);
        Taro.showToast({
          title: "发生错误，请重试!",
          icon: "none",
        });
      });

    getStorage();
  });

  async function setLoginInfo(avatar, nickName) {
    setAvatar(avatar);
    setNickName(nickName);
  }

  async function handleLogout() {
    setIsLogout(true);

    try {
      await Taro.removeStorage({ key: "userInfo" });

      setAvatar("");
      setNickName("");
    } catch (err) {
      console.log("removeStorage ERR: ", err);
    }

    setIsLogout(false);
  }

  function handleSetIsOpened(isOpened: boolean) {
    setIsOpened(isOpened);
  }

  function handleClick() {
    handleSetIsOpened(true);
  }
  function getTel(e) {
    let code = e.detail.code;
    console.log(e.code);
    Taro.login().then((response) => {
      let js_code = response.code;
      console.log("微信code = " + js_code);
      return Taro.request({
        url: `http://127.0.0.1:8080/crm/weChatAuth/getCustomerByPhone`,
        data: {
          jsCode: js_code,
          code: code,
          nickname: "微信用户",
          avatarUrl:
            "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
        },
        method: "POST",
      }).then((res) => {
        if (res.statusCode === 200) {
          let data = res.data;
          if (data.code == 0) {
            console.log("token = " + data.token);

            Taro.showToast({
              title: "登陆成功",
              icon: "none",
            });
          } else {
            console.log(`手机号登陆失败:${data.message}`);
          }
        } else if (res.statusCode !== 200) {
          Taro.showToast({
            title: "发生错误，请重试！",
            icon: "none",
          });
        }
      });
    });
  }

  async function handleSubmit(userInfo) {
    // 缓存在 storage 里面
    await Taro.setStorage({ key: "userInfo", data: userInfo });

    // 设置本地信息
    setAvatar(userInfo.avatar);
    setNickName(userInfo.nickName);

    // 关闭弹出层
    setIsOpened(false);
  }

  return (
    <View className="mine">
      <Header
        isLogged={isLogged}
        userInfo={{ avatar, nickName }}
        handleClick={handleClick}
        setLoginInfo={setLoginInfo}
        openType="getPhoneNumber"
        onGetPhoneNumber={getTel}
      />
      <Footer
        isLogged={isLogged}
        isOpened={isOpened}
        isLogout={isLogout}
        handleLogout={handleLogout}
        handleSetIsOpened={handleSetIsOpened}
        handleSubmit={handleSubmit}
      />
    </View>
  );
}

Mine.config = {
  navigationBarTitleText: "我的",
};
