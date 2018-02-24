/**
 * Created by ZQZYDMO on 2017/10/8.
 */

//创建游戏对象，并且设定分辨率，指定渲染器，绑定到div
var game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'game_view');

Phaser.World.prototype.displayObjectUpdateTransform = function () {
    if (!game.scale.correct) {
        this.x = game.camera.y + game.width;
        this.y = -game.camera.x;
        this.rotation = Phaser.Math.degToRad(Phaser.Math.wrapAngle(90));
    } else {
        this.x = -game.camera.x;
        this.y = -game.camera.y;
        this.rotation = 0;
    }
    PIXI.DisplayObject.prototype.updateTransform.call(this);
};


/*-------------------定义一些常量------------------*/
game.init = {
    score: 0,//游戏分数
    scoreDelayed: 2 * 1000,//坚持多长时间加一分，秒记
    isStart: false,//游戏是否开始
    BGSpeed: -100,//背景速度
    rocketTime: 0.4 * 1000,//飞机子弹发射间隔,秒记
    obstacleTime: 4 * 1000,//障碍出现时间间隔,秒记
    enemyTime: 5 * 1000,//敌机出现时间间隔,秒记
    m_planeRocketSpeed: 300,//飞机发射的炮弹的速度
    m_enemy1Speed: -200,//敌机飞行速度
    m_enemy2Speed: -175,//敌机飞行速度
    m_enemy3Speed: -150,//敌机飞行速度
    m_enemy2RocketSpeed: -262,//敌机飞行速度
    m_enemy3RocketSpeed: -225,//敌机飞行速度
    m_enemy3Life: 2,//第三种敌机有两条命
};
game.setIntScore = null;//后边赋值计分函数
/*--------------------一些初始方法---------------------*/
//返回两个数之间随机数[min,max)
game.selectFrom = function (lowerValue, upperValue) {
    var choices = upperValue - lowerValue;
    return Math.floor(Math.random() * choices + lowerValue);
};
// 通过对象组的方式创建对象,需要包括的obj有,Obj = {name:'',type:'',width:'',height:'',scaleX:'',scaleY:''}
game.getObj = function () {
    var m_obj = [];
    for (var i = 0; i < this.Obj.length; i++) {
        /*
         * 取出某个group中的第一个对象，参数，第一个（如果是false，就是拿第一个非存在的元素即没有显示在屏幕上的，如过是true，就是拿第一个存在的元素即显示在屏幕上的），如过拿不到对象会返回空
         * 第二个参数是如果组里没有元素了是否需要创建一个新的，默认false，三四就是x，y位置了
         * */
        var temp = this[this.Obj[i].type].getFirstExists(false, false, this.Obj[i].width, this.Obj[i].height);
        if (temp) {
            //设置障碍的位置,如果上边没有设置障碍的位置，所以需要使用reset设置一下物体位置
            //myBullet.reset(this.myplane.x + 15, this.myplane.y - 7);
        } else {
            //如果没有敌机就创建敌机
            temp = game.add.sprite(this.Obj[i].width, this.Obj[i].height, this.Obj[i].name);
            temp.scale.setTo(this.Obj[i].scaleX, this.Obj[i].scaleY);
            if (this.Obj[i].isCheckWorldKill) {
                //给障碍添加边缘检测,超出游戏边框就kill掉(回收到对象池中)
                temp.outOfBoundsKill = true;
                temp.checkWorldBounds = true;
            }
            //将创建得障碍添加到子弹组里变去
            this[this.Obj[i].type].addChild(temp);
            //障碍添加物理引擎
            game.physics.enable(temp, Phaser.Physics.ARCADE);
        }
        m_obj.push(temp);
    }
    return m_obj;

};
//创建title,即分享事显示的语句
game.makeTitle = function (score) {
    if (score > 100) {
        return "打飞机是个技术活,我才坚持了" + score + "分，你敢来么？";
    } else {
        return "打飞机我能坚持" + score + "分，不服来战!!!";
    }
};
game.onCloseShare = function () {
    document.getElementById('share').style.display = 'none';
};

