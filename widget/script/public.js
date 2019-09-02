/*============================== 数据 存储  偏好 设置  ============================*/

//.设置存储
function SetStorage(key, value) {
    $api.setStorage(key, value);
}

//.获取存储
function GetStorage(key) {
    return $api.getStorage(key);
}

//.移除存储
function RmStorage(key) {
    return $api.rmStorage(key);
}

//.清除全部缓存
function ClearStorage() {
    $api.clearStorage();
    Toast('初始化成功！');
}

//.设置偏好设置
function SetPrefs(key, value, _call) {
    api.setPrefs({
        key: key,
        value: value
    }, function(ret, err) {
        var v = ret.value;
        if (typeof _call == "function") {
            _call();
        }
    });
}

//.获取偏好设置
function GetPrefs(key, _call) {
    api.getPrefs({
        key: key
    }, function(ret, err) {
        var v = ret.value;
        if (typeof _call == "function") {
            _call(v);
        }
    });
}

//.移除偏好设置
function RemovePrefs(key, _call) {
    api.removePrefs({
        key: key
    }, function(ret, err) {
        var v = ret.value;
        if (typeof _call == "function") {
            _call();
        }
    });
}

function confirmPer(perm) {
    var has = hasPermission(perm);
    console.log(JSON.stringify(has));
    if (has[0].granted == false) {
        reqPermission(perm);
        /*    api.confirm({
                title: '提醒',
                msg: '没有获得 ' + perm + " nnnnnnnn权限\n是否前往设置？",
                buttons: ['去设置', '取消']
            }, function(ret, err) {
                if (1 == ret.buttonIndex) {
                    reqPermission(perm);
                }
            });*/
        return false;
    }
    return true;
}

function hasPermission(one_per) {
    var perms = new Array();
    perms.push(one_per);
    var rets = api.hasPermission({
        list: perms
    });
    return rets;
}

function reqPermission(one_per, callback) {
    var perms = new Array();
    perms.push(one_per);
    api.requestPermission({
        list: perms,
        code: 1
    }, function(ret, err) {
        console.log(JSON.stringify(callback));
        if (callback) {
            callback(ret);
            return;
        }
        console.log(JSON.stringify(ret.never));
    });
}

function HasPermission() {
    var resultList = api.hasPermission({
        list: ['storage', 'camera', 'photos', 'microphone', 'notification', 'location']
    });

    if (!resultList[0].granted || !resultList[1].granted || !resultList[2].granted || !resultList[3].granted || !resultList[4].granted || !resultList[5].granted) {
        api.requestPermission({
            list: ['storage', 'photos'],
            code: 1
        }, function(ret, err) {

        });
    }
}
//=============================== 广播  监听 跨窗口执行脚本  ============================

//.广播事件
function SendEvent(eventName, extra) {
    var _extra = (typeof arguments[1] == "undefined" || arguments[1] == null) ? {} : arguments[1];
    api.sendEvent({
        name: eventName,
        extra: _extra
    });
}

//.监听事件
function AddEventListener(eventName, _call, extra) {
    var _extra = (typeof arguments[2] == "undefined" || arguments[2] == null) ? {} : arguments[2];
    api.addEventListener({
        name: eventName,
        extra: _extra
    }, function(ret, err) {
        if (typeof _call == "function") {
            _call(ret);
        }
    });
}
/************ 判断用户登录 ****************/
//.去登录 //.修改密码

