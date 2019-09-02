//APP配置
var yesapi_app_key = "45228839C354F4AAB9C927C81E474397"; //小白app_key
var appconfig = {
    "packageName": "com.keeper11.ced",
    "yesapi_one": "http://hn216.api.okayapi.com/?app_key=" + yesapi_app_key + "&s=App.Table.FreeFindOne&model_name=", //小白一条数据接口
    "yesapi_many": "http://hn216.api.okayapi.com/?app_key=" + yesapi_app_key + "&s=App.Table.FreeQuery&model_name=", //小白多条数据接口
    "tbkurl": "https://uland.taobao.com/coupon/edetail?activityId=" //优惠券二合一链接
};
//字段条件封装
function where(field, value) {
    var where = 'where=[["' + field + '","=","' + value + '"]]';
    return where;
}
//获取全局变量
var serverurl = GetStorage('serverurl'); //域名配置
var p_inviteinfo = GetStorage('p_inviteinfo'); //上级邀请码配置
var inviteinfo = GetStorage('inviteinfo'); //本级邀请码配置
var userinfo = GetStorage('userinfo'); //手机用户配置

var pinvite = GetStorage('pinvite'); //判断登录后分配的邀请码配置
var appdata = GetStorage('appdata'); //APP配置
var commondata = GetStorage('commondata'); //公共配置
var commissiondata = GetStorage('commissiondata'); //淘宝帐号授权配置
var mediadata = GetStorage('mediadata'); //淘宝推广媒体KEY



//第一次请求参数
function config() {
    var timestamp = Date.parse(new Date()) / 1e3; //当前时间戳 精确到秒
    if (!GetStorage('times') || GetStorage('times') < timestamp) {
        var datetime = GetDatetime('Y-m-d H:i:s', timestamp)
        console.log('重新获取公共配置' + datetime);
        //  getcommon(); //公共配置
        //  getapp(); //获取APP配置
        SetStorage('times', timestamp + 1800);
    }
    getServer();
}

//选择服务器地址
function getServer() {
    var field = 'packageName';
    var value = appconfig.packageName.split(".")[2];
    console.warn('当前服务器域名' + GetStorage('serverurl'));
    if (!GetStorage('serverurl')) {
        api.ajax({
            url: appconfig.yesapi_one + 'domain&' + where(field, value),
            method: 'get',
            timeout: 5,
            cache: false,
            dataType: 'json'
        }, function(ret, err) {
          if (ret.ret == 200) {
              var data = ret.data.data;
            //  Alert(ret);
              getlocalurl(data);
          } else {
              Toast('服务器异常\n请联系客服');
          }
        });
    } else {
        getapp();
        getcommon();
        onelogin();
    }
}
//(1)本地测试服务器
function getlocalurl(data) {
    api.ajax({
        url: data.localurl + '/api/index/common',
        method: 'get',
        timeout: 5,
        cache: false,
        dataType: 'json'
    }, function(ret, err) {
        if (ret.code == 1) {
            SetStorage('serverurl', data.localurl); //本地服务器
            console.log('绑定 ' + data.localurl + ' 域名成功');
            SetStorage('userinfo', ret.data.userinfo);
            SetStorage('inviteinfo', ret.data.inviteinfo);
            SetStorage('p_inviteinfo', ret.data.p_inviteinfo);
            SetStorage('commondata', ret.data.common);
            setTimeout(onelogin, 500);
            setTimeout(getapp, 500);
        } else {
            getdomainurl(data);
        }
    });
}
//(2)运营服务器
function getdomainurl(data) {
    api.ajax({
        url: data.domainurl + '/api/index/common',
        method: 'get',
        timeout: 5,
        cache: false,
        dataType: 'json'
    }, function(ret, err) {
        if (ret.code == 1) {
            SetStorage('serverurl', data.domainurl); //运营服务器
            SetStorage('userinfo', ret.data.userinfo);
            SetStorage('inviteinfo', ret.data.inviteinfo);
            SetStorage('p_inviteinfo', ret.data.p_inviteinfo);
            SetStorage('commondata', ret.data.common);
            console.log('绑定 ' + data.domainurl + '域名成功');
            setTimeout(onelogin, 500);
            setTimeout(getapp, 500);
        } else {
            getserverurl(data);
        }
    });
}
//(3)备用服务器
function getserverurl(data) {
    api.ajax({
        url: data.serverurl + '/api/index/common',
        method: 'get',
        timeout: 5,
        cache: false,
        dataType: 'json'
    }, function(ret, err) {
        if (ret.code == 1) {
            SetStorage('serverurl', data.serverurl); //备用服务器
            console.log('绑定 ' + data.serverurl + '域名成功');
            SetStorage('userinfo', ret.data.userinfo);
            SetStorage('inviteinfo', ret.data.inviteinfo);
            SetStorage('p_inviteinfo', ret.data.p_inviteinfo);
            SetStorage('commondata', ret.data.common);
            setTimeout(onelogin, 500);
            setTimeout(getapp, 500);
        } else {
            setTimeout('Toast("服务器错误，十秒后自动重连", 5000)', 3000);
            setTimeout(function() {
                getlocalurl(data);
            }, 10000);
        }
    });
}

