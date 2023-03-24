import Taro, { useState } from "@tarojs/taro";

import { AtButton } from "taro-ui";
import { View } from "@tarojs/components";
import "./index.scss";

const { _login } = require("../../utils/pageRequest/login");

export default function Login() {
  const [loading, setLoading] = useState(false);
  const tobegin = (res) => {
    if (res.detail.userInfo) {
      // 返回的信息中包含用户信息则证明用户允许获取信息授权
      console.log("授权成功");
      // 保存用户信息微信登录
      Taro.setStorageSync("userInfo", res.detail.userInfo);

      setLoading(!loading);
      Taro.login().then((resLogin) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (resLogin.code) {
          // 登录
          _login(
            { ...res.detail, code: resLogin.code },
            (result) => {
              if (result.data.status === 200) {
                // 设置 token
                Taro.setStorageSync("token", result.data.data.token);
                // 登录成功返回首页并刷新首页数据
                Taro.switchTab({ url: "/pages/index/index" });
              } else {
                Taro.showToast({
                  title: "登录失败，请稍后重试",
                  icon: "none",
                  mask: true,
                });
              }
            },
            () => {
              Taro.showToast({
                title: "登录失败，请稍后重试",
                icon: "none",
                mask: true,
              });
            }
          );
        }
        setLoading(false);
      });
    } else {
      Taro.switchTab({ url: "/pages/index/index" });
    }
  };

  return (
    <View className="login body">
      <View className="textAlign need">需要使用你的微信昵称和头像</View>
      <AtButton
        className="at-col defaultWidth button"
        loading={loading}
        openType="getUserInfo"
        onGetUserInfo={tobegin}
      >
        点击授权
      </AtButton>
      <AtButton
        type="secondary"
        className="at-col defaultWidth"
        onClick={() => Taro.switchTab({ url: "/pages/index/index" })}
      >
        暂不登录
      </AtButton>
    </View>
  );
}
