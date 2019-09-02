/**
 * static.cms - v1.0.0  License By
 * WEB小组
 */
! function() {
    function t() {
        var t = null,
            e = function(t) {
                var o = parseInt($(".outTime b").eq(t).html());
                if (o > 0) {
                    if (3 != t) var o = o - 1 < 10 ? "0" + (o - 1) : o - 1;
                    else o -= 1;
                    $(".outTime b").eq(t).html(o)
                } else {
                    if (!(t > 0)) return !1;
                    if (0 == e(t - 1)) return 3 == t ? $(".outTime b").eq(t).html(0) : $(".outTime b").eq(t).html("00"), !1;
                    3 == t ? $(".outTime b").eq(t).html(9) : $(".outTime b").eq(t).html(59)
                }
            };
        $(".outTime").length > 0 && (t = setInterval(function() {
            0 == e(3) && clearInterval(t)
        }, 100))
    }
    $(".goods_video").on("click", function() {
            $(this).parent().addClass("active").find("video");
            var t = document.getElementById("myVideo");
            t.play()
        }), $(document).scroll(function(t) {
            var i = $(document).scrollTop();
            a();
            var s = i / ($(window).width() / 2);
            if (s = s >= .9 ? 1 : s, s <= 1) {
                $(".header_goods .icon_header>div.title").css({
                    opacity: s
                });
                var d = 255 * (1 - s);
                $(".header_goods .icon_header>a").css({
                    background: "rgba(0,0,0," + 30 * (1 - s) / 100 + ")",
                    color: "rgba(" + d + "," + d + "," + d + ",1)"
                })
            }
            i >= $(window).width() / 2 ? $(".header_goods").addClass("active") : $(".header_goods").removeClass("active"),
                i >= $("#anchors_title").offset().top - $(window).height() && !$("#anchors_title").attr("upload"),
                i >= $("#goods_item_list").offset().top - $(window).height() && !$("#goods_item_list").attr("upload")
        }),
        $(".header_goods .icon_header>div.title a").on("click", function() {
            $(".header_goods .icon_header>div.title a").removeClass("active"), $("html,body").animate({
                scrollTop: $("#" + $(this).addClass("active").attr("anchors")).offset().top - 40
            }, 400)
        });
    var
    /* e = function() {
               $("#goods_item_list").attr("upload", !0);
               var t = $("#goods_item_list").data("item");
               $("#goods_item_list .goods-new").html($cmsApi.goodsListTpl(t, $("#goods_item_list").data("open"))), wui.init("directive"), $cmsApi.satc()
           },
          o = function() {
               $("#anchors_title").attr("upload", !0).find(".imglist").html(""), $cmsApi.ajax({
                   url: 'http://hws.m.taobao.com/cache/mtop.wdetail.getItemDescx/4.1/?&data={"item_num_id":"' + $("#anchors_title").data("goodsid") + '"}&type=jsonp',
                   async: !1,
                   dataType: "jsonp",
                   jsonp: "callback",
                   jsonpCallback: "showTuwen"
               }).done(function(t) {
                   if (t.data.images.length > 0)
                       for (var e = 0; e < t.data.images.length; e++) $("#anchors_title").find(".imglist").append('<p><img src="' + t.data.images[e] + '" /></p>');
                   $cmsApi.satc(), wui.init("directive")
               })
           },*/
        a = function(t) {
        var e = {
                info: $("#anchors_info").offset().top - 45,
                title: $("#anchors_title").offset().top - 45,
                ant: $("#anchors_ant").offset().top - 45
            },
            o = $(document).scrollTop();
        o >= e.info && o < e.title ? ($(".header_goods .icon_header>div.title a").removeClass("active"), $(".header_goods .icon_header>div.title a[anchors='anchors_info']").addClass("active")) : o >= e.title && o < e.ant ? ($(".header_goods .icon_header>div.title a").removeClass("active"), $(".header_goods .icon_header>div.title a[anchors='anchors_title']").addClass("active")) : o >= e.ant && ($(".header_goods .icon_header>div.title a").removeClass("active"), $(".header_goods .icon_header>div.title a[anchors='anchors_ant']").addClass("active"))
    };
    $(".goods_swiper1 .swiper-container").css({
        height: $(window).width(),

    }), t()
}();