//一键登录
function onelogin() {
    var serverurl = GetStorage('serverurl');
    var deviceName = api.deviceName;
    var deviceId = api.deviceId;
    var device = deviceName + ':' + deviceId;
    console.log(GetStorage('mobile'));
    if (GetStorage('mobile')) {
        api.ajax({
            url: serverurl + '/api/user/onelogin?mobile=' + GetStorage('mobile'),
            method: 'get',
            timeout: 5,
            cache: false,
            dataType: 'json',
        }, function(ret, err) {
            if (ret.code == 0) {
                RmStorage('mobile'); //帐号异常，清除手机号信息
                console.log('手机号异常');
            } else if (ret.code == 1) {
                var data = ret.data;
                setdata(data);
            } else {
                //  RmStorage('mobile');
                RmStorage('serverurl');
                console.log('一键登录失败');
                setTimeout(getServer, 500);
            }
        });
    } else {
        setTimeout(getinvite, 500);
    }
}

function setdata(data) {
    console.log('一键登录成功，设置用户相关配置==>' + GetStorage('mobile'));
    SetStorage('userinfo', data.userinfo);
    SetStorage('inviteinfo', data.inviteinfo);
    SetStorage('p_inviteinfo', data.p_inviteinfo);
    SetStorage('commondata', data.common);
    SetStorage('mobile', data.userinfo.mobile);
    setTimeout(getinvite, 500);
}
//初始化用户数据
function rootuserdata() {
    setTimeout(function() {
        api.execScript({
            name: 'root',
            frameName: 'frame5',
            script: 'reload()'
        });
    }, 200);
    setTimeout(function() {
        api.closeToWin({
            name: 'root'
        });
    }, 2000);
}

function getapp() {
    var serverurl = GetStorage('serverurl');
    var appdata = GetStorage('appdata'); //APP配置
    var field = 'packageName';
    var value = appconfig.packageName.split(".")[2];
    var appId = api.appId;
    console.warn(' appid: ' + appId);
    api.ajax({
        url: serverurl + '/api/index/appconfig?appid=' + appId, //_package[2],
        method: 'get',
        timeout: 5,
        cache: false,
        dataType: 'json'
    }, function(ret, err) {
        if (ret.code == 1) {
            console.log('初始化APP配置成功=>>>' + JSON.stringify(ret.data));
            SetStorage('appdata', ret.data);
        } else {
            setTimeout(config, 5000);
            Toast('网络异常，请检查网络');
        }
    });
}

function getcommon() {
    var serverurl = GetStorage('serverurl');
    if (serverurl) {
        api.ajax({
            url: serverurl + '/api/index/common',
            method: 'get',
            timeout: 5,
            cache: false,
            dataType: 'json'
        }, function(ret, err) {
            if (ret.code == 1) {
                SetStorage('commondata', ret.data.common);
                console.log('用户公共配置初始化成功');
            }
        });
    }
}
//会员登录类型分配指定的邀请码配置
function getinvite() {
    var userinfo = GetStorage('userinfo');
    if (userinfo.memberlevel == 1) {
        var p_inviteinfo = GetStorage('p_inviteinfo');
        SetStorage('pinvite', p_inviteinfo);      //  console.warn('当前是普通会员登录');
      console.warn('当前是普通会员登录')
        setTimeout(getsession, 500);
    } else {
        var inviteinfo = GetStorage('inviteinfo');
        SetStorage('pinvite', inviteinfo);//        console.warn('当前是高级会员登录');
        console.warn('当前是VIP会员的登录')
        setTimeout(getsession, 500);
    }
}

//初始化获取淘宝授权session
function getsession() {
    var serverurl = GetStorage('serverurl');
    var pinvite = GetStorage('pinvite');
    var pid = pinvite.tb_pid.split("_")[1];
    console.warn('已经获取淘客PID：' + pinvite.tb_pid);
    api.ajax({
        url: serverurl + '/api/user/commission?pid=' + pid,
        method: 'get',
        timeout: 5,
        cache: false,
        dataType: 'json',
    }, function(ret, err) {
        if (ret.code == 1) {
            SetStorage('commissiondata', ret.data);
            console.warn('获取淘宝帐户参数：' + JSON.stringify(ret.data));
        } else {
            console.warn('淘宝授权帐户获取失败');
        }
    });
    //getmedia();
}
//初始化获取淘宝推广媒体KEY
function getmedia() {
    var pinvite = GetStorage('pinvite');
    var field = 'media_id';
    var value = pinvite.tb_pid.split("_")[2];
    console.warn('重新获取所授权淘宝帐号KEY');
    api.ajax({
        url: appconfig.yesapi_one + 'media&' + where(field, value), //二合一API接口链接
        method: 'get',
        timeout: 5,
        cache: false,
        dataType: 'json'
    }, function(ret, err) {
        if (ret) {
            SetStorage('mediadata', ret.data.data);
            console.log('获取淘宝帐户推广媒体：' + ret.data.data.app_key);
        }
    });
}



