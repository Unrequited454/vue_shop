<template>
  <div>
    <h3>添加商品</h3>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 信息提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="400" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单中包含一个标签页 -->
      <el-form
        ref="addGoodRef"
        :model="addGoodForm"
        :rules="addGoodRul"
        label-width="100px"
        :label-position="'top'"
      >
        <!-- 标签页left必须是一个字符串 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="tabBeLeave"
          @tab-click="goodParams"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item, index) in manyData" :key="index">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="val" v-for="(val, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="(item, index) in onlyData" :key="index">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headers"
              :on-success="picSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
            <el-button class="addBtn" type="primary" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="picPreviewDlVisible" width="20%">
      <img class="pic" :src="picUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
// 导入lodash包
import _ from 'lodash'
export default {
  data() {
    // 自定义验证规则-价格不能小于0
    let checkPrice = (rule, val, callback) => {
      if (val < 0) {
        callback(new Error('价格必须大于等于0'))
      } else {
        callback()
      }
    }
    // 自定义验证规则-重量不能小于0
    let checkWeight = (rule, val, callback) => {
      if (val < 0) {
        callback(new Error('重量必须大于0'))
      } else {
        callback()
      }
    }
    // 自定义验证规则-数量不能小于0
    let checkNumber = (rule, val, callback) => {
      if (val < 0) {
        callback(new Error('数量必须大于0'))
      } else {
        callback()
      }
    }
    return {
      // steps与tabs绑定的选项
      activeIndex: '0',
      // 表单绑定数据
      addGoodForm: {
        goods_name: '测试',
        goods_price: '0',
        goods_weight: '0',
        goods_number: '0',
        // 级联选择器选中的数组
        goods_cat: [],
        // 图片数组
        pics: [],
        // 富文本数据绑定-商品介绍
        goods_introduce: '',
        // 商品动态参数/静态属性
        attrs: []
      },
      // 动态参数
      manyData: [],
      // 静态属性
      onlyData: [],
      // 发送请求获取分类列表数据
      cateList: [],
      // 表单验证规则
      addGoodRul: {
        // 商品名称
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        // 商品价格
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }, { validator: checkPrice, trigger: 'blur' }],
        // 商品重量
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }, { validator: checkWeight, trigger: 'blur' }],
        // 商品数量
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }, { validator: checkNumber, trigger: 'blur' }],
        // 商品分类
        goods_cat: [{ required: true, message: '请选择三级商品分类', trigger: 'blur' }]
      },
      // 级联选择器渲染规则
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      //TODO: 图片地址，必须是完整图片地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      //TODO: 设置请求头携带Authorization
      headers: { Authorization: window.sessionStorage.getItem('token') },
      // 图片预览对话框显示状态
      picPreviewDlVisible: false,
      // 图片路径
      picUrl: ''
    }
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      let { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.cateList = res.data
    },
    // 根据分类的三级id获取动态参数
    async getManyParams() {
      let { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'many'
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      // 遍历动态参数中的attr_vals，将其中字符串以空格分隔，转换为数组
      res.data.forEach(item => {
        // return item.attr_vals.split(' ');
        item.attr_vals = item.attr_vals.trim().length === 0 ? [] : item.attr_vals.split(' ')
      })
      this.manyData = res.data
    },
    // 根据分类的三级id获取静态属性
    async getOnlyParams() {
      let { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: 'only'
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取属性失败')
      }
      this.onlyData = res.data
    },
    // 商品动态参数-点击触发
    goodParams() {
      if (this.activeIndex === '1') {
        this.getManyParams()
      } else if (this.activeIndex === '2') {
        this.getOnlyParams()
      }
    },
    // 选中商品分类列表节点时触发
    handleChange() {
      // 若用户不选择的不是三级商品分类，清空
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.addGoodForm.goods_cat = []
        return false
      }
    },
    // 标签页切换之前触发
    tabBeLeave(activeName, oldActiveName) {
      //TODO: 判断基本信息表单填写状态
      if (oldActiveName === '0') {
        if (this.addGoodForm.goods_name.trim().length === 0) {
          this.$message.error('商品名称不能为空！')
          return false
        } else if (this.addGoodForm.goods_price.trim().length === 0 || this.addGoodForm.goods_price < 0) {
          this.$message.error('商品价格有误！')
          return false
        } else if (this.addGoodForm.goods_weight.trim().length === 0 || this.addGoodForm.goods_weight < 0) {
          this.$message.error('商品重量有误！')
          return false
        } else if (this.addGoodForm.goods_number.trim().length === 0 || this.addGoodForm.goods_number < 0) {
          this.$message.error('商品数量有误！')
          return false
        } else if (this.addGoodForm.goods_cat.length !== 3) {
          this.$message.error('商品分类选择有误！')
          return false
        }
      }
    },
    // 图片预览触发
    handlePreview(file) {
      this.picPreviewDlVisible = true
    },
    // 图片移除触发
    handleRemove(file) {
      let filePath = file.response.data.tmp_path
      // 找到pics中对应的索引
      let index = this.addGoodForm.pics.findIndex(item => {
        return item.pic == filePath
      })
      // 通过索引删除图片
      this.addGoodForm.pics.splice(index, 1)
    },
    // 图片上传成功上传
    picSuccess(response) {
      if (response.meta.status !== 200) {
        return this.$message.error('图片上传失败')
      }
      this.addGoodForm.pics.push({ pic: response.data.tmp_path })
      this.picUrl = response.data.url
    },
    // 按钮-添加商品
    addGood() {
      // 表单提前验证
      this.$refs.addGoodRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写完整商品信息')
        }
        //TODO: 深拷贝
        let newAddform = _.cloneDeep(this.addGoodForm)
        newAddform.goods_cat = newAddform.goods_cat.join(',')
        // 遍历动态参数，将attr_id,attr_vals转换为符合请求参数attr_id, attr_value
        this.manyData.forEach(item => {
          newAddform.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') })
        })
        // 遍历静态属性，将attr_id,attr_vals转换为符合请求参数attr_id, attr_value
        this.onlyData.forEach(item => {
          newAddform.attrs.push({ attr_id: item.attr_id, attr_value: item.attr_vals })
        })
        let { data: res } = await this.$axios.post('goods', newAddform)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
  created() {
    // 调用方法，获取商品分类列表数据
    this.getCateList()
  },
  computed: {
    // 商品分类列表三级的id
    cateId() {
      if (this.addGoodForm.goods_cat.length === 3) {
        return this.addGoodForm.goods_cat[this.addGoodForm.goods_cat.length - 1]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 20px 0;
}
.pic {
  width: 100%;
}
.addBtn {
  margin-top: 10px;
}
</style>>
