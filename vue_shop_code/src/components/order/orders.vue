<template>
  <div>
    <!-- 面包屑导航 -->
    <h3>订单列表</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索栏 -->
      <el-row :gutter="20">
        <!-- 搜索输入框--搜索接口未做 -->
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            clearable
          >
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单区域 -->
      <el-table :data="orderList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editAddress(scope.row)"
            ></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="location(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 9, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 查看物流对话框 -->
    <el-dialog title="物流信息" :visible.sync="locationDlVisible" width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in kuaiDiInfo"
          :key="index"
          :timestamp="item.ftime"
        >{{item.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressDlVisible" width="50%" :before-close="closeEdit">
      <el-form ref="editRef" :rules="editRules" :model="editForm" label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="editForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="活动名称" prop="address2">
          <el-input v-model="editForm.address2"></el-input>
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
import cityData from './citydata.js'
export default {
  created() {
    // 调用请求订单数据方法
    this.getOrderList()
  },
  data() {
    return {
      // 请求参数对象
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 9
      },
      // 订单总条数
      total: 0,
      // 订单数据
      orderList: [],
      // 控制物流对话框状态显示
      locationDlVisible: false,
      //   控制修改地址对话框状态显示
      addressDlVisible: false,
      // 保存物流信息
      kuaiDiInfo: [],
      // 城市数据
      cityData: cityData,
      // 修改地址对象
      editForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单验证
      editRules: {
        address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写具体地址', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取订单数据列表
    async getOrderList() {
      let { data: res } = await this.$axios.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    // 改变每页条数时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 改变当前页码时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 查看物流信息
    async location(row) {
      let { data: res } = await this.$axios.get('/kuaidi/' + row.id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.kuaiDiInfo = res.data
      this.locationDlVisible = true
    },
    // 修改地址--后台接口未做
    editAddress(id) {
      this.addressDlVisible = true
    },
    // 修改地址取消
    closeEdit() {
      this.addressDlVisible = false
      this.$refs.editRef.resetFields()
    },
    // 确定修改地址
    ensureEdit() {
      this.$refs.editRef.validate(valid => {
        if (!valid) {
          return this.$message.error('请填写表单完整信息')
        }
        this.addressDlVisible = false
        this.$refs.editRef.resetFields()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 20px;
}
.el-cascader {
  width: 100%;
}
</style>
