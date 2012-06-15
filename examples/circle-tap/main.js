/*
 * phi
 */


var app = null;

// 定数
var SCREEN_WIDTH    = 480;
var SCREEN_HEIGHT   = 720;
var CIRCLE_RADIUS   = 5;
var CIRCLE_NUM      = 100;
var TAP_RANGE       = 150;

var Circle = tm.createClass({
    superClass: tm.app.Sprite,
    
    init: function(color) {
        this.superInit(CIRCLE_RADIUS+15, CIRCLE_RADIUS+15);
        
        this.v          = tm.geom.Vector2.random(0, 360, tm.util.Random.randfloat(4, 8));
        this.radius     = CIRCLE_RADIUS;
        this.fillStyle  = color;
        this.alpha      = 0.75;
        
        this.canvas.fillStyle = color;
        this.canvas.setTransformCenter();
        this.canvas.fillCircle(0, 0, this.radius);
        this.canvas.strokeStyle = "white";
        this.canvas.lineWidth = 2;
        this.canvas.strokeCircle(0, 0, this.radius+1);
    },
    
    update: function() {
        this.position.add(this.v);
        
        var left   = this.radius;
        var right  = SCREEN_WIDTH-this.radius;
        var top    = this.radius;
        var bottom = SCREEN_HEIGHT-this.radius;
        
        if      (left   > this.x) { this.x = left;   this.v.x*=-1; }
        else if (right  < this.x) { this.x = right;  this.v.x*=-1; }
        if      (top    > this.y) { this.y = top;    this.v.y*=-1; }
        else if (bottom < this.y) { this.y = bottom; this.v.y*=-1; }
    },
    
    disappear: function() {
        this.update = function() {};
        var duration = tm.util.Random.randint(500, 1500);
        this.animation.move(0, -150, duration).scale(4, duration).fadeOut(duration);
    },
    
    onanimationend: function() {
        this.remove();
    },
    
});

var MainScene = tm.createClass({
    superClass: tm.app.Scene,
    
    init: function(color) {
        this.superInit();
        
        this.interaction.eanbled = true;
        this.circleList = [];
        
        for (var i=0; i<CIRCLE_NUM; ++i) {
            var circle = Circle( "hsla({0}, 75%, 50%, 0.75)".format(Math.rand(0, 360)) );
            circle.setPosition(tm.util.Random.randint(CIRCLE_RADIUS, SCREEN_WIDTH-CIRCLE_RADIUS), tm.util.Random.randint(CIRCLE_RADIUS, SCREEN_HEIGHT-CIRCLE_RADIUS));
            circle.addChildTo(this);
            this.circleList.push(circle);
        }
        
        app.frame = 0;
        app.score = 0;
    },
    
    update: function(app) {
        var p = app.pointing;
        
        if (p.getPointingStart()) {
            tm.sound.SoundManager.get("touch").play();
            for (var i=0,len=this.circleList.length; i<len; ++i) {
                var circle = this.circleList[i];
                var d = tm.geom.Vector2.distanceSquared(p.position, circle.position);
                if (d < TAP_RANGE*TAP_RANGE) {
                    app.score += 100;
                    circle.disappear();
                }
                circle.update = function() {};
            }
            this.update = this.wait;
            app.frame = 0;
        };
    },
    
    wait: function() {
        if (app.frame > 120) { app.replaceScene(EndScene()); }
        
        app.frame+=1;
    },
    
    onblur: function() {
        app.pushScene(PauseScene());
    }
    
});

var StartScene = tm.createClass({
    superClass: tm.app.Scene,
    
    init: function(color) {
        this.superInit();
        
        
        for (var i=0; i<20; ++i) {
            this.circle = Circle( "hsla({0}, 75%, 50%, 0.5)".format(Math.rand(0, 360)) );
            this.circle.setPosition(tm.util.Random.randint(40, SCREEN_WIDTH-40), tm.util.Random.randint(40, SCREEN_HEIGHT-40));
            this.circle.addChildTo(this);
        }
        this.addChild( tm.prim.RectSprite(SCREEN_WIDTH, SCREEN_HEIGHT, "rgba(0, 0, 0, 0.75)") );
        
        var label = null;
        
        label = tm.app.Label("Circle Tap");
        label.position.set(SCREEN_WIDTH/2, SCREEN_HEIGHT/2-150);
        label.fontSize  = 70;
        label.width = SCREEN_WIDTH;
        label.color = "white";
        label.align = "center";
        label.baseline = "middle";
        label.addChildTo(this);
        
        label = tm.app.LabelButton("Start").addChildTo(this);
        label.position.set(SCREEN_WIDTH/2, SCREEN_HEIGHT/2+150);
        label.fontSize  = 40;
        label.width = 140;
        label.shadowColor = "#00f";
        label.shadowBlur   = 16;
        label.onpointingstart = function() {
            this.dispatchEvent(tm.event.Event("startbuttondown"));
        }.bind(this);
        
        var tmlibIconButton = tm.app.IconButton( tm.graphics.TextureManager.get("tmlibIcon") );
        tmlibIconButton.setPosition(SCREEN_WIDTH-80, SCREEN_HEIGHT-80).setSize(100, 100);
        tmlibIconButton.onpointingend = function() { window.open("https://github.com/phi1618/tmlib.js", "_self"); };
        tmlibIconButton.addChildTo(this);
        
        var blogIconButton = tm.app.IconButton( tm.graphics.TextureManager.get("blogIcon") );
        blogIconButton.setPosition(SCREEN_WIDTH-80-120, SCREEN_HEIGHT-80).setSize(100, 100);
        // blogIconButton.onpointingend = function() { window.open("http://tmlife.net", "_self"); };
        blogIconButton.onpointingend = function() { window.open("http://tmlife.net", "_self"); };
        blogIconButton.addChildTo(this);
        
        var fadein = tm.fade.FadeIn(SCREEN_WIDTH, SCREEN_HEIGHT, "#fff", 2000);
        fadein.blendMode = "lighter";
        this.addChild( fadein );
    },
    
    onstartbuttondown: function() {
        tm.sound.SoundManager.get("decide").play();
        
        this.addChild( tm.fade.FadeOut(
            SCREEN_WIDTH, SCREEN_HEIGHT, "#000", 500, function() {
                app.replaceScene(MainScene());
            })
        );
    },
    
    onblur: function() {
        app.pushScene(PauseScene());
    }
    
});


