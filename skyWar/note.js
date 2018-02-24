/**
 * Created by ZQZYDMO on 2017/10/9.
 */

/*
 * 打飞机游戏制作教程
 * */

/*
 * 第一步 --->图一
 * 首先创建对应项目结构文件夹与文件
 * assets
 *     游戏所需要的资源文件（图片，音频等，根据个人需要在细分）
 * images
 *     页面中需要的一些图片资源
 * js
 *     Phaser.min.js  --->游戏引擎插件
 *     main.js    --->主要游戏逻辑
 * index.html   --->首页
 * */

/*
 * 第二步 --->图二
 * 导入插件与游戏逻辑文件
 * 创建div
 * */

/*
 * 第三步 --->图三
 * 根据游戏需求在main中创建游戏对象，设定游戏分辨率，渲染器，并且绑定到div中
 * 然后在游戏对象上创建场景对象，一般场景邮箱有五个类型
 * boot引导场景--->最初加载条等资源加载
 * load加载场景--->加载游戏所需所有西苑的场景
 * start开始场景--->一般游戏的开始界面
 * play进行中场景--->一般游戏进行中场景，可以有多个
 * over死亡场景--->一般进行重新开始，分享，计分等功能
 * */

/*
 * 第四步 --->图四
 * Phaser中每个舞台常用的官方function有四个
 * preload --->将所有资源加载到页面中，一般在load场景中进行
 * create --->加载到场景中
 * update --->每帧执行，主要是进行游戏逻辑
 * render --->一般各种调试在此函数中
 * 设置引导场景加载进度条图片
 * 判断是否为手机登录，手机登录就全屏，然后跳转到加载资源场景
 * */

/*
 * 第五步 --->图五
 * 在加载资源场景中的preload函数中添加所有资源
 * game.load.image --->加载静态图片资源
 * game.load.spritesheet --->加载序列帧图片
 * game.load.audio --->加载声音
 * */

/*
 * 第六步 --->图六
 * 首先定义用来盛放加载进度文字，
 * 然后设定文字位置，样式等
 * game.add.text
 * 然后给game.load设定一个回调函数，每加载一次资源回调一次，修改进度文字
 * game.load.onFileComplete.add(function () {console.log(arguments);}, this);
 * 在加载完成后跳到开始场景
 * 因为在phaser中一些函数有固定的执行顺序，prolode->create->update->render
 * 所以直接在create函数中写跳转场景就好了
 * */

/*
 * 第七步 --->图七
 * 游戏开始场景
 * 在场景中加载背景，加载飞机，设置飞机动画，播放飞机动画，设置飞机大小
 * game.add.image(x,y,key);
 * m_plane.animations.add('随便设置个key');
 * m_plane.animations.play('key', 帧速率, 是否循环);
 * m_plane.scale.setTo(x缩放, y缩放);
 * 加载声音，因为声音有可能因为不同解码问题导致无法播放，所以使用try，这样即使声音无法播放也不会影响游戏
 * this.startBackground = game.add.audio(key,音量，是否循环)
 * this.startBackground.play();
 * this.startBackground.stop();
 * 设置点击屏幕游戏开始
 * game.input.onUp.add(function () {}, this);
 * */

/*
 * 第八步 --->图八
 * 进入到游戏中场景，首先开启世界的碰撞器，加载背景声音飞机资源
 * game.physics.startSystem(Phaser.Physics.ARCADE); --->开启ACRCADE碰撞器
 * this.background = game.add.tileSprite(0, 0, game.width, game.height, 'background'); --->平铺方式加载背景图
 * this.background.autoScroll(x方向速度, y方向速度);
 * 给飞机添加碰撞
 * game.physics.arcade.enable(this.m_plane);
 * 设置飞机飞到固定位置的动画
 * var tween = game.add.tween(飞机).to({x位置，y位置}, 时间, 动画类型, 自动播放);
 * 动画播放完后执行回调函数
 * tween.onComplete.add(this.onStart,this);
 * */

/*
 * 第九步 --->图九
 * 回调函数内容，或者说播放完动画后执行的逻辑
 * 首先飞机自动往下落，然后当点击屏幕的时候飞机上升
 * game.input.onDown.add(function(){})
 * game.input.onUp.add(function(){})
 * 但是直上直下的匀速下落上升给人感觉不好，所以在update中加上如果点击那么下降或者上升速度++
 * */

/*
 * 第十步 --->图十，图十-1
 * 首先给飞机添加碰撞边界检测
 * this.m_plane.checkWorldBounds = true;
 * 然后给飞机添加碰撞边界后执行的回调函数
 * this.m_plane.events.onOutOfBounds.add(this.alienOut, this);
 * 添加回调函数
 * alienOut:function () {
 * console.log('出界了，需要删除了')
 *  }
 * */

/*
 * 第十步 --->图十
 * 因为一条规则为当飞机碰触屏幕的时候算失败，并且跳转场景，因为直接使用对象超出游戏对象的碰撞检测存在一些问题，所以使用另一种方法实现，即（人为设置世界边框）在游戏世界外放置一个对象，当检测到飞机碰撞到对象后销毁飞机
 * 首先创建边界组
 * this.boundarys = game.add.group();
 * 设置组中两个元素的位置，然后创建边界，，给边界添加碰撞
 * 效果图查看图十-1，
 * 在update中添加飞机与边界的碰撞检测，碰撞后执行函数alienOut，图十-2
 * game.physics.arcade.overlap(this.m_plane, this.boundarys, this.alienOut, null, this);
 * 当飞机碰撞到边界时，需要执行，飞机炸毁，播放爆炸动画，播放爆炸音效
 * 然后当动画执行完毕后停止播放背景音，停止爆炸音效，跳转到计分场景
 * 当功能测试完毕的时候可以将两个边界线调整下位置调整到游戏场景外这样给人感觉飞机出了边界后爆炸，实际是撞上了边界线
 * */

/*
 * 第十一步 --->图十一
 * 继续丰富场景，设置障碍的创建
 * 
 * 
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/*
 * 第五步 --->图五
 * */


/**/
/**/
/**/