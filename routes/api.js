const express = require('express');
const router = express.Router();

const api = require('../modules/api');

var memory = new Object(), list = null;
router.get('/list', (req, res)=>{
  if(list!=null){
    return res.json(list);
  }else{
    return api.list((data)=>{
      if(data.error)
        return res.status(503).send(data);
      list = data;
      res.json(list);
    })
  }
});

router.get('/data', function(req, res){
  var name = req.query.class;
  if(name){
    api.course(name, (data)=>{
      if(data.error){
        return res.status(503).send(data);
      }else{
        memory[name] = data;
        return res.json(memory[name]);
      }
    });
  }else{
    return res.status(400).json({error:"class name it's not exist, please try again."});
  }
});

module.exports = router;
