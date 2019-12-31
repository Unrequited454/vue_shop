<template>
    <el-container>
        <el-header>
            <!-- logo部分 -->
            <div class="logo">
                <img src="../assets/heima.png" alt="">
                <span>后台管理系统</span>
            </div>
            <!-- 退出按钮 -->
            <el-button type="info" @click="cancel">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse?'64px':'200px'">
                <!-- 折叠按钮 -->
                <div class="toggle-btn" @click="toggleBtn">|||</div>
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
                    <!-- 一级菜单 -->
                    <!-- 这里的index必须是等于一个字符串的 -->
                    <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="iconsObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + item.path" v-for="item in item.children" :key="item.id" @click="saveActive('/' + item.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{item.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data() {
        return {
            // 存放数据
           menuList: [],
            // 字体图标对象-->思路：利用item.id对象键值对
            iconsObj: {
                '125': 'iconfont icon-user',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao'
            },
            isCollapse: false,
            activePath: ''
        }
    },
    // 数据在created状态时请求
    created() {
        // 调用getMenuList函数
        this.getMenuList();
        this.activePath = window.sessionStorage.getItem('active');
    },
    methods: {
        cancel() {
            // 清除token令牌，重定向到login界面
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
       async getMenuList() {
         const {data: res} = await this.$axios.get('menus');
         if (res.meta.status == 200) {
             this.menuList = res.data;
         } else {
             return this.$message.error(res.meta.msg);
         }
        },
        // 折叠按钮
        toggleBtn() {
            this.isCollapse = !this.isCollapse;
        },
        // 获取二级菜单路径
        saveActive(activePath) {
            window.sessionStorage.setItem('active', activePath);
            //TODO: 将激活路径赋值给this.activePath
            this.activePath = activePath;
        }
    },
};
</script>
<style lang="less" scoped>
    .el-container {
        height: 100%;
    }
    .el-header {
        background-color: #373D41;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 0;
        .logo {
            display: flex;
            align-items: center;
            color: #fff;
            font-size: 20px;
            span {
                padding-left: 20px;
            }
        }
    }
    .el-aside {
        background-color: #333744;
        .toggle-btn {
            width: 100%;
            height: 30px;
            text-align: center;
            line-height: 30px;
            letter-spacing: 0.2em;
            background-color: pink;
            cursor: pointer;
        }
    }
    .el-main {
        background-color: #eaedf1
    }
    .iconfont {
        margin-right: 10px;
    }
    // 解决ul中边框问题
    .el-menu {
        border-right: 0;
    }
</style>