var EndScene = tm.createClass({
    superClass: tm.app.Scene,
    
    init: function(color) {
        this.superInit();
        
        
        for (var i=0; i<20; ++i) {
            this.circle = Circle( "hsla({0}, 75%, 50%, 0.5)".format(Math.rand(0, 360)) );
            this.circle.setPosition(tm.util.Random.randint(40, SCREEN_WIDTH-40), tm.util.Random.randint(40, SCREEN_HEIGHT-40));
            this.circle.addChildTo(this);
        }
        this.addChild( tm.prim.RectSprite(SCREEN_WIDTH, SCREEN_HEIGHT, "rgba(0, 0, 0, 0.75)") );
        
        
        var label = null;
        label = tm.app.Label("Score");
        label.position.set(SCREEN_WIDTH/2, 300);
        label.fontSize = 60;
        label.width = SCREEN_WIDTH;
        label.color = "white";
        label.align = "center";
        label.addChildTo(this);
        
        label = tm.app.Label(app.score+"");
        label.position.set(SCREEN_WIDTH/2, 390);
        label.fontSize = 60;
        label.width = SCREEN_WIDTH;
        label.color = "white";
        label.align = "center";
        label.addChildTo(this);
        
        
        // tweet
        var msg = "『{title}』\nScore : {score}\n{msg}\n{url}\n#{hash0} #{hash1}".format({
            title: document.title,
            score: app.score,
            msg: "遊んでくれてありがとう♪",
            url: "https://github.com/phi1618/tmlib.js",
            hash0: "circletap",
            hash1: "tmlibjs",
        });
        var url = tm.social.Twitter.createURL({
            type: "tweet",
            text: msg,
            url : "https://github.com/phi1618/tmlib.js",
        });
        var tweetButton = tm.app.iPhoneButton(150, 50, "blue", "Tweet").addChildTo(this);
        tweetButton.setPosition(SCREEN_WIDTH/2, 470);
        tweetButton.onpointingstart = function() {
            window.open(url, "_self");
        };
        
        
        // back button
        var backButton = tm.app.LabelButton("Back Title").addChildTo(this);
        backButton.setPosition(SCREEN_WIDTH-100, SCREEN_HEIGHT-50).setSize(150, 50);
        backButton.onpointingstart = function() {
            this.dispatchEvent(tm.event.Event("backbuttondown"));
        }.bind(this);
        
        
        // フェード
        this.addChild( tm.fade.FadeIn( SCREEN_WIDTH, SCREEN_HEIGHT, "#000", 1000) );

    },
    
    onbackbuttondown: function() {
        tm.sound.SoundManager.get("decide").play();
        
        var fadeout = tm.fade.FadeOut(SCREEN_WIDTH, SCREEN_HEIGHT, "#fff", 500, function() {
            app.replaceScene(StartScene());
        });
        fadeout.blendMode = "lighter";
        this.addChild( fadeout );
    },
    
    _onpointingstart: function() {
        tm.sound.SoundManager.get("decide").play();
        
        var fadeout = tm.fade.FadeOut(SCREEN_WIDTH, SCREEN_HEIGHT, "#fff", 500, function() {
            app.replaceScene(StartScene());
        });
        fadeout.blendMode = "lighter";
        this.addChild( fadeout );
    },
    
    onblur: function() {
        app.pushScene(PauseScene());
    }
    
});

var PauseScene = tm.createClass({
    superClass: tm.app.Scene,
    
    init: function(color) {
        this.superInit();
        this.interaction;
        
        var filter = tm.app.Sprite(SCREEN_WIDTH, SCREEN_HEIGHT);
        filter.setPosition(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
        filter.canvas.clearColor("rgba(0, 0, 0, 0.75)");
        this.addChild(filter);
        
        app.stop();
        tm.sound.SoundManager.get("main_bgm").pause();
    },
    
    onfocus: function() {
        app.start();
    },
    
    onblur: function() {
        app.stop();
    },
    
    onpointingstart: function() {
        tm.sound.SoundManager.get("main_bgm").play();
        app.popScene();
    },
});

tm.preload(function() {
    tm.graphics.TextureManager.add("tmlibIcon", "data:image/png;base64,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");
    tm.graphics.TextureManager.add("blogIcon", "data:image/png;base64,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");
    /*
    tm.graphics.TextureManager.add("tmlibIcon", "../logo/icon.png");
    tm.graphics.TextureManager.add("blogIcon", "../logo/blog-icon.png");
    */
    
    tm.sound.SoundManager.add("main_bgm", "http://storage.tmlife.net/resource/bgm/maoudamashii/bgm_maoudamashii_healing02.wav", 1);
    tm.sound.SoundManager.add("touch", "touch");
    tm.sound.SoundManager.add("decide", "decide");
});

tm.main(function() {
    app = tm.app.CanvasApp("#world");
    app.fps = 30;
    app.fitWindow();
    app.enableStats();
    
    tm.sound.SoundManager.get("main_bgm").loop = true;
    tm.sound.SoundManager.get("main_bgm").play();
    
    var startScene = StartScene();
    app.replaceScene(startScene);
    
    app.run();
});





