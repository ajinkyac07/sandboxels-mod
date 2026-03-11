elements.e_heater = {
    color: "#ff7f00",
    behavior: behaviors.WALL,
    category: "machines",
    conduct: 1,
    insulate: true,
    tempGoal: 200,
    hardness: 1,

    desc: "Electric heater with adjustable target temperature",

    onSelect: function() {
        var t = prompt("Enter target temperature (°C):", elements.e_heater.tempGoal);
        if (t !== null) {
            elements.e_heater.tempGoal = parseFloat(t);
        }
    },

    tick: function(pixel) {

        if (!pixel.charge) return;

        var targetTemp = elements.e_heater.tempGoal;

        var dirs = [
            [0,-1],[0,1],[-1,0],[1,0],
            [-1,-1],[1,-1],[-1,1],[1,1]
        ];

        for (var i = 0; i < dirs.length; i++) {

            var x = pixel.x + dirs[i][0];
            var y = pixel.y + dirs[i][1];

            if (!isEmpty(x,y,true)) {

                var p = pixelMap[x][y];

                if (p.temp < targetTemp) {
                    p.temp += 4;
                    pixelTempCheck(p);
                }

            }
        }
    }
};
