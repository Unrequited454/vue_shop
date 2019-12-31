<template>
  <div class="login-container">
    <!-- login -->
    <div class="login">
      <!-- 头像 -->
      <div class="pic">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单 -->
      <el-form
        label-width="0px"
        class="login-form"
        :model="loginForm"
        :rules="loginFormRul"
        ref="resetForm"
      >
        <!-- 用户 -->
        <el-form-item prop="username">
          <el-input
            placeholder="请输入用户名"
            v-model="loginForm.username"
            autofocus
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="请输入密码"
            v-model="loginForm.password"
            prefix-icon="iconfont icon-lock_fill"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="login-btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 数据绑定
      loginForm: {
        username: '',
        password: ''
      },
      // 表单验证
      loginFormRul: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 重置按钮
    resetForm() {
      // TODO:ref="resetForm"其中resetForm就是表单的实例对象
      this.$refs.resetForm.resetFields()
    },
    // 登录按钮
    login() {
      this.$refs.resetForm.validate(async valid => {
        // 如果valid为true表单验证通过
        if (!valid) {
          return
        }
        // 登录请求
        let { data: res } = await this.$axios.post('login', this.loginForm)
        if (res.meta.status == 200) {
          this.$message.success('登录成功')
          // 将token存放到sessionStorage
          window.sessionStorage.setItem('token', res.data.token)
          // 路由重定向
          this.$router.push('/home')
        } else {
          this.$message.error('登录失败')
          // 密码清空
          this.loginForm.password = ''
          return
        }
      })
    }
  }
  // TODO:自定义指令没有效果
  /*   directives:{
     focus: {
       inserted: function (el) {
         el.focus();
        }
     }
    } */
}
</script>
<style lang="less" scoped>
.login-container {
  height: 100%;
  background-color: #2b5b6b;
  .login {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    height: 300px;
    border-radius: 3px;
    background-color: #fff;
    .pic {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      background-color: #fff;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      padding: 10px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
  .login-form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .login-btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
