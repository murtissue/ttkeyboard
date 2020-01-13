/**
* TTKeyboard
* GPIO 0 ~ GPIO 13 Input Pullup
* GPIO 14 ~ GPIO 18 OUTPUT
*/
const fs = require('fs'); 
const Gpio = require('onoff').Gpio;
const pinCol0 = new Gpio(0, 'in', 'both');
const pinCol1 = new Gpio(1, 'in', 'both');
const pinCol2 = new Gpio(2, 'in', 'both');
const pinCol3 = new Gpio(3, 'in', 'both');
const pinCol4 = new Gpio(4, 'in', 'both');
const pinCol5 = new Gpio(5, 'in', 'both');
const pinCol6 = new Gpio(6, 'in', 'both');
const pinCol7 = new Gpio(7, 'in', 'both');
const pinCol8 = new Gpio(8, 'in', 'both');
const pinCol9 = new Gpio(9, 'in', 'both');
const pinCol10 = new Gpio(10, 'in', 'both');
const pinCol11 = new Gpio(11, 'in', 'both');
const pinCol12 = new Gpio(12, 'in', 'both');
const pinCol13 = new Gpio(13, 'in', 'both');
const pinRow0 = new Gpio(14, 'out');
const pinRow1 = new Gpio(15, 'out');
const pinRow2 = new Gpio(16, 'out');
const pinRow3 = new Gpio(17, 'out');
const pinRow4 = new Gpio(18, 'out');
const pinCols=[pinCol0,pinCol1,pinCol2,pinCol3,pinCol4,pinCol5,pinCol6,pinCol7,pinCol8,pinCol9,pinCol10,pinCol11,pinCol12,pinCol13];
const inputBuffer = Buffer.alloc(8);
const ledStateBuffer = Buffer.alloc(1);
const regularKeyID={
  'Reserved' : 0,
  'ErrorRollOver' : 1,
  'POSTFail' : 2,
  'ErrorUndefined' : 3,
  'a' : 4,
  'b' : 5,
  'c' : 6,
  'd' : 7,
  'e' : 8,
  'f' : 9,
  'g' : 10,
  'h' : 11,
  'i' : 12,
  'j' : 13,
  'k' : 14,
  'l' : 15,
  'm' : 16,
  'n' : 17,
  'o' : 18,
  'p' : 19,
  'q' : 20,
  'r' : 21,
  's' : 22,
  't' : 23,
  'u' : 24,
  'v' : 25,
  'w' : 26,
  'x' : 27,
  'y' : 28,
  'z' : 29,
  '1' : 30,
  '2' : 31,
  '3' : 32,
  '4' : 33,
  '5' : 34,
  '6' : 35,
  '7' : 36,
  '8' : 37,
  '9' : 38,
  '0' : 39,
  'Return' : 40, //Return(ENTER)
  'ESCAPE' : 41,
  'DELETE': 42, //DELETE(backspace)
  'Tab' : 43,
  'Spacebar' : 44,
  '-' : 45,
  '=' : 46,
  '[' : 47,
  ']' : 48,
  '\\' : 49,
  'Non-US' : 50,
  ';' : 51,
  '\'': 52,
  'Grave Accent' : 53,
  ',' : 54,
  '.' : 55,
  '/' : 56,
  'Caps Lock': 57,
  'F1' : 58,
  'F2' : 59,
  'F3' : 60,
  'F4' : 61,
  'F5' : 62,
  'F6' : 63,
  'F7' : 64,
  'F8' : 65,
  'F9' : 66,
  'F10' : 67,
  'F11' : 68,
  'F12' : 69,
  'PrintScreen' : 70,
  'Scroll Lock' : 71,
  'Pause' : 72,
  'Insert' : 73,
  'Home' : 74,
  'PageUp' : 75,
  'Delete Forward' : 76,
  'End' : 77,
  'PageDown' : 78,
  'RightArrow' : 79,
  'LeftArrow' : 80,
  'DownArrow' : 81,
  'UpArrow' : 82,
  'Mute' : 127,
  'Volume Up' : 128,
  'Volume Down' : 129
};

const modifierKeyID={
  'LeftControl':1,
  'LeftShift':2,
  'LeftAlt':4,
  'Left GUI':8,
  'RightControl':16, //Hanja
  'RightShift':32,
  'RightAlt':64, //Hangeul
  'Right GUI':128
};

const multipleModifierKeys=[];