//打开新窗口
function loadWin(title, name, url) {
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: name,
        url: url,
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
    });
}
//打开新窗口
function openWin(obj) {
    var url = $api.attr(obj, 'data-url'); //推广连接
    var name = $api.attr(obj, 'data-name'); //窗口名称
    var title = $api.attr(obj, 'data-title'); //顶部标题
    opencommon(url, title);
}
//打开一个子窗口,一般用于打开分享页面
function openFrame(name, url) {
    api.openFrame({
        name: name,
        vScrollBarEnabled: false,
        url: url + '.html',
        rect: {
            x: 0,
            y: 0,
        },
        bounces: false
    });
}
/*搜索相关方法*/
function doSearch() {
    $api.addCls($api.dom(".aui-searchbar-wrap"), "focus");
    $api.dom('.aui-searchbar-input input').focus();
}

function cancelSearch() {
    $api.removeCls($api.dom(".aui-searchbar-wrap.focus"), "focus");
    $api.val($api.byId("search-input"), '');
    $api.dom('.aui-searchbar-input input').blur();
}

function clearInput() {
    $api.val($api.byId("search-input"), '');
}
//关键字搜索淘宝商品
function search(obj) {
    var words = $api.attr(obj, 'data-words');
    //  console.log(words);
    api.openWin({
        name: 'search_win',
        url: 'widget://html/taobao/search_win.html',
        vScrollBarEnabled: false,
        delay: 500,
        pageParam: {
            words: words,
        },
    });
}
//关键字搜索京东商品
function searchJD(obj) {
    var words = $api.attr(obj, 'data-words');
    //  console.log(words);
    api.openWin({
        name: 'search_win',
        url: 'widget://html/jingdong/search_win.html',
        vScrollBarEnabled: false,
        delay: 500,
        pageParam: {
            words: words,
        },
    });
}
//淘宝商品详情
function openxiangqing(obj) {
    var couponid = $api.attr(obj, 'data-couponid'); //优惠券ID
    var itemid = $api.attr(obj, 'data-itemid'); //商品ID
    api.openWin({
        name: itemid,
        url: 'widget://html/taobao/xiangqing.html',
        vScrollBarEnabled: false,
        delay: 500,
        reload: true,
        pageParam: {
            itemid: itemid,
            couponid: couponid
        },
    });
}
//推送淘宝商品详情
function pushXiangqing(itemid, couponid) {
    api.openWin({
        name: itemid,
        url: 'widget://html/taobao/xiangqing.html',
        vScrollBarEnabled: false,
        delay: 500,
        pageParam: {
            itemid: itemid,
            couponid: couponid
        },
    });
}
//推送活动
function openHuodong(huodongid, title) {
    var pinvite = GetStorage('pinvite');
    var tb_pid = pinvite.tb_pid.split("_");
    var commondata = GetStorage('commondata');
    var commissiondata = GetStorage('commissiondata');
    var mediadata = GetStorage('mediadata');
    var url = 'https://api.zhetaoke.com:10001/api/open_activitylink_get.ashx?appkey=';
    api.ajax({
        url: url + commondata.zhetaoke_appkey + '&sid=' + commissiondata.zhetaoke_sid + '&adzone_id=' + tb_pid[3] + '&site_id=' + tb_pid[2] + '&promotion_scene_id=' + huodongid, //活动API接口链接
        encode: true,
        method: 'get',
        timeout: 5,
        dataType: 'json'
    }, function(ret, err) {
        if (ret.tbk_sc_activitylink_toolget_response) {
            var url = ret.tbk_sc_activitylink_toolget_response.data;
            //Alert(ret);
            openTBAPP(url, title);
        }
    });
}

function openCarousel(obj) {
    var couponurl = $api.attr(obj, 'data-couponurl'); //推广连接
    var itemid = $api.attr(obj, 'data-itemid'); //商品ID
    //  Alert(couponurl);
    api.openWin({
        name: itemid,
        url: 'widget://html/taobao/carousel_xiangqing.html',
        vScrollBarEnabled: false,
        delay: 500,
        pageParam: {
            itemid: itemid,
            couponurl: couponurl
        },
    });
}
//高佣金链接
function openTBcoupon(couponurl, itemid) {
    var title = '粉丝福利购'; //顶部标题
    var url = 'https:' + couponurl;
    SetStorage('itemid', itemid); //保存浏览的商品ID
    openTBAPP(url, title);
}

function openTBurl(obj) {
    var _url = $api.attr(obj, 'data-url'); //推广连接
    var title = $api.attr(obj, 'data-title'); //顶部标题
    var pinvite = GetStorage('pinvite');
    var url = _url + pinvite.tb_pid;
    openTBAPP(url, title);
}
// 用于加密淘宝链接包含和已经加pid
function openTBurl_a(obj) {
    var url = $api.attr(obj, 'data-url'); //推广连接
    var title = $api.attr(obj, 'data-title'); //顶部标题
    openTBAPP(url, title);
}

