console.log("init.js Started");

window.use_english = false

var http = {};
http.quest = function (option, callback) {
  var url = option.url;
  var method = option.method;
  var data = option.data;
  var timeout = option.timeout || 0;
  var xhr = new XMLHttpRequest();
  (timeout > 0) && (xhr.timeout = timeout);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 400) {
        var result = xhr.responseText;
        try { result = JSON.parse(xhr.responseText); } catch (e) { }
        callback && callback(null, result);
      } else {
        callback && callback('status: ' + xhr.status);
      }
    }
  }.bind(this);
  xhr.open(method, url, true);
  if (typeof data === 'object') {
    try {
      data = JSON.stringify(data);
    } catch (e) { }
  }
  xhr.send(data);
  xhr.ontimeout = function () {
    callback && callback('timeout');
    console.log('%c连%c接%c超%c时', 'color:red', 'color:orange', 'color:purple', 'color:green');
  };
};
http.get = function (url, callback) {
  var option = url.url ? url : { url: url };
  option.method = 'get';
  this.quest(option, callback);
};
http.post = function (option, callback) {
  option.method = 'post';
  this.quest(option, callback);
};

function get_en_file_url(file_name, callback) {
    http.get("https://api.github.com/repos/autismsupport/meetings-record/contents/records_en/"+file_name, function (err, result) {
        console.log(err);
        console.log(result);
        if (err!="status: 404") {
            if (!("message" in result)) {
                callback(result["download_url"]);
                return;
            }
        }
        callback(false);
    });
}

function get_cn_file_url (file_name, callback) {
    http.get("https://api.github.com/repos/autismsupport/meetings-record/contents/records/"+file_name, function (err, result) {
        console.log(result);
        if (result.hasOwnProperty("message")) {
            callback(false);
        } else {
            callback(result["download_url"]);
        }
    });
}

function get_file_url (item, file_name, en, callback) {
    if (en) {
        get_en_file_url(file_name, function (en_url) {
            console.log(en_url);
            if (en_url!=false) {
                callback(en_url);
            } else {
                document.getElementById('viewer').innerHTML = "<div class='tip'><h1 style='text-align: center;'>Not Available Yet</h1><p style='text-align: center;'>We haven't done the translation of the document you selected.</p></div>";
            }
        });
    } else {
        get_cn_file_url(file_name, function (cn_url) {
            console.log(cn_url);
            if (cn_url!=false) {
                callback(cn_url);
            } else {
                document.getElementById('viewer').innerHTML = "<div class='tip'><h1 style='text-align: center;'>\>_\<</h1><p style='text-align: center;'>哎呀！出错啦！</p></div>";
            }
        });
    }
}

function make_item_selected(item,file_name,en=window.use_english) {
    //console.log(item);
    if (document.getElementById("item_selected") != null) {
        document.getElementById("item_selected").id = "";
    }
    item.id = "item_selected";
    if (!en) {
        document.getElementById('viewer').innerHTML = "<div class='tip'><h1 style='text-align: center;'>请稍候</h1><p style='text-align: center;'>若长时间无响应请重新选择文档</p></div>";
    } else {
        document.getElementById('viewer').innerHTML = "<div class='tip'><h1 style='text-align: center;'>Loading</h1><p style='text-align: center;'>Please wait ...</p></div>";
    }
    get_file_url(item,file_name,en,function (file_url) {
        http.get(file_url, function (err, result) {
            document.getElementById('viewer').innerHTML = marked(result);
        });
    });
}

function switch_lang() {
    console.log(window.use_english)
    if (!window.use_english) {
        window.use_english = true;
        document.getElementById('page_title').innerHTML = 'Meetings Record';
        document.getElementById('table_of_contents_title').innerHTML = 'Table of Contents';
        if (document.getElementById("item_selected") == null) {
            document.getElementById('viewer').innerHTML = "<div class='tip'><h1 style='text-align: center;'>Select a document from the left</h1><p style='text-align: center;'>Some translations might haven't been done yet</p></div>";
        } else {
            curr_item = document.getElementById("item_selected");
            make_item_selected(curr_item, curr_item.innerHTML, true);
        }
    } else {
        window.use_english = false;
        document.getElementById('page_title').innerHTML = '会议纪要';
        document.getElementById('table_of_contents_title').innerHTML = '目录';
        if (document.getElementById("item_selected") == null) {
            document.getElementById('viewer').innerHTML = "<div class='tip'><h1 style='text-align: center;'>从右侧选择一篇文档来查看</h1><p style='text-align: center;'>若暂无文档请等待加载完毕</p></div>";
        } else {
            curr_item = document.getElementById("item_selected");
            make_item_selected(curr_item, curr_item.innerHTML, false);
        }
    }
}


//window.use_english = false;

http.get('https://api.github.com/repos/autismsupport/meetings-record/contents/records', function (err, result) {
    console.log(result);
    result.forEach(function (file, index) {
        //console.log(file);
        let li = document.createElement("li");
        li.append(document.createTextNode(file["name"]));
        li.className = "item";
        li.onclick = function () {make_item_selected(li,file["name"]);};
        let ul = document.getElementById("table_of_contents");
        //console.log(ul.children)
        ul.append(li);
        // 若顺序错乱则将该项插入正确位置，若无法排序则插入至开头
        if (ul.children.length > 0) {
            if (file["name"].indexOf("-") != -1) {
                let file_no = file["name"].split("-")[0];
                //console.log(file_no)
                if (!isNaN(parseInt(file_no))) {
                    if (parseInt(file_no) <= ul.children.length) {
                        ul.insertBefore(li,ul.children[parseInt(file_no)-1]);
                    }
                } else {
                    ul.insertBefore(li,ul.children[0]);
                }
            } else {
                ul.insertBefore(li,ul.children[0]);
            }
        }
    })
});

document.getElementById('viewer').innerHTML = "<div class='tip'><h1 style='text-align: center;'>从右侧选择一篇文档来查看</h1><p style='text-align: center;'>若暂无文档请等待加载完毕</p></div>";
//document.getElementById("lang_btn").onclick = function () {switch_lang();}

console.log("init.js Done");