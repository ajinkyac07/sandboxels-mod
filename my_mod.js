elements.e_heater = {
    color: ["#ff8c00"],
    colorObject: [{r: 255, g: 140, b: 0}], // This manual RGB conversion stops the crash!
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
        let dirs = [
            [0, -1], [0, 1], [-1, 0], [1, 0],
            [-1, -1], [1, -1], [-1, 1], [1, 1]
        ];
        
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