// 淘宝高佣转链接口
function openTB(itemid, couponid) {
    //var couponid = $api.attr(obj, 'data-couponid'); //券ID
    //var itemid = $api.attr(obj, 'data-itemid'); //商品ID
    var title = '粉丝福利购'; //顶部标题
    SetStorage('itemid', itemid); //保存浏览的商品ID
    var pinvite = GetStorage('pinvite');
    var appdata = GetStorage('appdata');
    var commissiondata = GetStorage('commissiondata');
    var _url = appconfig.tbkurl + couponid + "&itemId=" + itemid; //优惠券ID
    //  alert({msg:couponid});
    //  alert({msg:_url.substring(40,83)});
    var ajaxurl = "https://v2.api.haodanku.com/ratesurl/apikey/"; //好单库高佣金转链
    api.ajax({
        url: ajaxurl + commissiondata.apikey + "/tb_name/" + commissiondata.tb_name + "/pid/" + pinvite.tb_pid + "/itemid/" + itemid, //二合一API接口链接
        method: 'post',
        timeout: 5,
        cache: false,
        dataType: 'json',
        data: {
            values: {
                tb_name: commissiondata.tb_name,
                pid: pinvite.tb_pid,
                itemid: itemid
            }
        }
    }, function(ret) {
        if (ret.code == 1) {
            var url = ret.data.coupon_click_url + '&activityId=' + couponid; //高佣金二合一链接
            console.warn('好单库==> 高佣转链成功，佣金比例：' + ret.data.max_commission_rate + '%。PID==>' + pinvite.tb_pid);
            //  Alert('好单库>>> ' + JSON.stringify( ret));
            openTBAPP(url, title);
        } else {
            openTb(_url, itemid, couponid, title); //备用高佣金转链
        }
    });
}
//备用高佣转链接口
function openTb(_url, itemid, couponid, title) {
    var pinvite = GetStorage('pinvite');
    var commissiondata = GetStorage('commissiondata');
    var ajaxurl = "https://www.heimataoke.com/api-zhuanlian?appkey=" + commissiondata.appkey + "&appsecret=" + commissiondata.appsecret + "&sid="; //黑马高佣转链
    api.ajax({
        url: ajaxurl + commissiondata.sid + "&pid=" + pinvite.tb_pid + "&num_iid=" + itemid,
        method: 'post',
        timeout: 5,
        cache: false,
        dataType: 'json'
    }, function(ret) {
        if (ret.category_id) {
            var url = ret.coupon_click_url + '&activityId=' + couponid; //高佣金二合一链接
            console.warn('黑马淘客==> 高佣转链成功，佣金比例：' + ret.max_commission_rate + '%。');
            //  Alert('黑马淘客>>> ' + JSON.stringify(ret));
            openTBAPP(url, title);
        } else {
            $api.toast('跳转淘宝中', '请稍候..', 2000);
            console.warn('高佣金授权失效，请授权');
            var url = _url + '&pid=' + pinvite.tb_pid;
            // Alert('拼接链接>>> ' + Url);
            setTimeout(function() {
                openTBAPP(url, title)
            }, 1000);
        }
    });
}

function openTBAPPkkkk() {
    if (api.systemType == "android") {
        plus.runtime.launchApplication({
            pname: "com.taobao.taobao",
            extra: {
                url: "https://m.taobao.com/#index"
            }
        }, function(e) {
            alert("打开失败:" + e.message);
        });
    }
}

//唤醒手机淘宝
function openTBAPP(url, title) {
    var pinvite = GetStorage('pinvite');
    if (GetStorage('commondata').login == 1 && !GetStorage('mobile')) {
        Toast('您还没有登录');
        GoLogin();
        return false;
    }
    var tburl = url;
    if (pinvite.relationid != 0) {
        tburl = url + '&relationId=' + pinvite.relationid;
        console.log('当前是渠道ID:' + pinvite.relationid);
    }
    // Alert("链接=>>  " + tburl);
    var tb_url = tburl.replace("http://", "taobao://").replace("https://", "taobao://"); //取https://后的字符组
    api.openApp({
        iosUrl: tb_url,
        uri: tb_url
    }, function(ret, err) {
        if (!ret) {
            opencommon(tburl, title);
        }
    });
}

