<template>
  <div>
    <!-- 面包屑导航 -->
    <h3>数据报表</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <div class="main" id="main"></div>
    </el-card>
  </div>
</template>

<script>
//导入echarts
import echarts from 'echarts'
//导入lodash
import _ from 'lodash'
export default {
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    var myChart = echarts.init(document.getElementById('main'))
    let { data: res } = await this.$axios.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败')
    }
    //合并res.data和this.options
    const result = _.merge(res.data, this.options)

    // 使用获取的数据展示图表
    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.main {
  width: 750px;
  height: 400px;
}
</style>>

