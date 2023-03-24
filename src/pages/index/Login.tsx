import Taro from "@tarojs/taro";

class Login {
  // 登录
  async login({
    iv,
    encryptedData,
    code,
  }: {
    iv: string;
    encryptedData: string;
    code: string;
  }) {
    const [err, data] = await login({
      code: code,
      iv: iv,
      encryptedData: encryptedData,
    });
    if (err) {
      Toast.info(err.message);
      throw err;
    } else {
      await this.saveLoginData(data);
    }
  }

  // 保存用户信息
  async saveLoginData(loginData: IMaLoginRet) {
    if (!loginData) {
      return;
    }
    const { phone, userId, tokenId } = loginData;
    await Taro.setStorage({
      key: StorageKey.USER_DATA,
      data: {
        phone,
        userId,
      },
    });
    await Taro.setStorage({
      key: StorageKey.ACCESS_TOKEN,
      data: tokenId,
    });
  }
}
export default Login;