//京东商品详情
function openJDxiangqing(obj) {
    var skuid = $api.attr(obj, 'data-skuid'); //商品ID
    var couponurl = $api.attr(obj, 'data-couponurl'); //推广连接
    var discount = $api.attr(obj, 'data-discount'); //优惠券额
    api.openWin({
        name: skuid,
        url: 'widget://html/jingdong/xiangqing.html',
        vScrollBarEnabled: false,
        delay: 500,
        pageParam: {
            discount: discount,
            couponurl: couponurl,
            skuid: skuid
        },
    });
}
// 用于京东二合一转链
function openJD(skuid, couponurl) {
    var commondata = GetStorage('commondata');
    var pinvite = GetStorage('pinvite');
    var jd_pid = (pinvite.jd_pid).split("_");
    console.log('获取的京东联盟PID：' + pinvite.jd_pid);
    var coupon_url = encodeURIComponent(couponurl);
    var url = "http://japi.jingtuitui.com/api/get_goods_link?appid=" + commondata.jingtuitui_APPID + "&appkey=" + commondata.jingtuitui_APPKEY;
    //  Toast('跳转中...', '请稍候', 2000);
    api.ajax({
            url: url + "&unionid=" + jd_pid[0] + "&positionid=" + jd_pid[2] + "&gid=" + skuid + "&coupon_url=" + coupon_url, //二合一API接口链接
            encode: false,
            method: 'post',
            timeout: 5,
            cache: 'ture',
            dataType: 'json'
        },
        function(ret, err) {
            if (ret.return == 0) {
                var jdurl = ret.result.link; //东券二合一链接
                openJDAPP(jdurl);
            } else {
                openJd(skuid, coupon_url, jd_pid);
            }
        });
}
// 用于京东二合一无券转链
function openJd(skuid, coupon_url, jd_pid) {
    //  var coupon_url = encodeURIComponent(coupon);
    var url = "http://japi.jingtuitui.com/api/get_goods_link?appid=" + commondata.jingtuitui_APPID + "&appkey=" + commondata.jingtuitui_APPKEY; //"&coupon_url=" + coupon_url;
    //  Toast('跳转中...', '请稍候', 2000);
    api.ajax({
            url: url + "&unionid=" + jd_pid[0] + "&positionid=" + jd_pid[2] + "&gid=" + skuid, //二合一API接口链接
            encode: false,
            method: 'post',
            timeout: 5,
            cache: 'ture',
            dataType: 'json'
        },
        function(ret, err) {
            if (ret.return == 0) {
                var jdurl = ret.result.link; //东券二合一链接
                // var jdurl = ret.union_short_url; //东券二合一链接
                openJDAPP(jdurl);
            } else {
                Toast('服务器连接错误,请检查网络');
            }
        });
}
//跟转二合一京东券页面
function openJDAPP(jdurl) {
    var url = jdurl;
    var title = '领券更便宜';
    var jdKepler = api.require('jdKepler');
    //  var jdKepler = api.require('jdKepler');
    jdKepler.login(function(ret) {
        console.log(JSON.stringify(ret));
    });
    jdKepler.openPage({
        url: jdurl,
        jumpType: 2
    }, function(ret) {
        console.log(JSON.stringify(ret));
    });
    /*  api.openApp({
        //  iosUrl: 'openApp.jdMobile1://communication?params={"action":"syncShareData","title":"1","content":"","shareUrl":"' + jdurl + '","iconUrl":""}',
      //  uri: 'openApp.jdMobile1://virtual?params={"action":"syncShareData","title":"1","content":"","shareUrl":"https://union-click.jd.com/jdc?d=cBwq5h","iconUrl": ""}',
      }, function(ret, err) {
          if (!ret) {
              //    opencommon(url, title);
          }
      });*/
}


// 用于拼多多网站链接
function openPDDurl(obj) {
    var url = $api.attr(obj, 'data-url'); //推广连接
    var title = $api.attr(obj, 'data-title'); //顶部标题
    //    var Url = url + pinvite.pdd_pid;
    openPDDAPP(url, title);
}
//唤醒拼多多APP
function openPDDAPP(url, title) {
    if (GetStorage('commondata').login == 1 && !GetStorage('mobile')) {
        Toast('您还没有登录');
        GoLogin();
        return false;
    }
    var pddurl = url.replace("https://mobile.yangkeduo.com/", "pinduoduo://com.xunmeng.pinduoduo/").replace("https://mobile.yangkeduo.com/", "pinduoduo://com.xunmeng.pinduoduo/"); //取https://后的字符组
    //Alert("链接=>>  " + url);
    api.openApp({
        iosUrl: pddurl,
        uri: pddurl
    }, function(ret, err) {
        if (!ret) {
            opencommon(url, title);
        }
    });
}
//需要登录后才能打开窗口
function loginopen(url, title) {
    if (!GetStorage('mobile')) {
        Toast('您还没有登录');
        GoLogin();
        return false;
    }
    opencommon(url, title);
}

function loginopenwin(url, title) {
    if (!GetStorage('mobile')) {
        Toast('您还没有登录');
        GoLogin();
        return false;
    }
    loadWin(title, title, url)
}
//公共顶部窗口自动获取标题
function opencommon(url, title) {
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: title,
        url: 'widget://html/common/common.html',
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
        pageParam: {
            title: title,
            url: url
        },
    });
}
//公共顶部窗口自传标题
function openpublic(url, title) {
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: title,
        url: 'widget://html/common/public.html',
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
        pageParam: {
            title: title,
            url: url
        },
    });
}

