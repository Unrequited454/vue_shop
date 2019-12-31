<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
          <!-- Tabs标签也区域 -->
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="动态参数" name="many">
              <el-button
                size="mini"
                type="primary"
                :disabled="isBtnDisabled"
                @click="addParams"
              >添加参数</el-button>
              <!-- 展示参数 -->
              <el-table :data="manyData" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="(item, index) in scope.row.attr_vals"
                      :key="index"
                      closable
                      @close="removeAttrVal(scope.row, index)"
                    >{{item}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button size="mini" type="primary" @click="editParams(scope.row.attr_id)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
              <el-button
                size="mini"
                type="primary"
                :disabled="isBtnDisabled"
                @click="addParams"
              >添加属性</el-button>
              <!-- 展示属性 -->
              <el-table :data="onlyData" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="(item, index) in scope.row.attr_vals"
                      :key="index"
                      closable
                      @close="removeAttrVal(scope.row, index)"
                    >{{item}}</el-tag>
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    ></el-input>
                    <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.row)"
                    >+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button size="mini" type="primary" @click="editParams(scope.row.attr_id)">编辑</el-button>
                    <el-button size="mini" type="danger" @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加参数/添加属性对话框 -->
    <el-dialog :title="addTitle" :visible.sync="addDlVisible" width="50%" :before-close="closeAdd">
      <!-- 表单 -->
      <el-form ref="addRef" :model="addForm" :rules="addRules" label-width="80px">
        <el-form-item :label="addFormTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeAdd">取 消</el-button>
        <el-button type="primary" @click="ensureAdd">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑修改参数/属性对话框 -->
    <el-dialog
      :title="editTitle"
      :visible.sync="editDlVisible"
      width="50%"
      :before-close="closeEdit"
    >
      <!-- 表单 -->
      <el-form ref="editRef" :model="editForm" :rules="addRules" label-width="80px">
        <el-form-item :label="addFormTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeEdit">取 消</el-button>
        <el-button type="primary" @click="ensureEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表数据
      cateList: [],
      // 级联选择器选中数组
      selectedKeys: [],
      // 级联选择器渲染的名称
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // Tabs标签叶绑定值
      activeName: 'many',
      // 存储动态参数数据
      manyData: [],
      // 存储静态属性数据
      onlyData: [],
      // 添加参数/添加属性对话框状态显示
      addDlVisible: false,
      // 添加参数/添加属性对话框表单
      addForm: {
        attr_name: ''
      },
      // 表单验证规则
      addRules: {
        attr_name: [
          { required: true, message: '请输入参数/属性', trigger: 'blur' }
        ]
      },
      // 编辑修改参数/属性表单
      editForm: {},
      // 编辑修改参数/属性对话框状态显示
      editDlVisible: false
    }
  },
  methods: {
    // 商品分类列表请求数据
    async getCateList() {
      let { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('请求数据失败')
      }
      this.cateList = res.data
    },
    // 参数列表请求数据
    async getParamList() {
      let { data: res } = await this.$axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('请先选择商品分类')
      }
      //TODO: 处理数据attr_vals，转换为数组，若输入为空，则返回一个空数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // TODO:控制tag标签文本输入框的显示或隐藏
        // TODO:在每个列表数据自己添加属性，是为了在tag中不相互影响
        item.inputVisible = false
        // tag输入文本
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else {
        this.onlyData = res.data
      }
    },
    // 按钮-添加参数/添加属性
    addParams() {
      this.addDlVisible = true
    },
    // 按钮-确定添加参数/添加属性
    ensureAdd() {
      this.$refs.addRef.validate(async valid => {
        if (!valid) {
          return
        }
        let { data: res } = await this.$axios.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加失败')
        }
        this.getParamList()
        this.$message.success('添加成功')
        this.addDlVisible = false
      })
    },
    // 按钮-取消添加参数/添加属性
    closeAdd() {
      this.addDlVisible = false
      this.$refs.addRef.resetFields()
    },
    // 级联选择数据改动方法
    handleChange() {
      this.getParamList()
    },
    // Tabs标签页Tabs被选中触发方法
    handleClick() {
      this.getParamList()
    },
    // 按钮-删除参数/删除属性
    async removeParams(attr_id) {
      let confRes = await this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      let { data: res } = await this.$axios.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getParamList()
    },
    // 按钮-编辑参数/编辑属性
    async editParams(attr_id) {
      let { data: res } = await this.$axios.get(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('数据获取失败')
      }
      this.editForm = res.data
      this.editDlVisible = true
    },
    // 按钮-编辑修改取消
    closeEdit() {
      this.editDlVisible = false
      this.$refs.editRef.resetFields()
    },
    // 按钮-编辑修改确定
    ensureEdit() {
      this.editDlVisible = false
      this.$refs.editRef.validate(async valid => {
        if (!valid) {
          return
        }
        let { data: res } = await this.$axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.$refs.editRef.resetFields()
        this.getParamList()
      })
    },
    //TODO:要在showInput方法前面，不然报错 tag回车、tag失去焦点方法
    handleInputConfirm(row) {
      // 若输入为空，无意义
      if (row.inputValue.trim().length === 0) {
        // 将输入框清空
        row.inputValue = ''
        row.inputVisible = false
        // 终止程序往下执行
        return
      }
      // 输入不为空执行业务逻辑,将输入值添加到attr_vals数组中
      row.attr_vals.push(row.inputValue.trim())
      // 清空上次的输入文本
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 发送请求，将attr_vals保存到数据库
    async saveAttrVals(row) {
      let { data: res } = await this.$axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败')
      }
      this.$message.success('更新成功')
    },
    // 按钮-控制tag中输入框的显示或隐藏
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除attr_vals,将数组中的index携带下来
    removeAttrVal(row, i) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 级联选择数据不是第三层分类，禁用按钮，返回true
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 处理参数列表请求数据的id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      } else {
        return null
      }
    },
    // 添加参数/添加属性对话框标题提示信息
    addTitle() {
      if (this.activeName === 'many') {
        return '添加商品参数'
      } else {
        return '添加商品属性'
      }
    },
    // 添加参数/添加属性对话框表单提示信息
    addFormTitle() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
    // 编辑修改参数/属性对话框标题提示信息
    editTitle() {
      if (this.activeName === 'many') {
        return '修改动态参数'
      } else {
        return '修改静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat-opt {
  margin-top: 15px;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 150px;
}
</style>>
