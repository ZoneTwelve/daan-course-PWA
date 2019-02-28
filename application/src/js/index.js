var loading = false;
var list;
var memory = new Object();
var selected = {link:"綜高109仁", class:"綜高二仁"};
function setup(){
  console.info('Program start at '+Time());
  let olist = readDB('list');
  var selectElement = document.querySelector(".toolbar>select");
  document.querySelector("#clear").onclick = clearLocalStorage;
  selectElement.onchange = () => {
    selected = list[~~(document.querySelector(".toolbar>select").value)];
    write2db('selected', ~~(document.querySelector(".toolbar>select").value));
    if(!loading)
      refresh();
  }
  if(olist){
    list = olist;
    createList(list, selectElement);
    refresh();
  }else{
    request(0, (result)=>{
      write2db('list', result);
      list = JSON.parse(result);
      createList(list, selectElement);
      refresh();
    });
  }
  pwaOnloadEvent();
}

function createList(list, selectElement){
  let grade = ['三', '二', '一', null];
  list.forEach((c, i) => {
    if(grade.length>0&&c.class.indexOf(grade[0])>-1){
      let g = grade.shift();
      let hr = document.createElement("option");
      hr.disabled = true; 
      hr.innerText = `${g}年級`;
      selectElement.appendChild(hr);
    }
    let opt = document.createElement("option");
    opt.value = i;
    opt.innerText = c.class;
    // if(c.class===selected.class)
    //   opt.selected = true;
    selectElement.appendChild(opt);
  });
}


function refresh(status = 0){
  if(loading==true)
    return alert("請稍後上個請求");
  loading = true;
  let selectedOptions = parseInt(readDB('selected'))||-1;
  if(selectedOptions>-1)
    selected = list[~~(selectedOptions)];
  //if status = 1  then query api to update
  document.querySelector(".header").innerText = `Loading...`;
  let _class = selected.class;
  var db = (readDB(_class));
  if(db){
    // console.log('database:', db, typeof db);
    if(typeof db==="string")
      db = JSON.parse(db);
    return updateTable(db);
  }
  request(1, (result)=>{
    write2db(_class, result);
    updateTable(readDB(_class));
  });
  return false;
}

function updateTable(db){
  loading = false;
  document.querySelector(".header").innerText = `${selected.class}的課表`;
  let els = document.querySelectorAll("#course>table>tbody>tr>td:not(.time)");
  for(var i=0;i<els.length;i++){
    let {subject, teacher} = db[i%db.length][~~(i/db.length)];
    let subjectTag = createSpan(subject);
    let teacherTag = createSpan(teacher, "hoverDisplay");
    els[i].innerHTML = '';
    els[i].appendChild(subjectTag);
    els[i].appendChild(document.createElement("br"));
    els[i].appendChild(teacherTag);
  }
}

function createSpan(content, c = ""){
  let span = document.createElement("span");
  span.className = c;
  span.innerText = content;
  return span;
}

function request(target, callback){
  let options = ['list', 'data'][target];
  if(options==undefined)
    return alert('找不到這個功能...');
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if(this.readyState==4){
      if(this.status===200)
        return callback(xhr.responseText);
      else
        document.querySelector(".header").innerText = JSON.parse(xhr.responseText).error;
    }
  };
  xhr.timeout = () => {
    document.querySelector(".header").innerText = "連線超時";
    loading = false;
  }
  xhr.onerror = () => {
    alert(`沒有網路連線, 無法取得${selected.class}的課表`);
    loading = false;
  }
  xhr.open("GET", `/api/${options}?class=${encodeURI(selected.link)}`, true);
  xhr.send();
}

function write2db(_class, db){
  memory[_class] = JSON.parse(db);
  if(typeof(Storage)!=="undefined"){
    localStorage.setItem(_class, (db));
  }
}

function readDB(_class){
  if(typeof(Storage)!=="undefined"&&memory[_class]==undefined){
    let db = JSON.parse(localStorage.getItem(_class));
    if(db)
      memory[_class] = (db);
    // memory[_class] = JSON.parse(localStorage.getItem[_class]);
  }
  if(memory[_class]!=undefined)
    return memory[_class];
  return false;
}

function clearLocalStorage(){
  if(!confirm("你確定要刪除所有下載的資料嗎?\n此功能刪除舊有的課表"))
    return;
  memory = new Object();
  Object.keys(localStorage).forEach(v=>localStorage.removeItem(v));
  return localStorage;
}
window.onload = setup;

//PWA part
//PWA onload event
function pwaOnloadEvent(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker
        .register('/service-worker.js')
        .then(function(){
            console.log('Service Worker 註冊成功');
        }).catch(function(error) {
            console.log('Service worker 註冊失敗:', error);
        });
  } else {
    console.log('瀏覽器不支援 Service-worker');
  }
}
//PWA onload event end

var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(event){
  event.preventDefault();
  deferredPrompt = event;
  Console.log(event);
  return false;
});



//PWA part end


// debug function

function Time(){
  let d = new Date();
  return `${d.getFullYear()}/${d.getMonth()}/${d.getDay()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${("00"+d.getMilliseconds()).substr(-3)}`;
}

// debug function end