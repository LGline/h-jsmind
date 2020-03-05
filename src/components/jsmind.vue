<template>
  <div class="Jsmind-wapper" :style="{width:container.width + 'px'}" @click="wapperClickHandle">
    <div class="tools">
      <div class="filter-wapper">
        <div class="select">
          <p class="selected-item" @click.stop="toggleOptions">
            <span style="color:#ccc;position:relative;top:2px;" v-if="!selectedFilters.length">在此过滤Epic状态</span>
            {{selectedFilters | selectedStatusFilter}}
          </p>
          <i class="iconfont" 
            :class="!filter.showOptions ? 'iconxiangxia' : 'iconxiangshang'" @click.stop="toggleOptions"> 
          </i>
          <ul class="reset-style-ul"
            :class="filter.showOptions ? 'show-options' : 'hide-options'">
            <li class="checkAll status-item" 
              :class="checkAllClass()" 
              @click.stop="checkStatusHandle(0)">
              <span class="box">
                <i class="iconfont iconduigou"></i>
              </span>
              <span class="text">全选</span>
            </li>
            <li class="status-item" 
              :class="checkClass(status)"
              v-for="status in statusData"
              :key="'status-' + status.value"
              @click.stop="checkStatusHandle(status.value)">
              <span class="box">
                <i class="iconfont iconduigou"></i>
              </span>
              <span class="text">{{status.label}}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="oprate-wapper">
        <span class="iconfont iconcaozuo"></span>
      </div>
    </div>
    <div class="plan-title">
      <div>
        <span>Epic</span>&nbsp;
        <i 
          class="iconfont " 
          :class="Epic_.expand ? 'iconjiahao' : 'iconjianhao'"
          @click.stop="EpicExpandHandle">
        </i>
      </div>
      <div>
        <span>Feature</span>&nbsp;
        <i 
          class="iconfont " 
          :class="Feature_.expand ? 'iconjiahao' : 'iconjianhao'"
          @click.stop="FeatureExpandHandle">
        </i>
      </div>
      <div>
        <span>Story</span>&nbsp;
        <i 
          class="iconfont " 
          :class="Story_.expand ? 'iconjiahao' : 'iconjianhao'"
          @click.stop="StoryExpandHandle">
        </i>
      </div>
      <div>
        <span>Task</span>&nbsp;
        <i 
          class="iconfont " 
          :class="Task_.expand ? 'iconjiahao' : 'iconjianhao'"
          @click.stop="TaskExpandHandle">
        </i>
      </div>
    </div>
    <div id="jsmind_container"></div>
    <div id="oprate-box" 
      class="oprate"
      v-show="oprateBox.show"
      :nodeid="mouseover_nodeid"
      :style="{top:oprateBox.position.top + 'px', right:oprateBox.position.right + 'px'}">
      <i v-if="oprateBox.items.addChildNode" class="iconfont icontianjiazijiedian oprate" @click="addChildNode"></i>
      <i v-if="oprateBox.items.addNode"  class="iconfont icontianjiajiedian oprate" @click="addNode"></i>
      <i v-if="oprateBox.items.deleteNode"  class="iconfont iconlajitong oprate" @click="deleteNode"></i>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
  import jsmind from '../common/js/jsmind.js'
  import jsmindDraggable from '../common/js/jsmind.draggable.js'
  import jsmindScreenshot from '../common/js/jsmind.screenshot.js'
  export default {
    name: 'Jsmind',
    components: {jsmind, jsmindDraggable, jsmindScreenshot},
    props: {
      jmData: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      initData() {
        return this.jmData
      }
    },
    created() {
      this.$set(this, 'jsMind', window.jsMind)
      this.$set(this.initData.options, 'custom_event_handles', {
        mouseover: this.customMouseover,
        mouseout: this.customMouseout,
        click: this.customClickHandle,
        dblclick: this.customDblclickHandle,
        expanderClick: this.customExpanderClick,
        updateNode: this.updateNode,
        beforeMoved: this.beforeMoved,
        moved: this.moved
      })
      this.$set(this.initData.options, 'customInnerHTML', {
        Epic_: '',
        Feature_: '',
        Story_: '',
        Task_: ''
      })
      this.$set(this.initData.options.customInnerHTML, 'renderHTML', this.renderHTML)
      this.$set(this.initData.options.customInnerHTML, 'Epic_', this.renderHTML({
        title: 'Epic_',
        handler: 'linguang'
      }))
    },
    mounted() {
      this.$set(this.initData.options, 'oprate_element', document.getElementById('oprate-box'))
      let jm = this.jsMind.show(this.initData.options, this.initData.mind)
      this.$set(this, 'jm', jm)
      this.addEvent(document, 'scroll', () => {
        if (this.oprateBox && this.oprateBox.show) {
          this.$set(this.oprateBox, 'show', false)
          this.$set(this.oprateBox, 'position', {top: 0, right: 0})
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        }
      })
      this.$set(this.container, 'width', document.body.clientWidth)
    },

    data() {
      return {
        container: {
          width: 0,
          height: 0
        },
        jm: {},
        jsMind: null,
        filter: {
          showOptions: false
        },
        selectedFilters: [],
        statusData: [
          {label: '新建', value: 1}, {label: '进行中', value: 2}, {label: '已解决', value: 3}, 
          {label: '测试中', value: 4}, {label: '已拒绝', value: 5}, {label: '已关闭', value: 6},
        ],
        create: {
          Epic_: {id: ''},
          Feature_: {id: ''},
          Story_: {id: ''},
          Task_: {id: ''},
        },
        Epic_: {expand: false},
        Feature_: {expand: false},
        Story_: {expand: false},
        Task_: {expand: false},
        mouseover_nodeid: null,
        oprateBox: {
          show: false, 
          items: {deleteNode: true, addNode: true, addChildNode: true},
          position: {top: 0, right: 0}
        },
        number: 0,
        nodeid_list: [],
        node_list: [],
        rootNode: {nodeid: 'root', children: []},
      }
    },
    filters: {
      selectedStatusFilter(value) {
        if (!value || !value.length) {
          return ''
        }
        if (value.length > 5) {
          return value.slice(0, 5).join(',') + ',...'
        } else {
          return value.join(',')
        }
      }
    },
    methods: {
      renderHTML(params) {
        return `
          <div class="custom-card jm-card">
            <div class="row jm-card">
              <div class="level jm-card"></div>
              <div class="status jm-card">新建</div>
              <div class="title jm-card" title="`+ (params.title || '') +`">
                <span class=" jm-card" style="display:none;">`+ (params.title || '') +`</span>
                <input class=" jm-card" type="text" value="`+ (params.title || '') +`"/>
              </div>
            </div>
            <div class="row jm-card">
              <div class="handler jm-card">`+ (params.handler || '') +`</div>
            </div>
          </div>
        `
      },
      wapperClickHandle(event) {
        let target = event.target || event.srcElement
        if (!target.className.includes('root') && !target.className.includes('icontianjiazijiedian')) {
          this.hideRootIcon()
          if (!target.className.includes('jm-card')) {
            this.jm.select_clear()
          }
        }
        
        if (this.filter.showOptions) {
          this.$set(this.filter, 'showOptions', false)
        }
        if (!target.className.includes('oprate') && this.mouseover_nodeid) {
          this.$set(this, 'mouseover_nodeid', null)
        }

        if (this.oprateBox.show) {
          this.$set(this.oprateBox, 'show', true)
          this.$set(this.oprateBox, 'position', {top: 0, right: 0})
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        }
      },
      hideRootIcon() {
        let i = document.querySelector('jmnode[class=root] > i')
        if (i) {
          let visible = i.style.visibility
          if (visible === 'visible') {
            i.style.visibility = 'hidden'
          }
        }
      },
      toggleOptions() {
        this.$set(this.filter, 'showOptions', !this.filter.showOptions)
      },
      checkClass(status) {
        return this.selectedFilters.includes(status.label) ? 'selected-status' : ''
      },
      checkAllClass() {
        return this.selectedFilters.length === this.statusData.length ? 'selected-status' : ''
      },
      checkStatusHandle(value) {
        switch (value) {
          case 0: this.checkAllStatus(); break;
          default: this.checkStatus(value); break;
        }
      },
      checkAllStatus() {
        if (this.selectedFilters.length !== this.statusData.length) {
          this.statusData.forEach(status => {
            if (!this.selectedFilters.includes(status.label)) {
              this.selectedFilters.push(status.label)
            }
          })
        } else {
          this.$set(this, 'selectedFilters', [])
        }
      },
      checkStatus(value) {
        let filter = this.statusData.filter(item => item.value === value)
        if (filter && filter[0]) {
          if (!this.selectedFilters.includes(filter[0].label)) {
            this.selectedFilters.push(filter[0].label)
          } else {
            this.selectedFilters.splice(this.selectedFilters.findIndex(item => item === filter[0].label), 1)
          }
        }
      },
      EpicExpandHandle() {
        if (this.oprateBox.show) {
          this.$set(this.oprateBox, 'show', !this.oprateBox.show)
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        }
        this.$set(this.Epic_, 'expand', !this.Epic_.expand)
        this.jm.toggle_node('root')
      },
      FeatureExpandHandle() {
        if (this.oprateBox.show) {
          this.$set(this.oprateBox, 'show', !this.oprateBox.show)
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        }
        this.$set(this.Feature_, 'expand', !this.Feature_.expand)
        this.initData.mind.data.children.forEach(child => {
          this.jm.toggle_node(child.id)
        })
      },
      StoryExpandHandle() {
        if (this.oprateBox.show) {
          this.$set(this.oprateBox, 'show', !this.oprateBox.show)
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        }
        this.$set(this.Story_, 'expand', !this.Story_.expand)
        this.initData.mind.data.children.forEach(child => {
          child.children.forEach(cld =>{
            this.jm.toggle_node(cld.id)
          })
        })
      },
      TaskExpandHandle() {
        if (this.oprateBox.show) {
          this.$set(this.oprateBox, 'show', !this.oprateBox.show)
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        }
        this.$set(this.Task_, 'expand', !this.Task_.expand)
        this.initData.mind.data.children.forEach(child => {
          child.children.forEach(cld =>{
            cld.children.forEach(c =>{
              this.jm.toggle_node(c.id)
            })
          })
        })
      },
      getNodeid(element) {
        if (element && element instanceof HTMLElement) {
          let nodeid = element.getAttribute('nodeid')
          if (!nodeid) {
            this.getNodeid(element.parentNode)
          } else {
            this.$set(this, 'mouseover_nodeid', nodeid)
          }
        } else {
          return null
        }
      },
      customMouseover(element) {
        if (element.nodeName === 'I' || element.getAttribute('nodeid') === 'root') {
          this.$set(this, 'mouseover_nodeid', null)
        }
        if (element.getAttribute('nodeid') === 'root') {
          // this.jm.select_clear()
          this.$set(this.oprateBox, 'show', false)
          this.$set(this.oprateBox, 'position', {top: 0, right: 0})
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        } else {
          if (element.className.includes('jm-card')) {
            this.hideRootIcon()
            this.getNodeid(element)
            if (this.mouseover_nodeid) {
              this.jm.select_node(this.mouseover_nodeid)
              let node = this.jm.get_node(this.mouseover_nodeid)
              let nodeElement = document.querySelector('jmnode[nodeid="'+ this.mouseover_nodeid +'"]')
              let wapper = document.querySelector('.Jsmind-wapper')
              let tools = document.querySelector('.tools')
              let title = document.querySelector('.plan-title')
              let width = parseFloat(this.getStyle(wapper, 'width'))
              let top = parseFloat(this.getStyle(tools, 'height')) + 
                        parseFloat(this.getStyle(title, 'height')) + 
                        parseFloat(this.getStyle(title, 'marginTop'))
              if (node.id.includes('Task_')) {
                this.$set(this.oprateBox.items, 'addChildNode', false)
              } else {
                this.$set(this.oprateBox.items, 'addChildNode', true)
              }
              this.$set(this.oprateBox, 'show', true)
              this.$set(this.oprateBox, 'position', {
                top: nodeElement.offsetTop + nodeElement.clientHeight + top + 5,
                right: width - nodeElement.offsetLeft - nodeElement.clientWidth
              })
            }
          }
        }
      },
      customMouseout(element) {
        // this.$set(this, 'mouseover_nodeid', null)
      },
      customMousedown(event) {

      },
      customClickHandle(data) {
        if (data === 'root_add_child') {
          this.addNode()
        }
      },
      customDblclickHandle() {

      },
      customExpanderClick(node, isJmShow) {
        if (node.isroot) {
          this.$set(this.Epic_, 'expand', isJmShow ? !node.expanded : node.expanded)
        } else {
          this.$set(this[this.getNextType(node.topic)], 'expand', isJmShow ? !node.expanded : node.expanded)
        }
        
      },
      updateNode({node, nodes}) {
        if (this.oprateBox.show) {
          this.$set(this.oprateBox, 'show', true)
          this.$set(this.oprateBox, 'position', {top: 0, right: 0})
          if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        }
      },
      get_parent_count(node) {
        var obj = {
          count: 0,
          getter: function(node) {
            if (node.parent) {
              this.count += 1;
              if (node.parent.id !== 'root') {
                this.getter(node.parent)
              }
            }
          }
        }
        obj.getter(node);
        return obj.count;
      },
      hasChild(node, count) {
        if (node && node.children && typeof count === 'number') {
          if (count === 0) {
            return !!node.children && !!node.children.length
          } else {
            for (let i = 0; i < node.children.length; i++) {
              if (count < 2) {
                if (node.children[i].children && node.children[i].children.length) {
                  return true
                }
              } else {
                count--
                this.hasChild(node.children, count)
              }
            }
            return false
          }
        } else {
          return true
        }
      },
      isBeyondLimit(node, limit) {
        if (!node.children || !node.children.length) {
          return false
        }
        return this.hasChild(node, limit)
      },
      beforeMoved({isInherited, targetNode, nodeid, beforeid, parentid, direction, success, error}) {
        this.$set(this, 'number', ++this.number)
        if (this.number <= 1) {
          if (isInherited) {
            this.$message({
              type:'warning', 
              message:'不能移动到子工作项中',
              duration: 2000,
              onClose: () => {
                this.$set(this, 'number', 0)
              }
            })
          } else {
            const ALLOWED_COUNT = 4
            let parent_count = this.get_parent_count(targetNode)
            if (this.isBeyondLimit(targetNode, ALLOWED_COUNT - parent_count)) {
              this.$message({
                type:'warning', 
                message:'子工作项层级超过限制',
                duration: 2000,
                onClose: () => {
                  this.$set(this, 'number', 0)
                }
              })
            } else {
              success && success(targetNode)
            }
          }
        }
      },
      transformData(data) {
        return data ? {
          id: data.id,
          topic: data.topic,
          title: data.title,
          expanded: data.expanded,
          direction: data.direction,
          children: data.children,
          handler: data.handler,
        } : {}
      },
      makeTree(node_list, node) {
        if (this.nodeid_list.length) {
          for (let i = 0; i < node_list.length; i++) {
            if (node_list[i].node) {
              if (node_list[i].node.parent.id === node.nodeid) {
                if (!node.children.map(child => {return child.id}).includes(node_list[i].nodeid)) {
                  node.children.push(node_list[i].node)
                }
              }
            }
          }
          node.children.forEach(item => {
            let index = this.nodeid_list.findIndex(id => {return id === item.nodeid})
            if (index != -1) {this.nodeid_list.splice(index, 1)}
          })
          if (node.children && node.children.length) {
            node.children.forEach(child =>{
              this.makeTree(node_list, child)
            })
          }
        }
      },
      moved({nodes}) {
        let selected_nodeid = this.jm.mind.selected.id
        for (let nodeid in nodes) {
          if (nodeid !== 'root') {
            this.nodeid_list.push(nodeid)
            this.node_list.push({
              nodeid,
              node: this.jm.get_node(nodeid)
            })
          }
        }
        this.makeTree(this.node_list, this.rootNode)
        this.$set(this.initData.mind.data, 'children', this.rootNode.children)
        // this.$set(this, 'jm', this.jsMind.show(this.initData.options, this.initData.mind))
        // this.jm.select_node(selected_nodeid)
        this.$set(this, 'number', 0)
      },
      deleteNode() {  
        let nodeList = this.initData.mind.data.children
        let targetNode = this.getNodeData(nodeList, this.mouseover_nodeid)
        let parentid = this.jm.get_node(this.mouseover_nodeid).parent.id
        let parentNode = this.getNodeData(nodeList, parentid)
        let index = parentNode.children.findIndex(child => {return child.id === this.mouseover_nodeid})
        if (index !== -1) {
          parentNode.children.splice(index, 1)
        }
        this.$set(this, 'jm', this.jsMind.show(this.initData.options, this.initData.mind))
      },
      getNodeData(nodeList, nodeid) {
        if (!nodeList || !nodeid) {return null}
        if (nodeid === 'root') {return this.initData.mind.data}
        let obj = {
          node: null,
          forEach: (list, id) => {
            for (let i = 0; i < list.length; i++) {
              if (list[i].id === id) {
                obj.node = list[i]
              } else {
                obj.forEach(list[i].children, id)
              }
            }
          }
        }
        obj.forEach(nodeList, nodeid)
        return obj.node
      },
      addNode(event, nodeid) {
        this.$set(this.oprateBox, 'show', false)
        this.$set(this.oprateBox, 'position', {top: 0, right: 0})
        if (!this.oprateBox.items.addChildNode) {this.$set(this.oprateBox.items, 'addChildNode', true)}
        if (event) { // 添加兄弟节点
          if (this.mouseover_nodeid) {
            let nodeList = this.initData.mind.data.children
            let parentid = this.jm.get_node(this.mouseover_nodeid).parent.id
            let parentNode = this.getNodeData(nodeList, parentid)
            let index = parentNode.children.findIndex(child => {return child.id === this.mouseover_nodeid})
            if (index !== -1) {
              parentNode.children.splice((index + 1), 0, this.emptyData(this.getNextType(parentNode.topic)))
            }
          }
        } else { // 添加子节点
          if (this.mouseover_nodeid) { // 除根节点以外的指定节点添加子节点
            if (nodeid) {
              let nodeList = this.initData.mind.data.children
              let targetNode = this.getNodeData(nodeList, nodeid)
              targetNode.children.push(this.emptyData(this.getNextType(targetNode.topic)))
            }
          } else { // 根节点添加子节点
            this.initData.mind.data.children.push(this.emptyData(this.getNextType()))
          }
        }

        setTimeout(() => {
          this.$set(this, 'jm', this.jsMind.show(this.initData.options, this.initData.mind))
          this.customExpanderClick(this.jm.get_node(nodeid || 'root'), true)
          this.$nextTick(() => {
            let topic = ''
            let node_id = null
            if (event) { // 添加兄弟节点
              if (this.mouseover_nodeid) {
                topic = this.jm.get_node(this.mouseover_nodeid).parent.topic
                node_id = this.create[this.getNextType(topic)].id
              }
            } else { // 添加子节点
              if (this.mouseover_nodeid) { // 除根节点以外的指定节点添加子节点
                if (nodeid) {
                  topic = this.jm.get_node(nodeid).topic
                  node_id = this.create[this.getNextType(topic)].id
                }
              } else { // 根节点添加子节点
                topic = this.jm.get_node('root').topic
                node_id = this.jm.mind.nodes[this.create[this.getNextType(topic)].id].id
              }
            }
            this.jm.select_node(node_id)
            if (this.jsMind.plugins[0] && this.jsMind.plugins[0].name === 'draggable') {
              this.jsMind.plugins[0].init(this.jm)
            }
            let selected_node = this.jm.get_selected_node()
            let element = selected_node._data.view.element
            if (element) {
              this.addEvent(element, 'mousedown', this.customMousedown)
            }
            let input = element.querySelector('.custom-card>.row>.title>input')
            let input_oldV = input.value
            let span = element.querySelector('.custom-card>.row>.title>span')
            this.addEvent(span, 'click', () => {
              this.$message('详情页面待开发')
            })

            if (input && input instanceof HTMLElement) {
              input.focus()
              if (input.setSelectionRange) {
                input.setSelectionRange(0, input.value.length)
              }
              this.addEvent(input, 'change', (event) => {
                let target = event.target || event.srcElement
                if (!target.value.trim()) {
                  target.value = input_oldV
                }
                let currentNode = this.getNodeData(this.initData.mind.data.children ,node_id)
                if (currentNode) {
                  currentNode.title = target.value
                }
              })
              this.addEvent(input, 'blur', () => {
                input.style.display = 'none'
                span.innerHTML = input.value
                span.style.display = 'inline-block'
                // this.jm.select_clear()
              })
            }
          })
        }, 500)
      },
      addChildNode() {
        this.addNode(null, this.mouseover_nodeid)
      },
      getNextType(type) {
        if (!type || type === '需求规划') {
          return 'Epic_'
        }
        switch (type) {
          case 'Epic_': return 'Feature_'; break;
          case 'Feature_': return 'Story_'; break;
          case 'Story_': return 'Task_'; break;
        }
      },
      emptyData(type) {
        if (!type) {return}
        switch (type) {
          case 'Epic_': 
            this.$set(this.create.Epic_, 'id', ('Epic_' + new Date().getTime() + ''))
            this.$set(this.initData.options.customInnerHTML, 'Epic_', this.renderHTML({title: 'Epic_', handler: 'linguang'}))
            return {
              "id": this.create.Epic_.id, 
              "topic": "Epic_", 
              "title": "Epic_",
              "expanded": true,
              "direction": 'right',
              "children": [],
              "handler": 'linguang'
            };
            break;
          case 'Feature_': 
            this.$set(this.create.Feature_, 'id', ('Feature_' + new Date().getTime()))
            this.$set(this.initData.options.customInnerHTML, 'Feature_', this.renderHTML({title: 'Feature_', handler: 'linguang'}))
            return {
              "id": this.create.Feature_.id, 
              "topic": "Feature_", 
              "title": "Feature_",
              "expanded": true,
              "direction": 'right',
              "children": [],
              "handler": 'linguang'
            };
            break;
          case 'Story_': 
            this.$set(this.create.Story_, 'id', ('Story_' + new Date().getTime() + ''))
            this.$set(this.initData.options.customInnerHTML, 'Story_', this.renderHTML({title: 'Story_', handler: 'linguang'}))
            return {
              "id": this.create.Story_.id, 
              "topic": "Story_", 
              "title": "Story_",
              "expanded": true,
              "direction": 'right',
              "children": [],
              "handler": 'linguang'
            };
            break;
          case 'Task_': 
            this.$set(this.create.Task_, 'id', ('Task_' + new Date().getTime() + ''))
            this.$set(this.initData.options.customInnerHTML, 'Task_', this.renderHTML({title: 'Task_', handler: 'linguang'}))
            return {
              "id": this.create.Task_.id, 
              "topic": "Task_", 
              "title": "Task_",
              "expanded": true,
              "direction": 'right',
              "children": [],
              "handler": 'linguang'
            };
            break;
        }
      },
      getStyle(element,cssPropertyName){
        if (window.getComputedStyle) {return window.getComputedStyle(element)[cssPropertyName];}
        else {return element.currentStyle[cssPropertyName];}
      },
      addEvent(dom, eName, fun, useCapture) {
        if (!dom || !eName) {return false;}
        if (dom.addEventListener) {
          dom.removeEventListener(eName, fun);
          dom.addEventListener(eName, fun, useCapture);
        } else if (dom.attachEvent) {
          dom.detachEvent('on'+eName, fun);
          dom.attachEvent('on'+eName, fun);
        }
      }
    },
    watch: {},
    destroyed () {}
  }
