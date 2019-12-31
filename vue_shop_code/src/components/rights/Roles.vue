<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 按钮-添加角色 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 列表-角色列表 -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item, index) in scope.row.children"
              :key="item.id"
              :class="['rights-center', index==0?'rights-top': '', 'rights-bottom']"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRights(scope.row, item.id)">{{item.authName}}</el-tag>
              </el-col>
              <!-- 二级三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item, index) in item.children"
                  :key="item.id"
                  :class="['rights-center', index==0?'': 'rights-top']"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRights(scope.row, item.id)"
                    >{{item.authName}}</el-tag>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="(item, index) in item.children"
                      :key="index"
                      type="warning"
                      closable
                      @close="removeRights(scope.row, item.id)"
                    >{{item.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRole(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRole(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="setRights(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDlVisible" width="50%" :before-close="cancelAdd">
      <el-form
        :model="roleForm"
        :rules="addRoleRules"
        ref="addRoleRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="ensureAdd">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setDlVisible" width="50%">
      <el-tree
        :data="roleTree"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="treeRef"
        highlight-current
        :props="treeProps"
        :default-checked-keys="treeKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDlVisible = false">取 消</el-button>
        <el-button type="primary" @click="ensureSetting">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDlVisible" width="50%" :before-close="cancelEdit">
      <el-form :model="editForm" :rules="editRoleRules" ref="editRoleRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc"></el-input>
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
    return {
      // 列表-角色列表
      roleList: [],
      // 列表-角色tree
      roleTree: [],
      // 树形控件绑定的属性对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 树形控件节点勾选数组
      treeKeys: [],
      // 添加角色参数
      // 当前即将分配权限角色id
      roleId: '',
      roleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色参数
      editForm: {},
      // 控制添加角色对话框显示
      addDlVisible: false,
      // 控制编辑角色对话框显示
      editDlVisible: false,
      // 分配权限对话框显示
      setDlVisible: false,
      addRoleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }]
      },
      editRoleRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    // 调用方法获取数据
    this.getRoleList()
  },
  methods: {
    // 声明发送roles请求方法
    async getRoleList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表加载失败')
      }
      this.roleList = res.data
    },
    // 按钮-添加角色
    async addRole() {
      this.addDlVisible = true
    },
    // 按钮-确定添加角色
    ensureAdd() {
      // 表单验证
      this.$refs.addRoleRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单填写有误，请重新填写')
        }
        const { data: res } = await this.$axios.post('roles', this.roleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('角色创建失败')
        }
        this.addDlVisible = false
        this.$message.success('角色创建成功')
        this.$refs.addRoleRef.resetFields()
        this.getRoleList()
      })
    },
    // 按钮-取消添加角色
    cancelAdd() {
      this.$refs.addRoleRef.resetFields()
      this.addDlVisible = false
    },
    // 按钮-编辑角色
    async editRole(id) {
      this.editDlVisible = true
      const { data: res } = await this.$axios.get('roles/' + id)
      this.editForm = res.data
      console.log(this.editForm)
    },
    ensureEdit() {
      // 表单验证
      this.$refs.editRoleRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单填写错误，请重新填写')
        }
        const { data: res } = await this.$axios.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败')
        }
        this.editDlVisible = false
        this.$message.success('编辑角色成功')
        this.$refs.editRoleRef.resetFields()
        this.getRoleList()
      })
    },
    // 按钮-取消编辑按钮
    cancelEdit() {
      this.editDlVisible = false
      this.$refs.editRoleRef.resetFields()
    },
    // 按钮-删除角色按钮
    async deleteRole(id) {
      let confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      console.log(res)
      this.$message.success('已删除')
      this.getRoleList()
      console.log(confirmRes)
    },
    // 删除指定权限
    async removeRights(row, id) {
      let confirmRes = await this.$confirm('此操作将永久该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除权限')
      }
      let { data: res } = await this.$axios.delete(`roles/${row.id}/rights/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除权限成功')
      row.children = res.data
    },
    // 分配权限
    async setRights(role) {
      // 将当前角色id赋值给roleId,后面角色权限分配接口调用
      this.roleId = role.id
      let { data: res } = await this.$axios.get('rights/tree')
      this.roleTree = res.data
      // 每次先让treeKeys的数组清空，再赋值
      this.treeKeys = []
      // 通过递归形式，将每项的id存到数组里面
      this.getLeafKeys(role, this.treeKeys)
      this.setDlVisible = true
    },
    // TODO: 通过递归的形式，获取角色下所有的三级id
    getLeafKeys(node, arr) {
      // 节点下没有children，则是三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      // 遍历node下的children，且进行递归
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 确定分配权限
    async ensureSetting() {
      let keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      let strId = keys.join(',')
      let { data: res } = await this.$axios.post(`roles/${this.roleId}/rights`, {
        rids: strId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败')
      }
      this.$message.success('更新成功')
      this.setDlVisible = false
      this.getRoleList()
    }
  }
}
</script>
<style lang="less" scoped>
.rights-center {
  display: flex;
  align-items: center;
}
.rights-bottom {
  border-bottom: 1px solid #eee;
}
.rights-top {
  border-top: 1px solid #eee;
}
.el-row {
  padding: 15px 0;
}
.el-tag {
  margin: 5px 5px;
}
</style>