function GoLogin() {
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: 'login',
        url: 'widget://html/common/common.html',
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
        pageParam: {
            url: 'widget://html/user/login.html',
            title: '登录'
        },
    });
}
//.修改密码
function GoPwd() {
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: 'pwd',
        url: 'widget://html/common/common.html',
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
        pageParam: {
            url: 'widget://html/user/pwd.html',
            title: '修改密码 '
        },
    });
}
//.去注册
function GoReg() {
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: 'reg',
        url: 'widget://html/common/common.html',
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
        pageParam: {
            url: 'widget://html/user/reg.html',
            title: '登录'
        },
    });
}
//打开弹窗
function buyalert() {
    console.log('打开弹窗');
    api.openFrame({
        name: 'buyalert',
        url: 'widget://html/alert/buyalert.html',
        vScrollBarEnabled: false,
        bgColor: 'rgba(0,0,0,0.0)',
        bounces: false,
        rect: {
            x: 0,
            y: 140,
            w: api.winWidth / 1.7,
            h: 30
        },
    });
}
//=============================== UI 界面  载入  刷新  加载  ============================

//.重载页面
function RefreshPage() {
    window.location.reload();
}

//可消失的提示信息
function Toast(text, duration, location) {
    api.toast({
        msg: text,
        duration: duration,
        location: location
    });
}

//带一个按纽的对话框
function Alert(text, title) {
    api.alert({
        msg: text,
        title: title
    });
}

//.弹出带按钮对话框
function OpenDialog(type, msg) {
    var dialog = new Dialog();
    dialog.alert({
        title: "提示信息",
        msg: msg,
        buttons: ['取消', '确定']
    }, function(ret) {
        if (ret.buttonIndex == 2) { //.确认退出
            switch (type) {
                case 'logout':
                    { //.用户退出
                        logout();
                    }
                    break;
                default:
                    break;
            }
        }
    })
}

//.更改按钮状态
function ChangeBtn(type) {
    switch (type) {
        case 'status':
            $api.addCls($api.dom('.btnok'), 'none');
            $api.removeCls($api.dom('.btn'), 'none');
            break;
        case 'err':
            $api.addCls($api.dom('.btn'), 'none');
            $api.removeCls($api.dom('.btnok'), 'none');
            break;
        default:
            break;
    }
}

//=============================== PHP IP 时间相关设置  ============================
//var city = return CitySN["cip"]+','+return CitySN["cname"]; //定义城市IP
//var ip = return CitySN["cip"];	//定义IP
//var cname = return CitySN["cname"];	//定义城市

//.处理时间日期函数
var date = new Date(); //当前时间
var year = date.getFullYear(); //年
var month = date.getMonth() + 1; //月
var day = date.getDate(); //日
var hour = date.getHours(); //时
var minute = date.getMinutes(); //分
var second = date.getSeconds(); //秒
var timestamp = Date.parse(new Date()) / 1e3; //当前时间戳 精确到秒
//时间戳转换为格式时间   完整格式:yyyy-MM-dd h:m:s
/** 获取当前时间 格式：yyyy-MM-dd HH:MM:SS , y-m-d h-i-s*/
var datetime = GetDatetime('Y-m-d H:i:s', timestamp);

