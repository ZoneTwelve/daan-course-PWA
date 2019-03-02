const murl = "http://ta.taivs.tp.edu.tw/contact/show_class.asp?classn=",
      request = require('request'),
      cheerio = require("cheerio"),
      iconv = require('iconv-lite'),
      urlencode = require('urlencode');

function main(Class, callback){
  let url = murl+urlencode(Class, 'big5');
  let options = {
    url:url,
    encoding:'binary'
  }
  request(options, (e, r, d)=>{
    let html = iconv.decode(new Buffer.from(d, "binary"),"Big5");
    if(e||!d)
      return callback({error:"網路發生無法預期的錯誤"});
    if((/班級格式有誤，請修改/g).test(html))
      return callback({error:'班級格式有誤, ex:電機107甲'});
    if(/有類似的班級/g.test(html))
      return callback({error:'有類似的班級'});
    if(/目前沒有/g.test(html))
      return callback({error:`目前沒有${Class}的班級課表！`});
    let $ = cheerio.load(html);
    var list = $('table[align="center"]>tbody>tr>td[width="13%"]');
    let data = new Array(5);
    for(var i=0;i<data.length;i++)data[i] = new Array();
    for(var i=0;i<list.length;i++){
      let el = list.eq(i).html().match(/\>(\S+)\<br\>(\S+)/);
      if(el){
        data[(i%5)].push({
          subject:$('<textarea />').html(el[1]).text().trim(),
          teacher:$('<textarea />').html(el[2]).text().trim()
        });
        if(data[(i%5)].length===4){
          data[(i%5)].push({
            subject:'午休',
            teacher:''
          })
        }
      }
    }
    return callback(data);
  });
}

function list(callback){
  let options = {
    url:'http://ta.taivs.tp.edu.tw/contact/all_class.asp',
    encoding:'binary'
  }

  request(options, (e,r,d)=>{
    console.log(e);
    if(e||!d)
      return callback({error:'網路發生無法預期的錯誤', message:e});
    let html = iconv.decode(new Buffer.from(d, "binary"),"Big5");
    let $ = cheerio.load(html);
    let data = [];
    let result = $('table>tbody>tr>td>a');
    for(var i=0;i<result.length;i++){
      data.push({
        class:result.eq(i).text(),
        link:result.eq(i).text().replace(/一|二|三/g, result.eq(i).attr('href').match(/classn=\S+(\d{3})&?/).pop())
      });
    }
    return callback(data);
  })
}

exports.course = main;
exports.list = list;
