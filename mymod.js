elements.e_heater = {
    color: "#ff9933",
    behavior: behaviors.WALL,
    category: "machines",
    conduct: 1,
    desc: "Electric heater. Heats nearby pixels when powered.",
    
    tick: function(pixel) {
        if (pixel.charge) {
            var coords = [
                [0,-1],[0,1],[-1,0],[1,0],
                [-1,-1],[1,-1],[-1,1],[1,1]
            ];
            
            for (var i = 0; i < coords.length; i++) {
                var x = pixel.x + coords[i][0];
                var y = pixel.y + coords[i][1];
                
                if (!isEmpty(x,y,true)) {
                    var target = pixelMap[x][y];
                    target.temp += 5;
                    pixelTempCheck(target);
                }
            }
        }
    }
};