function GetDatetime(format, timestamp) {
    var a, jsdate = ((timestamp) ? new Date(timestamp * 1000) : new Date());
    var pad = function(n, c) {
        if ((n = n + "").length < c) {
            return new Array(++c - n.length).join("0") + n;
        } else {
            return n;
        }
    };
    var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var txt_ordin = {
        1: "st",
        2: "nd",
        3: "rd",
        21: "st",
        22: "nd",
        23: "rd",
        31: "st"
    };
    var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var f = {
        // Day
        d: function() {
            return pad(f.j(), 2)
        },
        D: function() {
            return f.l().substr(0, 3)
        },
        j: function() {
            return jsdate.getDate()
        },
        l: function() {
            return txt_weekdays[f.w()]
        },
        N: function() {
            return f.w() + 1
        },
        S: function() {
            return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th'
        },
        w: function() {
            return jsdate.getDay()
        },
        z: function() {
            return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0
        },
        // Week
        W: function() {
            var a = f.z(),
                b = 364 + f.L() - a;
            var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;
            if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
                return 1;
            } else {
                if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
                    nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
                    return date("W", Math.round(nd2.getTime() / 1000));
                } else {
                    return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
                }
            }
        },
        // Month
        F: function() {
            return txt_months[f.n()]
        },
        m: function() {
            return pad(f.n(), 2)
        },
        M: function() {
            return f.F().substr(0, 3)
        },
        n: function() {
            return jsdate.getMonth() + 1
        },
        t: function() {
            var n;
            if ((n = jsdate.getMonth() + 1) == 2) {
                return 28 + f.L();
            } else {
                if (n & 1 && n < 8 || !(n & 1) && n > 7) {
                    return 31;
                } else {
                    return 30;
                }
            }
        },

        // Year
        L: function() {
            var y = f.Y();
            return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0
        },
        //o not supported yet
        Y: function() {
            return jsdate.getFullYear()
        },
        y: function() {
            return (jsdate.getFullYear() + "").slice(2)
        },

        // Time
        a: function() {
            return jsdate.getHours() > 11 ? "pm" : "am"
        },
        A: function() {
            return f.a().toUpperCase()
        },
        B: function() {
            // peter paul koch:
            var off = (jsdate.getTimezoneOffset() + 60) * 60;
            var theSeconds = (jsdate.getHours() * 3600) + (jsdate.getMinutes() * 60) + jsdate.getSeconds() + off;
            var beat = Math.floor(theSeconds / 86.4);
            if (beat > 1000) beat -= 1000;
            if (beat < 0) beat += 1000;
            if ((String(beat)).length == 1) beat = "00" + beat;
            if ((String(beat)).length == 2) beat = "0" + beat;
            return beat;
        },
        g: function() {
            return jsdate.getHours() % 12 || 12
        },
        G: function() {
            return jsdate.getHours()
        },
        h: function() {
            return pad(f.g(), 2)
        },
        H: function() {
            return pad(jsdate.getHours(), 2)
        },
        i: function() {
            return pad(jsdate.getMinutes(), 2)
        },
        s: function() {
            return pad(jsdate.getSeconds(), 2)
        },
        //u not supported yet
        // Timezone
        //e not supported yet
        //I not supported yet
        O: function() {
            var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
            if (jsdate.getTimezoneOffset() > 0) t = "-" + t;
            else t = "+" + t;
            return t;
        },
        P: function() {
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2))
        },
        //T not supported yet
        // Full Date/Time
        c: function() {
            return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P()
        },
        //r not supported yet
        U: function() {
            return Math.round(jsdate.getTime() / 1000)
        }
    };
    return format.replace(/[/]?([a-zA-Z])/g, function(t, s) {
        if (t != s) {
            // escaped
            ret = s;
        } else if (f[s]) {
            // a date function exists
            ret = f[s]();
        } else {
            // nothing special
            ret = s;
        }
        return ret;
    });
}
//=============================== 字符串处理  ============================//
//.生成随机字符串
function GetSalt() {
    //.字典
    var key = "0182157835976678656982176857273952108526536";
    var size = 10,
        salt = "";
    for (var i = 0; i < size; i++) {
        var rand = Math.floor(Math.random() * key.length);
        salt += key.charAt(rand);
    }
    return salt;
}
//=============================== 基础框架  ============================

//.统一打开新窗口
function developing() {
    Toast('攻城狮正在埋头苦干');
}

//.打开新窗口
function LoadNewWin(WinName, pageParamData) {
    //延时渲染 IOS有效
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    //适用全部打开新窗口操作
    api.openWin({
        name: WinName,
        url: 'widget://html/PublicWin.html',
        pageParam: pageParamData,
        bounces: false,
        vScrollBarEnabled: false,
        hScrollBarEnabled: false,
        reload: true,
        delay: delay
    });
}

//关闭窗口
function CloseWin() {
    api.closeWin();
}
//关闭子窗口
function CloseFrame() {
    api.closeFrame();
}
// 关闭当前窗口到新的窗口
function CloseToWin(name) {
    api.closeToWin({
        name: name,
        animation: {
            type: 'movein',
            subType: 'from_left',
            duration: 300
        }
    });
}

