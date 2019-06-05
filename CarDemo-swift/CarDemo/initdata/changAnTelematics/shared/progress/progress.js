/**
 * Created by 63471 on 2017/3/23.
 */
define([
    'text!shared/progress/progress.html'
],function (html) {
    var cls =function (per){
        var progress = document.querySelector('#default-progress');
        if(!progress) {
            progress = document.createElement('div');
            progress.id = 'default-progress';
            progress.innerHTML = html;
            document.querySelector('#navigationContainer').appendChild(progress);
        }
        per =parseInt(per);
        if(per !=0&&!per){
            console.warn('progress插件:请输入数字');
            return;
        }
        per = per>100 ? 100 : per;
        var front = progress.querySelector('.im-progress-front');
        var text = progress.querySelector('.im-progress-text');
        var bar = progress.querySelector('#default-progress-bar');
        var width = parseInt(document.defaultView.getComputedStyle(bar,null).width);
        front.style.width=per+'%';
        text.innerHTML =per+'%';
        if(per == 100) {
            setTimeout(function(){
                if(progress){
                    document.querySelector('#navigationContainer').removeChild(progress);
                }
            },450)
        }
    }

    cls.removeProgress = function(){
        var progress = document.querySelector('#default-progress');
        if(progress){
         document.querySelector('#navigationContainer').removeChild(progress);
        }
    }
    return cls;
})