let fnKey=false;
let reboot=false;
let shutdown=false;
let exec = require('child_process').exec,child;

const ttkLayout={
  row0:['ESCAPE','1','2','3','4','5','6','7','8','9','0','-','=','DELETE'],
  row1:['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  row2:['RightAlt','a','s','d','f','g','h','j','k','l',';','\'','Return'],
  row3:['LeftShift','z','x','c','v','b','n','m',',','.','UpArrow','/','RightShift'],
  row4:['LeftControl','Left GUI','LeftAlt','Caps Lock','Spacebar','LeftArrow','DownArrow','RightArrow','Fn']
};

const ttkLayoutFnKey={
  row0:['Grave Accent','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Delete Forward'],
  row1:['Tab','q','w','e','r','t','y','u','PrintScreen','Scroll Lock','Pause','[',']','\\'],
  row2:['RightAlt','a','s','d','f','g','h','Insert','Home','PageUp',';','\'','Return'],
  row3:['LeftShift','z','x','c','v','b','n','j','End','PageDown','UpArrow','/','RightShift'],
  row4:['LeftControl','Left GUI','LeftAlt','RightControl','Spacebar','LeftArrow','DownArrow','RightArrow','Fn']
};

const press=(usageID)=>{
  const regularObjKey=Object.keys(regularKeyID);
  const modifierObjKey=Object.keys(modifierKeyID);
  let setAllModKeys=0;

  if(modifierObjKey.indexOf(usageID)!=-1){

    for(let i=0; i<modifierObjKey.length; i++){
      if(usageID==modifierObjKey[i]){
          multipleModifierKeys[i]=modifierKeyID[usageID];

          for(let num in multipleModifierKeys){
            setAllModKeys+=multipleModifierKeys[num];
          }
          inputBuffer[0]=setAllModKeys;
          return;
      }
    }

  }
  else if(regularObjKey.indexOf(usageID)!=-1){

    for(let i=2; i<inputBuffer.length; i++){
      if(inputBuffer[i]==regularKeyID[usageID]){
        return;
      }
    }

    for(let i=2; i<inputBuffer.length; i++){
      if(inputBuffer[i]==0){
        inputBuffer[i]=regularKeyID[usageID];
        return;
      }
    }

  }

}

const release=(usageID)=>{
  const regularObjKey=Object.keys(regularKeyID);
  const modifierObjKey=Object.keys(modifierKeyID);
  let setAllModKeys=0;

  if(modifierObjKey.indexOf(usageID)!=-1){

    for(let i=0; i<modifierObjKey.length; i++){
      if(usageID==modifierObjKey[i]){
          multipleModifierKeys[i]=0;

          for(let num in multipleModifierKeys){
            setAllModKeys+=multipleModifierKeys[num];
          }
          inputBuffer[0]=setAllModKeys;
          break;
      }
    }

  }

  if(regularObjKey.indexOf(usageID)!=-1){

    for(let i=2; i<inputBuffer.length; i++){
      if(inputBuffer[i]==regularKeyID[usageID]){
        inputBuffer[i]=0;
      }
    }

  }

}

const releaseAll=()=>{
  inputBuffer[0]=0;
  inputBuffer[1]=0;
  inputBuffer[2]=0;
  inputBuffer[3]=0;
  inputBuffer[4]=0;
  inputBuffer[5]=0;
  inputBuffer[6]=0;
  inputBuffer[7]=0;
}