//关闭所有窗口回到首页
function closeToWin() {
    api.closeToWin({
        name: 'root'
    });
}

//===============APP 处理==================//
//自动检测更新
function autoupdate() {
    console.warn('自动检测更新');
    var appdata = GetStorage('appdata');
    if (!appdata) {
        Toast('连接服务器中');
        getapp();
    } else {
        api.ajax({
                url: appdata.pgyer_url + '/check?_api_key=' + appdata.api_key + '&appKey=' + appdata.appKey, //蒲公英版本更新接口
                method: 'post',
                timeout: 5,
                dataType: 'json',
            },
            function(ret, err) {
                if (ret.data) {
                    var data = ret.data;
                    var Ver = (ret.data.buildVersion).substr(2);
                    var ver = (api.appVersion).substr(2);
                    console.warn(Ver + '<=>' + ver);
                    if (Ver > ver) {
                        updateBox(data);
                    }
                }
            });
    }
}

//设置检测更新
function setupdate() {
    console.warn('自动检测更新=>手动');
    var appdata = GetStorage('appdata');
    if (!appdata) {
        Toast('连接服务器中');
    } else {
        api.ajax({
                url: appdata.pgyer_url + '/check?_api_key=' + appdata.api_key + '&appKey=' + appdata.appKey, //蒲公英版本更新接口
                method: 'post',
                timeout: 5,
                dataType: 'json',
            },
            function(ret, err) {
                if (ret.data) {
                    var version = ret.data.buildVersion;
                    var Ver = (ret.data.buildVersion).substr(2);
                    var ver = (api.appVersion).substr(2);
                    console.warn(Ver + '<=>' + ver);
                    if (Ver > ver) {
                        $api.byId("ver").innerText = '有新版本：' + version;
                    }
                } else {
                    Toast('暂无更新');
                }
            });
    }
}
//更新APP
function handupdate() {
    var appdata = GetStorage('appdata');
    if (!appdata) {
        Toast('连接服务器中');
    } else {
        api.ajax({
                url: appdata.pgyer_url + '/check?_api_key=' + appdata.api_key + '&appKey=' + appdata.appKey, //蒲公英版本更新接口
                method: 'post',
                timeout: 5,
                dataType: 'json',
            },
            function(ret, err) {
                if (ret.data) {
                    var Ver = (ret.data.buildVersion).substr(2);
                    var ver = (api.appVersion).substr(2);
                    console.warn(Ver + '<=>' + ver);
                    if (Ver > ver) {
                        update();
                    } else {
                        Toast('暂无更新');
                    };
                }
            });
    }
}
//更新确认窗口
function updateBox(data) {
    var dialogBox = api.require('dialogBox');
    dialogBox.alert({
        texts: {
            title: '更新提示',
            content: 'app有最新版本：' + data.buildVersion + '\n' + '应用更新说明：\n' + data.buildUpdateDescription, //+ '\n'+,
            leftBtnTitle: '取消升级',
            rightBtnTitle: '立即升级',
        },
        styles: {
            bg: '#fff',
            corner: 10,
            w: 300,
            title: {
                marginT: 20,
                icon: 'widget://image/update.png',
                iconSize: 40,
                titleSize: 20,
                titleColor: '#FF1F63'
            },
            content: {
                color: '#000',
                size: 16
            },
            left: {
                marginB: 7,
                marginL: 20,
                w: 100,
                h: 35,
                corner: 15,
                bg: '#07DC00',
                color: '#FFF',
                size: 16
            },
            right: {
                marginB: 7,
                marginL: 60,
                w: 100,
                h: 35,
                corner: 15,
                bg: '#FFA445',
                color: '#FFF',
                size: 16
            }
        }
    }, function(ret) {
        if (ret.eventType == 'left') {
            dialogBox.close({
                dialogName: 'alert'
            });
        } else if (ret.eventType == 'right') {
            update();
        }
        dialogBox.close({
            dialogName: 'alert'
        });
    });
}