//粘贴板获取标题搜索
function getcopy() {
    console.warn('粘贴板获取');
    return false;//20190805减少小白流量
    var Str = RegExp(/[(\〒)(\₮)(\₩)(\₴)(\₪)(\₱)(\₦)(\£)(\₭)(\₲)(\₡)(\฿)(\¤)(\₤)(\€)(\₴)(\¢)(\￥)(\~)(\!)(\₳)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\[)(\])(\{)(\})(\:)]+/);
    var commondata = GetStorage('commondata');
    var userinfo = GetStorage('userinfo');
    clipBoard = api.require('clipBoard');
    clipBoard.get(function(ret) {
        if ((ret.value).indexOf("销量") == -1 && (ret.value).indexOf("邀请码") == -1 && (ret.value).indexOf("验证码") == -1 && ret.value.length != 0 && isNaN(ret.value) && ret.value != GetStorage('word') && Str.test(ret.value) != true && ret.value != commondata.touch_wx && ret.value != userinfo.pwx) { // 是微信号不提示搜索
            var words = ret.value;
            showDialogBox(words);
            SetStorage('word', ret.value);
        } else {
            var content = ret.value; //淘口令链接解析
            //    if (content != GetStorage('content')) {
            shangpin(content);
            //    SetStorage('content', content);
            //  }
        }
    });
}
//粘贴板监听标题搜索
function setcopy() {
    console.warn('粘贴板监听启动');
    var Str = RegExp(/[(\〒)(\₮)(\₩)(\₴)(\₪)(\₱)(\₦)(\£)(\₭)(\₲)(\₡)(\฿)(\¤)(\₤)(\€)(\₴)(\¢)(\￥)(\~)(\!)(\₳)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\[)(\])(\{)(\})(\:)]+/);
    var commondata = GetStorage('commondata');
    var userinfo = GetStorage('userinfo');
    clipBoard = api.require('clipBoard');
    clipBoard.setListener( //setListener
        function(ret) {
            if ((ret.value).indexOf("销量") == -1 && (ret.value).indexOf("邀请码") == -1 && (ret.value).indexOf("验证码") == -1 && ret.value.length != 0 && isNaN(ret.value) && Str.test(ret.value) != true && ret.value != commondata.touch_wx && ret.value != userinfo.pwx) { // 是微信号不提示搜索
                var words = ret.value;
                showDialogBox(words);
                SetStorage('word', ret.value);
            } else {
                var content = ret.value; //淘口令链接解析
                //  if (content != GetStorage('content')) {
                shangpin(content);
                //  }
            }
        });
}
//淘口令链接解析
function shangpin(content) {
    var commissiondata = GetStorage('commissiondata');
    var commondata = GetStorage('commondata');
    var userinfo = GetStorage('userinfo');
    var pinvite = GetStorage('pinvite');
    if (content.indexOf("邀请码") != -1 || content.indexOf("验证码") != -1 || content.indexOf("下单链接") != -1 || isNaN(content) != true || content.indexOf("淘口令") != -1 || content == pinvite.alipay_search || content == userinfo.pwx) {
        return false;
    }
    if (commondata.tpwd == 1) {
        console.warn('淘口令解析中');
        var taobaokey = encodeURIComponent(content);
        var zhetaoke = 'http://api.zhetaoke.com:10000/api/open_shangpin_id.ashx?appkey='
        api.ajax({
            url: zhetaoke + commondata.zhetaoke_appkey + '&sid=' + commissiondata.zhetaoke_sid + '&type=1&content=' + taobaokey,
            method: 'get',
            timeout: 5,
            dataType: 'json',
        }, function(ret, err) {
            if (ret.item_id) {
                console.log(JSON.stringify(ret));
                var itemid = ret.item_id;
                var activityId = ret.activity_id;
                taoke_coupon(itemid, activityId); //查二合一优惠券
            } else {
                console.log('淘口令解析失败=>>' + JSON.stringify(err) + content);
            }
        });
    } else {
        console.warn('淘口令解析已经关闭');
    }
}

