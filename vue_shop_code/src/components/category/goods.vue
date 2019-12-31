<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 输入框 + 按钮区域 -->
      <el-row :gutter="20">
        <!-- 输入框 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            @change="search"
            clearable
            @clear="getGoodList"
          >
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <!-- 按钮 -->
        <el-col :span="4">
          <el-button type="primary" @click="addGood">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table :data="goodList" border stripe>
        <el-table-column prop="goods_name" label="商品名称" width="700"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="200"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="200"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="300">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editGood(scope.row)"></el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeGood(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表数据请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 参数列表
      goodList: [],
      // 总页数
      total: 0
    }
  },
  methods: {
    // 发送请求获取商品列表数据
    async getGoodList() {
      let { data: res } = await this.$axios.get('goods', {
        params: this.queryInfo
      })
      this.goodList = res.data.goods
      this.total = res.data.total
    },
    // 分页-pagesize改变会触发该方法
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodList()
    },
    // 分页-pagenum改变会触发该方法
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodList()
    },
    // 输入框搜索
    search() {
      this.getGoodList()
    },
    // 按钮-添加商品
    addGood() {
      this.$router.push('/add')
    },
    // 删除商品
    async removeGood(row) {
      let confRes = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confRes !== 'confirm') {
        return this.$message.info('删除已取消')
      }
      let { data: res } = await this.$axios.delete(`goods/${row.goods_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodList()
    },
    // 编辑商品
    editGood(row) {}
  },
  created() {
    this.getGoodList()
  }
}
</script>

<style lang="less" scoped>
  .el-card {
    height: 100%;
  }

  .el-pagination {
    margin-top: 10px;
  }
</style>

