
import {switches, gates, Switch, Gate} from "./gates.js";
import {drag} from "./drag.js";

let wires = [];
let connections = [];
export const canvas = document.getElementById('circuit');
export const ctx = canvas.getContext("2d");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
let switchCount = 0;
let gateCount = 0;

export function wireable(el) {

    el.onmousedown = startRope;

    let elRect = el.getBoundingClientRect();
    let x = elRect.left + 7;
    let y = elRect.top + 7;
    


    var x2 = 0, y2 = 0;

    function startRope(e) {
        
        e = e || window.event;
        e.preventDefault();

        document.onmousemove = drawRope;
        document.onkeydown = quitRope;
        
        for (let input of document.getElementsByClassName("input")) {
            input.onclick = endRope;
        }

        elRect = el.getBoundingClientRect();
        x = elRect.left + 7;
        y = elRect.top + 7;


    }

    function drawRope(e) {
        e = e || window.event;
        e.preventDefault();

        x2 = e.clientX;
        y2 = e.clientY;

        drawWires();
        drawLine(x, y, x2, y2);
    }

    function endRope(e) {
        document.onmousemove = null;
        // loop through all elements with class "input"
        for (let input of document.getElementsByClassName("input")) {
            input.onclick = null;
        }
        var elem = document.elementFromPoint(x2, y2);
        var elemRect = elem.getBoundingClientRect();
        let pair = [el, elem];
        if (wires.includes(pair)) return;
        wires.push(pair);
        connections.push([el.parentElement.id, elem.parentElement.id]);
        drawWires();
        updateCircuit();
    }

}
function quitRope(e) {
    document.onmousemove = null;
    for (let input of document.getElementsByClassName("input")) {
        input.onclick = null;
    }
    drawWires();
}

// function to draw line between two points on canvas
function drawLine(x1, y1, x2, y2, color) {

    ctx.strokeStyle = color;
    ctx.width = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

document.body.onload = function() {
    // loop through all elements with class "output"
    for (let output of document.getElementsByClassName("output")) {
        wireable(output);
    }
}

export function drawWires() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let wire of wires) {

        drawLine(wire[0].getBoundingClientRect().left + 7, wire[0].getBoundingClientRect().top + 7, wire[1].getBoundingClientRect().left + 7, wire[1].getBoundingClientRect().top + 7, "black");
        
    }
}




// when switch-origin is clicked, create switch
document.getElementById("new-switch").onclick = () => createSwitch();


// function to create a new switch
function createSwitch() {
    let s = document.createElement("div");
    s.setAttribute("class", "switch");
    s.setAttribute("value", 0);
    switchCount++;
    document.getElementById("switches").appendChild(s);
    let o = document.createElement("div");
    o.setAttribute("class", "output");
    s.appendChild(o);
    s.id = "s" + switchCount;
    new Switch(s.id);
    s.oncontextmenu = function(e) {
        e.preventDefault();
        quitRope(e);
        flip(s.id);
    }
    wireable(o);
    drawWires();
    
}

function createGate(type) {
    gateCount++;
    let g = document.createElement("div");
    g.className = "gate";
    g.id = "g" + gateCount;
    g.setAttribute("type", type);
    let in1 = document.createElement("div");
    in1.className = "input";
    in1.id = "1";
    let in2 = document.createElement("div");
    in2.className = "input";
    in2.id = "2";
    g.style.backgroundColor = randomColor();
    g.innerHTML = type;
    let out = document.createElement("div");
    out.className = "output";
    g.appendChild(in1);
    g.appendChild(in2);
    g.appendChild(out);
    document.getElementById("page").appendChild(g);
    wireable(out);
    g.ondblclick = () => drag(g);
}

        
function flip(id) {
    for (let s of switches) {
        if (s.id == id) {
            s.swap();
            document.getElementById(id).setAttribute("value", s.out);
            if (s.out) {
                document.getElementById(id).childNodes[0].style.backgroundColor = "#c23131";
            } else {
                document.getElementById(id).childNodes[0].style.backgroundColor = "#1b1919";
            }
        }
    }
    updateCircuit();
}