</script>
<style type="text/css">
  body {
    background-color: #f3f6f8;
  }
  body p {
    padding: 0px;
    margin: 0px;
  }
  body ul {
    margin: 0px;
    padding: 0px;
  }
  .Jsmind-wapper {
    min-height: calc(100vh - 90px);
    height: calc(100% - 90px);
    background: url(../assets/plan_back.png) repeat;
    padding-top: 60px;
  }
  #jsmind_container{
    border: solid 1px #ccc;
    background: none;
    float: left;
    width: 100%;
  }
  #jsmind_container .jsmind-inner {
    min-height: 100vh;
    overflow-x: hidden;
  }
  #jsmind_container .jsmind-inner canvas {
    left: 0px;
  }
  #jsmind_container .jsmind-inner jmnodes.theme-myTheme {
    left: 0px;
  }
  #jsmind_container .jsmind-inner jmnode.root {
    width: 24px;
    height: 80px;
    line-height: 1.3;
    font-size: 16px;
    font-weight: 500;
    overflow: visible;
    white-space: normal;
    text-overflow: clip;
    background: none;
    box-shadow: none;
  }
  #jsmind_container .jsmind-inner jmnode:not(.root) {
    border-radius: 2px;
    box-shadow: 1px 1px 2px rgba(41,48,64,0.2);
    /*width: calc(25% - 90px);*/
    padding: 0px;
    color: #293040;
    font-size: 16px;
    background-color: #fff;
    border: solid 1px #fff;
    cursor: default;
    /*max-width: calc(25% - 70px);*/
    white-space: normal !important;
  }
  #jsmind_container .jsmind-inner jmnode:not(.root).selected {
    border: solid 1px #5e7ce0;
    box-shadow: 1px 1px 8px #5e7ce0;
  }
  #jsmind_container .jsmind-inner jmnode .custom-card {
    overflow: hidden;
    font-size: 12px;
    width: 222px;
    padding: 10px;
  }
  .custom-card .row {
    clear: both;
    height: 25px;
    line-height: 25px;
  }
  .custom-card .row .level,
  .custom-card .row .status,
  .custom-card .row .title,
  .custom-card .row .handler {
    float: left;
  }
  .custom-card .row .level {
    border-color: #fa9841;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: inline-block;
    border-width: 3px;
    border-style: solid;
    box-sizing: border-box;
    position: relative;
    margin-right: 5px;
    margin-top: 2px;
  }
  .custom-card .row .status {
    background-color: #fff;
    color: #293040;
    height: 15px;
    line-height: 15px;
    width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    font-size: 12px;
    border-radius: 2px;
    padding: 2px 5px;
  }
  .custom-card .row .title {
    font-size: 12px;
    color: #293040;
    line-height: 15px;
    /*word-wrap: break-word;*/
    cursor: pointer;
    width: calc(100% - 80px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
  }
  .custom-card .row .handler {
    display: block;
    width: 50%;
    height: 15px;
    line-height: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
    font-size: 12px;
    text-align: left;
    color: #5e6678;
    margin-top: 10px;
  }
  .custom-card .row .title input,
  .custom-card .row .title span {
    width: 100%;
    border: none;
    font-size: 12px;
    padding: 2px 5px;
    text-align: left;
  }
  .custom-card .row .title input:hover,
  .custom-card .row .title span:hover {
    color: #5e7ce0;
  }
  .custom-card .row .title input:focus {
    color: #293040;
  }
  #jsmind_container jmexpander {
    width: 16px;
    height: 16px;
    border: none;
    font-size: 16px;
  }
  #jsmind_container jmnode.selected {
    color: #333;
  }
  #jsmind_container .jsmind-inner jmnode.root i.iconfont {
    width: 16px;
    height: 16px;
    border: 1px solid #ccc;
    border-radius: 50%;
    font-size: 14px;
    padding: 2px;
    font-weight: 500;
    color: #333;
    display: inline-block;
    margin-top: 5px;
    cursor: pointer;
  }
  #jsmind_container .jsmind-inner jmnode.root i.iconfont:hover {
    border: 1px solid #5e7ce0;
    background-color: #5e7ce0;
    color: #fff;
  }
  .reset-style-ul {
    list-style: none;
  }
