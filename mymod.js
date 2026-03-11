elements.e_heater = {
    color: "#ff8c00",
    category: "machines",
    behavior: behaviors.WALL,
    conduct: 1,
    temp: 20,
    tempGoal: 200,
    desc: "Electric heater with adjustable temperature",

    onSelect: function() {
        var t = prompt("Set heater target temperature (°C):", "200");
        if (t !== null) {
            elements.e_heater.tempGoal = parseFloat(t);
        }
    },

    tick: function(pixel) {

        if (pixel.charge) {

            var goal = elements.e_heater.tempGoal;

            var dirs = [
                [0,-1],[0,1],[-1,0],[1,0],
                [-1,-1],[1,-1],[-1,1],[1,1]
            ];

            for (var i = 0; i < dirs.length; i++) {

                var x = pixel.x + dirs[i][0];
                var y = pixel.y + dirs[i][1];

                if (!isEmpty(x,y,true)) {

                    var other = pixelMap[x][y];

                    if (other.temp < goal) {
                        other.temp += 5;
                        pixelTempCheck(other);
                    }

                }
            }

        }

    }
};
