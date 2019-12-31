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
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategory">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 分类表格 -->
      <table-tree
        :data="cateList"
        :columns="columns"
        show-index
        border
        :selection-type="false"
        :expand-type="false"
      >
        <!-- 是否有效模板 -->
        <template slot="isValid" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="setting" slot-scope="scope">
          <el-button size="mini" type="primary" @click.stop="editCate(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="removeCate(scope.row)">删除</el-button>
        </template>
      </table-tree>
      <!-- 分页 -->
      <!-- current-page:当前的页码值，page-size:一页中显示的数量， total:总页数 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="cateDlVisible" width="50%">
      <!-- 添加分类表单 -->
      <el-form
        ref="addCategoryRef"
        :model="addCategoryForm"
        :rules="addCategoryRul"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 分类列表级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderList"
            @change="parentCateChanged"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeAddCate">取 消</el-button>
        <el-button type="primary" @click="ensureAddCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑商品分类对话框 -->
    <el-dialog title="编辑分类名称" :visible.sync="editDlVisible" width="50%" :before-close="closeEdit">
      <el-form
        ref="editCateRef"
        :model="editCategoryForm"
        :rules="addCategoryRul"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCategoryForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeEdit">取 消</el-button>
        <el-button type="primary" @click="ensureEditCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 存储商品分类数据列表
      cateList: [],
      // 商品分类数据列表请求对象
      queryInfo: {
        type: 3,
        // 当前的页码值
        pagenum: 1,
        // 一页中显示的数量
        pagesize: 5
      },
      // 分类对话框显示
      cateDlVisible: false,
      // 添加分类表单
      addCategoryForm: {
        // 0表示一级分类
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类层级，0表示一级分类
        cat_level: 0
      },
      // 保存1,2级分类列表数据
      parentCateList: [],
      // 配置级联菜单的数据如何显示
      cascaderList: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true'
      },
      // 级联菜单的数据绑定
      selectedKeys: [],
      // 添加分类表单规则验证
      addCategoryRul: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 分类表格各列配置
      columns: [
        // 分类名称列
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        // 是否有效列
        {
          label: '是否有效',
          type: 'template',
          template: 'isValid'
        },
        // 排序列
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        // 操作列
        {
          label: '操作',
          type: 'template',
          template: 'setting'
        }
      ],
      // 分页总数量
      total: 0,
      // 商品分类编辑对话框
      editDlVisible: false,
      // 商品分类编辑数据
      editCategoryForm: {}
    }
  },
  created() {
    this.getcateList()
  },
  methods: {
    // 获取分类数据列表
    async getcateList() {
      let { data: res } = await this.$axios.get('categories', {
        params: this.queryInfo
      })
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 按钮，添加分类
    addCategory() {
      // 重置数据
      this.selectedKeys = []
      this.addCategoryForm.cat_pid = 0
      this.addCategoryForm.cat_level = 0
      this.getParentCateList()
      this.cateDlVisible = true
    },
    // 按钮，取消添加分类
    closeAddCate() {
      // 重置数据，重置表单
      this.$refs.addCategoryRef.resetFields()
      this.selectedKeys = []
      this.addCategoryForm.cat_pid = 0
      this.addCategoryForm.cat_level = 0
      this.cateDlVisible = false
    },
    // 获取1,2级分类列表数据
    async getParentCateList() {
      let { data: res } = await this.$axios.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.parentCateList = res.data
    },
    // 级联菜单事件改变
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        // 数组中最后一个元素就是对应的父类列表的id
        this.addCategoryForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 对应的level也要发生改变
        this.addCategoryForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      }
    },
    // 按钮-确定添加分类
    ensureAddCate() {
      // 进入表单提前验证
      this.$refs.addCategoryRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写表单！')
        }
        let { data: res } = await this.$axios.post(
          'categories',
          this.addCategoryForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加成功')
        this.getcateList()
        this.cateDlVisible = false
        // 重置表单
        this.$refs.addCategoryRef.resetFields()
      })
    },
    // 分页每页条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getcateList()
    },
    // 分页当前页码
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getcateList()
    },
    // TODO: 编辑分类
    async editCate(cateRow) {
      // 根据id查询分类数据
      let { data: res } = await this.$axios.get(`categories/${cateRow.cat_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.editCategoryForm = res.data
      this.editDlVisible = true
    },
    // 确定提交编辑
    ensureEditCate() {
      this.$refs.editCateRef.validate(async valid => {
        if (!valid) {
          return
        }
        let { data: res } = await this.$axios.put(
          `categories/${this.editCategoryForm.cat_id}`,
          {
            cat_name: this.editCategoryForm.cat_name
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新失败')
        }
        this.$message.success('更新成功')
      })
      this.editDlVisible = false
      this.$refs.editCateRef.resetFields()
      this.getcateList()
    },
    // 按钮-取消编辑商品名称
    closeEdit() {
      // 重置表单，重置
      this.editDlVisible = false
      this.$refs.editCateRef.resetFields()
      this.$message.info('已取消修改')
    },
    // 删除分类
    async removeCate(row) {
      let confRes = await this.$confirm(
        '此操作将永久删除该分类商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confRes !== 'confirm') {
        return this.$message.info('删除已取消')
      }
      let { data: res } = await this.$axios.delete(`categories/${row.cat_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getcateList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-icon-success {
  color: greenyellow;
}
.el-icon-error {
  color: red;
}
.el-cascader {
  width: 100%;
}
</style>
