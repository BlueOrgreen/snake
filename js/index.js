var sw = 20,  // 一个方块的宽度
    sh = 20,  // 一个方块的高度
    tr = 30,  // 行数
    td = 30;  // 列数

var snake = null  // 蛇的实例
var food = null
var game = null

function Square(x, y, classname) {
    this.x = x*sw
    this.y = y*sh
    this.class = classname
 
    this.viewContent = document.createElement('div')  // 方块DOM元素
    this.viewContent.className = this.class
    this.parent = document.getElementById('snakeWrap')
    
}

Square.prototype.create = function(){
    this.viewContent.style.position = 'absolute'
    this.viewContent.style.width = sw + 'px'
    this.viewContent.style.height = sh + 'px'
    this.viewContent.style.left = this.x + 'px'
    this.viewContent.style.top = this.y + 'px'

    this.parent.appendChild(this.viewContent)
}

Square.prototype.remove = function(){
    this.parent.removeChild(this.viewContent)
}

// 蛇
function Snake(){
    this.head = null
    this.tail = null
    this.pos = []  // 存储蛇身上每个方块的位置

    this.directionNum = {
        left: {x: -1, y: 0},
        right: {x: 1, y: 0},
        up: {x: 0, y: -1},
        down: {x: 0, y: 1}
    }  // 蛇走的方向
}

Snake.prototype.init = function(){
    var snakeHead = new Square(2, 0, 'snakeHead')  // 创建蛇头
    snakeHead.create()
    this.head = snakeHead    // 存储蛇头信息
    this.pos.push([2, 0])    

    // 创建蛇身
    var snakeBody1 = new Square(1, 0, 'snakeBody')
    snakeBody1.create()
    this.pos.push([1, 0]) 
    
    var snakeBody2 = new Square(0, 0, 'snakeBody')
    snakeBody2.create()
    this.tail = snakeBody2     // 存储蛇尾信息
    this.pos.push([0, 0])
    
    // 形成链表关系
    snakeHead.last = null
    snakeHead.next = snakeBody1

    snakeBody1.last = snakeHead
    snakeBody1.next = snakeBody2

    snakeBody2.last = snakeBody1
    snakeBody2.next = null

    // 给蛇添加一个属性，用来表示蛇走的方向
    this.direction = this.directionNum.right  // 默认向右走
}

// 用来获取蛇头下一个位置对应的元素，根据元素做不同的事情
Snake.prototype.getNextPros = function(){
    var nextPros = [         
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ]
    // 下个点是自己，游戏结束
    var selfCollied = false
    this.pos.forEach((value)=>{
        // 不能直接用对象比较(value==nextPros),
        // 因为对象比较不仅数据内容，还包括地址比较
        if(value[0]==nextPros[0] && value[1]==nextPros[1]){
            selfCollied = true    
        }
    })
    if(selfCollied){
        console.log('撞到自己了')
        this.strategies.die()
        return
    }

    // 下个点是墙，游戏结束
    if(nextPros[0]<0 || nextPros[1]<0 || nextPros[0]>td-1 || nextPros[1]>tr-1){
        console.log('撞墙了')
        this.strategies.die()
        return
    }

    // 下个点是食物，吃
    if(food && food.pos[0]==nextPros[0] && food.pos[1]==nextPros[1]){
        this.strategies.eat.call(this)
    }

    //下一个点什么都不是，走
    this.strategies.move.call(this)
}

// 处理碰撞后做的事情
Snake.prototype.strategies = {
    move: function(format){    // 该参数用于决定是否删除尾巴，传了表示吃
        var newBody = new Square(this.head.x/sw, this.head.y/sh, 'snakeBody')
        newBody.next = this.head.next
        this.head.next.last = newBody
        newBody.last = null

        this.head.remove()
        newBody.create()

        var newHead = new Square(this.head.x/sw+this.direction.x, this.head.y/sh+this.direction.y, 'snakeHead')
        
        newHead.next = newBody
        newHead.last = null
        newBody.last = newHead
        newHead.create()

        // 更新蛇身上的坐标
        this.pos.splice(0,0,[this.head.x/sw+this.direction.x, this.head.y/sh+this.direction.y])
        this.head = newHead

        if(!format){
            this.tail.remove()
            this.tail = this.tail.last

            this.pos.pop()
        }
        
    },
    eat: function(){
        this.strategies.move.call(this, true)
        createFood()
        game.score++
    },
    die: function(){
        game.over()
    }
}

snake = new Snake()

// 创建食物
function createFood(){
    var x = null
    var y = null

    var include = true  // true表示食物在蛇身上，要继续循环；false表示食物不在蛇身上，不用循环
    while(include){
        x = Math.round(Math.random()*(td-1))
        y = Math.round(Math.random()*(tr-1))
     
        snake.pos.forEach((value)=>{
            if(x!=value[0] || y!=value[1]){
                include = false
            }
        })
    }
    // 生成食物
    food = new Square(x, y, 'food')
    food.pos=[x, y]    // 与蛇头下一个要走的坐标对比
    
    var foodDom = document.querySelector('.food')
    if(foodDom){
        foodDom.style.left = x*sw + 'px'
        foodDom.style.top = y*sh + 'px'
    }else{
        food.create()
    }
}


// 游戏逻辑
function Game(){
    this.time = null
    this.score = 0
}

Game.prototype.init = function(){
    snake.init()
    createFood()

    document.onkeydown=function(event){
        if(event.which==37 && snake.direction != snake.directionNum.right){
            snake.direction = snake.directionNum.left
        }else if(event.which==38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up
        }else if(event.which==39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right
        }else if(event.which==40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down
        }
    }
    this.start()
}

Game.prototype.start = function(){
    this.timer = setInterval(function(){
        snake.getNextPros()
    }, 200)
}

Game.prototype.pause = function(){
    clearInterval(this.timer)
}

Game.prototype.over = function(){
    clearInterval(this.timer)
    alert('你现在的得分为：'+this.score)

    // 游戏回到最初
    var snakeWrap = document.getElementById('snakeWrap')
    snakeWrap.innerHTML = ''

    snake = new Snake()
    game = new Game()

    var startBtn = document.querySelector('.startBtn')
    startBtn.style.display = 'block' 
}

// 开启游戏
game = new Game()
var startBtn = document.querySelector('.startBtn button')
startBtn.addEventListener('click', function(){
    startBtn.parentElement.style.display = 'none'
    game.init()
})

// 暂停严肃
var snakeWrap = document.querySelector('#snakeWrap')
var pauseBtn = document.querySelector('.pauseBtn button')
snakeWrap.addEventListener('click', function(){
    game.pause()
    pauseBtn.parentNode.style.display = 'block'
})

pauseBtn.addEventListener('click', function(){
    game.start()
    pauseBtn.parentNode.style.display = 'none'
})