const sendKey=()=>{
  const stream = fs.createWriteStream('/dev/hidg0');
  stream.write(inputBuffer.toString());
  stream.end();
}
/*
const ledStates=(()=>{

  const stream = fs.createReadStream('/dev/hidg0');
  stream.on('data', function(data){
    ledStateBuffer[0]=data[0];
    // console.log(ledStateBuffer.toString('hex'));

  });

  stream.on('end', function(data){
    console.log('end');
    this.end();
  });

})();
*/
const scan=()=>{

  pinRow0.writeSync(Gpio.LOW)
  for(let i=0; i<pinCols.length; i++){
    if(!pinCols[i].readSync()){
      if(fnKey==false) press(ttkLayout.row0[i]);
      else press(ttkLayoutFnKey.row0[i]);
    }else{
      if(fnKey==false) release(ttkLayout.row0[i]);
      else release(ttkLayoutFnKey.row0[i]);
    }
  }
  pinRow0.writeSync(Gpio.HIGH);

  pinRow1.writeSync(Gpio.LOW);
  for(let i=0; i<pinCols.length; i++){
    if(!pinCols[i].readSync()){
      if(fnKey==false) press(ttkLayout.row1[i]);
      else press(ttkLayoutFnKey.row1[i]);
    }else{
      if(fnKey==false) release(ttkLayout.row1[i]);
      else release(ttkLayoutFnKey.row1[i]);
    }
  }
  pinRow1.writeSync(Gpio.HIGH);

  pinRow2.writeSync(Gpio.LOW);
  for(let i=0; i<pinCols.length; i++){
    if(!pinCols[i].readSync()){
      if(fnKey==false) press(ttkLayout.row2[i]);
      else press(ttkLayoutFnKey.row2[i]);
    }else{
      if(fnKey==false) release(ttkLayout.row2[i]);
      else release(ttkLayoutFnKey.row2[i]);
    }
  }
  pinRow2.writeSync(Gpio.HIGH);

  pinRow3.writeSync(Gpio.LOW);
  for(let i=0; i<pinCols.length; i++){
    if(!pinCols[i].readSync()){
      if(fnKey==false) press(ttkLayout.row3[i]);
      else press(ttkLayoutFnKey.row3[i]);
    }else{
      if(fnKey==false) release(ttkLayout.row3[i]);
      else release(ttkLayoutFnKey.row3[i]);
    }
  }
  pinRow3.writeSync(Gpio.HIGH);

  pinRow4.writeSync(Gpio.LOW);
  for(let i=0; i<4; i++){
    if(!pinCols[i].readSync()){
      if(fnKey==false) press(ttkLayout.row4[i]);
      else press(ttkLayoutFnKey.row4[i]);
    }else{
      if(fnKey==false) release(ttkLayout.row4[i]);
      else release(ttkLayoutFnKey.row4[i]);
    }
  }

  if(!pinCol6.readSync()){
    if(fnKey==false) press(ttkLayout.row4[4]);
    else press(ttkLayoutFnKey.row4[4]);
  }else{
    if(fnKey==false) release(ttkLayout.row4[4]);
    else release(ttkLayoutFnKey.row4[4]);
  }

  for(let i=9; i<12; i++){
    if(!pinCols[i].readSync()){
      if(fnKey==false) press(ttkLayout.row4[i-4]);
      else press(ttkLayoutFnKey.row4[i-4]);
    }else{
      if(fnKey==false) release(ttkLayout.row4[i-4]);
      else release(ttkLayoutFnKey.row4[i-4]);
    }
  }

  if(!pinCol12.readSync()){
    fnKey=true;
  }else{
    fnKey=false;
  }
  pinRow4.writeSync(Gpio.HIGH)

  sendKey();

  if(inputBuffer[0]==modifierKeyID['LeftControl']&&inputBuffer[2]==regularKeyID['r']&&fnKey==true){
    reboot=true;
    releaseAll();
    sendKey();
    clearInterval(loop);
  }//reboot raspberry pi

  if(inputBuffer[0]==modifierKeyID['LeftControl']&&inputBuffer[2]==regularKeyID['s']&&fnKey==true){
    shutdown=true;
    releaseAll();
    sendKey();
    clearInterval(loop);
  }//shutdown raspberry pi
}

const loop = setInterval(scan,10);

process.on('SIGINT',() => {
  releaseAll();
  sendKey();
  clearInterval(loop);
  pinCol0.unexport();
  pinCol1.unexport();
  pinCol2.unexport();
  pinCol3.unexport();
  pinCol4.unexport();
  pinCol5.unexport();
  pinCol6.unexport();
  pinCol7.unexport();
  pinCol8.unexport();
  pinCol9.unexport();
  pinCol10.unexport();
  pinCol11.unexport();
  pinCol12.unexport();
  pinCol13.unexport();
  pinRow0.unexport();
  pinRow1.unexport();
  pinRow2.unexport();
  pinRow3.unexport();
  pinRow4.unexport();
});

process.on('exit',() => {
  if(reboot==true){
    child = exec('sudo reboot',(err, stdout, stderr)=>{
      if(err !== null){
        throw err;
      }
    });
  }
  if(shutdown==true){
    child = exec('sudo shutdown -h now',(err, stdout, stderr)=>{
      if(err !== null){
        throw err;
      }
    });
  }
  clearInterval(loop);
  process.exit();
});