function taoke_coupon(itemid, activityId) {
    var pinvite = GetStorage('pinvite');
    var appdata = GetStorage('appdata');
    var inviteinfo = GetStorage('inviteinfo');
    var commissiondata = GetStorage('commissiondata');
    var ajaxurl = "https://v2.api.haodanku.com/ratesurl/apikey/"; //好单库高佣金转链
    api.ajax({
        url: ajaxurl + commissiondata.apikey + "/tb_name/" + commissiondata.tb_name + "/pid/" + pinvite.tb_pid + "/itemid/" + itemid, //二合一API接口链接
        method: 'post',
        timeout: 5,
        dataType: 'json',
        data: {
            values: {
                tb_name: commissiondata.tb_name,
                pid: pinvite.tb_pid,
                itemid: itemid
            }
        }
    }, function(ret) {
        if (ret.code == 1) {
            var coupon = ret.data //高佣金二合一数据
            console.warn('好单库==> 高佣转链成功，佣金比例：' + ret.data.max_commission_rate + '%。');
            taoke_itemid(itemid, coupon, activityId);
            //  SetStorage('itemid', itemid); //保存浏览的商品ID
            var clipBoard = api.require('clipBoard');
            clipBoard.set({
                value: "【" + api.appName + "】" + commondata.apptext + '邀请码:' + inviteinfo.invite + '\n' + appdata.appurl
            });
        } else {
            //  console.log(itemid + '不是淘客商品');
            Alert('您复制的商品已下架或退出推广活动，暂时没有优惠券和返利。请找相似的商品重查优惠券。', '检测到没有优惠券的商品');
        }
    });
}
//淘客商品
function taoke_itemid(itemid, coupon, activityId) {
    api.closeFrame({
        name: 'coupon' //判断当前子窗口打开并关闭
    });
    api.openFrame({
        name: 'coupon',
        url: 'widget://html/taobao/coupon.html',
        vScrollBarEnabled: false,
        rect: {
            x: 0,
            y: 0,
            w: 'auto',
            h: 'auto'
        },
        pageParam: {
            itemid: itemid,
            coupon: coupon,
            activityId: activityId
        },
        bgColor: 'rgba(0,0,0,0.4)',
        bounces: false
    });
}
//非淘客商品
function taobao_id(itemid) {
    var mediadata = GetStorage('mediadata');
    var timestamp = Date.parse(new Date()) / 1e3; //当前时间戳 精确到秒
    var datetime = GetDatetime('Y-m-d H:i:s', timestamp);

    var taobao = host + '?sign=' + tb_MD5(param) + '&app_key=' + mediadata.app_key + '&method=' + method + '&timestamp=' + datetime + '&num_iids=' + itemid + '&sign_method=md5&format=json&v=2.0';
    api.ajax({
        url: taobao, //商品API接口链接
        encode: true,
        method: 'get',
        timeout: 5,
        dataType: 'json'
    }, function(ret, err) {
        if (ret.tbk_item_info_get_response) {
            // Alert(ret);
            var itemdata = ret.tbk_item_info_get_response.results.n_tbk_item;
            SetStorage('itemdata', itemdata);
            SetStorage('coupon', coupon);
            api.closeFrame({
                name: 'coupon' //判断当前子窗口打开并关闭
            });
            api.openFrame({
                name: 'coupon',
                url: 'widget://html/taobao/taobaoshangpin.html',
                vScrollBarEnabled: false,
                rect: {
                    x: 0,
                    y: 0,
                    w: 'auto',
                    h: 'auto'
                },
                pageParam: {
                    itemdata: itemdata,
                    coupon: coupon
                },
                bgColor: 'rgba(0,0,0,0.4)',
                bounces: false
            });
        } else {
            Alert(err)
        }
    });
}
//搜索跳转
function showDialogBox(content) {
    var dialogBox = api.require('dialogBox');
    dialogBox.alert({
        texts: {
            title: '优惠券智能搜索',
            content: '〖 ' + content + ' 〗',
            leftBtnTitle: '取消',
            rightBtnTitle: '搜索',
        },
        styles: {
            bg: '#fff',
            corner: 10,
            w: 300,
            title: {
                marginT: 20,
                icon: 'widget://image/findquan.png',
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
            var dialogBox = api.require('dialogBox');
            dialogBox.close({
                dialogName: 'alert'
            });
        } else if (ret.eventType == 'right') {
            SetStorage('_words', content)
            api.openWin({
                name: 'search_win',
                url: 'widget://html/taobao/search_win.html',
                vScrollBarEnabled: false,
                delay: 500,
                pageParam: {
                    words: content,
                },
            });
        }
        var dialogBox = api.require('dialogBox');
        dialogBox.close({
            dialogName: 'alert'
        });
    });
}
// 用于轮播图链接
function openslide(obj) {
    var id = $api.attr(obj, 'data-id'); //专题ID
    var url = $api.attr(obj, 'data-url'); //专题图片
    var title = $api.attr(obj, 'data-title'); //顶部标题
    var _content = $api.attr(obj, 'data-content'); //专题文案
    var content = _content.replace(/\n/g, "<br>"); //全局替换\n为<br>
    //  alert({msg:content});
    api.openWin({
        name: 'subject_win',
        url: 'widget://html/taobao/subject_win.html',
        vScrollBarEnabled: false,
        delay: 500,
        pageParam: {
            id: id,
            title: title,
            url: url,
            content: content
        },
    });
}
// 用于轮播分类
function opencarousel(obj) {
    var id = $api.attr(obj, 'data-id'); //专题ID
    var url = $api.attr(obj, 'data-url'); //专题图片
    var title = $api.attr(obj, 'data-title'); //顶部标题
    var _content = $api.attr(obj, 'data-content'); //专题文案
    api.openWin({
        name: id,
        url: url,
        vScrollBarEnabled: false,
        delay: 500,
        pageParam: {
            id: id,
            title: title
        },
    });
}

/*扫一扫 二维码扫描*/
function openScanner() {
    if (!confirmPer('camera')) {
        console.log('获取相机权限');
      //  return false;
    }
    var FNScanner = api.require('FNScanner');
    FNScanner.openScanner({
        autorotation: true,
    }, function(ret, err) {
        if (ret.eventType == 'success') {
            var content = ret.content;
            if (content.indexOf("tb") != -1 || content.indexOf("taobao") != -1) {
                shangpin(content);
                console.log('当前是淘宝链接');
            } else if (content.indexOf("alipay") != -1) {
                var url = content.replace("http://", "alipays://").replace("https://", "alipays://");
                api.openApp({
                    iosUrl: url,
                    uri: url
                }, function(ret, err) {
                    if (!ret) {
                        Toast('没有安装支付宝');
                    }
                });
            } else if (content.indexOf("jd") != -1) {
                Toast('当前是京东链接');
            } else if (content.indexOf("keduo") != -1 || content.indexOf("nanren") != -1) {
                Toast('当前是拼多多链接');
            } else {
                var url = content;
                Alert(url, '扫描结果')
            }
        } else {
            //  Alert(err);
        }
    });
}
//分类管理通用页面
function getdefault(name, id, title) {
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: name,
        url: 'widget://html/user/category_win.html',
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
        pageParam: {
            title: title,
            name: name,
            id: id
        },
    });
}
//分类管理通用页面
function opendefault(obj) {
    var id = $api.attr(obj, 'data-id'); //分类ID
    var name = $api.attr(obj, 'data-name'); //标题类型
    var title = $api.attr(obj, 'data-title'); //顶部标题
    getdefault(name, id, title);
}




 /*********** zjhoo de 公共工具抽离 ***************/
 //调试工具
 function _JS(obj){
    return JSON.stringify(obj);
}