/*-------------------定义常量结束------------------*/
game.MyStates = {};
//最一开始加载的场景,引导场景，用来加载一些比较微小的提示类消息
game.MyStates.boot = {
    preload: function () {
        game.scale.onOrientationChange.add(function () {
            if (game.scale.isLandscape) {
                game.scale.correct = true;
                game.scale.setGameSize(1280, 720);
            } else {
                game.scale.correct = false;
                game.scale.setGameSize(720, 1280);
            }
        }, this);
        //导入最初加载进度条
        game.load.image('preload', 'assets/other/preloader.gif');
        //判断是否在手机端，如果是在手机端，就全屏拉伸
        if (!game.device.desktop) {
            //设定缩放方式
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        }
    },
    create: function () {
        //跳转到加载资源场景
        game.state.start('load');
    }
};
//加载资源场景
game.MyStates.load = {
    //定义用来盛放加载进度文字
    prelodeText: null,
    preload: function () {
        /*定义读取进度的文字*/
        //首先定义文字(x位置，y位置，内容)
        this.prelodeText = game.add.text(game.world.centerX, game.world.centerY - 20, '0%');
        //设置中心点
        this.prelodeText.anchor.set(0.5);
        //居中
        this.prelodeText.align = 'center';
        //字体
        this.prelodeText.font = 'Arial Black';
        //字号
        this.prelodeText.fontSize = 20;
        //粗体
        this.prelodeText.fontWeight = 'bold';
        //描边颜色
        this.prelodeText.stroke = '#ffffff';
        //字体宽度
        this.prelodeText.strokeThickness = 4;
        //文字颜色
        this.prelodeText.fill = '#ff00ff';
        //从第几个字开始变成什么颜色
        this.prelodeText.addColor('#43d637', 1);
        this.prelodeText.addColor('#ffffff', 3);
        //文本描边的颜色
        this.prelodeText.addStrokeColor('#ff00ff', 3);
        //每加载一次资源后会执行一次的回调函数，在回调函数中设置进度文字的变化,将当前函数定义域传到匿名函数中
        game.load.onFileComplete.add(function (process) {
            this.prelodeText.text = process + '%';
        }, this);
        /*加载上边资源，然后场景中加载*/
        var preloadSprite = game.add.sprite(game.width / 2 - 220 / 2, game.height / 2 - 19 / 2, 'preload');
        //preloadSprite.anchor.setTo(0.5, 0.5);
        //preloadSprite.angle = 45;
        /*获取加载进度，设置加载精灵*/
        game.load.setPreloadSprite(preloadSprite);
        /*加载其他资源*/
        //背景，这种使用image加载图片的，分别是后文件中的key，路径
        game.load.image('background_start', 'assets/background/background_start.jpg');
        game.load.image('background_restart', 'assets/background/background_restart.jpg');
        game.load.image('background', 'assets/background/background.jpg');
        //子弹
        game.load.image('enemyBullet1', 'assets/bullet/enemyBullet1.png');
        game.load.image('enemyBullet2', 'assets/bullet/enemyBullet2.png');
        game.load.image('MyPlaneBullet', 'assets/bullet/MyPlaneBullet.png');
        //加载按钮,这种使用精灵图加载序列帧的，分别是以后文件中的key，路径，单帧宽，但帧高，共几帧
        game.load.spritesheet('share_btn', 'assets/button/share_btn.png', 768, 768, 2);
        game.load.spritesheet('restart_btn', 'assets/button/restart_btn.png', 128, 128, 2);
        //加载敌人
        game.load.image('enemy1', 'assets/enemy/enemy1.png');
        game.load.image('enemy2', 'assets/enemy/enemy2.png');
        game.load.image('enemy3', 'assets/enemy/enemy3.png');
        //加载自己飞机
        game.load.spritesheet('Plane_start', 'assets/plane/Plane_start.png', 400, 400, 12);
        game.load.image('Plane', 'assets/plane/Plane.png');
        //加载分数相关的图片
        game.load.image('score', 'assets/score/score.png');
        game.load.image('s0', 'assets/score/0.png');
        game.load.image('s1', 'assets/score/1.png');
        game.load.image('s2', 'assets/score/2.png');
        game.load.image('s3', 'assets/score/3.png');
        game.load.image('s4', 'assets/score/4.png');
        game.load.image('s5', 'assets/score/5.png');
        game.load.image('s6', 'assets/score/6.png');
        game.load.image('s7', 'assets/score/7.png');
        game.load.image('s8', 'assets/score/8.png');
        game.load.image('s9', 'assets/score/9.png');
        //加载其他图片资源
        game.load.spritesheet('explode', 'assets/other/explode.png', 64, 64, 23);
        game.load.image('scoreboard', 'assets/other/scoreboard.png');
        game.load.image('obstacle1', 'assets/other/obstacle1.png');
        game.load.image('obstacle2', 'assets/other/obstacle2.png');
        //边界，碰撞检测用
        game.load.image('boundary', 'assets/other/boundary.png');
        //加载音乐资源，这种使用audio加载声音的，分别是后文件中的key，路径
        game.load.audio('m_background_start', 'assets/music/background_start.mp3');
        game.load.audio('m_background_play', 'assets/music/background_play.mp3');
        game.load.audio('m_explode', 'assets/music/explode.mp3');
        game.load.audio('m_rocketMusic', 'assets/music/rocketMusic.mp3');
    },
    create: function () {
        //加载完成后跳到开始场景
        game.state.start('start');
    }
};
//开始游戏场景
game.MyStates.start = {
    create: function () {
        this.createMusic();
        this.createScene();
        this.createPlane();
        //如果手触摸屏幕并抬起，或者鼠标点击并抬起，执行函数
        game.input.onUp.add(function () {
            this.onStartClick();
        }, this);
    },//构造开始游戏场景
    onStartClick: function () {
        //尝试停止声音
        try {
            this.startBackground.stop();
        } catch (e) {
            console.log(e);
        }
        //跳转场景
        game.state.start('play');
    },//点击后开始游戏
    /*-----------------------创建加载游戏世界元素----------------------------*/
    createScene: function () {
        //加载开始场景背景图片
        game.add.image(0, 0, 'background_start');
    },//创建场景
    createMusic: function () {
        //将声音加载到场景
        this.startBackground = game.add.audio('m_background_start', 0.5, true);
        //尝试播放声音
        try {
            this.startBackground.play();
        } catch (e) {
            console.log(e);
        }
    },//创建背景音乐
    createPlane: function () {
        //加载飞机
        var m_plane = game.add.sprite(game.width / 2 - 200, game.height / 2, 'Plane_start');
        //设置飞机动画
        m_plane.animations.add('fly');
        //播放飞机动画
        m_plane.animations.play('fly', 12, true);
        //设置精灵缩放(飞机大小)
        m_plane.scale.setTo(0.5, 0.5);
    }//创建飞机
};
//游戏进行中场景
game.MyStates.play = {
    /*-----------------------默认基本运行函数----------------------------*/
    create: function () {
        //开启游戏世界中的碰撞
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //加载发射子弹时的声音
        this.m_RocketMusic = game.add.audio('m_rocketMusic', 0.1, false);
        //创建游戏场景
        this.createScene();
        //创建游戏边界,用来做碰撞检测用
        this.createBoundary();
        //创建背景音乐
        this.createBGMusic();
        //创建飞机
        this.createPlane();
        //定义最后一个发射子弹时间
        this.m_plane.lastRocketTime = 0;
        //定义障碍最后一个出现时间
        this.m_plane.lastObstacleTime = 0;
        //定义敌机最后一个出现时间
        this.m_plane.lastEnemyTime = 0;
        //创建一个盛放自己飞机子弹的组
        this.m_Rockets = game.add.group();
        //创建两个盛放障碍的组
        this.m_Obstacle1s = game.add.group();
        this.m_Obstacle2s = game.add.group();
        //创建三个盛放敌机的组
        this.m_Enemy1s = game.add.group();
        this.m_Enemy2s = game.add.group();
        this.m_Enemy3s = game.add.group();
        //创建敌机的子弹
        this.m_Enemy2Rockets = game.add.group();
        this.m_Enemy3Rockets = game.add.group();
        //创建分数的组
        this.m_scoreImgs = game.add.group();
    },//创建物体
    onStart: function () {
        //渲染分数
        this.scoreTransform();
        //游戏开始
        game.init.isStart = true;
        //设置飞机的重力,或者说下降速度
        this.m_plane.body.velocity.y = 300;
        //如果手触摸屏幕并按下，或者鼠标点击，执行函数
        game.input.onDown.add(function () {
            this.m_plane.body.velocity.y = -200;
        }, this);
        //如果手触摸屏幕并按下，或者鼠标点击，执行函数
        game.input.onUp.add(function () {
            this.m_plane.body.velocity.y = 300;
        }, this);
        //算分函数
        game.setIntScore = setInterval(function () {
            //分数增加
            game.init.score++;
            //更改分数显示
            game.MyStates.play.scoreTransform();
        }, game.init.scoreDelayed);
    },//开始游戏
    /*-------------------------创建加载游戏世界元素----------------------------*/
    createScene: function () {
        //使用平铺方式加载背景图
        this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background');
        //让背景图自动移动
        this.background.autoScroll(game.init.BGSpeed, 0);
        //创建分数
        this.scoreBG = game.add.sprite(game.width - 200, 20, 'score');
        //设置分数大小
        this.scoreBG.scale.setTo(0.7, 0.7);
    },//创建游戏场景(不带交互的)
    createBoundary: function () {
        //创建边界组,用来检测飞机是否超出世界上下边界
        this.boundarys = game.add.group();
        //设置组中两个元素的位置
        // var boundaryXY = [-2, game.height];
        this.Obj = [{
            name: 'boundary',
            type: 'boundarys',
            width: 0,
            height: -50,
            scaleX: game.width,
            scaleY: 1,
            isCheckWorldKill: false
        }, {
            name: 'boundary',
            type: 'boundarys',
            width: 0,
            height: game.height + 30,
            scaleX: game.width,
            scaleY: 1,
            isCheckWorldKill: false
        }];
        game.getObj.call(this);
    },//创建边界,飞机与敌机等超出边界销毁
    createBGMusic: function () {
        //添加声音到场景
        this.background = game.add.audio('m_background_play', 0.5, true);
        //播放声音
        this.background.play();
    },//创建背景音乐
    createPlane: function () {
        //加载飞机
        this.m_plane = game.add.sprite(game.width / 2 - 180, game.height / 2 + 70, 'Plane');
        //设置精灵缩放(飞机大小)
        this.m_plane.scale.setTo(0.5, 0.5);
        //给飞机添加碰撞
        game.physics.arcade.enable(this.m_plane);
        //设置飞机边界碰撞时不超出
        //this.m_plane.body.collideWorldBounds = true;
        //设置飞机边界碰撞检测
        //this.m_plane.checkWorldBounds = true;
        //飞机碰撞边界后回调函数
        //this.m_plane.events.onOutOfBounds.add(this.gameOver, this);

        //设置飞机初始化位置
        var tween = game.add.tween(this.m_plane).to({x: 100, y: 100}, 1500, Phaser.Easing.Sinusoidal.InOut, true);
        //动画添加回调，执行完动画后开始游戏
        tween.onComplete.add(this.onStart, this);
    },//创建飞机
    createEnemy: function () {
        //记录创建敌机类型
        this.Obj = [];
        //获得时间戳,用来创建障碍
        var now = new Date().getTime();
        //如果有我方的飞机,那就每隔一段时间创建一个敌机
        if (this.m_plane.alive && now - this.m_plane.lastEnemyTime > game.init.enemyTime) {
            var m_obj, m_enemy, m_enemyRocket;
            //随机生成敌机
            switch (game.selectFrom(0, 3)) {
                case 0:
                    this.Obj = [{
                        name: 'enemy1',
                        type: 'm_Enemy1s',
                        width: game.width,
                        height: game.selectFrom(50, 650),
                        scaleX: game.selectFrom(20, 27) / 100,
                        scaleY: game.selectFrom(20, 27) / 100,
                        speed: game.init.m_enemy1Speed,
                        isCheckWorldKill: true
                    }];
                    break;
                case 1:
                    this.Obj.push({
                        name: 'enemy2',
                        type: 'm_Enemy2s',
                        width: game.width,
                        height: game.selectFrom(50, 650),
                        scaleX: game.selectFrom(20, 29) / 100,
                        scaleY: game.selectFrom(20, 29) / 100,
                        speed: game.init.m_enemy2Speed,
                        isCheckWorldKill: true
                    });
                    this.Obj.push({
                        name: 'enemyBullet1',
                        type: 'm_Enemy2Rockets',
                        width: this.Obj[0].width,
                        height: this.Obj[0].height + 80,
                        scaleX: this.Obj[0].scaleX,
                        scaleY: this.Obj[0].scaleX,
                        speed: game.init.m_enemy2RocketSpeed,
                        isCheckWorldKill: true
                    });
                    break;
                case 2:
                    this.Obj.push({
                        name: 'enemy3',
                        type: 'm_Enemy3s',
                        width: game.width,
                        height: game.selectFrom(50, 650),
                        scaleX: game.selectFrom(20, 31) / 100,
                        scaleY: game.selectFrom(20, 31) / 100,
                        speed: game.init.m_enemy3Speed,
                        isCheckWorldKill: true
                    });
                    this.Obj.push({
                        name: 'enemyBullet2',
                        type: 'm_Enemy3Rockets',
                        width: this.Obj[0].width,
                        height: this.Obj[0].height + 80,
                        scaleX: this.Obj[0].scaleX,
                        scaleY: this.Obj[0].scaleX,
                        speed: game.init.m_enemy3RocketSpeed,
                        isCheckWorldKill: true
                    });
                    break;
                default:
                    break;
            }
            m_obj = game.getObj.call(this);
            //设置敌机的运动方向即敌机速度
            m_obj[0].body.velocity.x = this.Obj[0].speed;
            if (m_obj[1]) {
                m_obj[1].body.velocity.x = this.Obj[1].speed;
                if (this.Obj[1].name == 'enemyBullet1') {
                    m_obj[1].body.velocity.y = (m_obj[1].position.y - this.m_plane.position.y) / ((m_obj[1].position.x - this.m_plane.position.x) / this.Obj[1].speed);
                } else {
                    m_obj[0].life = game.init.m_enemy3Life;
                }
            }
            //最后一次创建敌机时间赋值
            this.m_plane.lastEnemyTime = now;
        }
    },//创建敌人
    createObstacle: function () {
        //障碍一,高度范围0-300,缩放范围0.3-0.5
        //障碍二,高度范围300-550,缩放范围0.5-1
        //两种障碍随机一个
        this.Obj = [];
        //获得时间戳,用来创建障碍
        var now = new Date().getTime();
        //如果有我方的飞机,那就每隔一段时间创建一个障碍
        if (this.m_plane.alive && now - this.m_plane.lastObstacleTime > game.init.obstacleTime) {
            var m_obstacle;
            //获取障碍物类型
            switch (game.selectFrom(0, 2)) {
                case 0:
                    this.Obj = [{
                        name: 'obstacle1',
                        width: game.width,
                        height: game.selectFrom(0, 250),
                        scaleX: game.selectFrom(30, 50) / 100,
                        scaleY: game.selectFrom(30, 50) / 100,
                        type: 'm_Obstacle1s',
                        isCheckWorldKill: true
                    }];
                    break;
                case 1:
                    this.Obj = [{
                        name: 'obstacle2',
                        width: game.width,
                        height: game.selectFrom(350, 550),
                        scaleX: game.selectFrom(50, 100) / 100,
                        scaleY: game.selectFrom(50, 100) / 100,
                        type: 'm_Obstacle2s',
                        isCheckWorldKill: true
                    }];
                    break;
                default:
                    break;
            }
            m_obstacle = game.getObj.call(this)[0];
            //设置子弹的运动方向即子弹速度
            m_obstacle.body.velocity.x = game.init.BGSpeed;
            //最后一次发射子弹时间赋值
            this.m_plane.lastObstacleTime = now;
        }
    },//创建障碍物
    planeRocket: function () {
        this.Obj = [];
        //获得时间戳,用来创建炮弹
        var now = new Date().getTime();
        //如果有我方的飞机,那就每五百毫秒发射一次子弹
        if (this.m_plane.alive && now - this.m_plane.lastRocketTime > game.init.rocketTime) {
            this.Obj = [{
                name: 'MyPlaneBullet',
                width: this.m_plane.x + 100,
                height: this.m_plane.y + 70,
                scaleX: 0.1,
                scaleY: 0.1,
                type: 'm_Rockets',
                isCheckWorldKill: true
            }];
            //获取子弹
            var m_Rocket = game.getObj.call(this)[0];
            //设置子弹的运动方向即子弹速度
            m_Rocket.body.velocity.x += game.init.m_planeRocketSpeed;
            //最后一次发射子弹时间赋值
            this.m_plane.lastRocketTime = now;
            //尝试播放播放声音，就算出错只会抛出异常，不会影响游戏继续
            try {
                /*播放声音*/
                this.m_RocketMusic.play();
            } catch (e) {
                console.log(e);
            }
        }
    },//创建飞机炮弹
    scoreTransform: function () {
        //先清空所有显示
        this.m_scoreImgs.removeAll();
        //现将分数转换为字符串
        this.scoreStr = game.init.score.toString();
        //将字符串转换为数组
        this.scoreArr = this.scoreStr.split('');
        //设定分数参数
        this.Obj = [];
        // 将数字与图片一一对应起来
        for (var i = 0; i < this.scoreArr.length; i++) {
            this.Obj.push({
                name: 's' + this.scoreArr[i],
                width: (game.width - 90) + i * 18,
                height: 25,
                scaleX: 0.3,
                scaleY: 0.3,
                type: 'm_scoreImgs',
                isCheckWorldKill: false
            })
        }
        game.getObj.call(this);
    },//将分数转换为图片显示
    /*-------------------------逻辑函数----------------------------*/
    update: function () {
        //由于固定速度看起来感觉不好，所以当判断鼠标按下或者抬起的时候，改为匀加速下降或者上升
        if (game.input.activePointer.isDown) {
            this.m_plane.body.velocity.y -= 3;
        }
        //由于固定速度看起来感觉不好，所以当判断鼠标按下或者抬起的时候，改为匀加速下降或者上升
        if (game.input.activePointer.isUp) {
            this.m_plane.body.velocity.y += 3;
        }
        //检测飞机与边界是否碰撞，如果碰撞执行函数gameOver
        game.physics.arcade.overlap(this.m_plane, this.boundarys, this.gameOver, null, this);
        //检测飞机与障碍物是否碰撞,如果碰撞执行函数gameOver
        game.physics.arcade.overlap(this.m_plane, this.m_Obstacle1s, this.gameOver, null, this);
        game.physics.arcade.overlap(this.m_plane, this.m_Obstacle2s, this.gameOver, null, this);
        //检测飞机与敌机是否相撞,如果碰撞执行函数gameOver
        game.physics.arcade.overlap(this.m_plane, this.m_Enemy1s, this.gameOver, null, this);
        game.physics.arcade.overlap(this.m_plane, this.m_Enemy2s, this.gameOver, null, this);
        game.physics.arcade.overlap(this.m_plane, this.m_Enemy3s, this.gameOver, null, this);
        //检测敌机是否与炮弹发生碰撞
        game.physics.arcade.overlap(this.m_plane, this.m_Enemy2Rockets, this.gameOver, null, this);
        game.physics.arcade.overlap(this.m_plane, this.m_Enemy3Rockets, this.gameOver, null, this);
        //检测炮弹与敌机碰撞,如果碰撞销毁敌机
        game.physics.arcade.overlap(this.m_Rockets, this.m_Enemy1s, this.enemyExplode, null, this);
        game.physics.arcade.overlap(this.m_Rockets, this.m_Enemy2s, this.enemyExplode, null, this);
        game.physics.arcade.overlap(this.m_Rockets, this.m_Enemy3s, this.enemyExplode, null, this);
        //如果游戏已经开始
        if (game.init.isStart) {
            //飞机发射子弹
            this.planeRocket();
            //创建障碍物
            this.createObstacle();
            //创建敌机
            this.createEnemy();
        }
    },//每帧执行
    render: function () {
        // if (this.m_plane) {
        //     game.debug.body(this.m_plane);
        // }
    },//测试等输出
    gameOver: function (plane, other) {
        clearInterval(game.setIntScore);
        if (other.key == 'enemyBullet1' || other.key == 'enemyBullet2') {
            other.kill();
        }
        //删除场景中内容
        this.m_Enemy1s.removeAll();
        this.m_Enemy2Rockets.removeAll();
        this.m_Enemy2s.removeAll();
        this.m_Enemy3Rockets.removeAll();
        this.m_Enemy3s.removeAll();
        this.m_Rockets.removeAll();
        //飞机销毁
        this.m_plane.kill();
        //创建爆炸动画
        var explode = game.add.sprite(this.m_plane.x + 40, this.m_plane.y + 30, 'explode');
        //设置爆炸动画
        var anim = explode.animations.add('explode');
        //播放动画（时间，是否循环，放完后是否销毁，true为销毁）
        anim.play(30, false, false);
        //给动画添加回调函数，播放完动画后跳转场景
        anim.onComplete.addOnce(function () {
            //直接从内存中删除对象，比kill更彻底一些
            explode.destroy();
            //清空场景中内容
            this.m_scoreImgs.removeAll();
            this.m_Enemy1s.removeAll();
            this.m_Enemy2s.removeAll();
            this.m_Enemy3s.removeAll();
            this.m_Enemy2Rockets.removeAll();
            this.m_Enemy3Rockets.removeAll();
            this.m_Obstacle1s.removeAll();
            this.m_Obstacle2s.removeAll();
            this.m_Rockets.removeAll();
            //跳转场景
            game.state.start('over');
            //尝试停止播放背景音乐
            try {
                this.background.stop();
                this.m_explode.stop();
            } catch (e) {
                console.log(e)
            }
        }, this);
        //尝试播放爆炸音效
        try {
            this.m_explode = game.add.audio('m_explode', 0.5, false);
            this.m_explode.play();
        } catch (e) {
            console.log(e);
        }
    },//飞机撞上炮弹或障碍或者出界(游戏结束)
    enemyExplode: function (rocket, enemy) {
        if (enemy.life && enemy.life > 0) {
            rocket.kill();
            enemy.life--;
            return;
        }
        rocket.kill();
        enemy.kill();
        //分数相加
        game.init.score++;
        //更改分数显示
        this.scoreTransform();
        //创建爆炸动画
        var explode = game.add.sprite(enemy.x + 40, enemy.y + 30, 'explode');
        //设置爆炸动画
        var anim = explode.animations.add('explode');
        //播放动画（时间，是否循环，放完后是否销毁，true为销毁）
        anim.play(30, false, true);
        //尝试播放爆炸音效
        try {
            this.m_explode = game.add.audio('m_explode', 0.5, false);
            this.m_explode.play();
        } catch (e) {
            console.log(e);
        }
    }//敌机销毁
};
//死亡，分数统计场景
game.MyStates.over = {
    //创建场景
    create: function () {
        game.MyStates.start.createMusic();
        game.add.image(0, 0, 'background_restart');
        this.createScore();
        var share_btn = game.add.button(game.width / 2 + 100, game.height - 150, 'share_btn', this.share, this, 0, 0, 1);
        share_btn.scale.setTo(0.1, 0.1);
        var restart_btn = game.add.button(game.width / 2 - 100, game.height - 150, 'restart_btn', this.restart, this, 0, 0, 1);
        restart_btn.scale.setTo(0.6, 0.6);
    },
    createScore: function () {
        this.scoreBG = game.add.sprite(game.width / 2 - 180, game.height / 2, 'score');
        this.scoreBG.scale.setTo(1.5, 1.5);
        this.m_scoreImgs = game.add.group();
        //现将分数转换为字符串
        this.scoreStr = game.init.score.toString();
        //将字符串转换为数组
        this.scoreArr = this.scoreStr.split('');
        //设定分数参数
        this.Obj = [];
        // 将数字与图片一一对应起来
        for (var i = 0; i < this.scoreArr.length; i++) {
            this.Obj.push({
                name: 's' + this.scoreArr[i],
                width: game.width / 2 + 110 + i * 50,
                height: game.height / 2,
                scaleX: 0.8,
                scaleY: 0.8,
                type: 'm_scoreImgs',
                isCheckWorldKill: false
            })
        }
        game.getObj.call(this);
        game.init.score = 0;

    },//创建分数相关内容
    update: function () {
    },
    restart: function () {
        game.MyStates.start.onStartClick();
    },//重新开始游戏
    share: function () {
        document.title = game.makeTitle(game.init.score);
        document.getElementById('share').style.display = 'block';
    }//分享游戏
};
//将游戏对象中的场景添加到舞台中,并绑定
game.state.add('boot', game.MyStates.boot);
game.state.add('load', game.MyStates.load);
game.state.add('start', game.MyStates.start);
game.state.add('play', game.MyStates.play);
game.state.add('over', game.MyStates.over);
//并且指定游戏一开始进入引导场景
game.state.start('boot');