var carColor = '#ffffff';   //0xffffff格式
var carDoorState = false;  //true,flase格式

var hasLoad = false;

var carVisible = true;

var stateMap = {
    'qlc' : 0,
    'hlc' : 0,
    'qrc' : 0,
    'hrc' : 0,
    'bc' : 0,
    'tcc' : 0,
    'light' : 0,
    'Rot' : 1,
    'wheel': 0,
    'qlbc' : 0.0,
    'qrbc' : 0.0,
    'hlbc' : 0.0,
    'hrbc' : 0.0
}
function changeAnyColor(c)
{
    if(!hasLoad) return;
    carColor = c;
}

function setDoorState(st)
{
    if(!hasLoad) return;
    carDoorState = st;
    console.log(st);
}

function openDoor(nm, vl)
{
    if(!hasLoad) return;
    stateMap[nm] = vl;
}

function openWindows(nm, stat, vl)
{
    if(!hasLoad) return;
    stateMap[nm] = vl;
}

function rotationToggle(vl)
{
    if(!hasLoad) return;
    stateMap['Rot'] = vl;
}

function lightToggle(vl)
{
    if(!hasLoad) return;
    stateMap['light'] = vl;
}

function speedToggle(vl)
{
    if(!hasLoad) return;
    stateMap['wheel'] = vl;
}

function pause()
{
    if(!hasLoad) return;
    carVisible = false;
}

function recovery()
{
    if(!hasLoad) return;
    carVisible = true;
}

//调用测试
// setCarColor(0xffffff);
// setDoorState(true);