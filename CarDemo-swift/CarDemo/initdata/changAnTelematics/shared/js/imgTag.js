define(['zepto', 'shared/js/imgSrc'], function($, imgSrc) {


  var imgtag = function(body, width, height) {
    var imgt;
    console.log(width);
    //查询所有img标签
    var findTag = function() {



      var imgarr = new Array;
      var imglist = body.split('<img');



      if (imglist.length > 1) {



        for (var i = 1; i < imglist.length; i++) {

          var im = imglist[i].split('/>')[0];
          var ims = "<img " + im + "/>";
          imgarr.push(ims);

        }
      } else {
        imglist = body.split('IMG');

        for (var j = 1; j < imglist.length; j++) {

          var im2 = imglist[j].split('>')[0];
          var ims2 = "IMG " + im2 + "/>";
          imgarr.push(ims2);

        }

      }

      return imgarr;

    };

    //add width height
    var addwh = function() {
      var ih = findTag();
      var newimgarr = new Array;
      for (var i = 0; i < ih.length; i++) {

        var newsrc = ih[i].split('src="')[1].split('"')[0] + "&width=" + width + "&height=" + height;

        var newimgsrc = newsrc.imgSrc();


        // var newimgtag = ih[i].split('src="')[0] + 'src="' + newimgsrc + '"/>';
            var newimgtag ='<img    alt="" src="' + newimgsrc + '"/>';
        newimgarr.push(newimgtag);
      }



      return newimgarr;
    };



    //组合新html

    var newhtml = function() {

      var aw = addwh();

      var imglist;
      var nh;
      imglist = body.split('<img');

      if (imglist.length > 1) {



        nh = imglist[0];

        for (var i = 1; i < imglist.length; i++) {



          var im = imglist[i].split('/>');
          var ims = aw[i - 1];

          for (var m = 1; m < im.length; m++) {



            if (m != im.length - 1) {
              ims = ims + im[m] + "/>";
            } else {

              ims = ims + im[m];
            }

          }

          nh = nh + ims;

        }

      } else {

        imglist = body.split('IMG');

        nh = imglist[0];

        for (var k = 1; k < imglist.length; k++) {



          var im2 = imglist[k].split('>');



          var ims2 = aw[k - 1];
          for (var j = 1; j < im2.length; j++) {

            if (j != im2.length - 1) {
              ims2 = ims2 + im2[j] + ">";
            } else {

              ims2 = ims2 + im2[j];
            }
          }



          nh = nh + ims2;

        }


      }

      return nh;

    };
    imgt = newhtml();

    return imgt;
  };

  return imgtag;
});