//公共页面头 福购商场
function opencommonFG(options) {
    if(!options || !options.url ) return; 
    var url = options.url;
    var title = options.title?options.title:' ';
    
    var delay = 0;
    if ("ios" != api.systemType) {
        delay = 300;
    }
    api.openWin({
        name: title,
        url: 'widget://html/common/common_FG.html',
        vScrollBarEnabled: false,
        delay: delay,
        slidBackType: 'edge',
        pageParam: {
            title: title,
            url: url
        },
    });
}


//zjhoo 对象封装
(function(w) {
	var m = function() {
		//是否开启沉浸式状态栏
		this.immersiveFlag = true;
		//安卓连续点击返回键 退出应用计数器
        this.keyBackCount = 0;
        
		//服务器地址
		this.protocol = 'http';
        this.Sever = 'shop.19gou.net';    //生产环境环境 
		this.port ='80';		
		this.httpServer = this.protocol+"://"+this.Sever+':'+this.port;
    }
    
	/**
	 * @description apicloud加载完成后执行
	 * @param
	 * @return
	 * @author zjhoo
	 */
	m.prototype.ready = function(callback) {
		var me = this;
		w.apiready = function() {
			//解析单击事件，解决iso单击300秒延迟
			api.parseTapmode();
			me.phoneKey = api.loadSecureValue({
				sync : true,
				key : 'phoneKey'
			});
			var header = document.getElementById('header');
			var head = document.getElementById('head');
			var footer = document.getElementById('footer');
			if (header) {
				//沉浸式状态栏处理
				me.immersiveFlag && me.fixStatusBar(header || head);
				//获取头部标签宽高
				me.headerPos = me.offset(header || head);
			}
			if(footer){
				me.fixIosXFooter(footer)
			}
			if (callback) callback();
		}
    }
    
    /**
     * 获取状态栏高度
     * zjhoo
     */
    m.prototype.getStatusbarHeight = function(){
		var sysType = api.systemType;
		var version = api.systemVersion.replace(/(\d+\.\d).*/,'$1');
		if (sysType == 'ios' && (api.deviceModel.indexOf('iPhone10') != -1 || api.deviceModel.indexOf('iPhone11') != -1) ) {//ios7以上支持沉浸式状态栏
			return 40
		}else if(sysType == 'ios'){
			return 20
		}else if( sysType == 'android' && Number(version) >= 4.4 ) {
			var statusBar = api.require("statusBar");
			return statusBar.getStatusBarHeight();
		}else if( sysType == 'android' ){
			return 0
		}
    }
    
    m.prototype.toast = function(msg, time) {
		if (!msg) return;
		api.toast({
			msg : msg,
			duration : time || 2000,
			location : 'middle'
		});
    }
    
    /**
     * 请求封装
     * zjhoo
     */
    m.prototype.ajax = function(options){
		var _this = this;
        var token = $api.getStorage('mobile')
        // token = 
		// if(token) user = JSON.parse(user);
		var me = this;
		if (api.connectionType == 'none') {
            		me.toast('网络状态不佳，请稍后重试！');
			return;
		}
		//参数检查
		if (!(options['url'] && options['success'])) this.errorHandler('地址及成功处理函数不能为空');
		options['url'] = this.httpServer + options['url'];
		//请求进度等待框
		// if (options['progress']) {
		// 	me.openFrame({
		// 		name: 'idFrmProgress',
		// 		url: 'widget://html/other/cry_common_loader.html',
		// 		bgColor: 'rgba(255,255,255,0.01)'
		// 	});
		// }
		var errorFun=options['error'],successFun=options['success'],data = options['data'] || {}, ele, action = options['action'], tFlag = options['tFlag'],keyback=options['keyback'],isToLoin=options['isToLoin']||true;
		var loginParam={
            action:action,
            keyback:keyback
		};
		options['data'] = {};
		delete options['action'];
		delete options['tFlag'];
		delete options['error'];
		delete options['success'];
		options['method'] = options['type'] || 'post';
		options['timeout'] = options['timeout'] || 20;
		options['dataType'] = options['dataType'] || 'json';
		options['returnAll'] = options['returnAll'] || false;
		options['headers'] = {'Token': token?token:'','Content-Type': 'application/json;charset=UTF-8' };
		options['cache'] = false;
		options['data']['body'] = data;
		options['data']['files'] = options['file'] || {};
		api.ajax(options, function (ret, err) {
			api.closeFrame({ name: 'idFrmProgress'});
			if (ret && ret.code && ret.code=='1' ) { //成功
			    successFun(ret)
            }else if(ret && ret.code=='401'){//登录失效
                
                localStorage.removeItem('moblie');
                
                // if(api.winName != 'root' || options.needLogin){
                // 	_this.toLogin();
                // }
                // api.sendEvent({ name: 'LevelChange', extra: {}});
            } else { //code 0 err
                if(!ret){
                    errorFun && typeof(errorFun) == 'function' ? errorFun(err) : me.toast('服务器繁忙,请稍后再试')
                }else{
                    errorFun && typeof(errorFun) == 'function' ? errorFun(ret,err) : me.toast(ret.msg||ret.body.msg)
                }
            }
		});
	}

    /* @description 让伪类:active生效 用于点击效果 */
	w.document.body.addEventListener('touchstart', function() { }, false);
	w.page = m;
	w._APP = new m();
})(window)



