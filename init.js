console.log("init.js Started");


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

function make_item_selected(item,file_url) {
    //console.log(item);
    if (document.getElementById("item_selected") != null) {
        document.getElementById("item_selected").id = "";
    }
    item.id = "item_selected";
    http.get(file_url, function (err, result) {
        document.getElementById('viewer').innerHTML = marked(result);
    });
}


http.get('https://api.github.com/repos/autismsupport/meetings-record/contents/records', function (err, result) {
    console.log(result);
    result.forEach(function (file, index) {
        //console.log(file);
        let li = document.createElement("li");
        li.append(document.createTextNode(file["name"]));
        li.className = "item";
        li.onclick = function () {make_item_selected(li,file["download_url"]);};
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


console.log("init.js Done");