</style>
<style lang="stylus" rel="stylesheet/stylus" scoped>
  .Jsmind-wapper {
    position: relative;
    overflow: hidden;
    .tools {
      height: 60px;
      float: left;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      z-index: 100;
      line-height: 60px;
      .filter-wapper {
        position: absolute;
        top: 50%;
        left: 10px;
        height: 30px;
        line-height: 30px;
        background-color: #fff;
        transform: translateY(-50%);
        .select {
          width: 240px;
          height: 30px;
          border: 1px solid #cacfd8;
          &:hover {
            border-color: #405dff;
          }
          .selected-item {
            text-align: left;
            height: 30px;
            width: calc(100% - 30px);
            padding: 0px 5px;
            padding-right: 25px;
            position: absolute;
            top: 0px;
            left: 0px;
            z-index: 10;
            cursor: pointer;
            font-size: 12px;
          }
          i.iconfont.iconxiangxia, i.iconfont.iconxiangshang {
            position: absolute;
            top: 50%;
            right: 5px;
            transform: translateY(-50%);
            z-index: 12;
            cursor: pointer;
          }
          ul {
            position: absolute;
            top: 32px;
            z-index: 9;
            left: 0px;
            overflow: hidden;
            box-shadow: 0 4px 8px 0 rgba(41,48,64,.2);
            background-color: #fff;
            width: 100%;
            li.status-item {
              padding: 8px 13px;
              width: 214px;
              font-size: 14px;
              height: 24px;
              line-height: 24px;
              text-align: left;
              &:hover {
                background-color: #f3f7fe;
                cursor: pointer;
              }
              .box {
                display: inline-block;
                width: 12px;
                height: 12px;
                border: 1px solid #cfcfd8;
                margin-right: 10px;
                position: relative;
                top: 5px;
                &:hover {
                  border: 1px solid #405dff;
                }
                i.iconfont.iconduigou {
                  visibility: hidden;
                }
              }
            }
            li.selected-status {
              .box {
                background-color: #405dff;
                border-color: #405dff;
                text-align: center;
                i.iconfont.iconduigou {
                  visibility: visible;
                  color: #fff;
                  font-size: 12px;
                  position: relative;
                  top: -5px;
                }
              }
            }
          }
          ul.show-options {
            height: 290px;
            padding: 5px 0px;
            transition: height .3s;
          }
          ul.hide-options {
            height: 0px;
            padding: 0px;
            transition: height .3s;
          }
        }
      }
      .oprate-wapper {
        height: 100%;
        float: right;
        min-width: 60px;
        position: relative;
        span.iconfont {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          left: 0px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid  #cacfd8;
          font-size: 14px;
          cursor: pointer;
        }
        .iconcaozuo:before {
          position: absolute;
          top: -18px;
          left: 5px;
          height: 24px;
        }
      }
    }
    .plan-title {
      float: left;
      width: 100%;
      font-size: 18px;
      font-weight: bold;
      color: #293040;
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
      height: 30px;
      div:first-child {
        margin-left: 76px;
      }
      div {
        min-width: 295px;
        text-align: center;
        i.iconfont {
          color: #666;
          cursor: pointer;
          &:hover {
            color: #000;
          }
        }
      }
    }
    #oprate-box {
      position: absolute;
      width: 120px;
      height: 24px;
      line-height: 24px;
      z-index: 1000;
      i.iconfont {
        margin-left: 10px;
        width: 20px;
        height: 20px;
        display: inline-block;
        border: 1px solid #cacfd8;
        border-radius: 50%;
        cursor: pointer;
        font-size: 14px;
        float: right;
      }
      i.iconfont:hover {
        border: 1px solid #5e7ce0;
        background-color: #5e7ce0;
        color: #fff;
      }
      i.icontianjiazijiedian,
      i.icontianjiajiedian {
        &:before {
          position: relative;
          top: -2px;
        }
      }
      i.iconlajitong {
        font-size: 16px;
        &:before {
          position: relative;
          top: -2px;
        }
      }
    }
  }
</style>
