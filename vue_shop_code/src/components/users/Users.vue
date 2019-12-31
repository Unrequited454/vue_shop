<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card class="users-card">
      <!-- 搜索框添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-input
              placeholder="请输入内容"
              class="input-with-select"
              v-model="queryInfo.query"
              clearable
              @clear="getUserList"
              @change="getUserList"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button type="primary" @click="addUser">添加用户</el-button>
          </div>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" border style="width: 100%" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 状态作用域插槽 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="info"
              @change="changeState(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <!-- 操作作用域插槽 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editUser(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="管理分配"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalSize"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" :before-close="cancelAdd" width="50%">
      <el-form
        :model="addForm"
        status-icon
        :rules="addUserRules"
        ref="addUserRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="ensureAdd">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      :before-close="cancelEdit"
    >
      <el-form
        :model="editForm"
        status-icon
        :rules="editUserRules"
        ref="editUserRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="ensureEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 自定义邮箱验证规则
    let emailCheck = (rules, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+([a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      } else {
        return callback(new Error('请输入合法邮箱'))
      }
    }
    // 自定义手机号码验证规则
    let mobileCheck = (rules, value, callback) => {
      // 验证手机的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      } else {
        return callback(new Error('请输入合法手机'))
      }
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      userList: [],
      totalSize: 0,
      dialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 定义查询到的对象信息
      editForm: {},
      // 表单非空输入验证
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: mobileCheck, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: emailCheck, trigger: 'blur' }
        ]
      },
      // 修改用户非空输入验证
      editUserRules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: mobileCheck, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: emailCheck, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 发送请求
    this.getUserList()
  },
  methods: {
    async getUserList() {
      let { data: res } = await this.$axios.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$Message.error('获取用户列表错误！')
      }
      this.userList = res.data.users
      this.totalSize = res.data.total
    },
    // 监听switch
    async changeState(userInfo) {
      let { data: res } = await this.$axios.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$Message.error(res.meta.msg)
      }
      this.$Message({
        message: res.meta.msg,
        type: 'success'
      })
    },
    // 分页
    // pageSize 改变时会触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // currentPage 改变时会触发
    handleCurrentChange(currentPath) {
      this.queryInfo.pagenum = currentPath
      this.getUserList()
    },
    // 添加用户按钮
    addUser() {
      this.dialogVisible = true
    },
    // 取消按钮，关闭对话框且重置表单
    cancelAdd() {
      this.dialogVisible = false
      this.$refs.addUserRef.resetFields()
    },
    ensureAdd() {
      // 对表单进行提前验证
      this.$refs.addUserRef.validate(async valid => {
        // valid为false，则不通过表单验证
        if (!valid) {
          return
        }
        const { data: res } = await this.$axios.post('users', this.addForm)
        if (res.meta.status !== 200) {
          this.$Message.error('用户添加失败')
        }
        this.$Message.success('用户添加成功')
        // 关闭对话框，刷新列表
        this.dialogVisible = false
        this.$refs.addUserRef.resetFields()
        this.getUserList()
      })
    },
    async editUser(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$axios.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      // 渲染编辑用户表单
      this.editForm = res.data
    },
    // 取消编辑
    cancelEdit() {
      this.editDialogVisible = false
      // 重置表单
      this.$refs.editUserRef.resetFields()
    },
    // 确认修改
    async ensureEdit() {
      // 对表单进行提前验证
      this.$refs.editUserRef.validate(async valid => {
        // valid为false，则不通过表单验证
        if (!valid) {
          return
        }
        const { data: res } = await this.$axios.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          this.$Message.error('用户修改失败')
        }
        this.$Message.success('用户修改成功')
        // 关闭对话框，刷新列表
        this.editDialogVisible = false
        this.$refs.editUserRef.resetFields()
        this.getUserList()
      })
    },
    // 删除用户
    async deleteUser(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除用户，是否继续',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => {
        return err
      })
      // TODO:使用catch去捕捉抛出的错误
      if (confirm !== 'confirm') {
        return this.$Message.info('已经取消删除')
      }
      const { data: res } = await this.$axios.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$Message.error('删除失败')
      }
      this.$Message.success('已删除用户')
      this.getUserList()
    }
  }
}
</script>
<style lang="less" scoped>
</style>
