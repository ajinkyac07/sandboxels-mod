elements.e_heater = {
    color: "#ff8c00",
    behavior: behaviors.WALL,
    category: "machines",
    state: "solid",     // Required for the game engine to know how to render/process it
    conduct: 1,         // Allows it to receive sparks
    insulate: true,
    hardness: 1,
    tempGoal: 200,      // Custom property we will reference in the tick function

    desc: "Electric heater. Needs a spark to heat up to 200 degrees.",

    tick: function(pixel) {
        // Only run the heating logic if the pixel is currently conducting electricity
        if (!pixel.charge) return;

        let goal = elements.e_heater.tempGoal;

        // The 8 neighboring coordinates (x, y)
        let dirs = [
            [0, -1], [0, 1], [-1, 0], [1, 0],
            [-1, -1], [1, -1], [-1, 1], [1, 1]
        ];

        for (let i = 0; i < dirs.length; i++) {
            let x = pixel.x + dirs[i][0];
            let y = pixel.y + dirs[i][1];

            // isEmpty(x, y, true) checks if the pixel is empty or out of bounds.
            // Using ! ensures we only target actual, existing neighboring elements.
            if (!isEmpty(x, y, true)) {
                let other = pixelMap[x][y];

                // Heat the neighbor if it's below our goal
                if (other.temp < goal) {
                    other.temp += 5;
                    pixelTempCheck(other); // Tells the game to check if the neighbor should melt/boil
                }
            }
        }
    }
};
