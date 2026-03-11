// ==========================================
// 1. ELEMENT LOGIC
// ==========================================

// 1. E-HEATER
elements.e_heater = {
    color: ["#ff8c00"],
    colorObject: [{r: 255, g: 140, b: 0}], 
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1,
    insulate: true,
    hardness: 1,
    tempGoal: 200,
    desc: "Electric heater. Needs a spark to heat up to 200 degrees.",
    
    tick: function(pixel) {
        if (!pixel.charge) return;
        let goal = elements.e_heater.tempGoal;
        let dirs = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
        
        for (let i = 0; i < dirs.length; i++) {
            let x = pixel.x + dirs[i][0];
            let y = pixel.y + dirs[i][1];
            if (!isEmpty(x, y, true)) {
                let other = pixelMap[x][y];
                if (other.temp < goal) {
                    other.temp += 5;
                    pixelTempCheck(other);
                }
            }
        }
    }
};

// 2. E-CABLE (Data Wire with Cooldown Fix)
elements.e_cable = {
    color: ["#00ffff"], 
    colorObject: [{r: 0, g: 255, b: 255}],
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    desc: "Data cable. Transmits data signals. Ignores electricity.",
    
    tick: function(pixel) {
        if (pixel.data_cooldown === undefined) pixel.data_cooldown = 0;
        if (pixel.data_cooldown > 0) pixel.data_cooldown--;

        if (pixel.data_charge > 0) {
            pixel.color = "rgb(255, 255, 255)"; // White when ON
            pixel.data_charge--; 
            
            let dirs = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
            for (let i = 0; i < dirs.length; i++) {
                let x = pixel.x + dirs[i][0];
                let y = pixel.y + dirs[i][1];
                if (!isEmpty(x, y, true)) {
                    let other = pixelMap[x][y];
                    // Pass data if neighbor is a cable, has no charge, AND has no cooldown
                    if (other.element === "e_cable" && !other.data_charge && other.data_cooldown === 0) {
                        other.data_charge = 2; 
                        other.data_cooldown = 4; // Lock for 4 frames to prevent infinite bouncing
                    }
                }
            }
        } else {
            pixel.color = "rgb(0, 255, 255)"; // Cyan when OFF
        }
    }
};

// 3. E-SWITCH (Sends both Power and Data)
elements.e_switch = {
    color: ["#444444"], 
    colorObject: [{r: 68, g: 68, b: 68}], 
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1, 
    desc: "Toggle switch. Outputs electricity to wires and data to cables.",
    
    tick: function(pixel) {
        if (pixel.isOn === undefined) {
            pixel.isOn = false;
            pixel.cooldown = 0;
        }
        if (pixel.cooldown > 0) pixel.cooldown--;

        let beingShocked = false;
        let dirs = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];

        for (let i = 0; i < dirs.length; i++) {
            let x = pixel.x + dirs[i][0];
            let y = pixel.y + dirs[i][1];
            if (!isEmpty(x, y, true)) {
                let other = pixelMap[x][y];
                if (other.element === "electric" || other.element === "lightning") {
                    beingShocked = true;
                    break; 
                }
            }
        }

        if (beingShocked && pixel.cooldown === 0) {
            pixel.isOn = !pixel.isOn;
            pixel.cooldown = 20; 
        }

        if (pixel.isOn) {
            pixel.color = "rgb(0, 255, 0)"; 
            for (let i = 0; i < dirs.length; i++) {
                let x = pixel.x + dirs[i][0];
                let y = pixel.y + dirs[i][1];
                if (!isEmpty(x, y, true)) {
                    let other = pixelMap[x][y];
                    
                    if (other.element === "e_cable") {
                        other.data_charge = 2; // Send fast data
                    } 
                    else if (elements[other.element] && elements[other.element].conduct) {
                        other.charge = 5; // Send power
                    }
                }
            }
        } else {
            pixel.color = "rgb(68, 68, 68)"; 
        }
    }
};

// 4. E-GROUND (Instant BFS Color and Drain)
elements.e_ground = {
    color: ["#280505"], 
    colorObject: [{r: 40, g: 5, b: 5}], 
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",
    conduct: 1, 
    desc: "Smart ground. Instantly colors the whole rod and drains charge when connected to data.",
    
    tick: function(pixel) {
        let dirs = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
        let isReceivingData = false;

        // 1. Am I directly touching an active data source?
        for (let i = 0; i < dirs.length; i++) {
            let nx = pixel.x + dirs[i][0];
            let ny = pixel.y + dirs[i][1];
            if (!isEmpty(nx, ny, true)) {
                let other = pixelMap[nx][ny];
                if ((other.element === "e_cable" && other.data_charge > 0) || 
                    (other.element === "e_switch" && other.isOn)) {
                    isReceivingData = true;
                    break;
                }
            }
        }

        // 2. If directly touching data, run BFS to turn the WHOLE rod ON instantly
        if (isReceivingData) {
            pixel.color = "rgb(150, 75, 0)"; // Brown
            pixel.charge = 0;
            
            let queue = [[pixel.x, pixel.y]];
            let visited = new Set();
            visited.add(`${pixel.x},${pixel.y}`);
            let maxSearch = 1500; 
            let iterations = 0;

            while (queue.length > 0 && iterations < maxSearch) {
                let current = queue.shift();
                let cx = current[0];
                let cy = current[1];
                iterations++;

                for (let i = 0; i < dirs.length; i++) {
                    let nx = cx + dirs[i][0];
                    let ny = cy + dirs[i][1];

                    if (!isEmpty(nx, ny, true)) {
                        let key = `${nx},${ny}`;
                        if (!visited.has(key)) {
                            visited.add(key);
                            let other = pixelMap[nx][ny];

                            // Propagate ON state to rest of ground rod
                            if (other.element === "e_ground") {
                                other.color = "rgb(150, 75, 0)";
                                other.justActivated = true; // Tell it to stay on this frame
                                other.charge = 0;
                                queue.push([nx, ny]);
                            } 
                            // Drain connected power
                            else if (other.charge && elements[other.element] && elements[other.element].conduct) {
                                other.charge = 0; 
                                queue.push([nx, ny]); 
                            }
                        }
                    }
                }
            }
        } else {
            // 3. Not directly receiving data. Check if BFS turned me ON this frame.
            if (pixel.justActivated) {
                pixel.justActivated = false; // Reset for next frame
            } else {
                pixel.color = "rgb(40, 5, 5)"; // Turn OFF (Black-Red)
            }
        }
    }
};

// ==========================================
// 2. HTML BUTTON INJECTION (For F12 Console)
// ==========================================
function createUIBtn(idName, elementID, text, bgColor) {
    if (document.getElementById(idName)) return; 
    let btn = document.createElement("button");
    btn.id = idName;
    btn.className = "elementButton";
    btn.setAttribute("element", elementID);
    btn.innerText = text;
    btn.style.background = bgColor;
    btn.onclick = function() {
        currentElement = elementID;
        let allBtns = document.getElementsByClassName("elementButton");
        for (let i = 0; i < allBtns.length; i++) {
            allBtns[i].setAttribute("current", "false");
        }
        this.setAttribute("current", "true");
    };
    document.getElementById("category-machines").appendChild(btn);
}

createUIBtn("elementButton-e_heater", "e_heater", "E-Heater", "#ff8c00");
createUIBtn("elementButton-e_cable", "e_cable", "E-Cable", "#00ffff");
createUIBtn("elementButton-e_switch", "e_switch", "E-Switch", "#444444");
createUIBtn("elementButton-e_ground", "e_ground", "E-Ground", "#280505");