//打开更新页面
function update() {
    api.openFrame({
        name: 'update',
        url: 'widget://html/alert/update.html',
        vScrollBarEnabled: false,
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        bgColor: 'rgba(0,0,0,0.4)',
        bounces: false
    });
}
/*********************************************/
function setstartlogo() {
    var serverurl = GetStorage('serverurl');
    api.ajax({
        url: serverurl + '/api/user/sorts?name=logo', //广告图API接口链接
        method: 'get',
        timeout: 5,
    }, function(ret, err) {
        if (ret.code == 1) {
            var len = ret.data.length;
            var random = parseInt(Math.random() * len);
            console.warn('插屏广告启动,获取启动画面资源：' + random + '号');
            var picurl = ret.data[random].image;
            //    Alert(picurl);
            SetStorage('picurl', picurl);
        } else if (ret.code == 0) {
            RmStorage('picurl');
            console.log('清除启动画面');
        } else {
            RmStorage('picurl');
            console.log('清除启动画面');
        }
    });
}
//移除启动画面
function removelv() {
    api.removeLaunchView();
    console.warn('启动画面关闭');
}

//打开插屏页面
function openwin_launch(url) {
    console.log('正在打开插屏广告');
    api.openWin({
        //  bgColor: 'widget://image/launch.png',
        name: 'startadvert',
        url: 'widget://html/guide/startadvert.html',
        vScrollBarEnabled: false,
        bounces: false,
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        animation: {
            type: "none", //动画类型（详见动画类型常量）
            duration: 100 //动画过渡时间，默认300毫秒
        },
        pageParam: {
            picurl: url
        },
    });
}

//短链链接转换
function shorturl() {
    var serverurl = GetStorage('serverurl');
    var inviteinfo = GetStorage('inviteinfo');
    var appdata = GetStorage('appdata');
    var url = encodeURI(appdata.appurl);
    api.ajax({
        url: serverurl + '/api/index/shorturl?url=' + url + '&invite=' + inviteinfo.invite,
        method: 'get',
    }, function(ret, err) {
        if (ret.code == 1) {
            // Alert(ret);
            var appurl = ret.data.shorturl;
            SetStorage('appurl', appurl);
            console.warn('生成分享短链成功 ' + appurl);
        } else {
            SetStorage('appurl', appdata.appurl);
            //  RmStorage('serverurl');
            //  getServer();
        }
    });
}
/*-----------------淘宝MD5算法加密-----------------*/
function tb_MD5(param) {
    var mediadata = GetStorage('mediadata');
    var array = new Array(); // 对参数名进行字典排序
    for (var key in param) {
        array.push(key);
    }
    array.sort(); // 拼接有序的参数名-值串
    var paramArray = new Array();
    paramArray.push(mediadata.app_secret);
    for (var index in array) {
        var key = array[index];
        paramArray.push(key + param[key]);
    }
    paramArray.push(mediadata.app_secret);
    var shaSource = paramArray.join(""); // MD5编码，并转换成大写，即可获得签名
    var sign = new String(md5(shaSource)).toUpperCase();
    return sign;
}

//拼多多MD5算法加密
function pdd_MD5(param) {
    var mediadata = GetStorage('mediadata');
    var array = new Array(); // 对参数名进行字典排序
    for (var key in param) {
        array.push(key);
    }
    array.sort();
    var paramArray = new Array(); // 拼接有序的参数名-值串
    paramArray.push(mediadata.client_secret);
    for (var index in array) {
        var key = array[index];
        paramArray.push(key + param[key]);
    }
    paramArray.push(mediadata.client_secret);
    var shaSource = paramArray.join(""); // MD5编码，并转换成大写，即可获得签名
    var sign = new String(md5(shaSource)).toUpperCase();
    return sign;
}