function updateCircuit() {

  gates.forEach(g => {
    g.destroy;
    g = null;
  })

  
    console.log("num switches: " + switches.length + " num gates: " + gates.length);
  
    let connectionsDict = {};
    let gateStack = [];

    for (let i = gateCount; i > 0; -- i) {
        gateStack.push('g' + i);
    }

    connections.forEach(i => {

        let input = i[0];
        let gate = i[1];
      console.log("input: "  + input + " gate: " + gate);

        if (!connectionsDict[gate]) {
            connectionsDict[gate] = [input];
        } else {
            connectionsDict[gate].push(input);
        }

    });
    console.log("conDict: " + connectionsDict);
  

    while (gateStack.length > 0) {
        gateStack.forEach(id => {
            traceGate(id);
        });
    }
    flipDiode();

    function traceGate(id) {

      
    if (document.getElementById(id).getAttribute("type") == "NOT") {


        let ins = connectionsDict[id][0];
        let inputs = [];

        if (ins.includes("s")) {
            switches.forEach(s => {
                if (s.id == ins) {
                    inputs.push(s);
                }
            });
        } else if (ins.includes("g")) {
            gates.forEach(g => {
                if (g.id == ins) {
                    inputs.push(g);
                }
            });
        } else {
            return;
        }

        if (!inputs || inputs.length != 1) return;
        let g = new Gate("NOT", id, inputs);
        console.log(id + " : " + inputs);
        gateStack = arrayRemove(gateStack, id);

        
    } else {


        let ins = connectionsDict[id];
        console.log("ins: " + ins);
        var inputs = [];

        if (!ins) {gateStack = arrayRemove(gateStack, id); return;}
        if (ins.length < 2) {gateStack = arrayRemove(gateStack, id); return;}
        ins.forEach(i => {
          if(inputs.length >= 2) return;
            if (i.includes("s")) {
                switches.forEach(s => {
                    if (s.id == i) {
                        inputs.push(s);
                    }
                });
            }

            if(i.includes("g")) {
                gates.forEach(g => {
                    if (g.id == i) {
                        if (inputs.includes(g)) return;
                        inputs.push(g);
                    }
                });
            }


        });


            if (inputs.length < 2) return;
            inputs = [...new Set(inputs)];
            console.log("new inputs: " + inputs);
            let g = new Gate(document.getElementById(id).getAttribute("type"), id, inputs);
        console.log(id + " : " + inputs + " : " + g.out);
      for(let p of inputs) {
        switches.forEach(s => {
          if (s.id == p.id) {
            console.log(s.id + " : " + s.out);
          }
        });
        gates.forEach(g => {
          if (g.id == p.id) {
            console.log(g.id + " : " + g.out);
          }
        })
      }
            gateStack = arrayRemove(gateStack, id);
        }
    }

    function flipDiode() {
        let inputs = [];
    
        if (!connectionsDict["diode"]) return;
        connectionsDict["diode"].forEach(i => {
            if (i.includes("s")) {
                switches.forEach(s => {
                    if (s.id == i) {
                        inputs.push(s.out);
                    }
                });
            }
            if (i.includes("g")) {
                gates.forEach(g => {
                    if(g.id == i) {
                        inputs.push(g.out);
                    }
                });
            }
        });

        if (inputs.includes(1)) {
            document.getElementById("diode").childNodes[1].style.backgroundColor = "#c23131";
        } else {
            document.getElementById("diode").childNodes[1].style.backgroundColor = "#1b1919";
        }

    }

}







// function to remove an element from an array
export function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });

}

// function to return random color
function randomColor() {
    let color = "hsl(" + Math.random() * 360 + ", 100%, 75%)";
    return color;
  }

function download(filename, text) {
    var el = document.createElement("a");
    el.setAttribute("href", 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    el.setAttribute("download", filename);
    el.style.display = "none";
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);

}
function readFile(callback) {
    const file = document.getElementById("file-upload").files[0];
    const reader = new FileReader();
    reader.onload = () => {
        let data = reader.result;
        callback(data);
    }
    reader.readAsText(file);
}


function save() {

    let saveObj = [];
    let temp = [];
    for (let i = 1; i <= gateCount; ++ i) {
        let el = document.getElementById('g' + i);
        let data = [el.style.left, el.style.top, el.getAttribute("type")];
        temp.push(data);
    }
    saveObj.push(temp);
    saveObj.push([switchCount, connections]);
    saveObj = JSON.stringify(saveObj);
    download(document.getElementById("file-name").value + ".json", saveObj);

}

// data format
// [[[gate1], [gate2]], [switchCount, connections]]

async function load(data) {
    data = JSON.parse(data);

    console.log(data);

    let ss = data[0];
    ss.forEach(s => {
        
        createGate(s[2]);
        document.getElementById("g" + gateCount).style.left = s[0];
        document.getElementById("g" + gateCount).style.top = s[1];

    });
    for (let i = 0; i < parseInt(data[1][0]); ++ i) {
        createSwitch();
    }

    connectionsToWires(data[1][1]);
    connections = data[1][1];
    updateCircuit();
}


document.getElementById("save").onclick = function() {
    document.getElementById("save-modal").style.display = "block";
    document.addEventListener("keydown", (ev) => {
        if (ev.keyCode == 27) {
            document.getElementById("save-modal").style.display = "none";
        }
    });
    document.getElementById("save-button").onclick = function() {
        save();
        document.getElementById("save-modal").style.display = "none";
    }
}

document.getElementById("load").onclick = function() {
    document.getElementById("load-modal").style.display = "block";
    document.addEventListener("keydown", (ev) => {
        if (ev.keyCode == 27) {
            document.getElementById("load-modal").style.display = "none";
        }
    });
    document.getElementById("upload-button").onclick = function() {
        readFile(load);
        document.getElementById("load-modal").style.display = "none";
    }
}


function connectionsToWires(data) {
    data.forEach(i => {
        let from = i[0];
        let to = i[1];
        let pair = [];
        if(from.includes("s")) {
            pair.push(document.getElementById(from).childNodes[0]);
        } else if (from.includes("g")) {
            pair.push(document.getElementById(from).childNodes[3]);
        }

        if (to.includes("g")) {
            wires.some(function(wire) {
                if(wire[1] == to) {
                    pair.push(document.getElementById(to).childNodes[1]);
                    return 1;
                }
            });
            if (pair.length != 2) {
                pair.push(document.getElementById(to).childNodes[2]);
            }
        } else if (to == "diode") {
            pair.push(document.getElementById("diode").childNodes[1]);
        }

        wires.push(pair);
    });
    
    console.log("wires: " + wires);
    drawWires();
}

document.getElementById("new-and").onclick = () => createGate("AND");
document.getElementById("new-or").onclick = () => createGate("OR");
document.getElementById("new-not").onclick = () => createGate("NOT");
document.getElementById("new-nor").onclick = () => createGate("NOR");
document.getElementById("new-nand").onclick = () => createGate("NAND");
