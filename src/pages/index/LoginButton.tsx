import { BaseEventOrig, ButtonProps } from "@tarojs/components";
import Taro from "@tarojs/taro";
import React, { useEffect, useState } from "react";
import Login from "./Login";

const LoginButton = React.memo((props: IProps) => {
  const { children, onSuccess, onClick, ...other } = props;
  const [code, setCode] = useState("");
  useEffect(() => {
    if (!code) {
      // 实际上是调用了wx.Login()
      Login.getWxCode().then((wxCode) => {
        setCode(wxCode);
      });
    }
  }, [code]);
  const handleGetPhoneNumber = async (
    e: BaseEventOrig<ButtonProps.onGetPhoneNumberEventDetail>
  ) => {
    const { iv, encryptedData, errMsg } = e.detail;
    try {
      if (!code) {
        Toast.info("code为空");
        return;
      }
      if (errMsg.includes("ok")) {
        Taro.showLoading({ title: "正在登录" });
        await Login.login({ iv, encryptedData, code: code });
        Taro.hideLoading();
        onSuccess?.();
        Toast.success("登录成功");
      }
    } catch (error) {
      // 解密失败重新login
      Login.getWxCode().then((wxCode) => {
        setCode(wxCode);
      });
      Taro.hideLoading();
      Toast.info(error.message || error.errMsg);
    }
  };
  const handleBtnClick = async (event) => {
    onClick?.(event);
  };

  return (
    // @ts-ignore
    <Button
      openType="getPhoneNumber"
      onClick={handleBtnClick}
      onGetPhoneNumber={handleGetPhoneNumber}
      {...other}
    >
      {children}
    </Button>
  );
});
export default LoginButton;
